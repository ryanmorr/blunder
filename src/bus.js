import { Exception } from './exception';

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

export function dispatch(error, details) {
    const blunderError = Exception.from(error, details);
    subscribers.slice().forEach((callback) => callback(blunderError));
}
