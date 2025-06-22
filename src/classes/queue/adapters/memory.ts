import type { QueueJson } from "../../../types/Queue";
import { StorageAdapter } from "./abstract";

/**
 * Class representing a memory storage manager.
 * @class MemoryAdapter
 * @extends {StorageAdapter}
 */
export class MemoryAdapter<
	T extends QueueJson = QueueJson,
> extends StorageAdapter<T> {
	/**
	 * Memory storage.
	 * @type {Map<string, QueueJson>}
	 * @private
	 * @readonly
	 * @internal
	 */
	private readonly storage: Map<string, T> = new Map();

	public override get(key: string): T | undefined {
		return this.parse(this.storage.get(key));
	}

	public override set(key: string, value: T): void {
		this.storage.set(key, this.stringify(value));
	}

	public override delete(key: string): boolean {
		return this.storage.delete(key);
	}

	public override clear(): void {
		return this.storage.clear();
	}

	public override has(key: string): boolean {
		return this.storage.has(key);
	}

	public override parse(value: unknown): T {
		return value as T;
	}

	public override stringify(value: unknown): T {
		return value as T;
	}
}
