import { isNumber, isString, TNullable } from '@rt-tools/utils';

import { kitNameOf } from '@rt-tools/ui-kit-v2/icon';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { IRtDataTable } from '@rt-tools/ui-kit-v2/core';

/** Значение ячейки: как его отдала запись или как его переделала колонка. */
export function dataTableCellValue<T>(row: T, column: IRtDataTable.Column<T>): T[keyof T] | string | number {
    const transform: TNullable<(value: T[keyof T]) => string | number> = column.transform;
    const raw: T[keyof T] = row[column.propName];

    return transform ? transform(raw) : raw;
}

/** Текст значения для подсказки и буфера — так же, как первый кит: строка, число, иначе JSON. */
export function dataTableCellText(value: unknown): string {
    if (isString(value)) {
        return value;
    }

    if (isNumber(value)) {
        return value.toString();
    }

    return JSON.stringify(value);
}

/**
 * Сторона кнопки копирования: заданная колонкой, иначе противоположная выравниванию значения —
 * справа выровненное значение копируется кнопкой слева.
 */
export function dataTableCopyButtonSide(column: IRtDataTable.Column<unknown>): 'left' | 'right' {
    return column.copyBtnAlign ?? (column.align === 'right' ? 'left' : 'right');
}

/** Значок набора кита по имени из колонки; `null` — такого имени в наборе нет. */
export function dataTableIconName(glyph: string): IRtIcon.Name | null {
    return kitNameOf(glyph);
}
