export class BlunderError extends Error {
    constructor(message) {
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
    }
}
