export function isNumber<T>(value: T | unknown): value is number {
    return typeof value === 'number';
}
