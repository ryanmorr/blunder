function getType(value) {
    return {}.toString.call(value).slice(8, -1);
}

function serializeException(ex, seen) {
    seen.add(ex);
    const value = serialize(ex.serializable(), seen);
    seen.delete(ex);
    return value;
}

function serializeError(error, seen) {
    seen.add(error);
    const value = {
        name: error.name,
        message: error.message,
        stack: error.stack
    };
    if ('cause' in error) {
        value.cause = serialize(error.cause, seen);
    }
    seen.delete(error);
    return value;
}

function serializeArray(array, seen) {
    seen.add(array);
    const value = array.map((item) => serialize(item, seen));
    seen.delete(array);
    return value;
}

function serializeObject(object, seen) {
    seen.add(object);
    const value = {};
    for (const [key, item] of Object.entries(object)) {
        value[key] = serialize(item, seen);
    }
    seen.delete(object);
    return value;
}

export function serialize(value, seen = new WeakSet()) {
    if (value == null) {
        return value;
    }
    if (seen.has(value)) {
        return '[Circular]';
    }
    const type = getType(value);
    if (type === 'String' || type === 'Number' || type === 'Boolean' || type === 'Date') {
        return value;
    }
    if (type === 'Function') {
        return `[Function: ${value.name || 'anonymous'}]`;
    }
    if (type === 'Array') {
        return serializeArray(value, seen);
    }
    if (type === 'Object') {
        return serializeObject(value, seen);
    }
    if (value instanceof Error) {
        if (typeof value.serializable === 'function') {
            return serializeException(value, seen);
        }
        return serializeError(value, seen);
    }
    return undefined;
}
