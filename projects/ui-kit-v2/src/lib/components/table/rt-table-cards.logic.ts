import { CdkColumnDef } from '@angular/cdk/table';
import { TemplateRef } from '@angular/core';

import { IRtTableCardContext } from './rt-table-card.directive';
import { RT_TABLE_ROW_ACTIONS_COLUMN } from './rt-table-columns.logic';
import { IRtTable } from './rt-table.model';

/**
 * Поле авто-карточки узкого экрана: подпись колонки и её шаблон ячейки. Значение рисуется
 * тем же шаблоном, что и в строке таблицы, — второй разметки у карточки нет.
 */
export interface IRtTableCardColumn<TRow> {
    key: string;
    label: string;
    cell: TemplateRef<IRtTableCardContext<TRow>>;
}

/**
 * Строки, которые можно показать карточками. Источник данных таблицы бывает массивом,
 * потоком и своим объектом, а карточки строятся только по массиву: у остальных состав строк
 * известен лишь самой таблице, и брать его отсюда нечем.
 */
export function cardRowsOf<TRow>(dataSource: unknown): ReadonlyArray<TRow> {
    return Array.isArray(dataSource) ? (dataSource as ReadonlyArray<TRow>) : [];
}

/**
 * Поля авто-карточки: видимые колонки, кроме колонки действий, с подписью из конфига и
 * шаблоном ячейки из объявления колонки. Колонка без шаблона ячейки пропускается — рисовать
 * её значение нечем.
 */
export function cardColumnsOf<TRow>(
    displayedColumns: ReadonlyArray<string>,
    columnDefs: ReadonlyArray<CdkColumnDef>,
    columnsConfig: ReadonlyArray<IRtTable.ColumnConfig>
): ReadonlyArray<IRtTableCardColumn<TRow>> {
    const defsByName: Map<string, CdkColumnDef> = new Map(columnDefs.map((def: CdkColumnDef): [string, CdkColumnDef] => [def.name, def]));
    const labelByKey: Map<string, string> = new Map(
        columnsConfig.map((column: IRtTable.ColumnConfig): [string, string] => [column.key, column.label])
    );

    return displayedColumns
        .filter((key: string): boolean => key !== RT_TABLE_ROW_ACTIONS_COLUMN)
        .map((key: string): IRtTableCardColumn<TRow> | null => {
            const cell: TemplateRef<IRtTableCardContext<TRow>> | undefined = defsByName.get(key)?.cell?.template;

            return cell === undefined ? null : { key, cell, label: labelByKey.get(key) ?? key };
        })
        .filter((column: IRtTableCardColumn<TRow> | null): column is IRtTableCardColumn<TRow> => column !== null);
}
