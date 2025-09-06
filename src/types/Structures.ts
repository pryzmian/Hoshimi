import { Node } from "../classes/node/Node";
import { Rest } from "../classes/node/Rest";
import { Player } from "../classes/player/Player";
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
};

/**
 * Infers the custom structure for a given class.
 */
export type InferCustomStructure<T, N extends string> = CustomizableStructures extends Record<N, infer P> ? P : T;
