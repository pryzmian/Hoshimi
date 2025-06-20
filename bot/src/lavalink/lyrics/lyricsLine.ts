import type { LyricsLineEvent, Player, Track } from "hoshimi";
import type { UsingClient } from "seyfert";

/**
 * Handles the lyrics line event from the lavalink node.
 * @param client The Seyfert client instance.
 * @param player The player instance that emitted the event.
 * @param track The current track being played, or null if no track is playing.
 * @param payload The lyrics line event payload containing the lyrics line.
 */
export async function lyricsLine(
	client: UsingClient,
	player: Player,
	track: Track | null,
	payload: LyricsLineEvent,
) {
	client.logger.info({ player, track, payload });
}
