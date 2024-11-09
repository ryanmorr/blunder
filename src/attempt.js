import { dispatch } from './bus';

function fail(error) {
    return [undefined, error];
}

function pass(result) {
    return [result, undefined];
}
    
function handlePromise(promise, data) {
    return promise.then(
        (result) => pass(result),
        (error) => fail(dispatch(error, data))
    );
}

export function attempt(fn, data) {
    if (fn instanceof Promise) {
        return handlePromise(fn, data);
    }
    try {
        const result = fn();
        if (result instanceof Promise) {
            return handlePromise(result, data);
        }
        return pass(result);
    } catch(error) {
        return fail(dispatch(error, data));
    }
}
