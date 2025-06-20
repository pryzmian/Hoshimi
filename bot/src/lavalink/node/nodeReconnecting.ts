import type { Node } from "hoshimi";
import type { UsingClient } from "seyfert";
import { TimeFormat } from "../../time";

/**
 * Handles the reconnection of a Lavalink node.
 * @param client The Seyfert client instance.
 * @param node The Lavalink node that is reconnecting.
 * @param retriesLeft The number of retries left for the reconnection.
 * @param delay The delay before the next reconnection attempt, in milliseconds.
 */
export function nodeReconnecting(
	client: UsingClient,
	node: Node,
	retriesLeft: number,
	delay: number,
): void {
	client.logger.warn(
		`Node ${node.id} is reconnecting with ${retriesLeft} retries left in ${TimeFormat.toHumanize(delay)}...`,
	);
}
