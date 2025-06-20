import type { Node, NodeDestroyInfo } from "hoshimi";
import type { UsingClient } from "seyfert";

/**
 * Handles the destruction of a Lavalink node.
 * @param client The Seyfert client instance.
 * @param node The Lavalink node that is being destroyed.
 * @param destroy The destruction information containing the reason and code.
 */
export function nodeDestroy(client: UsingClient, node: Node, destroy: NodeDestroyInfo): void {
	client.logger.warn(
		`Node ${node.id} is destroyed with the reason ${destroy.reason} (${destroy.code}).`,
	);
}
