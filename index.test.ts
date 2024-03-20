import { sleep } from 'bun'
import { test, expect } from 'bun:test'

import { EagerQueue } from '.'

test('eager queue', async () => {
    let results: number[] = []
    let promises: Promise<unknown>[] = []

    for (let i = 0; i < 10; i++) {
        const done = new Promise<void>(async (resolve) => {
            await sleep(Math.random() * 100)
            results.push(i)
            resolve()
        })
        promises.push(done)
    }

    await Promise.all(promises)

    expect(results).not.toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

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

    expect(results).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

    // retry since `random` is not deterministic
}, { retry: 1 })
