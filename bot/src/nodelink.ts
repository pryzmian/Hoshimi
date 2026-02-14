import { Node, RestRoutes } from "hoshimi";

/**
 * The connection speed metrics for nodelink.
 */
interface NodelinkConnectionSpeed {
    /**
     * Speed in megabits per second.
     * @type {number}
     */
    mbps: number;
    /**
     * Speed in kilobits per second.
     * @type {number}
     */
    kbps: number;
    /**
     * Speed in bits per second.
     * @type {number}
     */
    bps: number;
}

/**
 * The connection metrics for nodelink.
 */
interface NodelinkConnectionMetrics {
    /**
     * Timestamp of the metrics.
     * @type {number}
     */
    timestamp: number;
    /**
     * Total bytes downloaded.
     * @type {number}
     */
    downloadedBytes: number;
    /**
     * The duration of the connection in seconds.
     * @type {number}
     */
    durationSeconds: number;
    /**
     * The connection speed metrics.
     * @type {NodelinkConnectionSpeed}
     */
    speed: NodelinkConnectionSpeed;
    /**
     * The current status of the connection.
     * @type {string}
     */
    status: string;
}

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
}
