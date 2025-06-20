import type { Node } from "hoshimi";
import type { UsingClient } from "seyfert";

/**
 * Handles the readiness of a Lavalink node.
 * @param client The Seyfert client instance.
 * @param node The Lavalink node that is ready.
 */
export function nodeReady(client: UsingClient, node: Node): void {
	client.logger.info(`Node ${node.id} is ready.`);
}
