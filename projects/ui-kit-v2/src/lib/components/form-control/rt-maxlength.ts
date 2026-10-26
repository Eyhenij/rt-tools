import { NumberInput } from '@angular/cdk/coercion';
import { numberAttribute } from '@angular/core';

/**
 * Предел длины поля из входа `maxlength`: целое не меньше нуля. Пустой атрибут, `null` и не число —
 * предела нет, атрибут на поле не ставится.
 */
export function rtMaxlength(value: NumberInput): number | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const limit: number = numberAttribute(value, Number.NaN);
    return Number.isInteger(limit) && limit >= 0 ? limit : null;
}
