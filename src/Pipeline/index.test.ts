import { Pipeline } from '.';

describe('Pipeline', () => {
    it('should create a new instance', () => {
        const pipeline = new Pipeline();
        expect(pipeline).toBeInstanceOf(Pipeline);
    });
});
