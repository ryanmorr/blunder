import { Exception } from './exception';
import { dispatch } from './bus';

let hasErrorEvent = false;
let hasUnhandledRejectionEvent = false;
let hasRejectionHandledEvent = false;

function handleError(e) {
    e.preventDefault();
    const error = e.error;
    error.fileName = e.filename;
    error.lineNumber = e.lineno;
    error.columnNumber = e.colno;
    dispatch(Exception.from(error));
}

function handleUnhandledRejection(e) {
    e.preventDefault();
    dispatch(Exception.from(e.reason, {promise: e.promise}));
}

function handleRejectionHandled(e) {
    e.preventDefault();
    dispatch(Exception.from(e.reason, {promise: e.promise}));
}

function removeListeners() {
    if (hasErrorEvent) {
        hasErrorEvent = false;
        window.removeEventListener('error', handleError);
    }
    if (hasUnhandledRejectionEvent) {
        hasUnhandledRejectionEvent = false;
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    }
    if (hasRejectionHandledEvent) {
        hasRejectionHandledEvent = false;
        window.removeEventListener('rejectionhandled', handleRejectionHandled);
    }
}

export function monitor({error = true, unhandledrejection = true, rejectionhandled = true} = {}) {
    if (hasErrorEvent || hasUnhandledRejectionEvent || hasRejectionHandledEvent) {
        return removeListeners;
    }
    if (error) {
        hasErrorEvent = true;
        window.addEventListener('error', handleError);
    }
    if (unhandledrejection) {
        hasUnhandledRejectionEvent = true;
        window.addEventListener('unhandledrejection', handleUnhandledRejection);
    }
    if (rejectionhandled) {
        hasRejectionHandledEvent = true;
        window.addEventListener('rejectionhandled', handleRejectionHandled);
    }
    return removeListeners;
}
