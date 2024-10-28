import { Exception } from './exception';
import { dispatch } from './bus';

let hasErrorEvent = false;
let hasUnhandledRejectionEvent = false;
let hasRejectionHandledEvent = false;

function handleError(event) {
    event.preventDefault();
    dispatch(Exception.from(event.error, {event}));
}

function handleUnhandledRejection(event) {
    event.preventDefault();
    dispatch(Exception.from(event.reason, {event}));
}

function handleRejectionHandled(event) {
    event.preventDefault();
    dispatch(Exception.from(event.reason, {event}));
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
        window.addEventListener('error', handleError, true);
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
