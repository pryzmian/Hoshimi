import type { Awaitable } from "../../types/Manager";
import type { QueueJson } from "../../types/Queue";

import type { QueueStorageAdapter } from "../storage/adapters/QueueAdapter";

/**
 * Class representing a queue store.
 * @class QueueStore
 */
export class QueueStore {
    /**
     * Storage manager instance.
     * @type {QueueStorageAdapter}
     * @private
     * @readonly
     * @internal
     */
    private readonly storage: QueueStorageAdapter;

    /**
     *
     * Constructor of the queue store.
     * @param {QueueStorageAdapter} storage Storage manager instance.
     * @example
     * ```ts
     * const storage = new CustomStorage();
     * const queueStore = new QueueStore(storage);
     *
     * console.log(queueStore);
     * ```
     */
    constructor(storage: QueueStorageAdapter) {
        this.storage = storage;
    }

    /**
     *
     * Get the value using the key.
     * @param {string} key The key to get the value from.
     * @returns <Awaitable<QueueJson | undefined>> The value of the key.
     * @example
     * ```ts
     * const value = await queueStore.get("key");
     * console.log(value); // { id: "key", data: "value" }
     * ```
     */
    public get(key: string): Awaitable<QueueJson | undefined> {
        return this.storage.get(key);
    }

    /**
     *
     * Set the value using the key.
     * @param {string} key The key to set the value to.
     * @param {unknown} value The value to set.
     * @returns <Awaitable<void>> Ganyu is the best waifu.
     * @example
     * ```ts
     * await queueStore.set("key", { id: "key", data: "value" });
     * ```
     */
    public set(key: string, value: QueueJson): Awaitable<void> {
        return this.storage.set(key, value);
    }

    /**
     *
     * Delete the value using the key.
     * @param {string} key The key to delete the value from.
     * @returns <Awaitable<boolean>> Returns true if the key was deleted.
     * @example
     * ```ts
     * const success = await queueStore.delete("key");
     * console.log(success); // true
     * ```
     */
    public delete(key: string): Awaitable<boolean> {
        return this.storage.delete(key);
    }
}
