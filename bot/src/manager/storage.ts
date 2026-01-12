import { type QueueJson, QueueStorageAdapter, type RestOrArray } from "hoshimi";
import type { RedisClient } from "../redis.js";

/**
 * Class representing a Redis storage adapter for Hoshimi.
 * @class RedisStorage
 * @extends {QueueStorageAdapter}
 */
export class RedisStorage extends QueueStorageAdapter {
    constructor(readonly redis: RedisClient) {
        super();
    }

    override async get(key: string): Promise<QueueJson | undefined> {
        const data = await this.redis.instance.get(this.buildKey(this.namespace, key));
        if (!data) return undefined;

        return this.parse(data);
    }
    override async set(key: string, value: QueueJson): Promise<void> {
        await this.redis.instance.set(this.buildKey(this.namespace, key), this.stringify(value));
    }

    override async delete(key: string): Promise<boolean> {
        const result = await this.redis.instance.del(this.buildKey(this.namespace, key));
        return result > 0;
    }

    override async clear(): Promise<void> {
        await this.redis.instance.flushAll();
    }

    override async has(key: string): Promise<boolean> {
        const result = await this.redis.instance.exists(this.buildKey(this.namespace, key));
        return result > 0;
    }

    override parse(value: unknown): QueueJson {
        return typeof value === "string" ? JSON.parse(value) : (value as QueueJson);
    }

    override stringify<R = string>(value: unknown): R {
        return (typeof value === "object" ? JSON.stringify(value) : value) as R;
    }

    public buildKey(...parts: RestOrArray<string>): string {
        const flattern = parts.flat();
        return flattern.join(":");
    }
}
