import { serialize } from './serialize';
import { Exception } from './exception';

export function report(url, error) {
    return new Promise((resolve, reject) => {
        const fail = (e) => reject(Exception.from(e));
        fetch(url, {
            method: 'POST',
            cache: 'no-cache',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: serialize(error)
        }).catch(fail).then((response) => {
            if (!response.ok) {
                return Promise.reject(Exception.from(response.statusText));
            }
            return response.json();
        }).then(resolve).catch(fail);
    });
}
