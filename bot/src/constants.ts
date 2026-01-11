import { resolve } from "node:path";

/**
 * Constants used throughout the bot.
 */
export const Constants = {
    /**
     * The directory where cache files are stored.
     * @type {string}
     * @default "cache"
     */
    CacheDirectory: "cache",
    /**
     * The name of the sessions file.
     * @type {string}
     * @default "sessions.json"
     */
    SessionsFile: "sessions.json",
    /**
     * The name of the cache file.
     * @type {string}
     * @default "commands.json"
     */
    CacheFile: "commands.json",
    /**
     *
     * Whether debug mode is enabled.
     * @type {boolean}
     * @default false
     */
    Debug: process.argv.includes("--debug"),
    /**
     *
     * Get the full path to the sessions file.
     * @type {string}
     * @returns {string} The full path to the sessions file.
     */
    SessionsPath(): string {
        return resolve(process.cwd(), this.CacheDirectory);
    },
    /**
     *
     * Get the full path to the cache file.
     * @type {string}
     * @returns {string} The full path to the cache file.
     */
    CachePath(): string {
        return resolve(process.cwd(), this.CacheDirectory, this.CacheFile);
    },
};
