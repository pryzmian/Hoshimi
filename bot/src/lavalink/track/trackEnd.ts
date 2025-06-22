import { type Player, SourceNames, type Track } from "hoshimi";
import type { UsingClient } from "seyfert";

/**
 * Handles the end of a track in a Lavalink player.
 * @param client The Seyfert client instance.
 * @param track The track that has ended, or null if no track was playing.
 * @param player The player instance that emitted the event.
 */
export async function trackEnd(client: UsingClient, track: Track | null, player: Player) {
	if (!track) return;

	if (track.info.sourceName === SourceNames.FloweryTTS) return;

	const textId = player.textId;
	if (!textId) return;

	await client.messages.write(textId, {
		content: `Finished playing: ${track.toHyperlink()}`,
	});
}
