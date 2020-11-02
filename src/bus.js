import { BlunderError } from './blundererror';

const subscribers = [];

export function subscribe(callback) {
    subscribers.push(callback);
    return () => {
        const index = subscribers.indexOf(callback);
        if (index !== -1) {
            subscribers.splice(index, 1);
        }
    };
}

export function dispatch(error) {
    const blunderError = BlunderError.from(error);
    subscribers.slice().forEach((callback) => callback(blunderError));
}
