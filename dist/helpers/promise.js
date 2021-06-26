export function isPromise(obj) {
    return obj instanceof Promise || (obj && typeof obj.then === 'function');
}
