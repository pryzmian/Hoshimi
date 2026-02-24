import { type Awaitable, Node, RestRoutes } from "hoshimi";
import { logger } from "../utils";
import type { NodelinkConnectionMetrics, NodelinkPayload } from "./types";

/**
 * Class representing a nodelink node, which extends the base Node class.
 * @class HoshimiNode
 * @extends {Node}
 */
export class HoshimiNode extends Node {
    /**
     *
     * Get the connection metrics for nodelink.
     * If the node is not nodelink, this will return null.
     * @returns {Promise<NodelinkConnectionMetrics | null>} The connection metrics, or null if nodelink is not enabled.
     */
    public connection(): Promise<NodelinkConnectionMetrics | null> {
        if (!this.isNodelink()) return Promise.resolve(null);
        return this.rest.request<NodelinkConnectionMetrics>({ endpoint: RestRoutes.Connection });
    }

    public override message(payload: NodelinkPayload): Awaitable<void> {
        if (!this.isNodelink())
            return logger.warn(
                `[Nodelink] Received a message event, but the node is not a nodelink node. Payload: ${JSON.stringify(payload)}`,
            );

        logger.info(`[Nodelink] Received event: ${payload.op} with data: ${JSON.stringify(payload)}`);
    }
}
