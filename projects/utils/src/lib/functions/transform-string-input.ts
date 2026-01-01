import { isString } from './is-string';

export function transformStringInput(value: unknown): string {
    return isString(value) ? value : '';
}
