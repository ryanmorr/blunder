import { BlunderError } from './blundererror';
import { dispatch } from './bus';

let registered = false;

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
    registered = false;
    window.removeEventListener('error', handleError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    window.removeEventListener('rejectionhandled', handleRejectionHandled);
}

export function monitor() {
    if (registered) {
        return removeListeners;
    }
    registered = true;
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('rejectionhandled', handleRejectionHandled);
    return removeListeners;
}
