import { Track, type LavalinkPlayer, type Node, type Ready } from "hoshimi";
import type { UsingClient } from "seyfert";

/**
 *
 * Handles the resumption of a Lavalink node.
 * @param client The Seyfert client instance.
 * @param node The Lavalink node that has resumed.
 * @param players The list of players associated with the node.
 * @param payload The payload containing the ready state of the node.
 */
export async function nodeResumed(
	client: UsingClient,
	node: Node,
	players: LavalinkPlayer[],
	payload: Ready,
): Promise<void> {
	client.logger.debug(
		`[Hoshimi] Node resumed: ${node.id} with ${players.length} players. | Payload: ${JSON.stringify(payload)}`,
	);

	for (const data of players) {
		const player = client.manager.createPlayer({
			guildId: data.guildId,
			voiceId: "1222873458778570814",
			textId: "1228578969184632882",
			node: node.id,
			selfDeaf: true,
			selfMute: false,
			volume: data.volume,
		});

		player.voice = data.voice;

		await player.connect();
		//await player.queue.utils.sync(true, false);

		if (data.track) player.queue.current = new Track(data.track);

		player.connected = data.state.connected;
		player.paused = data.paused;
		player.position = data.state.position;
		player.playing = !data.paused && !!data.track;
		player.ping = data.state.ping;

		if (!player.playing) await player.play();
	}
}
