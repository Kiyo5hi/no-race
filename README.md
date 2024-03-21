# no-race

`no-race` is a simple library for JavaScript/TypeScript to queue promises in case of concurrency and race conditions.

## EagerQueue

`EagerQueue` provides a best-effort queue, it queues and executes tasks in order.

```typescript
import { EagerQueue } from 'no-race'
import { sleep } from 'bun'

results = []
promises = []

const eagerQueue = new EagerQueue()

for (let i = 0; i < 10; i++) {
    const done = eagerQueue.enqueue(async () => {
        await sleep(Math.random() * 100)
        results.push(i)
    })
    promises.push(done)
}

await Promise.all(promises)

// expected output: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
console.log(results)
```

## LazyQueue

`LazyQueue` provides a queue that skips when it is busy; this is very helpful when each task is extremely resource-consuming.


```typescript
import { LazyQueue } from 'no-race'
import { sleep } from 'bun'

results = []
promises = []

const lazyQueue = new LazyQueue()

for (let i = 0; i < 10; i++) {
    const done = lazyQueue.enqueue(async () => {
        await sleep(Math.random() * 100)
        results.push(i)
    })
    promises.push(done)
}

await Promise.all(promises)

// expected output: [0], maybe one or two more due to the indeterminism of `random` 
console.log(results)
```
