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
        const pipeline = Pipeline.create<Promise<number>>().through([
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
        const pipeline = Pipeline.create<string, number>().through([
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

    it('should be able to return a new type', () => {
        const aNumber = 1;
        const pipeline = Pipeline.create<string, number>()
            .send(aNumber)
            .through([
                (data, next) => {
                    return next(`String of ${data}`);
                },
            ]);

        const result = pipeline.thenReturn();
        expect(result).toEqual('String of 1');
    });

    it('should be able to return early', () => {
        const pipeline = Pipeline.create<number, number>()
            .send(1)
            .through([
                () => {
                    return 10;
                },
                (data, next) => {
                    return next(data);
                },
            ]);

        const result = pipeline.thenReturn();
        expect(result).toEqual(10);
    });

    it('should call the pipe before and/or after the destination', () => {
        const pipeline = Pipeline.create<string, string>()
            .send('<initial>')
            .through([
                (data, next) => {
                    const mutation = `${data}<first:before>`;
                    const response = next(mutation);

                    return `${response}<first:after>`;
                },
                (data, next) => {
                    const mutation = `${data}<second:before>`;
                    const response = next(mutation);

                    return `${response}<second:after>`;
                },
            ]);

        const result = pipeline.then((data) => {
            return `${data}<destination>`;
        });

        expect(result).toEqual(
            '<initial><first:before><second:before><destination><second:after><first:after>'
        );
    });

    it('should infer the input type for the first pipe', () => {
        const pipeline = Pipeline.create<string, string>()
            .send('passable')
            .through([
                // @ts-expect-error the first pipe should be inferred as
                // a string by the class generic input type
                (data: number, next) => {
                    return next(data + ' first');
                },
                (data, next) => {
                    return next(data + ' second');
                },
            ]);

        const result = pipeline.thenReturn();
        expect(result).toEqual('passable first second');
    });
});
