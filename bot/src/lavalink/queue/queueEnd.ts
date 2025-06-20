import type { Player } from "hoshimi";
import type { UsingClient } from "seyfert";

/**
 * Handles the end of a queue in a Lavalink player.
 * @param client The Seyfert client instance.
 * @param player The player instance that emitted the event.
 */
export async function queueEnd(client: UsingClient, player: Player) {
	const textId = player.textId;
	if (!textId) return;

	await client.messages.write(textId, { content: "Queue has ended." });
}
