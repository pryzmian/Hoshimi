import type { CustomizablePlayerStorage } from "./Player";

/**
 * Type representing the customizable player storage.
 */
type StorageKeys = keyof CustomizablePlayerStorage | (string & {});

/**
 * Type representing the customizable player storage values.
 */
type StorageValues<V extends StorageKeys = StorageKeys> = V extends keyof CustomizablePlayerStorage
    ? CustomizablePlayerStorage[V]
    : unknown;

/**
 * Class representing a player storage.
 * @class PlayerStorage
 */
export class PlayerStorage<K extends StorageKeys = StorageKeys, V extends StorageValues<K> = StorageValues<K>> {
    /**
     * The internal storage.
     * @type {Map<K, V>}
     * @private
     * @readonly
     * @internal
     */
    private readonly internal: Map<K, V> = new Map<K, V>();

    /**
     *
     * Get the value for a key in the storage.
     * @param {K} key The key to get the value for.
     * @returns {V | undefined} The value for the key, or undefined if it doesn't exist.
     */
    public get<K extends StorageKeys, V extends StorageValues<K>>(key: K): V | undefined {
        return this.internal.get(key as never) as V | undefined;
    }

    /**
     * Set the value for a key in the storage.
     * @param {K} key The key to set the value for.
     * @param {V} value The value to set for the key.
     */
    public set<K extends StorageKeys, V extends StorageValues<K>>(key: K, value: V): void {
        this.internal.set(key as never, value as never);
    }

    /**
     * Check if the storage has a key.
     * @param {K} key The key to check for.
     * @returns {boolean} True if the storage has the key, false otherwise.
     */
    public has(key: K): boolean {
        return this.internal.has(key);
    }

    /**
     * Delete a key from the storage.
     * @param {K} key The key to delete.
     * @returns {boolean} True if the key was deleted, false otherwise.
     */
    public delete(key: K): boolean {
        return this.internal.delete(key);
    }

    /**
     * Get all keys in the storage.
     * @returns {K[]} The keys in the storage.
     */
    public keys<K extends StorageKeys[]>(): K[] {
        return [...this.internal.keys()] as never;
    }

    /**
     * Get all values in the storage.
     * @returns {V[]} The values in the storage.
     */
    public values<K extends StorageKeys[], V extends StorageValues<K[number]>>(): V[] {
        return [...this.internal.values()] as never as V[];
    }

    /**
     * Get all entries in the storage.
     * @returns {[K, V][]} The entries in the storage.
     */
    public entries<K extends StorageKeys[], V extends StorageValues<K[number]>>(): [K, V][] {
        return [...this.internal.entries()] as never as [K, V][];
    }

    /**
     *
     * Get all key-value pairs in the storage.
     * @returns {Record<K[number], V>} An object containing all key-value pairs in the storage, excluding internal keys.
     */
    public all<K extends StorageKeys[], V extends StorageValues<K[number]>>(): Record<K[number], V> {
        return Object.fromEntries([...this.internal.entries()].filter(([key]) => !key.startsWith("internal_"))) as never as Record<
            K[number],
            V
        >;
    }

    /**
     * Clear the storage.
     */
    public clear(): void {
        this.internal.clear();
    }

    /**
     * Get the size of the storage.
     * @returns {number} The number of entries in the storage.
     */
    public get size(): number {
        return this.internal.size;
    }
}
