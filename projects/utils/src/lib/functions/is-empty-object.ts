import { isEmptyArray } from './is-empty-array.js';

export function isEmptyObject(value: Record<string, unknown>): boolean {
    return isEmptyArray(Object.keys(value));
}
