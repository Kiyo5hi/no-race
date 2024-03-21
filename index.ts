export type Consumable<T> = () => Promise<T>;
export type Resolve<T> = (value: T | PromiseLike<T>) => void

export interface Queue<T> {
    enqueue(consumable: Consumable<T>): Promise<T | undefined>;
}

/**
 * EagerQueue queues and processes items in the order they are enqueued.
 */
export class EagerQueue<T> implements Queue<T> {
    #queue: [Consumable<T>, Resolve<T>][] = [];
    #isProcessing = false;

    /**
     * Enqueues a consumable function to be processed.
     * @param consumable An async function that returns a value.
     * @returns The value returned by the consumable function.
     */
    async enqueue(consumable: Consumable<T>): Promise<T> {
        return new Promise<T>((resolve) => {
            this.#queue.push([consumable, resolve]);
            this.#process()
        })
    }

    async #process(): Promise<void> {
        if (this.#isProcessing) return;
        this.#isProcessing = true;

        const item = this.#queue.shift();
        if (!item) {
            this.#isProcessing = false;
            return
        }
        const [consumable, resolve] = item;

        resolve(await consumable());
        this.#isProcessing = false;

        this.#process();
    }
}

export class BusyQueueError extends Error {
    constructor() {
        super('Queue is busy');
    }
}

/**
 * LazyQueue only queues item when it is not processing an item.
 */
export class LazyQueue<T> implements Queue<T> {
    #currentConsumable: [Consumable<T>, Resolve<T>] | undefined;
    #errorOnSkip: boolean;

    constructor(errorOnSkip = false) {
        this.#errorOnSkip = errorOnSkip;
    }

    /**
     * Enqueues a consumable function to be processed.
     * @param consumable An async function that returns a value.
     * @returns The value returned by the consumable function, or undefined if the queue is busy.
     */
    async enqueue(consumable: Consumable<T>): Promise<T | undefined> {
        if (this.#currentConsumable) {
            if (this.#errorOnSkip) {
                throw new BusyQueueError();
            }
            return undefined;
        }

        return new Promise<T>((resolve) => {
            this.#currentConsumable = [consumable, resolve];
            this.#process()
        })
    }

    async #process(): Promise<void> {
        if (!this.#currentConsumable) return;

        const [consumable, resolve] = this.#currentConsumable;
        resolve(await consumable())
        this.#currentConsumable = undefined;
    }
}
