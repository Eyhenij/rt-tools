export function isString<T>(value: T | unknown): value is string {
    return typeof value === 'string';
}
