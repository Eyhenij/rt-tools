import { DASH } from '../const';
import { isNil } from './is-nil';

export function emptyToDash<T>(value: T | null | undefined): T | string {
    return isNil(value) || value === '' ? DASH : value;
}
