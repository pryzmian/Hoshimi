import type { Node } from "hoshimi";
import type { UsingClient } from "seyfert";

/**
 * Handles the disconnection of a Lavalink node.
 * @param client The Seyfert client instance.
 * @param node The Lavalink node that has disconnected.
 */
export function nodeDisconnect(client: UsingClient, node: Node): void {
	client.logger.error(`Node ${node.id} disconnected.`);
}
