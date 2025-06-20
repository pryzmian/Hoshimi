import { SourceNames, type Player, type Track } from "hoshimi";
import type { UsingClient } from "seyfert";
import { TimeFormat } from "../../time";

/**
 * Handles the start of a track in a Lavalink player.
 * @param client The Seyfert client instance.
 * @param track The track that has started, or null if no track was playing.
 * @param player The player instance that emitted the event.
 */
export async function trackStart(client: UsingClient, track: Track | null, player: Player) {
	if (!track) return;

	if (track.info.sourceName === SourceNames.FloweryTTS) return;

	const textId = player.textId;
	if (!textId) return;

	await client.messages.write(textId, {
		content: `Now playing: ${track.toHyperlink()} (${TimeFormat.toHumanize(track.info.length)}), By: ${track.requester.tag}`,
	});
}
