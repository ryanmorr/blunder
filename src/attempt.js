import { Exception } from './exception';
import { dispatch } from './bus';

export function attempt(fn) {
    return new Promise((resolve, reject) => {
        try {
            resolve(fn());
        } catch(e) {
            const error = Exception.from(e);
            reject(error);
            dispatch(error);
        }
    });
}
