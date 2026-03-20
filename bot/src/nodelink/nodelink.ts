import { Node, RestRoutes, SourceRegistry } from "hoshimi";
import type { NodelinkConnection } from "./types";

/**
 * Class representing a nodelink node, which extends the base Node class.
 * @class HoshimiNode
 * @extends {Node}
 */
export class HoshimiNode extends Node {
    public constructor(...args: ConstructorParameters<typeof Node>) {
        super(...args);

        SourceRegistry.register({ source: "bilibili", name: "bilibili" }, { source: "azsearch", name: "amazonmusic" });
    }
    /**
     *
     * Get the connection metrics for nodelink.
     * If the node is not nodelink, this will return null.
     * @returns {Promise<NodelinkConnection | null>} The connection metrics, or null if nodelink is not enabled.
     */
    public connection(): Promise<NodelinkConnection | null> {
        if (!this.isNodelink()) return Promise.resolve(null);
        return this.rest.request<NodelinkConnection>({ endpoint: RestRoutes.Connection });
    }
}
