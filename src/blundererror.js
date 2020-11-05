const doc = window.document;
const docEl = doc.documentElement;
const nav = window.navigator;
const screen = window.screen;
const perf = window.performance;

export class BlunderError extends Error {
    constructor(message, details = {}) {
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
        this.metadata = {
            datetime: new Date(),
            timestamp: Date.now(),
            userAgent: nav.userAgent,
            url: doc.location.href,
            referrer: doc.referrer,
            cookie: nav.cookieEnabled ? doc.cookie : 'disabled',
            language: nav.browserLanguage || nav.systemLanguage || nav.userLanguage || nav.language,
            readyState: doc.readyState,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
        };
        if (screen && screen.orientation && screen.orientation.type) {
            this.metadata.orientation = screen.orientation.type;
        } else {
            this.metadata.orientation = docEl.clientWidth > docEl.clientHeight ? 'landscape' : 'portrait';
        }
        if (nav.connection && nav.connection.effectiveType) {
            this.metadata.connection = nav.connection.effectiveType;
        }
        if (perf && perf.memory) {
            this.metadata.heap = Math.round(perf.memory.usedJSHeapSize / 1048576);
            this.metadata.heapPercent = Math.round(perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit * 100);
        }
        this.details = Object.assign({}, details);
    }

    static from(error, details) {
        if (error instanceof BlunderError) {
            if (details) {
                error.details = Object.assign(error.details, details);
            }
            return error;
        }
        if (error instanceof Error) {
            const blunderError = new BlunderError(error.message, details);
            blunderError.originalError = error;
            blunderError.stack = error.stack;
            return blunderError;
        }
        return new BlunderError(error, details);
    }
}
