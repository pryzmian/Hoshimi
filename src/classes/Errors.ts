/**
 * Error class for the manager.
 */
export class ManagerError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "Hoshimi [ManagerError]";
	}
}

/**
 * Error class for invalid options.
 */
export class OptionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "Hoshimi [OptionError]";
	}
}

/**
 * Error class for the player.
 */
export class PlayerError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "Hoshimi [PlayerError]";
	}
}

/**
 * Error class for the node.
 */
export class NodeError extends Error {
	constructor({ message, id }: NodeErrorOptions) {
		super(message);
		this.name = `Hoshimi [NodeError | ${id}]`;
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
