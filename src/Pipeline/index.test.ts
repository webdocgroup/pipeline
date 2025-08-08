import { Pipeline } from '.';

describe('Pipeline', () => {
    it('should create a new instance', () => {
        const pipeline = Pipeline.create();
        expect(pipeline).toBeInstanceOf(Pipeline);
    });

    it('should be able to sum numbers', () => {
        const pipeline = Pipeline.create<number, number>()
            .send(1)
            .through([
                (data, next) => {
                    const res = next(data + 1);
                    return res + 1;
                },
                (data, next) => {
                    const x = next(data + 1);
                    return x + 1;
                },
            ]);

        const result = pipeline.thenReturn();
        expect(result).toEqual(5);
    });

    it('should be able to asynchronously sum numbers', async () => {
        const pipeline = Pipeline.create<number, Promise<number>>().through([
            async (data, next) => {
                const res = await next(data + 1);
                return res;
            },
            async (data, next) => {
                const res = await next(data + 1);
                return res;
            },
        ]);

        const result = await pipeline.send(1).thenReturn();
        expect(result).toEqual(3);
    });

    it('should be able call a destination', async () => {
        const pipeline = Pipeline.create<number, string>().through([
            (data, next) => {
                return next(data + 1);
            },
            (data, next) => {
                return next(data + 1);
            },
        ]);

        const result = pipeline.send(1).then((data) => {
            return `Number: ${data}`;
        });
        expect(result).toEqual('Number: 3');
    });

    it('should be chainable', () => {
        const pipeline = Pipeline.create<number, number>();
        const result = pipeline
            .addPipe((data, next) => {
                return next(data + 1);
            })
            .addPipe((data, next) => {
                return next(data + 1);
            })
            .send(1)
            .then((data) => {
                return data + 1;
            });

        expect(result).toEqual(4);
    });
});
