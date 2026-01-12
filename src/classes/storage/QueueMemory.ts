import type { RestOrArray } from "../../types/Manager";
import type { QueueJson } from "../../types/Queue";
import { QueueStorageAdapter } from "./adapters/QueueAdapter";

/**
 * Class representing a memory storage manager.
 * @class MemoryAdapter
 * @extends {QueueStorageAdapter}
 */
export class QueueMemoryStorage<T extends QueueJson = QueueJson> extends QueueStorageAdapter<T> {
    /**
     * Memory storage.
     * @type {Map<string, QueueJson>}
     * @private
     * @readonly
     * @internal
     */
    private readonly storage: Map<string, QueueJson> = new Map();

    public get(key: string): T | undefined {
        return this.parse(this.storage.get(key));
    }

    public set(key: string, value: T): void {
        this.storage.set(this.buildKey(this.namespace, key), this.stringify<QueueJson>(value));
    }

    public delete(key: string): boolean {
        return this.storage.delete(this.buildKey(this.namespace, key));
    }

    public clear(): void {
        this.storage.clear();
    }

    public has(key: string): boolean {
        return this.storage.has(this.buildKey(this.namespace, key));
    }

    public parse(value: unknown): T {
        return value as T;
    }

    public stringify<R = string>(value: unknown): R {
        return value as R;
    }

    public buildKey(...parts: RestOrArray<string>): string {
        const flattern = parts.flat();
        return flattern.join(":");
    }
}
