# Pipeline

Pipeline is a lightweight and flexible TypeScript utility for creating and running modular data processing pipelines. It is inspired by Laravel middleware, providing a similar approach to chaining and processing data through multiple stages.

## Installation

Install the package using npm:

```bash
npm install @webdocgroup/pipeline
```

## Usage

### Basic Example

Here is an example of a simple pipeline that processes numbers:

```ts
import { Pipeline } from '@webdocgroup/pipeline';

const pipeline = Pipeline.create()
    .send(1)
    .through([(data, next) => next(data + 1), (data, next) => next(data * 2)]);

const result = pipeline.thenReturn(); // 4
```

### Complex Example with Before and After Calls

This example demonstrates a more complex pipeline with before and after calls around the destination:

```ts
import { Pipeline } from '@webdocgroup/pipeline';

const id = ulid();
const pipeline = Pipeline.create()
    .send(id)
    .through([
        (data, next) => {
            console.info('before pipe');
            const result = next(data);
            console.info('after pipe');

            return result;
        },
    ]);

const result = pipeline.then((data) => {
    console.log('handling input...');

    return data;
});

console.log(result);
```

Output:

```bash
before pipe
handling input...
after pipe
01K255JMT6VCYVWPDZH65J8GZ5

```

### Return Early

You can stop the execution of the pipeline by returning from any of your pipes. For example:

```ts
import { Pipeline } from '@webdocgroup/pipeline';

const statusCode = 404;

const pipeline = Pipeline.create()
    .send(statusCode)
    .through([
        (data, next) => {
            if (data !== 200) {
                return 'Not Found';
            }

            return next(data);
        },
        (data, next) => {
            // Pipe is never called
            return next(data);
        },
    ]);

const result = pipeline.thenReturn(); // Not Found
```
