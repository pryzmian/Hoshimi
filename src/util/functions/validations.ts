import type { NodeOptions, SearchQuery } from "../../types/Node";
import { SearchEngines, type HoshimiOptions } from "../../types/Manager";
import { OptionError } from "../../classes/Errors";
import type { Node } from "../../classes/node/Node";
import type { PlayerOptions } from "../../types/Player";
import type { LavalinkPlayer, UpdatePlayerInfo } from "../../types/Rest";

const validEngines = Object.values(SearchEngines);

/**
 *
 * Validate the manager options.
 * @param options The options to validate.
 */
export function validateManagerOptions(options: HoshimiOptions) {
	if (!Array.isArray(options.nodes) || !options.nodes.every(isNode) || !options.nodes.length)
		throw new OptionError(
			"'options.nodes': Must be a valid array of nodes and atleast one valid node.",
		);
	if (typeof options.sendPayload !== "function")
		throw new OptionError("'options.sendPayload': Must be a vaid function.");

	if (
		typeof options.queueOptions !== "undefined" &&
		typeof options.queueOptions.maxPreviousTracks !== "number"
	)
		throw new OptionError("'options.queue.maxPreviousTracks': Must be a number.");
	if (
		typeof options.queueOptions !== "undefined" &&
		typeof options.queueOptions.autoplayFn !== "function"
	)
		throw new OptionError("'options.queue.autoplayFn': Must be a function.");

	if (
		typeof options.defaultSearchEngine !== "undefined" &&
		!validEngines.includes(options.defaultSearchEngine)
	)
		throw new OptionError("'options.defaultSearchEngine' Must be a valid search engine.");
	if (typeof options.client !== "undefined" && typeof options.client !== "object")
		throw new OptionError("'options.client' Must be a valid object.");
	if (typeof options.client !== "undefined" && typeof options.client.id !== "string")
		throw new OptionError("'options.client.id' Must be a valid string.");
	if (typeof options.client !== "undefined" && typeof options.client.username !== "string")
		throw new OptionError("'options.client.username': Must be a valid string.");
}

/**
 *
 * Validate the query for the node.
 * @param this The node to validate the query for.
 * @param search The query to validate.
 * @returns
 */
export function validateQuery(this: Node, search: SearchQuery): SearchQuery {
	if (typeof search !== "object") throw new OptionError("'query' Must be a valid object.");
	if (typeof search.query !== "string")
		throw new OptionError("'query.query' Must be a valid string.");

	const engine = search.engine ?? this.manager.options.defaultSearchEngine;
	if (typeof engine !== "undefined" && !validEngines.includes(engine))
		throw new OptionError("'query.engine' Must be a valid search engine.");

	search.engine ??= engine;

	const engineKey = Object.keys(SearchEngines).find((key) => search.query.startsWith(`${key}:`));
	if (engineKey && search.query.startsWith(`${engineKey}:`))
		search.query = search.query.slice(engineKey.length + 1);

	const isUrl = /^(https?:\/\/)?([a-zA-Z0-9\-_]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/.test(search.query);
	if (isUrl) search.query = new URL(search.query).toString();

	if (search.engine !== SearchEngines.Local && !isUrl)
		search.query = `${search.engine}:${encodeURIComponent(search.query)}`;
	if (search.engine === SearchEngines.FloweryTTS) search.query = `//${encodeURI(search.query)}`;

	return search;
}

/**
 *
 * Validate the player options.
 * @param options The player options.
 */
export function validatePlayerOptions(options: PlayerOptions): void {
	if (typeof options.guildId !== "string")
		throw new OptionError("options.guildId: Must be a string.");
	if (typeof options.voiceId !== "string")
		throw new OptionError("options.voiceId: Must be a string.");
	if (typeof options.textId !== "undefined" && typeof options.textId !== "string")
		throw new OptionError("options.textId: Must be a string.");

	if (typeof options.selfDeaf !== "undefined" && typeof options.selfDeaf !== "boolean")
		throw new OptionError("options.selfDeaf: Must be a boolean.");
	if (typeof options.selfMute !== "undefined" && typeof options.selfMute !== "boolean")
		throw new OptionError("options.selfMute: Mute must be a boolean.");
	if (typeof options.volume !== "undefined" && typeof options.volume !== "number")
		throw new OptionError("options.volume: Must be a number.");
}

/**
 *
 * Validate the player data.
 * @param this The node to validate the player data for.
 * @param data The data to validate.
 * @param res The lavalink player to validate.
 * @returns
 */
export function validatePlayerData(
	this: Node,
	data: Partial<UpdatePlayerInfo>,
	res: LavalinkPlayer | null,
): void {
	if (
		typeof data === "object" &&
		typeof data.playerOptions === "object" &&
		typeof data.guildId === "string" &&
		Object.keys(data.playerOptions).length > 0
	) {
		const player = this.manager.getPlayer(data.guildId);
		if (!player) return;

		if (typeof data.playerOptions.voice === "object") player.voice = data.playerOptions.voice;

		if (typeof data.playerOptions.paused === "boolean") {
			player.paused = data.playerOptions.paused;
			player.playing = !data.playerOptions.paused;
		}

		if (typeof data.playerOptions.volume === "number")
			player.volume = data.playerOptions.volume;
	}
}

/**
 *
 * Validate if the node options are correct.
 * @param options The node options to validate.
 * @returns
 */
function isNode(options: NodeOptions) {
	return (
		typeof options.host === "string" &&
		typeof options.port === "number" &&
		typeof options.password === "string" &&
		(typeof options.id === "string" || typeof options.id === "undefined") &&
		(typeof options.secure === "boolean" || typeof options.secure === "undefined") &&
		(typeof options.sessionId === "string" || typeof options.sessionId === "undefined") &&
		(typeof options.retryAmount === "number" || typeof options.retryAmount === "undefined") &&
		(typeof options.retryDelay === "number" || typeof options.retryDelay === "undefined")
	);
}
