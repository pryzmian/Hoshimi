import { type QueueJson, StorageAdapter } from "hoshimi";
import type { RedisClient } from "../redis.js";

/**
 *
 * Builds a Redis key for Hoshimi queue storage.
 * @param {string} key The key to build.
 * @returns {string} The built key.
 */
const buildKey = (key: string): string => `hoshimi:queue:${key}`;

/**
 * Class representing a Redis storage adapter for Hoshimi.
 * @class RedisStorage
 * @extends {StorageAdapter}
 */
export class RedisStorage extends StorageAdapter {
    constructor(readonly redis: RedisClient) {
        super();
    }

    override async get(key: string): Promise<QueueJson | undefined> {
        const data = await this.redis.instance.get(buildKey(key));
        if (!data) return undefined;

        return this.parse(data);
    }
    override async set(key: string, value: QueueJson): Promise<void> {
        await this.redis.instance.set(buildKey(key), this.stringify(value));
    }

    override async delete(key: string): Promise<boolean> {
        const result = await this.redis.instance.del(buildKey(key));
        return result > 0;
    }

    override async clear(): Promise<void> {
        await this.redis.instance.flushAll();
    }

    override async has(key: string): Promise<boolean> {
        const result = await this.redis.instance.exists(buildKey(key));
        return result > 0;
    }

    override parse(value: unknown): QueueJson {
        return typeof value === "string" ? JSON.parse(value) : (value as QueueJson);
    }

    override stringify<R = string>(value: unknown): R {
        return (typeof value === "object" ? JSON.stringify(value) : value) as R;
    }
}
