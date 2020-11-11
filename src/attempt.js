import { Exception } from './exception';
import { dispatch } from './bus';

export function attempt(fn) {
    const promise = new Promise((resolve, reject) => {
        try {
            resolve(fn());
        } catch(e) {
            reject(Exception.from(e));
        }
    });
    promise.catch(dispatch);
    return promise;
}