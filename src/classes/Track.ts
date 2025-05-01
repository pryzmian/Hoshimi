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
	 * @type {InferableRequester}
	 */
	public requester: InferableRequester;

	/**
	 * The constructor for the track.
	 * @param {LavalinkTrack} track The track to construct the track from.
	 * @param {InferableRequester} requester The requester of the track.
	 */
	constructor(track: LavalinkTrack, requester: InferableRequester) {
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
export type InferableRequester = Inferable<CustomizableTrack, "requester">;
