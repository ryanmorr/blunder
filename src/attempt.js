import { Exception } from './exception';
import { dispatch } from './bus';

export function attempt(fn, data) {
    const promise = new Promise((resolve, reject) => {
        try {
            resolve(fn());
        } catch(e) {
            reject(Exception.from(e, data));
        }
    });
    promise.catch(dispatch);
    return promise;
}
