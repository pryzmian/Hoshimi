import { PluginNames, type LyricsResult } from "../../types/Node";
import { HttpMethods } from "../../types/Rest";
import { validateNodePlugins } from "../../util/functions/utils";
import type { Track } from "../Track";
import type { Node } from "./Node";

/**
 * Class representing a LyricsManager.
 * @class LyricsManager
 */
export class LyricsManager {
    /**
     * The node instance.
     * @type {Node}
     * @readonly
     */
    readonly node: Node;

    /**
     * Create a new LyricsManager instance.
     * @param {Node} node The node instance.
     * @example
     * ```ts
     * const node = manager.nodeManager.get("nodeId");
     * const lyricsManager = new LyricsManager(node);
     * ```
     */
    constructor(node: Node) {
        this.node = node;
    }

    /**
     *
     * Get the current lyrics for the current track.
     * @param {boolean} skipSource Whether to skip the source or not.
     * @returns {Promise<LyricsResult | null>} The lyrics result or null if not found.
     * @example
     * ```ts
     * const player = manager.getPlayer("guildId");
     * const lyrics = await player.lyricsManager.current();
     * ```
     */
    public async current(guildId: string, skipSource: boolean = false): Promise<LyricsResult | null> {
        if (!this.node.sessionId) return null;

        validateNodePlugins(this.node, PluginNames.LavaLyrics, PluginNames.JavaLyrics, PluginNames.LavaSrc);

        return this.node.rest.request<LyricsResult>({
            endpoint: `/sessions/${this.node.sessionId}/players/${guildId}/track/lyrics`,
            params: {
                skipTrackSource: `${skipSource}`,
            },
        });
    }

    /**
     *
     * Get the lyrics for a specific track.
     * @param {Track} track The track to get the lyrics for.
     * @param {boolean} skipSource Whether to skip the source or not.
     * @returns {Promise<LyricsResult | null>} The lyrics result or null if not found.
     * @example
     * ```ts
     * const node = manager.nodeManager.get("nodeId");
     * const lyrics = await node.lyricsManager.get(track);
     * ```
     */
    public async get(track: Track, skipSource: boolean = false): Promise<LyricsResult | null> {
        if (!this.node.sessionId) return null;

        validateNodePlugins(this.node, PluginNames.LavaLyrics, PluginNames.JavaLyrics, PluginNames.LavaSrc);

        return this.node.rest.request<LyricsResult>({
            endpoint: "/lyrics",
            params: {
                track: track.encoded,
                skipTrackSource: `${skipSource}`,
            },
        });
    }

    /**
     *
     * Subscribe to the lyrics for a specific guild.
     * @param {string} guildId The guild id to subscribe to.
     * @param {boolean} skipSource Whether to skip the source or not.
     * @returns {Promise<void>} Let's start the sing session!
     * @example
     * ```ts
     * const node = manager.nodeManager.get("nodeId");
     * await node.lyricsManager.subscribe("guildId");
     * ```
     */
    public async subscribe(guildId: string, skipSource: boolean = false): Promise<void> {
        if (!this.node.sessionId) return;

        validateNodePlugins(this.node, PluginNames.LavaLyrics, PluginNames.JavaLyrics, PluginNames.LavaSrc);

        await this.node.rest.request({
            endpoint: `/sessions/${this.node.sessionId}/players/${guildId}/lyrics/subscribe`,
            method: HttpMethods.Post,
            params: {
                skipTrackSource: `${skipSource}`,
            },
        });
    }

    /**
     *
     * Unsubscribe from the lyrics for a specific guild.
     * @param {string} guildId The guild id to unsubscribe from.
     * @returns {Promise<void>} Let's stop the sing session!
     * @example
     * ```ts
     * const node = manager.nodeManager.get("nodeId");
     * await node.lyricsManager.unsubscribe("guildId");
     * ```
     */
    public async unsubscribe(guildId: string): Promise<void> {
        if (!this.node.sessionId) return;

        validateNodePlugins(this.node, PluginNames.LavaLyrics, PluginNames.JavaLyrics, PluginNames.LavaSrc);

        await this.node.rest.request({
            endpoint: `/sessions/${this.node.sessionId}/players/${guildId}/lyrics/subscribe`,
            method: HttpMethods.Delete,
        });
    }
}
