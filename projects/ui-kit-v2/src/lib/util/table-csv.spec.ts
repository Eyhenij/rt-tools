import { rtTableCsv, rtTablePlainText } from './table-csv';
import { IRtTableData, rtTableData } from './table-data';

/**
 * CSV и копия ответа — чистые функции над приведёнными данными таблицы.
 */

function table(columns: unknown, rows: unknown, total: unknown = null): IRtTableData {
    const data: IRtTableData | null = rtTableData(columns, rows, total);

    if (data === null) {
        throw new Error('the sample table is not valid');
    }

    return data;
}

describe('rtTableCsv', (): void => {
    it('SC-UKV-1410 — поля с запятой, кавычкой и переносом берутся в кавычки, строки через CRLF', (): void => {
        const csv: string = rtTableCsv(table([{ label: 'Город', type: 'text' }], [['Москва, центр'], ['Вилла "Море"'], ['две\nстроки']]));

        expect(csv).toBe('Город\r\n"Москва, центр"\r\n"Вилла ""Море"""\r\n"две\nстроки"');
    });

    it('SC-UKV-1411 — числа в CSV сырые при любом языке, итог последней строкой', (): void => {
        const csv: string = rtTableCsv(
            table(
                [
                    { label: 'Сумма', type: 'number' },
                    { label: 'Доля', type: 'percent' },
                    { label: 'Выручка', type: 'currency', currency: 'RUB' },
                ],
                [[1234.5, 0.25, -10]],
                [1234.5, 1, -10]
            )
        );

        expect(csv.split('\r\n')).toEqual(['Сумма,Доля,Выручка', '1234.5,0.25,-10', '1234.5,1,-10']);
    });

    it('SC-UKV-1421 — текстовое поле с началом формулы получает апостроф, число — нет', (): void => {
        const csv: string = rtTableCsv(
            table(
                [
                    { label: '=Итог', type: 'text' },
                    { label: 'N', type: 'number' },
                ],
                [
                    ['=SUM(A1:A2)', -10],
                    ['@user', '-12'],
                    ['-скидка', null],
                    ['+7 999', null],
                    ['\tтаб', null],
                    ['\rвозврат', null],
                ]
            )
        );

        expect(csv.split('\r\n')).toEqual([
            "'=Итог,N",
            "'=SUM(A1:A2),-10",
            "'@user,'-12",
            "'-скидка,",
            "'+7 999,",
            "'\tтаб,",
            '"\'\rвозврат",',
        ]);
    });

    it('SC-UKV-1424 — без строк и без итога CSV — одна строка шапки', (): void => {
        expect(rtTableCsv(table([{ label: 'A', type: 'text' }], [], [null]))).toBe('A');
    });

    it('SC-UKV-1428 — CSV пишет число как String, NaN и бесконечность — пустые поля', (): void => {
        const csv: string = rtTableCsv(table([{ label: 'N', type: 'number' }], [[-0.001], [Number.NaN], [Number.POSITIVE_INFINITY]]));

        expect(csv).toBe('N\r\n-0.001\r\n\r\n');
    });
});

describe('rtTablePlainText', (): void => {
    it('SC-UKV-1414 — копия ответа: строки через табуляцию и LF, значения как в таблице', (): void => {
        const text: string = rtTablePlainText(
            table(
                [
                    { label: 'Объект', type: 'text' },
                    { label: 'Выручка', type: 'currency', currency: 'EUR' },
                ],
                [['Вилла\tу\nморя', 1200]],
                ['Итого', 1200]
            ),
            'en'
        );

        expect(text).toBe('Объект\tВыручка\nВилла у моря\t€1,200\nИтого\t€1,200');
    });

    it('SC-UKV-1424 — без строк и без итога копия ответа — одна строка шапки', (): void => {
        expect(rtTablePlainText(table([{ label: 'A', type: 'text' }], [], []), 'en')).toBe('A');
    });
});
