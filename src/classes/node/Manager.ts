import { type NodeOptions, State } from "../../types/Node";
import { Collection } from "../../util/collection";
import type { Hoshimi } from "../Hoshimi";
import { Node } from "./Node";

/**
 * Class representing a node manager.
 */
export class NodeManager {
	/**
	 * The manager for the node.
	 * @type {Hoshimi}
	 */
	public manager: Hoshimi;

	/**
	 * The nodes for the manager.
	 * @type {Collection<string, Node>}
	 */
	readonly nodes: Collection<string, Node> = new Collection();

	/**
	 *
	 * The constructor for the node manager.
	 * @param {Hoshimi} manager The manager for the node.
	 */
	constructor(manager: Hoshimi) {
		this.manager = manager;
	}

	/**
	 *
	 * Delete the node.
	 * @param {string} id The id of the node to delete.
	 * @returns {boolean} If the node was deleted.
	 */
	public deleteNode(id: string): boolean {
		return this.nodes.delete(id);
	}

	/**
	 *
	 * Get the node by id.
	 * @param {string} id The id of the node.
	 * @returns {Node | undefined} The node or undefined if not found.
	 */
	public getNode(id: string): Node | undefined {
		return this.nodes.get(id);
	}

	/**
	 *
	 * Get the least used node.
	 * @returns {Node} The least used node.
	 */
	public getLeastUsedNode(): Node {
		const nodes: Node[] = this.nodes.filter((node) => node.state === State.Connected);
		return nodes.reduce((a, b) => (a.penalties < b.penalties ? a : b));
	}

	/**
	 *
	 * Create a new node.
	 * @param {NodeOptions} options The options for the node.
	 * @returns {Node} The created node.
	 */
	public createNode(options: NodeOptions): Node {
		const oldNode: Node | undefined = this.nodes.get(
			options.id ?? `${options.host}:${options.port}`,
		);
		if (oldNode) return oldNode;

		const node = new Node(this, options);
		this.nodes.set(node.id, node);
		return node;
	}

	/**
	 *
	 * Reconnect the nodes.
	 * @returns {void}
	 */
	public reconnectNodes(): void {
		if (!this.nodes.size) return;

		for (const node of this.nodes.filter((node) => node.state !== State.Connected)) {
			node.reconnect();
		}
	}

	/**
	 * Disconnect the nodes.
	 * @returns {void}
	 */
	public disconnectNodes(): void {
		if (!this.nodes.size) return;

		for (const node of this.nodes.filter((node) => node.state !== State.Disconnected)) {
			node.disconnect();
		}
	}

	/**
	 * Connect the nodes.
	 * @returns {void}
	 */
	public connectNodes(): void {
		if (!this.nodes.size) return;

		for (const node of this.nodes.filter((node) => node.state !== State.Connected)) {
			node.connect();
		}
	}

	/**
	 * Destroy the nodes.
	 * @returns {void}
	 */
	public destroyNodes(): void {
		if (!this.nodes.size) return;

		for (const node of this.nodes.values()) {
			node.destroy();
		}
	}
}
