export type NextPipe<Input = any, Output = any> = (data: Input) => Output;
export type Pipe<Input = any, Output = any> = (
    data: Input,
    next: NextPipe<Input, Output>
) => Output;

type Destination<Input, Output> = NextPipe<Input, Output>;

type PipelineConfig<Input> = {
    pipes: Array<Pipe<unknown, unknown>>;
    passable: Input | null;
};

export class Pipeline<Input = any, Output = any> {
    private readonly props: PipelineConfig<Input>;

    private constructor(props: PipelineConfig<Input>) {
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
    public send<NextInput = any>(
        data: Input extends any ? NextInput : Input
    ): Pipeline<Input extends any ? NextInput : Input, Output> {
        return new Pipeline<Input extends any ? NextInput : Input, Output>({
            pipes: this.props.pipes,
            passable: data,
        });
    }

    /**
     * Add pipes to the pipeline.
     */
    public through(pipes: Pipe[]): Pipeline<Input, Output> {
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

    public addPipe<AdditionalPipe extends Pipe>(
        pipe: AdditionalPipe
    ): Pipeline<Input, Output> {
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
        return (nextPipe: NextPipe, pipe: Pipe): NextPipe<any, Output> => {
            return (passable: Input) => {
                return pipe(passable, nextPipe);
            };
        };
    }
}
