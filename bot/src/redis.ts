import { createClient, type RedisClientType } from "redis";
import type { UsingClient } from "seyfert";

/**
 * Class representing a Redis client.
 */
export class RedisClient {
    /**
     * The Redis client instance.
     * @type {RedisClientType}
     * @readonly
     */
    readonly instance: RedisClientType;

    /**
     * The client using this Redis instance.
     * @type {UsingClient}
     * @readonly
     */
    readonly client: UsingClient;

    /**
     *
     * Creates a new RedisClient instance.
     * @param {UsingClient} client The client using this Redis instance.
     */
    constructor(client: UsingClient) {
        // The default options are usually sufficient.
        // Add custom options here if needed.
        this.instance = createClient();

        this.client = client;
    }

    /**
     * Connects to the Redis server.
     * @returns {Promise<void>} A promise that resolves when the connection is established.
     */
    public async start(): Promise<void> {
        await this.instance.connect();
    }

    /**
     * Disconnects from the Redis server.
     * @returns {void} Nothing, yay!
     */
    public destroy(): void {
        this.instance.destroy();
    }
}
