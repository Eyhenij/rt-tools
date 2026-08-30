// Модель колонок приезжает из Angular-либы, и её модуль на загрузке требует JIT-компилятор.
// Без этой строки спека падает на импорте, а не на утверждении.
import '@angular/compiler';

import {
    defaultColumnItems,
    displayedColumnKeys,
    resolveColumns,
    RT_TABLE_ROW_ACTIONS_COLUMN,
    withoutLockedHidden,
} from './rt-table-columns.logic';
import { IRtTable } from './rt-table.model';

function column(overrides: Partial<IRtTable.ColumnConfig> = {}): IRtTable.ColumnConfig {
    return { key: 'checkIn', label: 'Заезд', ...overrides };
}

const CONFIG: ReadonlyArray<IRtTable.ColumnConfig> = [
    column({ key: 'name', label: 'Имя', locked: true }),
    column({ key: 'checkIn', label: 'Заезд' }),
    column({ key: 'note', label: 'Заметка', hidden: true }),
];

describe('defaultColumnItems', () => {
    it('скрытая по умолчанию колонка приходит скрытой', () => {
        expect(defaultColumnItems(CONFIG).map((item: IRtTable.ColumnSettingItem): boolean => item.hidden)).toEqual([false, false, true]);
    });

    it('закрытая колонка видима, даже когда конфиг зовёт её скрытой', () => {
        expect(defaultColumnItems([column({ locked: true, hidden: true })])[0].hidden).toBe(false);
    });
});

describe('resolveColumns', () => {
    it('без настроек порядок и скрытие берутся из конфига', () => {
        expect(resolveColumns(CONFIG, null).map((item: IRtTable.ColumnSettingItem): string => item.key)).toEqual([
            'name',
            'checkIn',
            'note',
        ]);
    });

    it('пустой конфиг колонок не даёт', () => {
        expect(resolveColumns([], { order: ['name'], hidden: [] })).toEqual([]);
    });

    it('сохранённый порядок применяется, а незнакомый ключ отбрасывается', () => {
        const resolved: ReadonlyArray<IRtTable.ColumnSettingItem> = resolveColumns(CONFIG, {
            order: ['note', 'gone', 'name'],
            hidden: [],
        });

        expect(resolved.map((item: IRtTable.ColumnSettingItem): string => item.key)).toEqual(['note', 'name', 'checkIn']);
    });

    it('колонка, появившаяся в конфиге после сохранения, встаёт в конец и остаётся видимой', () => {
        const resolved: ReadonlyArray<IRtTable.ColumnSettingItem> = resolveColumns(CONFIG, { order: ['checkIn', 'name'], hidden: [] });

        expect(resolved.map((item: IRtTable.ColumnSettingItem): string => item.key)).toEqual(['checkIn', 'name', 'note']);
        expect(resolved[2].hidden).toBe(false);
    });

    it('закрытая колонка видима, даже когда настройки зовут её скрытой', () => {
        const resolved: ReadonlyArray<IRtTable.ColumnSettingItem> = resolveColumns(CONFIG, {
            order: ['name', 'checkIn', 'note'],
            hidden: ['name', 'checkIn'],
        });

        expect(resolved.map((item: IRtTable.ColumnSettingItem): boolean => item.hidden)).toEqual([false, true, false]);
    });
});

describe('displayedColumnKeys', () => {
    const RESOLVED: ReadonlyArray<IRtTable.ColumnSettingItem> = resolveColumns(CONFIG, null);

    it('у настраиваемой таблицы скрытая колонка в строки не попадает', () => {
        expect(displayedColumnKeys(RESOLVED, [], true, false)).toEqual(['name', 'checkIn']);
    });

    it('у ненастраиваемой таблицы состав задаёт вход `[columns]`', () => {
        expect(displayedColumnKeys(RESOLVED, ['a', 'b'], false, false)).toEqual(['a', 'b']);
    });

    it('колонка действий встаёт последней', () => {
        expect(displayedColumnKeys(RESOLVED, [], true, true)).toEqual(['name', 'checkIn', RT_TABLE_ROW_ACTIONS_COLUMN]);
    });
});

describe('withoutLockedHidden', () => {
    it('ключ закрытой колонки из списка скрытых вычищается', () => {
        expect(withoutLockedHidden(CONFIG, { order: ['name', 'checkIn'], hidden: ['name', 'checkIn'] })).toEqual({
            order: ['name', 'checkIn'],
            hidden: ['checkIn'],
        });
    });

    it('порядок приходит своей копией: настройки панели дальше не меняются', () => {
        const settings: IRtTable.ColumnSettings = { order: ['name'], hidden: [] };
        const applied: IRtTable.ColumnSettings = withoutLockedHidden(CONFIG, settings);

        applied.order.push('checkIn');

        expect(settings.order).toEqual(['name']);
    });
});
