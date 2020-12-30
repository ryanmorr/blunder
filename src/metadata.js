const doc = window.document;
const docEl = doc.documentElement;
const nav = window.navigator;
const screen = window.screen;
const perf = window.performance;

export function getMetaData() {
    const meta = {
        datetime: new Date().toString(),
        timestamp: Date.now(),
        userAgent: nav.userAgent,
        url: doc.location.href,
        referrer: doc.referrer,
        cookie: nav.cookieEnabled ? doc.cookie : '<disabled>',
        language: nav.language || nav.userLanguage,
        readyState: doc.readyState,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
    };
    if (screen && screen.orientation && screen.orientation.type) {
        meta.orientation = screen.orientation.type;
    } else {
        meta.orientation = docEl.clientWidth > docEl.clientHeight ? 'landscape' : 'portrait';
    }
    if (nav.connection && nav.connection.effectiveType) {
        meta.connection = nav.connection.effectiveType;
    }
    if (perf && perf.memory) {
        meta.memory = Math.round(perf.memory.usedJSHeapSize / 1048576);
        meta.memoryPercent = Math.round(perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit * 100);
    }
    return meta;
}
