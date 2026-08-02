import { isString } from './is-string.js';

export function transformStringInput(value: unknown): string {
    return isString(value) ? value : '';
}
