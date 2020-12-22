import { getMetaData } from './metadata';
import { stacktrace } from './stacktrace';

export class Exception extends Error {

    constructor(message, detail = {}) {
        super(message);
        Object.defineProperty(this, 'name', {
            configurable: true,
            enumerable : false,
            value : this.constructor.name,
            writable : true,
        });
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        if (typeof this.stack !== 'string') {
            Object.defineProperty(this, 'stack', {
                configurable: true,
                enumerable : false,
                value : (new Error(message)).stack,
                writable : true,
            });
        }
        this.detail = detail;
        this.meta = getMetaData();
    }

    get stacktrace() {
        if (!this._stacktrace) {
            this._stacktrace = stacktrace(this.stack);
        }
        return this._stacktrace;
    }

    static from(error, detail) {
        const constructor = this;
        if (error instanceof constructor) {
            if (detail) {
                error.detail = Object.assign(error.detail, detail);
            }
            return error;
        }
        if (error instanceof Error) {
            const ex = new constructor(error.message, detail);
            ex.stack = error.stack;
            ex.source = error;
            return ex;
        }
        return new constructor(error, detail);
    }
}
