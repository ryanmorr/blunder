import { serialize } from './serialize';

function setProperty(obj, name, value) {
    Object.defineProperty(obj, name, {
        configurable: true,
        enumerable : false,
        value : value,
        writable : true,
    });
}

export class Exception extends Error {

    constructor(message, options = {}) {
        const {cause: cause = null, ...data} = options;
        super(message, {cause});
        setProperty(this, 'name', this.constructor.name);
        if (!('cause' in this)) {
            setProperty(this, 'cause', cause);
        }
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        if (typeof this.stack !== 'string') {
            setProperty(this, 'stack', (new Error(message)).stack);
        }
        setProperty(this, 'data', data);
    }

    serializable() {
        return {
            name: this.name,
            message: this.message,
            stack: this.stack,
            cause: this.cause,
            data: this.data
        };
    }

    toJSON() {
        return serialize(this);
    }

    toString() {
        return `${this.name}: ${this.message}`;
    }

    static from(error, options) {
        const constructor = this;
        if (error instanceof constructor) {
            if (options) {
                const {cause: cause = null, ...data} = options;
                Object.assign(error.data, data);
                if (cause) {
                    error.cause = cause;
                }
            }
            return error;
        }
        if (error instanceof Error) {
            const { message, stack, cause, errors } = error;
            const ex = new constructor(message, options);
            ex.stack = stack;
            if (cause) {
                ex.cause = cause;
            } else if (errors) {
                ex.cause = errors.slice();
            }
            ex.source = error;
            return ex;
        }
        return new constructor(String(error), options);
    }
}
