import { ERtKpiDeltaUnit, ERtKpiFormat, IRtKpiItem, rtKpiItems } from './kpi-data';
import { RT_AI_CHAT_KPI_SCHEMA } from './kpi.schema';

/**
 * Схема написана рукой, и библиотеки проверки схем в дереве нет. Спека читает поля схемы и
 * сверяет с ними образцы: принятый схемой блок рисуется целиком.
 */

function field(path: string[]): unknown {
    return path.reduce(
        (node: unknown, key: string): unknown => (typeof node === 'object' && node !== null ? Reflect.get(node, key) : undefined),
        RT_AI_CHAT_KPI_SCHEMA
    );
}

const ITEM: string[] = ['properties', 'items', 'items'];

describe('RT_AI_CHAT_KPI_SCHEMA', (): void => {
    it('SC-UKV-1483 — схема требует только название и значение, называет единицы и смысл чисел', (): void => {
        expect(field(['$schema'])).toBe('https://json-schema.org/draft/2020-12/schema');
        expect(field(['required'])).toEqual(['items']);
        expect(field([...ITEM, 'required'])).toEqual(['label', 'value']);
        expect(field([...ITEM, 'properties', 'format', 'enum'])).toEqual(Object.values(ERtKpiFormat));
        expect(field([...ITEM, 'properties', 'deltaUnit', 'enum'])).toEqual([ERtKpiDeltaUnit.Percent, ERtKpiDeltaUnit.Points]);
        expect(field([...ITEM, 'properties', 'currency', 'pattern'])).toBe('^[A-Z]{3}$');
        expect(field([...ITEM, 'properties', 'value', 'description'])).toContain('fraction');
        expect(field([...ITEM, 'properties', 'delta', 'description'])).toContain('in percent');
    });

    it('SC-UKV-1459 — блок, принятый схемой, рисуется целиком; карточка строкой отвергнута и выпадает', (): void => {
        const items: object[] = [
            { label: 'Выручка', value: 1240000, format: 'currency', currency: 'RUB', delta: 12.5, base: 'vs LY', period: 'ноябрь 2026' },
            { label: 'Загрузка', value: 0.78, format: 'percent', delta: 3, deltaUnit: 'points', base: 'vs LM', period: 'ноябрь 2026' },
            { label: 'Отмены', value: 14, format: 'number', delta: 8, growthIsGood: false, base: 'vs LM', period: 'ноябрь 2026' },
            { label: 'Средний чек', value: 8400, format: 'currency', currency: 'RUB', delta: 0, base: 'vs LY', period: 'ноябрь 2026' },
        ];
        const read: IRtKpiItem[] | null = rtKpiItems(items);

        expect(read?.length).toBe(4);
        expect(read?.map((item: IRtKpiItem): string | null => item.base)).toEqual(['vs LY', 'vs LM', 'vs LM', 'vs LY']);
        expect(read?.map((item: IRtKpiItem): number | null => item.delta)).toEqual([12.5, 3, 8, 0]);
        expect(rtKpiItems([...items, 'Выручка'])?.length).toBe(4);
    });
});
