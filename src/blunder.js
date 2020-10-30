const nav = window.navigator;
const screen = window.screen;
const doc = window.document;
const docEl = doc.documentElement;

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
        this.metadata = {
            timestamp: Date.now(),
            datetime: new Date().toString(),
            userAgent: nav.userAgent,
            url: doc.location.href,
            referrer: doc.referrer,
            cookie: nav.cookieEnabled ? doc.cookie : 'disabled',
            language: nav.browserLanguage || nav.systemLanguage || nav.userLanguage || nav.language,
            readyState: document.readyState,
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
        if (window.performance && window.performance.memory) {
            this.metadata.heap = Math.round(performance.memory.usedJSHeapSize / 1048576);
            this.metadata.heapPercent = Math.round(performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit * 100);
        }
    }
}
