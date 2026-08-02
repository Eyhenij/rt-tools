import { DASH } from '../../const/index.js';
import { isNil } from '../is-nil/index.js';

export function emptyToDash<T>(value: T | null | undefined): T | string {
    return isNil(value) || value === '' ? DASH : value;
}
