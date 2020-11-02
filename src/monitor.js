import { BlunderError } from './blundererror';
import { dispatch } from './bus';

let hasErrorEvent = false;
let hasUnhandledRejectionEvent = false;
let hasRejectionHandledEvent = false;

function handleError(e) {
    e.preventDefault();
    const error = BlunderError.from(e.error);
    dispatch(error);
}

function handleUnhandledRejection(e) {
    e.preventDefault();
    const error = BlunderError.from(e.reason);
    dispatch(error);
}

function handleRejectionHandled(e) {
    e.preventDefault();
    const error = BlunderError.from(e.reason);
    dispatch(error);
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
