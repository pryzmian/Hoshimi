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
 * Error class for the storage.
 * @class StorageError
 * @extends {Error}
 */
export class StorageError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "Hoshimi [StorageError]";
    }
}

/**
 * Error class for the node manager.
 * @class NodeManagerError
 * @extends {Error}
 */
export class NodeManagerError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "Hoshimi [NodeManagerError]";
    }
}

/**
 * Error class for resolving tracks.
 * @class ResolveError
 * @extends {Error}
 */
export class ResolveError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "Hoshimi [ResolveError]";
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
