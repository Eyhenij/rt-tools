import {
    ERtTableColumn,
    IRtTableCell,
    IRtTableColumn,
    IRtTableData,
    rtTableCellWriter,
    rtTableColumn,
    rtTableData,
    TRtTableValue,
} from './table-data';

/**
 * Приведение данных таблицы и запись значений — чистые функции: спека зовёт их и читает ответ.
 */

function column(type: ERtTableColumn, currency: string | null = null): IRtTableColumn {
    return { label: '', type, currency };
}

function write(col: IRtTableColumn, value: TRtTableValue, locale: string = 'en'): IRtTableCell {
    return rtTableCellWriter(col, locale)(value);
}

/** Пробел, которым `Intl.NumberFormat` отделяет знак рубля в `ru`. */
function ruCurrencySpace(): string {
    const parts: Intl.NumberFormatPart[] = new Intl.NumberFormat('ru', { style: 'currency', currency: 'RUB' }).formatToParts(1);

    return parts.find((part: Intl.NumberFormatPart): boolean => part.type === 'literal')?.value ?? ' ';
}

describe('rtTableData', (): void => {
    it('SC-UKV-1402 — строки подогнаны под столбцы, испорченные части выброшены', (): void => {
        const data: IRtTableData | null = rtTableData(
            [
                { label: 'A', type: 'text' },
                { label: 'B', type: 'number' },
                { label: 'C', type: 'number' },
            ],
            [['a', 1], ['b', 2, 3, 4], ['c', null, 5], { A: 'd' }, ['e', true, 6]],
            ['Итого', 10, 20, 30]
        );

        expect(data?.rows).toEqual([
            ['a', 1, null],
            ['b', 2, 3],
            ['c', null, 5],
            ['e', null, 6],
        ]);
        expect(data?.total).toEqual(['Итого', 10, 20]);
    });

    it('SC-UKV-1402 — столбец не объектом — текстовый без подписи, подпись не строкой — пустая', (): void => {
        expect(rtTableColumn('Сумма')).toEqual({ label: '', type: ERtTableColumn.Text, currency: null });
        expect(rtTableColumn({ label: 12, type: 'number' })).toEqual({ label: '', type: ERtTableColumn.Number, currency: null });
    });

    it('SC-UKV-1403 — неизвестный род и род без значения — текст', (): void => {
        expect(rtTableColumn({ label: 'D', type: 'date' }).type).toBe(ERtTableColumn.Text);
        expect(rtTableColumn({ label: 'E' }).type).toBe(ERtTableColumn.Text);
    });

    it('SC-UKV-1424 — итог null, пустой, из пустых ячеек или не списком отсутствует', (): void => {
        const columns: object[] = [{ label: 'A', type: 'text' }];

        expect(rtTableData(columns, [], null)?.total).toBeNull();
        expect(rtTableData(columns, [], [])?.total).toBeNull();
        expect(rtTableData(columns, [], [null])?.total).toBeNull();
        expect(rtTableData(columns, [], 'итог')?.total).toBeNull();
        expect(rtTableData(columns, [], null)?.rows).toEqual([]);
    });

    it('столбцы не непустым списком или строки не списком — данных нет, блок показывается плашкой', (): void => {
        expect(rtTableData([], [], null)).toBeNull();
        expect(rtTableData(null, [], null)).toBeNull();
        expect(rtTableData([{ label: 'A', type: 'text' }], 'строки', null)).toBeNull();
    });
});

describe('rtTableCellWriter', (): void => {
    it('SC-UKV-1398 — значение пишется по роду столбца и языку', (): void => {
        expect(write(column(ERtTableColumn.Number), 1250000.567).text).toBe('1,250,000.57');
        expect(write(column(ERtTableColumn.Percent), 0.1234).text).toBe('12.3%');
        expect(write(column(ERtTableColumn.Currency, 'EUR'), 1200).text).toBe('€1,200.00');
    });

    it('SC-UKV-1399 — валюта без кода или с кодом не из трёх заглавных латинских букв пишется числом', (): void => {
        expect(write(column(ERtTableColumn.Currency), 1200.5).text).toBe('1,200.5');
        expect(write(column(ERtTableColumn.Currency, 'rub'), 1200.5).text).toBe('1,200.5');
    });

    it('SC-UKV-1400 — значение ниже нуля помечено отрицательным, ноль и плюс нет', (): void => {
        const rub: IRtTableColumn = column(ERtTableColumn.Currency, 'RUB');

        expect(write(rub, -10, 'ru')).toEqual({ text: `-10,00${ruCurrencySpace()}₽`, align: 'end', negative: true });
        expect(write(rub, -5, 'ru')).toEqual({ text: `-5,00${ruCurrencySpace()}₽`, align: 'end', negative: true });
        expect(write(rub, 0, 'ru').negative).toBe(false);
        expect(write(rub, 15, 'ru').negative).toBe(false);
    });

    it('SC-UKV-1401 — строка в числовом столбце стоит как пришла, у края столбца и без цвета', (): void => {
        expect(write(column(ERtTableColumn.Number), 'n/a')).toEqual({ text: 'n/a', align: 'end', negative: false });
        expect(write(column(ERtTableColumn.Number), '-12')).toEqual({ text: '-12', align: 'end', negative: false });
    });

    it('SC-UKV-1403 — текстовый столбец пишет число его цифрами и стоит у начала', (): void => {
        expect(write(column(ERtTableColumn.Text), 1234.5)).toEqual({ text: '1234.5', align: 'start', negative: false });
        expect(write(column(ERtTableColumn.Text), 1200).text).toBe('1200');
    });

    it('SC-UKV-1426 — валюта пишет столько знаков после запятой, сколько у неё есть', (): void => {
        expect(write(column(ERtTableColumn.Currency, 'JPY'), 1200.5).text).toBe('¥1,201');
    });

    it('SC-UKV-1427 — язык, который Intl не принимает, пишет значения как en', (): void => {
        expect(write(column(ERtTableColumn.Number), 1234.5, 'en_US').text).toBe('1,234.5');
    });

    it('SC-UKV-1428 — запись, равная нулю, без минуса и без цвета; NaN и бесконечность пусты', (): void => {
        const number: IRtTableColumn = column(ERtTableColumn.Number);

        expect(write(number, -0.001)).toEqual({ text: '0', align: 'end', negative: false });
        expect(write(number, Number.NaN).text).toBe('');
        expect(write(number, Number.POSITIVE_INFINITY).text).toBe('');
        expect(write(number, null).text).toBe('');
        expect(write(number, 0).text).toBe('0');
    });
});
