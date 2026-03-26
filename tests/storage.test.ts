import { describe, expect, it } from "vitest";

import { QueueStore } from "../src/classes/queue/Store";
import { PlayerMemoryStorage } from "../src/classes/storage/PlayerMemory";
import { QueueMemoryStorage } from "../src/classes/storage/QueueMemory";

describe("storage", () => {
    it("QueueMemoryStorage set/get/has/delete/clear work correctly", () => {
        const storage = new QueueMemoryStorage();
        const key = "guild-1";
        const namespacedKey = `${storage.namespace}:${key}`;
        const value = {
            tracks: [],
            history: [],
            current: null,
        };

        storage.set(key, value);

        expect(storage.has(key)).toBe(true);
        expect(storage.get(key)).toBeUndefined();
        expect(storage.get(namespacedKey)).toEqual(value);

        expect(storage.delete(key)).toBe(true);
        expect(storage.has(key)).toBe(false);

        storage.set(key, value);
        storage.clear();
        expect(storage.has(key)).toBe(false);
    });

    it("QueueMemoryStorage buildKey applies namespace", () => {
        const storage = new QueueMemoryStorage();

        expect(storage.buildKey(storage.namespace, "guild-1")).toBe("hoshimiqueue:guild-1");
    });

    it("PlayerMemoryStorage CRUD and helpers work correctly", () => {
        const storage = new PlayerMemoryStorage();

        storage.set("volume" as never, 100 as never);

        expect(storage.has("volume" as never)).toBe(true);
        expect(storage.get("volume" as never)).toBe(100);
        expect(storage.size()).toBe(1);

        expect(storage.keys()).toEqual(["hoshimiplayer:volume"]);
        expect(storage.values()).toEqual([100]);
        expect(storage.entries()).toEqual([["hoshimiplayer:volume", 100]]);
        expect(storage.all()).toEqual({ "hoshimiplayer:volume": 100 });

        expect(storage.delete("volume" as never)).toBe(true);
        expect(storage.has("volume" as never)).toBe(false);

        storage.clear();
        expect(storage.size()).toBe(0);
    });

    it("QueueStore delegates operations to the adapter", () => {
        const storage = new QueueMemoryStorage();
        const store = new QueueStore(storage);

        const key = "guild-2";
        const namespacedKey = `${storage.namespace}:${key}`;
        const value = {
            tracks: [],
            history: [],
            current: null,
        };

        store.set(key, value);
        expect(store.get(key)).toBeUndefined();
        expect(store.get(namespacedKey)).toEqual(value);

        expect(store.delete(key)).toBe(true);
        expect(store.get(key)).toBeUndefined();
    });
});
