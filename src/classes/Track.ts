import type { Inferable } from "../types/Manager";
import type { LavalinkTrack, PluginInfo, TrackInfo } from "../types/Node";

/**
 * Class representing a Hoshimi track.
 */
export class Track {
	/**
	 * The base64 encoded track.
	 * @type {string}
	 */
	readonly encoded: string;

	/**
	 * The track info.
	 * @type {TrackInfo}
	 */
	readonly info: TrackInfo;

	/**
	 * The plugin info of the track.
	 * @type {PluginInfo}
	 */
	readonly pluginInfo: PluginInfo;

	/**
	 * The requester of the track.
	 * @type {TrackRequester}
	 */
	public requester: TrackRequester;

	/**
	 * The constructor for the track.
	 * @param {LavalinkTrack} track The track to construct the track from.
	 * @param {TrackRequester} requester The requester of the track.
	 * @example
	 * ```ts
	 * const track = new Track({
	 * 	encoded: "base64",
	 * 	info: {
	 * 		title: "Track Title",
	 * 		uri: "https://example.com",
	 * 		duration: 300000,
	 * 	},
	 * 	// the rest of the track info
	 * }, requester);
	 *
	 * console.log(track.encoded); // base64encodedtrack
	 * ```
	 */
	constructor(track: LavalinkTrack, requester: TrackRequester) {
		this.info = track.info;
		this.encoded = track.encoded;
		this.requester = requester;
		this.pluginInfo = track.pluginInfo;
	}

	/**
	 *
	 * Get the hyperlink of the track.
	 * @param {boolean} [embedable=true] Whether the hyperlink should be embedable or not.
	 * @returns {string} The hyperlink of the track.
	 * @example
	 * ```ts
	 * const track = queue.current;
	 * console.log(track.toHyperlink()); // [Track Title](https://example.com)
	 * console.log(track.toHyperlink(false)); // [Track Title](<https://example.com>)
	 * ```
	 */
	public toHyperlink(embedable: boolean = true): string {
		if (embedable) return `[${this.info.title}](${this.info.uri})`;
		return `[${this.info.title}](<${this.info.uri}>)`;
	}
}

/**
 * Interface representing an extendable track.
 */
export interface CustomizableTrack {}

/**
 * The requester of the track.
 */
export type TrackRequester = Inferable<CustomizableTrack, "requester">;
