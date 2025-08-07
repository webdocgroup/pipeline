export type NextStage<Input, Output> = (data: Input) => Output;
export type PipelineStage<Input, Output> = (
    data: Input,
    next: NextStage<Input, Output>
) => Output;

export class Pipeline<Input = any, Output = any> {
    private stages: Array<PipelineStage<Input, Output>> = [];
    private destination: NextStage<Input, Output> | null = null;

    constructor(
        stages: Array<PipelineStage<Input, Output>>,
        destination: NextStage<Input, Output> | null = null
    ) {
        this.stages = stages;
        this.destination = destination;
    }

    public addStage(
        stage: PipelineStage<Input, Output>
    ): Pipeline<Input, Output> {
        this.stages.push(stage);
        return this;
    }

    public setDestination(
        destination: NextStage<Input, Output>
    ): Pipeline<Input, Output> {
        this.destination = destination;
        return this;
    }

    public execute(input: Input): Output {
        const pipeline = [...this.stages]
            .reverse()
            .reduce(this.carry(), this.handleCarry());
        return pipeline(input);
    }

    private carry() {
        return (
            nextStage: NextStage<Input, Output>,
            stage: PipelineStage<Input, Output>
        ): NextStage<Input, Output> => {
            return (passable: Input) => {
                return stage(passable, nextStage);
            };
        };
    }

    private handleCarry(): NextStage<Input, Output> {
        if (this.destination !== null) {
            return this.destination;
        }

        return (passable: Input): Output => {
            return passable as unknown as Output;
        };
    }
}
