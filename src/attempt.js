import { dispatch } from './bus';

function fail(error) {
    return [undefined, error];
}

function pass(result) {
    return [result, undefined];
}
    
function handlePromise(promise, options) {
    return promise.then(
        (result) => pass(result),
        (error) => fail(dispatch(error, options))
    );
}

export function attempt(fn, options) {
    if (fn instanceof Promise) {
        return handlePromise(fn, options);
    }
    try {
        const result = fn();
        if (result instanceof Promise) {
            return handlePromise(result, options);
        }
        return pass(result);
    } catch(error) {
        return fail(dispatch(error, options));
    }
}
