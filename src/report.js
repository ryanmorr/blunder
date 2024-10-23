export function report(url, data) {
    return navigator.sendBeacon(url, JSON.stringify(data));
}
