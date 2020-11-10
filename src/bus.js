import { Exception } from './exception';

const subscribers = [];
const dispatched = new WeakSet();

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
    const ex = Exception.from(error, details);
    if (dispatched.has(ex)) {
        return ex;
    }
    dispatched.add(ex);
    subscribers.slice().forEach((callback) => callback(ex));
    return ex;
}
