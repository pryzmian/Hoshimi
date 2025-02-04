import { EventEmitter } from "node:events";

export abstract class TypedEmitter<T extends Record<string, unknown[]>> extends EventEmitter {
	override on<K extends Extract<keyof T, string> | symbol>(
		eventName: K,
		listener: (...args: T[Extract<K, string>]) => void,
	): this {
		return super.on(eventName, listener);
	}

	override once<K extends Extract<keyof T, string> | symbol>(
		eventName: K,
		listener: (...args: T[Extract<K, string>]) => void,
	): this {
		return super.once(eventName, listener);
	}

	override off<K extends Extract<keyof T, string> | symbol>(
		eventName: K,
		listener: (...args: T[Extract<K, string>]) => void,
	): this {
		return super.off(eventName, listener);
	}

	override emit<K extends Extract<keyof T, string> | symbol>(
		eventName: K,
		...args: T[Extract<K, string>]
	): boolean {
		return super.emit(eventName, ...args);
	}
}
