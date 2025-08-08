export type NextPipe<Input, Output> = (data: Input) => Output;
export type Pipe<Input, Output> = (
    data: Input,
    next: NextPipe<Input, Output>
) => Output;

type Destination<Input, Output> = NextPipe<Input, Output>;

type PipelineConfig<Input, Output> = {
    pipes: Array<Pipe<Input, Output>>;
    passable: Input | null;
};

export class Pipeline<Input = any, Output = any> {
    private readonly props: PipelineConfig<Input, Output>;

    private constructor(props: PipelineConfig<Input, Output>) {
        this.props = props;
    }

    public static create<Input = any, Output = any>(): Pipeline<Input, Output> {
        return new Pipeline<Input, Output>({
            pipes: [],
            passable: null,
        });
    }

    /**
     * Value to pass through the pipeline.
     */
    public send(data: Input): Pipeline<Input, Output> {
        return new Pipeline<Input, Output>({
            pipes: this.props.pipes,
            passable: data,
        });
    }

    /**
     * Add pipes to the pipeline.
     */
    public through(pipes: Array<Pipe<Input, Output>>): Pipeline<Input, Output> {
        return new Pipeline<Input, Output>({
            pipes: pipes,
            passable: this.props.passable,
        });
    }

    /**
     * Run the pipeline and then call the destination with the result.
     */
    public then(destination: Destination<Input, Output>) {
        if (!this.props.passable) {
            throw new Error('No data to pass through the pipeline');
        }

        return this.execute({
            input: this.props.passable,
            destination: destination,
        });
    }

    /**
     * Run the pipeline and then return the result.
     */
    public thenReturn(): Output {
        return this.then((result) => result as unknown as Output);
    }

    public addPipe(pipe: Pipe<Input, Output>): Pipeline<Input, Output> {
        const nextPipes = [...this.props.pipes, pipe];

        return new Pipeline<Input, Output>({
            pipes: nextPipes,
            passable: this.props.passable,
        });
    }

    /**
     * Run the pipeline with the provided input and destination.
     */
    private execute({
        input,
        destination,
    }: {
        input: Input;
        destination: Destination<Input, Output>;
    }): Output {
        const pipeline = [...this.props.pipes]
            .reverse()
            .reduce(this.carry(), destination);

        return pipeline(input);
    }

    private carry() {
        return (
            nextPipe: NextPipe<Input, Output>,
            pipe: Pipe<Input, Output>
        ): NextPipe<Input, Output> => {
            return (passable: Input) => {
                return pipe(passable, nextPipe);
            };
        };
    }
}
