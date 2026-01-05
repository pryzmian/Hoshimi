import type { HoshimiEvents, Omit, PlayerJson } from "hoshimi";
import type { UsingClient } from "seyfert";
import type { Awaitable } from "seyfert/lib/common";
import type { APIUser } from "seyfert/lib/types";

/**
 * The interface of the session json.
 * @extends {PlayerJson}
 */
export interface SessionJson
    extends Omit<PlayerJson, "ping" | "createdTimestamp" | "lastPositionUpdate" | "paused" | "playing" | "queue" | "filters"> {
    requester: HoshimiUser;
}

/**
 * The interface of the Hoshimi user.
 */
export type HoshimiUser = APIUser & {
    tag: string;
};

/**
 * The interface of the lavalink event.
 */
export interface LavalinkEvent<K extends keyof HoshimiEvents> {
    /**
     * The event name.
     * @type {K}
     */
    name: K;
    /**
     * The event run callback.
     * @type {LavalinkEventRun<K>}
     */
    run: LavalinkEventRun<K>;
    /**
     * The event once property.
     * @type {boolean}
     * @default false
     */
    once?: boolean;
}

/**
 * The interface of the lavalink event run function.
 */
export type LavalinkEventRun<K extends keyof HoshimiEvents> = (client: UsingClient, ...args: HoshimiEvents[K]) => Awaitable<any>;
