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

interface NodeErrorOptions {
	message: string;
	id: string;
}
