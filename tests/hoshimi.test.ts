import { describe, expect, it, vi } from "vitest";
import { ManagerError } from "../src/classes/Errors";
import { Hoshimi } from "../src/classes/Hoshimi";
import { State } from "../src/types/Node";

function createOptions() {
    return {
        sendPayload: vi.fn().mockResolvedValue(undefined),
        nodes: [{ host: "localhost", port: 2333, password: "pass" }],
    };
}

describe("Hoshimi", () => {
    it("throws ManagerError when options are missing", () => {
        expect(() => new Hoshimi(undefined as never)).toThrow(ManagerError);
    });

    it("sets default options when constructed", () => {
        const manager = new Hoshimi(createOptions() as never);

        expect(manager.options.defaultSearchSource).toBeDefined();
        expect(manager.options.playerOptions.storage).toBeDefined();
        expect(manager.options.queueOptions.storage).toBeDefined();
    });

    it("isUseable returns false when manager is not ready", () => {
        const manager = new Hoshimi(createOptions() as never);
        manager.ready = false;

        expect(manager.isUseable()).toBe(false);
    });

    it("isUseable returns true when ready and a connected node exists", () => {
        const manager = new Hoshimi(createOptions() as never);

        manager.ready = true;
        manager.nodeManager.nodes.set("node-1", { id: "node-1", state: State.Connected } as never);

        expect(manager.isUseable()).toBe(true);
    });
});
