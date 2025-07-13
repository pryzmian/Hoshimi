import { Events } from "../../types/Manager";
import { type NodeOptions, State } from "../../types/Node";
import { Collection } from "../../util/collection";
import type { Hoshimi } from "../Hoshimi";
import { Node } from "./Node";

/**
 * Class representing a node manager.
 * @class NodeManager
 */
export class NodeManager {
	/**
	 * The manager for the node.
	 * @type {Hoshimi}
	 * @readonly
	 */
	readonly manager: Hoshimi;

	/**
	 * The nodes for the manager.
	 * @type {Collection<string, Node>}
	 * @readonly
	 */
	readonly nodes: Collection<string, Node> = new Collection();

	/**
	 *
	 * The constructor for the node manager.
	 * @param {Hoshimi} manager The manager for the node.
	 * @example
	 * ```ts
	 * const manager = new Hoshimi();
	 * const nodeManager = new NodeManager(manager);
	 *
	 * console.log(nodeManager.nodes.size); // 0
	 * ```
	 */
	constructor(manager: Hoshimi) {
		this.manager = manager;
	}

	/**
	 *
	 * Delete the node.
	 * @param {string} id The id of the node to delete.
	 * @returns {boolean} If the node was deleted.
	 * @example
	 * ```ts
	 * const node = manager.nodeManager.get("node1");
	 * if (node) manager.nodeManager.delete(node.id); // true if the node was deleted
	 * ```
	 */
	public delete(id: string): boolean {
		return this.nodes.delete(id);
	}

	/**
	 *
	 * Get the node by id.
	 * @param {string} id The id of the node.
	 * @returns {Node | undefined} The node or undefined if not found.
	 * @example
	 * ```ts
	 * const node = manager.nodeManager.get("node1");
	 * if (node) console.log(node.id); // node1
	 * ```
	 */
	public get(id: string): Node | undefined {
		return this.nodes.get(id);
	}

	/**
	 *
	 * Get the least used node.
	 * @returns {Node} The least used node.
	 * @example
	 * ```ts
	 * const node = manager.nodeManager.getLeastUsed();
	 * if (node) {
	 * 	console.log(node.id); // node1
	 * 	console.log(node.penalties); // the penalties of the node
	 * 	console.log(node.state); // the state of the node
	 * }
	 * ```
	 */
	public getLeastUsed(): Node {
		const nodes: Node[] = this.nodes.filter((node) => node.state === State.Connected);
		return nodes.reduce((a, b) => (a.penalties < b.penalties ? a : b));
	}

	/**
	 *
	 * Create a new node.
	 * @param {NodeOptions} options The options for the node.
	 * @returns {Node} The created node.
	 * @example
	 * ```ts
	 * const node = manager.nodeManager.create({
	 * 	host: "localhost",
	 * 	port: 2333,
	 * 	password: "password",
	 * 	secure: false,
	 * });
	 *
	 * console.log(node.id); // localhost:2333
	 */
	public create(options: NodeOptions): Node {
		options.id ??= `${options.host}:${options.port}`;

		const oldNode: Node | undefined = this.nodes.get(options.id);
		if (oldNode) return oldNode;

		const node = new Node(this, options);

		this.nodes.set(node.id, node);
		this.manager.emit(Events.NodeCreate, node);

		return node;
	}

	/**
	 *
	 * Reconnect the nodes.
	 * @returns {void}
	 * @example
	 * ```ts
	 * const node = manager.nodeManager.get("node1");
	 * if (node) node.reconnectNodes();
	 * ```
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
	 * @example
	 * ```ts
	 * const node = manager.nodeManager.get("node1");
	 * if (node) node.disconnectNodes();
	 * ```
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
	 * @example
	 * ```ts
	 * const node = manager.nodeManager.get("node1");
	 * if (node) node.connectNodes();
	 * ```
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
	 * @example
	 * ```ts
	 * const node = manager.nodeManager.get("node1");
	 * if (node) node.destroyNodes();
	 * ```
	 */
	public destroyNodes(): void {
		if (!this.nodes.size) return;

		for (const node of this.nodes.values()) {
			node.destroy();
		}
	}
}
