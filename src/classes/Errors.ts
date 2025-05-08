/**
 * Error class for the manager.
 * @class ManagerError
 * @extends {Error}
 */
export class ManagerError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "Hoshimi [ManagerError]";
	}
}

/**
 * Error class for invalid options.
 * @class OptionError
 * @extends {Error}
 */
export class OptionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "Hoshimi [OptionError]";
	}
}

/**
 * Error class for the player.
 * @class PlayerError
 * @extends {Error}
 */
export class PlayerError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "Hoshimi [PlayerError]";
	}
}

/**
 * Error class for the node.
 * @class NodeError
 * @extends {Error}
 */
export class NodeError extends Error {
	constructor({ message, id }: NodeErrorOptions) {
		super(message);
		this.name = `Hoshimi [NodeError | ${id}]`;
	}
}

/**
 * Error class for merging options.
 * @class MergeError
 * @extends {Error}
 */
export class MergeError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "Hoshimi [MergeError]";
	}
}

/**
 * Error options for the node.
 */
interface NodeErrorOptions {
	/**
	 * The message of the error.
	 * @type {string}
	 */
	message: string;
	/**
	 * The id of the node.
	 * @type {string}
	 */
	id: string;
}
