import { RT_AI_CHAT_KPI_SCHEMA } from './kpi.schema';
import { ERtSectionSpan, IRtSectionItem, rtSectionItems, rtSectionSpan, rtSectionTitle } from './section-data';
import { RT_AI_CHAT_SECTION_SCHEMA, rtAiChatSectionSchema, TRtJsonSchema } from './section.schema';
import { RT_AI_CHAT_TABLE_SCHEMA } from './table.schema';

/**
 * Схема написана рукой, и библиотеки проверки схем в дереве нет. Спека читает поля схемы и
 * сверяет с ними образцы: блок, принятый схемой, не теряет ни одного элемента списка.
 */

function field(schema: TRtJsonSchema, path: (string | number)[]): unknown {
    return path.reduce(
        (node: unknown, key: string | number): unknown => (typeof node === 'object' && node !== null ? Reflect.get(node, key) : undefined),
        schema
    );
}

const ITEM: string[] = ['properties', 'blocks', 'items'];

describe('RT_AI_CHAT_SECTION_SCHEMA', (): void => {
    it('SC-UKV-1519 — схема требует blocks хотя бы с одним блоком, тип не section, называет span', (): void => {
        const schema: TRtJsonSchema = RT_AI_CHAT_SECTION_SCHEMA;

        expect(field(schema, ['$schema'])).toBe('https://json-schema.org/draft/2020-12/schema');
        expect(field(schema, ['required'])).toEqual(['blocks']);
        expect(field(schema, ['properties', 'title', 'type'])).toBe('string');
        expect(field(schema, ['properties', 'blocks', 'minItems'])).toBe(1);
        expect(field(schema, [...ITEM, 'required'])).toEqual(['type']);
        expect(field(schema, [...ITEM, 'properties', 'type'])).toEqual({ type: 'string', not: { const: 'section' } });
        expect(field(schema, [...ITEM, 'properties', 'span', 'enum'])).toEqual(['full', 'column']);
    });

    it('SC-UKV-1519 — секция, принятая схемой, держит каждый элемент списка ячейкой', (): void => {
        const blocks: object[] = [
            { type: 'markdown', text: 'Итог' },
            { type: 'kpi', items: [] },
            { type: 'chart', span: 'full' },
            { type: 'никто-не-знает', span: 'column' },
        ];
        const items: IRtSectionItem[] | null = rtSectionItems(blocks);

        expect(items).toEqual(blocks);
        expect(items?.map((item: IRtSectionItem): ERtSectionSpan => rtSectionSpan(item.type, item['span']))).toEqual([
            ERtSectionSpan.Full,
            ERtSectionSpan.Full,
            ERtSectionSpan.Full,
            ERtSectionSpan.Column,
        ]);
        expect(rtSectionItems([...blocks, 7, null, {}, { type: 7 }, ['x']])).toEqual(blocks);
    });

    it('SC-UKV-1516 — blocks не списком, пустой или без блоков даёт null', (): void => {
        expect(rtSectionItems(undefined)).toBeNull();
        expect(rtSectionItems('text')).toBeNull();
        expect(rtSectionItems([])).toBeNull();
        expect(rtSectionItems([7, null, {}])).toBeNull();
    });

    it('SC-UKV-1517 — заголовок обрезается; пустой и не строка — его нет', (): void => {
        expect(rtSectionTitle('  Обзор ноября  ')).toBe('Обзор ноября');
        expect(rtSectionTitle('  ')).toBeNull();
        expect(rtSectionTitle(7)).toBeNull();
        expect(rtSectionTitle(undefined)).toBeNull();
    });
});

describe('rtAiChatSectionSchema', (): void => {
    it('SC-UKV-1524 — элемент blocks — одна из схем, тип закреплён за именем, span по желанию', (): void => {
        const kpiBefore: string = JSON.stringify(RT_AI_CHAT_KPI_SCHEMA);
        const tableBefore: string = JSON.stringify(RT_AI_CHAT_TABLE_SCHEMA);
        const joined: TRtJsonSchema = rtAiChatSectionSchema({ kpi: RT_AI_CHAT_KPI_SCHEMA, table: RT_AI_CHAT_TABLE_SCHEMA });
        const one: (string | number)[] = [...ITEM, 'oneOf'];

        expect(field(joined, ['required'])).toEqual(['blocks']);
        expect(field(joined, ['properties', 'blocks', 'minItems'])).toBe(1);
        expect(field(joined, ['properties', 'title', 'type'])).toBe('string');
        expect(field(joined, [...one, 'length'])).toBe(2);
        expect(field(joined, [...one, 0, 'properties', 'type'])).toEqual({ const: 'kpi' });
        expect(field(joined, [...one, 0, 'required'])).toEqual(['type', 'items']);
        expect(field(joined, [...one, 0, 'properties', 'items'])).toEqual(field(RT_AI_CHAT_KPI_SCHEMA, ['properties', 'items']));
        expect(field(joined, [...one, 0, 'properties', 'span', 'enum'])).toEqual(['full', 'column']);
        expect(field(joined, [...one, 0, '$schema'])).toBeUndefined();
        expect(field(joined, [...one, 1, 'properties', 'type'])).toEqual({ const: 'table' });
        expect(field(joined, [...one, 1, 'properties', 'columns'])).toEqual(field(RT_AI_CHAT_TABLE_SCHEMA, ['properties', 'columns']));
        expect(JSON.stringify(RT_AI_CHAT_KPI_SCHEMA)).toBe(kpiBefore);
        expect(JSON.stringify(RT_AI_CHAT_TABLE_SCHEMA)).toBe(tableBefore);
        expect(field(RT_AI_CHAT_SECTION_SCHEMA, [...ITEM, 'oneOf'])).toBeUndefined();
    });

    it('SC-UKV-1524 — схема под именем section не берётся; без схем возвращается схема секции', (): void => {
        const joined: TRtJsonSchema = rtAiChatSectionSchema({ section: RT_AI_CHAT_SECTION_SCHEMA, kpi: RT_AI_CHAT_KPI_SCHEMA });

        expect(field(joined, [...ITEM, 'oneOf', 'length'])).toBe(1);
        expect(rtAiChatSectionSchema({})).toBe(RT_AI_CHAT_SECTION_SCHEMA);
        expect(rtAiChatSectionSchema({ section: RT_AI_CHAT_SECTION_SCHEMA })).toBe(RT_AI_CHAT_SECTION_SCHEMA);
    });
});
