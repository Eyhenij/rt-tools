import { ERtTableColumn, IRtTableColumn, IRtTableData, rtTableData } from './table-data';
import { RT_AI_CHAT_TABLE_SCHEMA } from './table.schema';

/**
 * Схема написана рукой, и библиотеки проверки схем в дереве нет. Спека читает поля схемы и
 * сверяет с ними образцы: принятый схемой блок рисуется целиком.
 */

function field(path: string[]): unknown {
    return path.reduce(
        (node: unknown, key: string): unknown => (typeof node === 'object' && node !== null ? Reflect.get(node, key) : undefined),
        RT_AI_CHAT_TABLE_SCHEMA
    );
}

describe('RT_AI_CHAT_TABLE_SCHEMA', (): void => {
    it('SC-UKV-1433 — схема называет заголовок, роды столбцов, код валюты и строки списками значений', (): void => {
        expect(field(['$schema'])).toBe('https://json-schema.org/draft/2020-12/schema');
        expect(field(['required'])).toEqual(['columns', 'rows']);
        expect(field(['properties', 'title', 'type'])).toBe('string');
        expect(field(['properties', 'columns', 'items', 'properties', 'type', 'enum'])).toEqual(Object.values(ERtTableColumn));
        expect(field(['properties', 'columns', 'items', 'properties', 'currency', 'pattern'])).toBe('^[A-Z]{3}$');
        expect(field(['properties', 'rows', 'items', 'type'])).toBe('array');
        expect(field(['properties', 'rows', 'items', 'items', 'type'])).toEqual(['number', 'string', 'null']);
    });

    it('SC-UKV-1433 — блок, принятый схемой, рисуется целиком; строка объектом схемой отвергнута и выпадает', (): void => {
        const columns: object[] = [
            { label: 'Объект', type: 'text' },
            { label: 'Ночи', type: 'number' },
            { label: 'Загрузка', type: 'percent' },
            { label: 'Выручка', type: 'currency', currency: 'EUR' },
        ];
        const rows: unknown[][] = [
            ['Вилла', 20, 0.66, 4200],
            ['Апартаменты', 12, 0.4, null],
            ['Дом', 0, 0, -150],
        ];
        const total: unknown[] = ['Итого', 32, 0.53, 4050];
        const data: IRtTableData | null = rtTableData(columns, rows, total);

        expect(data?.columns.map((column: IRtTableColumn): string => column.label)).toEqual(['Объект', 'Ночи', 'Загрузка', 'Выручка']);
        expect(data?.rows).toEqual(rows);
        expect(data?.total).toEqual(total);
        expect(rtTableData(columns, [...rows, { Объект: 'Студия' }], total)?.rows).toEqual(rows);
    });
});
