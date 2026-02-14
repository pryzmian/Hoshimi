import { LyricsManager } from "../classes/node/Lyrics";
import { NodeManager } from "../classes/node/Manager";
import { Node } from "../classes/node/Node";
import { Rest } from "../classes/node/Rest";
import { FilterManager } from "../classes/player/filters/Manager";
import { Player } from "../classes/player/Player";
import { Queue } from "../classes/queue/Queue";
import type { CustomizableStructures } from "./Manager";

/**
 * The structure for the Player class.
 */
export type PlayerStructure = InferCustomStructure<Player, "Player">;

/**
 * The structure for the Rest class.
 */
export type RestStructure = InferCustomStructure<Rest, "Rest">;

/**
 * The structure for the Node class.
 */
export type NodeStructure = InferCustomStructure<Node, "Node">;

/**
 * The structure for the Queue class.
 */
export type QueueStructure = InferCustomStructure<Queue, "Queue">;

/**
 * The structure for the LyricsManager class.
 */
export type LyricsManagerStructure = InferCustomStructure<LyricsManager, "LyricsManager">;

/**
 * The structure for the NodeManager class.
 */
export type NodeManagerStructure = InferCustomStructure<NodeManager, "NodeManager">;

/**
 * The structure for the FilterManager class.
 */
export type FilterManagerStructure = InferCustomStructure<FilterManager, "FilterManager">;

/**
 * The structures of the Hoshimi classes.
 */
export const Structures = {
    Player(...args: ConstructorParameters<typeof Player>): PlayerStructure {
        return new Player(...args);
    },
    Rest(...args: ConstructorParameters<typeof Rest>): RestStructure {
        return new Rest(...args);
    },
    Node(...args: ConstructorParameters<typeof Node>): NodeStructure {
        return new Node(...args);
    },
    Queue(...args: ConstructorParameters<typeof Queue>): QueueStructure {
        return new Queue(...args);
    },
    LyricsManager(...args: ConstructorParameters<typeof LyricsManager>): LyricsManagerStructure {
        return new LyricsManager(...args);
    },
    NodeManager(...args: ConstructorParameters<typeof NodeManager>): NodeManagerStructure {
        return new NodeManager(...args);
    },
    FilterManager(...args: ConstructorParameters<typeof FilterManager>): FilterManagerStructure {
        return new FilterManager(...args);
    },
};

/**
 * Infers the custom structure for a given class.
 */
export type InferCustomStructure<T, N extends string> = CustomizableStructures extends Record<N, infer P> ? P : T;
