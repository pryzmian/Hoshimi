import type { Node } from "hoshimi";
import type { UsingClient } from "seyfert";

/**
 * Handles errors emitted by a Lavalink node.
 * @param client The Seyfert client instance.
 * @param node The Lavalink node that emitted the error.
 * @param error The error that was emitted.
 */
export function nodeError(client: UsingClient, node: Node, error: unknown): void {
	client.logger.error(`Node ${node.id} emitted an error: ${error}`);
}
