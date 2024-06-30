export function transformArrayInput<T>(array: unknown): T[] {
    if (Array.isArray(array) && array.length) {
        return array as T[];
    } else {
        return [];
    }
}
