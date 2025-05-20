import type { NodeOptions, PluginNames, SearchQuery } from "../../types/Node";
import { type RestOrArray, SearchEngines, type HoshimiOptions } from "../../types/Manager";
import { NodeError, OptionError } from "../../classes/Errors";
import type { Node } from "../../classes/node/Node";
import type { PlayerOptions } from "../../types/Player";
import type { UpdatePlayerInfo } from "../../types/Rest";
import { UrlRegex, ValidEngines } from "../constants";

/**
 *
 * Validate the manager options.
 * @param {HoshimiOptions} options The options to validate.
 * @returns {void} Nothing, yeah, nothing.
 */
export function validateManagerOptions(options: HoshimiOptions): void {
	if (!Array.isArray(options.nodes) || !options.nodes.every(isNode) || !options.nodes.length)
		throw new OptionError(
			"The manager option 'options.nodes' must be a valid array of nodes and atleast one valid node.",
		);
	if (typeof options.sendPayload !== "function")
		throw new OptionError("The manager option 'options.sendPayload' must be a vaid function.");

	if (
		typeof options.queueOptions !== "undefined" &&
		typeof options.queueOptions.maxPreviousTracks !== "number"
	)
		throw new OptionError(
			"The manager option 'options.queue.maxPreviousTracks' must be a number.",
		);
	if (
		typeof options.queueOptions !== "undefined" &&
		typeof options.queueOptions.autoplayFn !== "function"
	)
		throw new OptionError("The manager option 'options.queue.autoplayFn' must be a function.");

	if (
		typeof options.defaultSearchEngine !== "undefined" &&
		!ValidEngines.includes(options.defaultSearchEngine)
	)
		throw new OptionError(
			"The manager option 'options.defaultSearchEngine' Must be a valid search engine.",
		);
	if (typeof options.client !== "undefined" && typeof options.client !== "object")
		throw new OptionError("The manager option 'options.client' Must be a valid object.");
	if (
		typeof options.client !== "undefined" &&
		typeof options.client.id !== "undefined" &&
		typeof options.client.id !== "string"
	)
		throw new OptionError("The manager option 'options.client.id' Must be a valid string.");
	if (
		typeof options.client !== "undefined" &&
		typeof options.client.id !== "undefined" &&
		typeof options.client.username !== "string"
	)
		throw new OptionError(
			"The manager option 'options.client.username' must be a valid string.",
		);
}

/**
 *
 * Validate the query for the node.
 * @param {SearchQuery} search The query to validate.
 * @returns {string} The validated query.
 */
export function validateQuery(search: SearchQuery): string {
	if (typeof search !== "object") throw new OptionError("The 'query' must be a valid object.");
	if (typeof search.query !== "string")
		throw new OptionError("The query option 'query.query' must be a valid string.");

	if (typeof search.engine !== "undefined" && !ValidEngines.includes(search.engine))
		throw new OptionError("The query option 'query.engine' must be a valid search engine.");

	const query = search.query.trim();

	const engineKey = Object.values(SearchEngines).find((key) =>
		query.toLowerCase().startsWith(key),
	);
	if (engineKey && query.toLowerCase().startsWith(`${engineKey}:`)) {
		const sliced = query.slice(engineKey.length + 1).trim();
		const isUrl = UrlRegex.test(sliced);

		if (isUrl) return sliced;

		return `${engineKey}:${sliced}`;
	}

	const isUrl = UrlRegex.test(query);
	if (isUrl) return query;

	if (search.engine === SearchEngines.FloweryTTS) return `${search.engine}://${query}`;
	if (search.engine !== SearchEngines.Local) return `${search.engine}:${query}`;

	return query;
}

/**
 *
 * Validate the player options.
 * @param {PlayerOptions} options The player options.
 * @returns {void} Nothing, yeah, nothing, again.
 */
export function validatePlayerOptions(options: PlayerOptions): void {
	if (typeof options.guildId !== "string")
		throw new OptionError("The player option 'options.guildId' must be a string.");
	if (typeof options.voiceId !== "string")
		throw new OptionError("The player option 'options.voiceId' Must be a string.");
	if (typeof options.textId !== "undefined" && typeof options.textId !== "string")
		throw new OptionError("The player option 'options.textId' Must be a string.");

	if (typeof options.selfDeaf !== "undefined" && typeof options.selfDeaf !== "boolean")
		throw new OptionError("The player option 'options.selfDeaf' Must be a boolean.");
	if (typeof options.selfMute !== "undefined" && typeof options.selfMute !== "boolean")
		throw new OptionError("The player option 'options.selfMute' Mute must be a boolean.");
	if (typeof options.volume !== "undefined" && typeof options.volume !== "number")
		throw new OptionError("The player option 'options.volume' Must be a number.");
}

/**
 *
 * Validate the player data.
 * @param {Node} this The node to validate the player data for.
 * @param {Partial<UpdatePlayerInfo>} data The data to validate.
 * @returns {void} Nothing.
 */
export function validatePlayerData(this: Node, data: Partial<UpdatePlayerInfo>): void {
	if (
		typeof data === "object" &&
		typeof data.playerOptions === "object" &&
		typeof data.guildId === "string" &&
		Object.keys(data.playerOptions).length > 0
	) {
		const player = this.nodeManager.manager.getPlayer(data.guildId);
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
 * Validate the plugins in the node.
 * @param {Node} node The node to validate the plugins for.
 * @param {RestOrArray<string>} plugins The plugins to validate.
 */
export function validateNodePlugins(node: Node, ...plugins: RestOrArray<PluginNames>): void {
	const info = node.info;
	if (!info) throw new NodeError({ id: node.id, message: "Node is not ready yet." });

	if (!info.plugins.length)
		throw new NodeError({ id: node.id, message: "No plugins found in the node." });

	plugins = plugins.flat();

	const missings = plugins.filter((name) => !info.plugins.some((p) => p.name === name));
	if (missings.length)
		throw new NodeError({
			id: node.id,
			message: `The node does not support the following plugins: ${missings.join(", ")}.`,
		});
}

/**
 *
 * Validate if the node options are correct.
 * @param {NodeOptions} options The node options to validate.
 * @returns {boolean} If the node options are correct.
 */
function isNode(options: NodeOptions): boolean {
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
