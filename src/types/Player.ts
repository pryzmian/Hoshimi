import type { Node } from "../classes/node/Node";
import type { Track } from "../classes/Track";
import type { Nullable } from "./Manager";
import type { Exception, LavalinkTrack, OpCodes } from "./Node";
import type { QueueJson } from "./Queue";

/**
 * Partial Lavalink track type.
 */
type PartialLavalinkTrack = Partial<Nullable<LavalinkTrack>>;

/**
 * The types of loop modes.
 */
export enum LoopMode {
	/**
	 * Loop mode for repeating the current track.
	 */
	Track = 1,
	/**
	 * Loop mode for repeating the queue.
	 */
	Queue = 2,
	/**
	 * Loop mode for repeating nothing.
	 */
	Off = 3,
}

/**
 * The types of player events.
 */
export enum PlayerEventType {
	/**
	 * Event type for when a track starts.
	 */
	TrackStart = "TrackStartEvent",
	/**
	 * Event type for when a track ends.
	 */
	TrackEnd = "TrackEndEvent",
	/**
	 * Event type for when a track encounters an exception.
	 */
	TrackException = "TrackExceptionEvent",
	/**
	 * Event type for when a track gets stuck.
	 */
	TrackStuck = "TrackStuckEvent",
	/**
	 * Event type for when the WebSocket connection is closed.
	 */
	WebsocketClosed = "WebSocketClosedEvent",
}

/**
 * The reasons a track can end.
 */
export enum TrackEndReason {
	/**
	 * The track ended normally.
	 */
	Finished = "finished",
	/**
	 * The track fails to load.
	 */
	LoadFailed = "loadFailed",
	/**
	 * The track was stopped.
	 */
	Stopped = "stopped",
	/**
	 * The track was replaced.
	 */
	Replaced = "replaced",
	/**
	 * The track was cleaned up.
	 */
	Cleanup = "cleanup",
}

/**
 * The base interface for player events.
 */
export interface PlayerEvent {
	/**
	 * The operation code for the event.
	 * @type {OpCodes.Event}
	 */
	op: OpCodes.Event;
	/**
	 * The guild ID associated with the event.
	 * @type {string}
	 */
	guildId: string;
}

/**
 * The event for when a track starts playing.
 */
export interface TrackStartEvent extends PlayerEvent {
	/**
	 * The type of the event.
	 * @type {PlayerEventType.TrackStart}
	 */
	type: PlayerEventType.TrackStart;
	/**
	 * The track that started playing.
	 * @type {LavalinkTrack}
	 */
	track: LavalinkTrack;
}

/**
 * The event for when a track ends.
 */
export interface TrackEndEvent extends PlayerEvent {
	/**
	 * The type of the event.
	 * @type {PlayerEventType.TrackEnd}
	 */
	type: PlayerEventType.TrackEnd;
	/**
	 * The track that ended.
	 * @type {LavalinkTrack}
	 */
	track: LavalinkTrack;
	/**
	 * The reason the track ended.
	 * @type {TrackEndReason}
	 */
	reason: TrackEndReason;
}

/**
 * The event for when a track gets stuck.
 */
export interface TrackStuckEvent extends PlayerEvent {
	/**
	 * The type of the event.
	 * @type {PlayerEventType.TrackStuck}
	 */
	type: PlayerEventType.TrackStuck;
	/**
	 * The track that got stuck.
	 * @type {LavalinkTrack}
	 */
	track: LavalinkTrack;
	/**
	 * The threshold in milliseconds.
	 * @type {number}
	 */
	thresholdMs: number;
}

/**
 * The event for when a track encounters an exception.
 */
export interface TrackExceptionEvent extends PlayerEvent {
	/**
	 * The type of the event.
	 * @type {PlayerEventType.TrackException}
	 */
	type: PlayerEventType.TrackException;
	/**
	 * The exception that occurred.
	 * @type {Exception}
	 */
	exception: Exception;
}

/**
 * The event for when the WebSocket connection is closed.
 */
export interface WebSocketClosedEvent extends PlayerEvent {
	/**
	 * The type of the event.
	 * @type {PlayerEventType.WebsocketClosed}
	 */
	type: PlayerEventType.WebsocketClosed;
	/**
	 * The close code.
	 * @type {number}
	 */
	code: number;
	/**
	 * Whether the connection was closed by the remote.
	 * @type {boolean}
	 */
	byRemote: boolean;
	/**
	 * The reason for the closure.
	 * @type {string}
	 */
	reason: string;
}

/**
 * The update for the player state.
 */
export interface PlayerUpdate {
	/**
	 * The operation code for the update.
	 * @type {OpCodes.PlayerUpdate}
	 */
	op: OpCodes.PlayerUpdate;
	/**
	 * The guild ID associated with the update.
	 * @type {string}
	 */
	guildId: string;
	/**
	 * The state of the player.
	 * @type {PlayerUpdateState}
	 */
	state: PlayerUpdateState;
}

export interface PlayerUpdateState {
	/**
	 * Whether the player is connected.
	 * @type {boolean}
	 */
	connected: boolean;
	/**
	 * The position of the track.
	 * @type {number}
	 */
	position: number;
	/**
	 * The time of the update.
	 * @type {number}
	 */
	time: number;
	/**
	 * The ping of the player.
	 * @type {number}
	 */
	ping: number;
}

/**
 * The options for the player.
 */
export interface PlayerOptions {
	/**
	 * Guild id of the player.
	 * @type {string}
	 */
	guildId: string;
	/**
	 * Voice channel id of the player.
	 * @type {string}
	 */
	voiceId: string;
	/**
	 * Volume of the player.
	 * @type {number | undefined}
	 * @default 100
	 */
	volume?: number;
	/**
	 * Set if the player should be deafened.
	 * @type {boolean | undefined}
	 * @default true
	 */
	selfDeaf?: boolean;
	/**
	 * Set if the player should be muted.
	 * @type {boolean | undefined}
	 * @default false
	 */
	selfMute?: boolean;
	/**
	 * Text channel id of the player.
	 * @type {string | undefined}
	 */
	textId?: string;
	/**
	 * Lavalink node of the player.
	 * @type {string | Node | undefined}
	 */
	node?: string | Node;
}

/**
 * The base options for playing a track.
 */
export interface BasePlayOptions {
	/**
	 * The position to start the track.
	 * @type {number | undefined}
	 */
	position?: number;
	/**
	 * The position to end the track.
	 * @type {number | undefined}
	 */
	endTime?: number;
	/**
	 * The pause state of the player.
	 * @type {boolean | undefined}
	 */
	paused?: boolean;
	/**
	 * The volume of the player.
	 * @type {number | undefined}
	 */
	volume?: number;
	/**
	 * The filters for the player.
	 * @type {Partial<FilterOptions> | undefined}
	 */
	filters?: Partial<FilterOptions>;
	/**
	 * The voice settings for the player.
	 * @type {LavalinkPlayerVoice | undefined}
	 */
	voice?: LavalinkPlayerVoice;
}

/**
 * The options for playing a track with Lavalink.
 */
export interface LavalinkPlayOptions extends BasePlayOptions {
	/**
	 * Track to play.
	 * @type {PartialLavalinkTrack | undefined}
	 */
	track?: PartialLavalinkTrack;
}

/**
 * The options for playing a track.
 */
export interface PlayOptions extends BasePlayOptions {
	/**
	 * Whether to replace the current track.
	 * @type {boolean | undefined}
	 * @default false
	 */
	noReplace?: boolean;
	/**
	 * Track to play.
	 * @type {Track | undefined}
	 */
	track?: Track;
}

/**
 * The band settings for the equalizer.
 */
export interface Band {
	/**
	 * The band number.
	 * @type {number}
	 */
	band: number;
	/**
	 * The gain for the band.
	 * @type {number}
	 */
	gain: number;
}

/**
 * The settings for the karaoke filter.
 */
export interface KaraokeSettings {
	/**
	 * The level of the karaoke filter.
	 * @type {number | undefined}
	 */
	level?: number;
	/**
	 * The mono level of the karaoke filter.
	 * @type {number | undefined}
	 */
	monoLevel?: number;
	/**
	 * The filter band of the karaoke filter.
	 * @type {number | undefined}
	 */
	filterBand?: number;
	/**
	 * The filter width of the karaoke filter.
	 * @type {number | undefined}
	 */
	filterWidth?: number;
}

/**
 * The settings for the timescale filter.
 */
export interface TimescaleSettings {
	/**
	 * The speed of the timescale filter.
	 * @type {number | undefined}
	 */
	speed?: number;
	/**
	 * The pitch of the timescale filter.
	 * @type {number | undefined}
	 */
	pitch?: number;
	/**
	 * The rate of the timescale filter.
	 * @type {number | undefined}
	 */
	rate?: number;
}

/**
 * The settings for frequency-based filters.
 */
export interface FreqSettings {
	/**
	 * The frequency of the filter.
	 * @type {number | undefined}
	 */
	frequency?: number;
	/**
	 * The depth of the filter.
	 * @type {number | undefined}
	 */
	depth?: number;
}

/**
 * The settings for the rotation filter.
 */
export interface RotationSettings {
	/**
	 * The rotation frequency in Hz.
	 * @type {number | undefined}
	 */
	rotationHz?: number;
}

/**
 * The settings for the distortion filter.
 */
export interface DistortionSettings {
	/**
	 * The sine offset.
	 * @type {number | undefined}
	 */
	sinOffset?: number;
	/**
	 * The sine scale.
	 * @type {number | undefined}
	 */
	sinScale?: number;
	/**
	 * The cosine offset.
	 * @type {number | undefined}
	 */
	cosOffset?: number;
	/**
	 * The cosine scale.
	 * @type {number | undefined}
	 */
	cosScale?: number;
	/**
	 * The tangent offset.
	 * @type {number | undefined}
	 */
	tanOffset?: number;
	/**
	 * The tangent scale.
	 * @type {number | undefined}
	 */
	tanScale?: number;
	/**
	 * The offset.
	 * @type {number | undefined}
	 */
	offset?: number;
	/**
	 * The scale.
	 * @type {number | undefined}
	 */
	scale?: number;
}

/**
 * The settings for the channel mix filter.
 */
export interface ChannelMixSettings {
	/**
	 * The left to left channel mix.
	 * @type {number | undefined}
	 */
	leftToLeft?: number;
	/**
	 * The left to right channel mix.
	 * @type {number | undefined}
	 */
	leftToRight?: number;
	/**
	 * The right to left channel mix.
	 * @type {number | undefined}
	 */
	rightToLeft?: number;
	/**
	 * The right to right channel mix.
	 * @type {number | undefined}
	 */
	rightToRight?: number;
}

/**
 * The settings for the low pass filter.
 */
export interface LowPassSettings {
	/**
	 * The smoothing of the low pass filter.
	 * @type {number | undefined}
	 */
	smoothing?: number;
}

/**
 * The options for the filters.
 */
export interface FilterOptions {
	/**
	 * The volume of the filter.
	 * @type {number | undefined}
	 */
	volume?: number;
	/**
	 * The equalizer settings.
	 * @type {Band[] | undefined}
	 */
	equalizer?: Band[];
	/**
	 * The karaoke settings.
	 * @type {KaraokeSettings | null}
	 */
	karaoke?: KaraokeSettings | null;
	/**
	 * The timescale settings.
	 * @type {TimescaleSettings | null}
	 */
	timescale?: TimescaleSettings | null;
	/**
	 * The tremolo settings.
	 * @type {FreqSettings | null}
	 */
	tremolo?: FreqSettings | null;
	/**
	 * The vibrato settings.
	 * @type {FreqSettings | null}
	 */
	vibrato?: FreqSettings | null;
	/**
	 * The rotation settings.
	 * @type {RotationSettings | null}
	 */
	rotation?: RotationSettings | null;
	/**
	 * The distortion settings.
	 * @type {DistortionSettings | null}
	 */
	distortion?: DistortionSettings | null;
	/**
	 * The channel mix settings.
	 * @type {ChannelMixSettings | null}
	 */
	channelMix?: ChannelMixSettings | null;
	/**
	 * The low pass settings.
	 * @type {LowPassSettings | null}
	 */
	lowPass?: LowPassSettings | null;
}

export interface PlayerVoice {
	/**
	 * The voice server token.
	 * @type {string}
	 */
	token: string;
	/**
	 * The voice server endpoint.
	 * @type {string}
	 */
	endpoint: string;
	/**
	 * The voice server session id.
	 * @type {string}
	 */
	sessionId: string;
	/**
	 * The voice server guild id.
	 * @type {string | undefined}
	 */
	connected?: boolean;
	/**
	 * The voice server ping.
	 * @type {number | undefined}
	 */
	ping?: number;
}

/**
 * The JSON representation of the player.
 */
export interface PlayerJson {
	/**
	 * The guild id of the player.
	 * @type {string}
	 */
	guildId: string;
	/**
	 * The volume of the player.
	 * @type {number}
	 */
	volume: number;
	/**
	 * The self deaf state of the player.
	 * @type {boolean}
	 */
	selfDeaf: boolean;
	/**
	 * The self mute state of the player.
	 * @type {boolean}
	 */
	selfMute: boolean;
	/**
	 * The voice settings for the player.
	 * @type {LavalinkPlayerVoice}
	 */
	voice: Nullable<LavalinkPlayerVoice>;
	/**
	 * The loop mode of the player.
	 * @type {LoopMode}
	 */
	loop: LoopMode;
	/**
	 * The options for the player.
	 * @type {boolean}
	 */
	options: PlayerOptions;
	/**
	 * The paused state of the player.
	 * @type {boolean}
	 */
	paused: boolean;
	/**
	 * The playing state of the player.
	 * @type {boolean}
	 */
	playing: boolean;
	/**
	 * The voice channel id of the player.
	 * @type {string}
	 */
	voiceId?: string;
	/**
	 * The text channel id of the player.
	 * @type {string | undefined}
	 */
	textId?: string;
	/**
	 * The queue of the player.
	 * @type {QueueJson}
	 */
	queue?: QueueJson;
}

/**
 * The voice settings for the player.
 */
export type LavalinkPlayerVoice = Omit<PlayerVoice, "connected" | "ping">;
