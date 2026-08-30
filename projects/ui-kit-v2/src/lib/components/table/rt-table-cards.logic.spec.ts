// Шаблон ячейки приезжает из Angular-либы, и её модуль на загрузке требует JIT-компилятор.
// Без этой строки спека падает на импорте, а не на утверждении.
import '@angular/compiler';

import { CdkColumnDef } from '@angular/cdk/table';

import { cardColumnsOf, cardRowsOf, IRtTableCardColumn } from './rt-table-cards.logic';
import { RT_TABLE_ROW_ACTIONS_COLUMN } from './rt-table-columns.logic';
import { IRtTable } from './rt-table.model';

interface IRow {
    id: string;
}

/** Двойник объявления колонки: логике нужны только имя и шаблон ячейки. */
function columnDef(name: string, hasCell: boolean = true): CdkColumnDef {
    return { name, cell: hasCell ? { template: { name } } : undefined } as unknown as CdkColumnDef;
}

const CONFIG: ReadonlyArray<IRtTable.ColumnConfig> = [
    { key: 'name', label: 'Имя' },
    { key: 'checkIn', label: 'Заезд' },
];

describe('cardRowsOf', () => {
    it('массив источника отдаётся строками карточек', () => {
        const rows: ReadonlyArray<IRow> = [{ id: 'a' }];

        expect(cardRowsOf<IRow>(rows)).toBe(rows);
    });

    it('источник, который не массив, карточек не даёт', () => {
        expect(cardRowsOf<IRow>({ connect: (): void => undefined })).toEqual([]);
    });
});

describe('cardColumnsOf', () => {
    it('подпись берётся из конфига, а шаблон — из объявления колонки', () => {
        const columns: ReadonlyArray<IRtTableCardColumn<IRow>> = cardColumnsOf<IRow>(['name'], [columnDef('name')], CONFIG);

        expect(columns).toEqual([{ key: 'name', label: 'Имя', cell: { name: 'name' } }]);
    });

    it('колонка вне конфига подписывается своим ключом', () => {
        expect(cardColumnsOf<IRow>(['note'], [columnDef('note')], CONFIG)[0].label).toBe('note');
    });

    it('колонка без шаблона ячейки в карточку не попадает', () => {
        expect(cardColumnsOf<IRow>(['name'], [columnDef('name', false)], CONFIG)).toEqual([]);
    });

    it('колонка действий в карточку не попадает', () => {
        expect(cardColumnsOf<IRow>([RT_TABLE_ROW_ACTIONS_COLUMN], [columnDef(RT_TABLE_ROW_ACTIONS_COLUMN)], CONFIG)).toEqual([]);
    });
});
