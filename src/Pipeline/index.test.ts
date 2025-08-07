import { Pipeline } from '.';

describe('Pipeline', () => {
    it('should create a new instance', () => {
        const pipeline = new Pipeline([]);
        expect(pipeline).toBeInstanceOf(Pipeline);
    });

    it('should be able to sum numbers', () => {
        const pipeline = new Pipeline<number, number>([
            (data, next) => {
                const res = next(data + 1);
                return res + 1;
            },
            (data, next) => {
                const x = next(data + 1);
                return x + 1;
            },
        ]);

        const result = pipeline.execute(1);
        expect(result).toEqual(5);
    });

    it('should be able to asynchronously sum numbers', async () => {
        const pipeline = new Pipeline<number, Promise<number>>([
            async (data, next) => {
                const res = await next(data + 1);
                return res;
            },
            async (data, next) => {
                const res = await next(data + 1);
                return res;
            },
        ]);

        const result = await pipeline.execute(1);
        expect(result).toEqual(3);
    });

    it('should be able call a destination', async () => {
        const pipeline = new Pipeline<number, string>(
            [
                (data, next) => {
                    return next(data + 1);
                },
                (data, next) => {
                    return next(data + 1);
                },
            ],
            (data) => {
                return `Number: ${data}`;
            }
        );

        const result = pipeline.execute(1);
        expect(result).toEqual('Number: 3');
    });

    it('should be chainable', () => {
        const pipeline = new Pipeline<number, number>([]);
        const result = pipeline
            .addStage((data, next) => {
                return next(data + 1);
            })
            .addStage((data, next) => {
                return next(data + 1);
            })
            .setDestination((data) => {
                return data + 1;
            })
            .execute(1);

        expect(result).toEqual(4);
    });
});
