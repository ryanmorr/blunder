import { BlunderError } from './blundererror';
import { dispatch } from './bus';

export function attempt(fn) {
    return new Promise((resolve, reject) => {
        try {
            resolve(fn());
        } catch(e) {
            const error = BlunderError.from(e);
            reject(error);
            dispatch(error);
        }
    });
}
