import { Events } from "../../types/Manager";
import { type NodeOptions, NodeSortTypes, State } from "../../types/Node";
import { type NodeStructure, Structures } from "../../types/Structures";
import { Collection } from "../../util/collection";
import type { Hoshimi } from "../Hoshimi";

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
    readonly nodes: Collection<string, NodeStructure> = new Collection();

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
     * @returns {NodeStructure | undefined} The node or undefined if not found.
     * @example
     * ```ts
     * const node = manager.nodeManager.get("node1");
     * if (node) console.log(node.id); // node1
     * ```
     */
    public get(id: string): NodeStructure | undefined {
        return this.nodes.get(id);
    }

    /**
     *
     * Get the least used node.
     * @returns {NodeStructure} The least used node.
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
    public getLeastUsed(sortType: NodeSortTypes = NodeSortTypes.Penalties): NodeStructure {
        const nodes: NodeStructure[] = this.nodes.filter((node) => node.state === State.Connected);
        if (!nodes.length) throw new Error("No connected nodes available.");

        let node: NodeStructure | undefined;

        switch (sortType) {
            case NodeSortTypes.Players: {
                const sorted = nodes.sort((a, b) => (a.stats?.players ?? 0) - (b.stats?.players ?? 0));
                node = sorted[0];
                break;
            }

            case NodeSortTypes.PlayingPlayers: {
                const sorted = nodes.sort((a, b) => (a.stats?.playingPlayers ?? 0) - (b.stats?.playingPlayers ?? 0));
                node = sorted[0];
                break;
            }

            case NodeSortTypes.SystemLoad: {
                const sorted = nodes.sort((a, b) => (a.stats?.cpu.systemLoad ?? 0) - (b.stats?.cpu.systemLoad ?? 0));
                node = sorted[0];
                break;
            }

            case NodeSortTypes.LavalinkLoad: {
                const sorted = nodes.sort((a, b) => (a.stats?.cpu.lavalinkLoad ?? 0) - (b.stats?.cpu.lavalinkLoad ?? 0));
                node = sorted[0];
                break;
            }

            case NodeSortTypes.Penalties: {
                const sorted = nodes.sort((a, b) => a.penalties - b.penalties);
                node = sorted[0];
                break;
            }

            case NodeSortTypes.Cpu: {
                const sorted = nodes.sort((a, b) => {
                    const aLoad = ((a.stats?.cpu.systemLoad ?? 0) + (a.stats?.cpu.lavalinkLoad ?? 0)) / 2;
                    const bLoad = ((b.stats?.cpu.systemLoad ?? 0) + (b.stats?.cpu.lavalinkLoad ?? 0)) / 2;
                    return aLoad - bLoad;
                });
                node = sorted[0];
                break;
            }

            case NodeSortTypes.Memory: {
                const sorted = nodes.sort((a, b) => {
                    const aLoad = ((a.stats?.memory.used ?? 0) / (a.stats?.memory.allocated ?? 1)) * 100;
                    const bLoad = ((b.stats?.memory.used ?? 0) / (b.stats?.memory.allocated ?? 1)) * 100;
                    return aLoad - bLoad;
                });
                node = sorted[0];
                break;
            }
        }

        if (!node) throw new Error("No connected nodes available.");

        return node;
    }

    /**
     *
     * Create a new node.
     * @param {NodeOptions} options The options for the node.
     * @returns {NodeStructure} The created node.
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
    public create(options: NodeOptions): NodeStructure {
        options.id ??= `${options.host}:${options.port}`;

        const oldNode: NodeStructure | undefined = this.nodes.get(options.id);
        if (oldNode) return oldNode;

        const node = Structures.Node(this, options);

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
     * if (node) node.reconnect();
     * ```
     */
    public reconnect(): void {
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
     * if (node) node.disconnect();
     * ```
     */
    public disconnect(): void {
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
     * if (node) node.connect();
     * ```
     */
    public connect(): void {
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
     * if (node) node.destroy();
     * ```
     */
    public destroy(): void {
        if (!this.nodes.size) return;

        for (const node of this.nodes.values()) {
            node.destroy();
        }
    }
}
