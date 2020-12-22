import { Exception } from './exception';

function getType(obj) {
    return {}.toString.call(obj).slice(8, -1);
}

function toObject(error) {
    const data = {
        name: error.name,
        message: error.message,
        stack: error.stack
    };
    if (error instanceof Exception) {
        data.detail = error.detail;
        data.meta = error.meta;
        data.stacktrace = error.stacktrace;
    }
    return data;
}

function replacer(key, value) {
    const originalValue = this[key];
    const type = getType(originalValue);
    if (type === 'Date' || type === 'Function') {
        return originalValue.toString();
    }
    return value;
}

export function serialize(error) {
    return JSON.stringify(toObject(error), replacer);
}
