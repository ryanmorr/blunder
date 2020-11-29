import { Exception } from './exception';
import { dispatch } from './bus';

export function attempt(fn, details) {
    const promise = new Promise((resolve, reject) => {
        try {
            resolve(fn());
        } catch(e) {
            reject(Exception.from(e, details));
        }
    });
    promise.catch(dispatch);
    return promise;
}
