import { stacktrace } from './stacktrace';

const doc = window.document;
const docEl = doc.documentElement;
const nav = window.navigator;
const screen = window.screen;
const perf = window.performance;

export class Exception extends Error {
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
            language: nav.language || nav.userLanguage,
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
        this.stacktrace = stacktrace(this.stack);
        const hasStack = this.stacktrace.length > 0;
        if (this.fileName === undefined) {
            this.fileName = this.fileName || this.filename || this.sourceURL || hasStack ? this.stacktrace[0].fileName : null;
        }
        if (this.lineNumber === undefined) {
            this.lineNumber = this.line || hasStack ? this.stacktrace[0].lineNumber : null;
        }
        if (this.columnNumber === undefined) {
            this.columnNumber = this.columnNumber || hasStack ? this.stacktrace[0].columnNumber : null;
        }
    }

    static from(error, details) {
        const constructor = this;
        if (error instanceof constructor) {
            if (details) {
                error.details = Object.assign(error.details, details);
            }
            return error;
        }
        if (error instanceof Error) {
            const ex = new constructor(error.message, details);
            ex.originalError = error;
            ex.stack = error.stack;
            return ex;
        }
        return new constructor(error, details);
    }
}
