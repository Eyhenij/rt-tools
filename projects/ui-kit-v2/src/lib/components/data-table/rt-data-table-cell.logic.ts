import { isNumber, isString, TNullable } from '@rt-tools/utils';

import { iconMaterialMap, IRtIconMaterialEntry } from '../icon/rt-icon-material-map';
import { IRtIcon } from '../icon/rt-icon.model';
import { IRtDataTable } from './rt-data-table.model';

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

/**
 * Значок набора кита для имени первого кита, либо `null`, если пары нет.
 *
 * Идёт через перечень соответствий кита, а не своим списком: второй список разошёлся бы с
 * перечнем молча, и одно имя рисовалось бы в двух местах двумя рисунками.
 */
export function dataTableIconName(glyph: string): IRtIcon.Name | null {
    return iconMaterialMap.find((entry: IRtIconMaterialEntry) => entry.from === glyph)?.to ?? null;
}
