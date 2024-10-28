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

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            stack: this.stack,
            cause: this.cause,
            data: Object.keys(this.data).reduce((data, key) => {
                let val = this.data[key];
                const type = {}.toString.call(val).slice(8, -1)
                if (type === 'Date' || type === 'Function') {
                    val = val.toString();
                }
                data[key] = val;
                return data;
            }, {})
        };
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
            const errors = error.errors;
            const ex = new constructor(error.message, options);
            ex.stack = error.stack;
            ex.cause = errors ? (errors.length === 1 ? errors[0] : errors) : error;
            return ex;
        }
        return new constructor(String(error), options);
    }
}
