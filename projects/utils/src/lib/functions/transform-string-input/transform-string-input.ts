import { isString } from '../is-string/index.js';

export function transformStringInput(value: unknown): string {
    return isString(value) ? value : '';
}
