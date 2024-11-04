function getType(value) {
    return {}.toString.call(value).slice(8, -1);
}

function serializeValue(value, seen) {
    if (typeof value?.toJSON === 'function' && !(value instanceof Error)) {
        value = value.toJSON();
    }
    if (value == null) {
        return value;
    }
    const type = getType(value);
    if (type === 'String' || type === 'Number' || type === 'Boolean') {
        return value;
    }
    if (type === 'Function') {
        return `[Function: ${value.name || 'anonymous'}]`;
    }
    if (seen.has(value)) {
        return '[Circular]';
    }
    let newValue;
    seen.add(value);
    if (value instanceof Error) {
        newValue = {
            name: value.name,
            message: value.message,
            stack: value.stack
        };
        if ('cause' in value) {
            newValue.cause = serializeValue(value.cause, seen);
        }
        if (value.data) {
            newValue.data = serializeValue(value.data, seen);
        }
    } else if (type === 'Array' || type === 'Object') {
        newValue = type === 'Array' ? [] : {};
        for (const [key, val] of Object.entries(value)) {
            newValue[key] = serializeValue(val, seen);
        }
    }
    seen.delete(value);
    return newValue;
}

export function serialize(error) {
    const seen = new WeakSet();
    return serializeValue(error, seen);
}
