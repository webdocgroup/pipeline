export type NextPipe<Input = any, Output = any> = (data: Input) => Output;
export type Pipe<Input = any, Output = any> = (
    data: Input,
    next: NextPipe<any, any>
) => Output;

export type Pipes<Input = any> = [] | [Pipe<Input>, ...Pipe[]];

type Destination<Input, Output> = NextPipe<Input, Output>;

type PipelineConfig<Input> = {
    pipes: Pipes<Input>;
    passable: Input | null;
};

export class Pipeline<Output = any, Input = any> {
    private readonly props: PipelineConfig<Input>;

    private constructor(props: PipelineConfig<Input>) {
        this.props = props;
    }

    public static create<Output = any, Input = any>(): Pipeline<Output, Input> {
        return new Pipeline<Output, Input>({
            pipes: [],
            passable: null,
        });
    }

    /**
     * Value to pass through the pipeline.
     */
    public send(data: Input): Pipeline<Output, Input> {
        return new Pipeline<Output, Input>({
            pipes: this.props.pipes,
            passable: data,
        });
    }

    /**
     * Add pipes to the pipeline.
     */
    public through(pipes: Pipes<Input>): Pipeline<Output, Input> {
        return new Pipeline<Output, Input>({
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
    ): Pipeline<Output, Input> {
        const nextPipes: Pipes = [...this.props.pipes, pipe];

        return new Pipeline<Output, Input>({
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
