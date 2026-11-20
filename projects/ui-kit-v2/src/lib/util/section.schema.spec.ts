import Ajv2020 from 'ajv/dist/2020';

import { RT_AI_CHAT_KPI_SCHEMA } from './kpi.schema';
import { ERtSectionSpan, IRtSectionItem, rtSectionItems, rtSectionSpan, rtSectionTitle } from './section-data';
import { RT_AI_CHAT_SECTION_SCHEMA, rtAiChatSectionSchema, TRtJsonSchema } from './section.schema';
import { RT_AI_CHAT_TABLE_SCHEMA } from './table.schema';

/**
 * Схема написана рукой. Спека читает её поля и проверяет образцы настоящим валидатором: блок,
 * принятый схемой, не теряет ни одного элемента списка.
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
        const accepts: (value: unknown) => boolean = new Ajv2020({ strict: false }).compile(RT_AI_CHAT_SECTION_SCHEMA);

        expect(accepts({ blocks })).toBe(true);
        expect(accepts({ blocks: [] })).toBe(false);
        expect(accepts({ blocks: [{ type: 'section', blocks }] })).toBe(false);
        expect(accepts({ blocks: [{ type: 'chart', span: 'wide' }] })).toBe(false);
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

function record(value: unknown): TRtJsonSchema {
    return typeof value === 'object' && value !== null ? { ...value } : {};
}

function branches(schema: TRtJsonSchema): unknown[] {
    const oneOf: unknown = field(schema, [...ITEM, 'oneOf']);

    return Array.isArray(oneOf) ? oneOf : [];
}

function branch(schema: TRtJsonSchema, type: string): TRtJsonSchema {
    return record(branches(schema).find((item: unknown): boolean => field(record(item), ['properties', 'type', 'const']) === type));
}

describe('rtAiChatSectionSchema', (): void => {
    it('SC-UKV-1524 — свои блоки кита в схеме без слова приложения, тип закреплён, span по желанию', (): void => {
        const joined: TRtJsonSchema = rtAiChatSectionSchema();

        expect(branches(joined).map((item: unknown): unknown => field(record(item), ['properties', 'type', 'const']))).toEqual([
            'markdown',
            'notice',
            'kpi',
            'table',
        ]);
        expect(field(joined, ['required'])).toEqual(['blocks']);
        expect(field(joined, ['properties', 'blocks', 'minItems'])).toBe(1);
        expect(field(joined, ['properties', 'title', 'type'])).toBe('string');
        expect(field(branch(joined, 'markdown'), ['required'])).toEqual(['type', 'text']);
        expect(field(branch(joined, 'notice'), ['required'])).toEqual(['type', 'severity', 'text']);
        expect(field(branch(joined, 'notice'), ['properties', 'severity', 'enum'])).toEqual([
            'info',
            'success',
            'warning',
            'danger',
            'secondary',
            'neutral',
        ]);
        expect(field(branch(joined, 'kpi'), ['required'])).toEqual(['type', 'items']);
        expect(field(branch(joined, 'kpi'), ['properties', 'items'])).toEqual(field(RT_AI_CHAT_KPI_SCHEMA, ['properties', 'items']));
        expect(field(branch(joined, 'kpi'), ['properties', 'span', 'enum'])).toEqual(['full', 'column']);
        expect(field(branch(joined, 'kpi'), ['$schema'])).toBeUndefined();
        expect(field(branch(joined, 'table'), ['properties', 'columns'])).toEqual(
            field(RT_AI_CHAT_TABLE_SCHEMA, ['properties', 'columns'])
        );
    });

    it('SC-UKV-1524 — схема приложения добавляется по имени, а под именем своего типа заменяет его', (): void => {
        const map: TRtJsonSchema = { type: 'object', required: ['place'], properties: { place: { type: 'string' } } };
        const joined: TRtJsonSchema = rtAiChatSectionSchema({
            map,
            markdown: { required: ['body'], properties: { body: { type: 'string' } } },
        });

        expect(field(branch(joined, 'map'), ['required'])).toEqual(['type', 'place']);
        expect(field(branch(joined, 'map'), ['properties', 'span', 'enum'])).toEqual(['full', 'column']);
        expect(field(branch(joined, 'markdown'), ['required'])).toEqual(['type', 'body']);
        expect(branches(joined)).toHaveLength(5);
    });

    it('SC-UKV-1524 — результат ничего не делит с переданным и со схемой секции', (): void => {
        const kpiBefore: string = JSON.stringify(RT_AI_CHAT_KPI_SCHEMA);
        const sectionBefore: string = JSON.stringify(RT_AI_CHAT_SECTION_SCHEMA);
        const joined: TRtJsonSchema = rtAiChatSectionSchema();
        const cards: unknown = field(joined, [...ITEM, 'oneOf', 2, 'properties', 'items']);

        expect(joined).not.toBe(rtAiChatSectionSchema());
        expect(cards).toEqual(field(RT_AI_CHAT_KPI_SCHEMA, ['properties', 'items']));
        expect(cards).not.toBe(field(RT_AI_CHAT_KPI_SCHEMA, ['properties', 'items']));
        expect(field(joined, ['properties', 'title'])).not.toBe(field(RT_AI_CHAT_SECTION_SCHEMA, ['properties', 'title']));
        if (typeof cards === 'object' && cards !== null) {
            Reflect.set(cards, 'minItems', 7);
        }
        expect(JSON.stringify(RT_AI_CHAT_KPI_SCHEMA)).toBe(kpiBefore);
        expect(JSON.stringify(RT_AI_CHAT_SECTION_SCHEMA)).toBe(sectionBefore);
    });

    it('SC-UKV-1524 — правка результата не доходит до схемы, которую дало приложение', (): void => {
        const map: TRtJsonSchema = { type: 'object', required: ['place'], properties: { place: { type: 'string', enum: ['Сочи'] } } };
        const before: string = JSON.stringify(map);
        const place: unknown = field(branch(rtAiChatSectionSchema({ map }), 'map'), ['properties', 'place']);

        expect(place).toEqual(field(map, ['properties', 'place']));
        expect(place).not.toBe(field(map, ['properties', 'place']));
        if (typeof place === 'object' && place !== null) {
            Reflect.set(place, 'minLength', 7);
        }
        expect(JSON.stringify(map)).toBe(before);
        expect(field(RT_AI_CHAT_SECTION_SCHEMA, [...ITEM, 'oneOf'])).toBeUndefined();
    });

    it('SC-UKV-1524 — схема под именем section не берётся', (): void => {
        const joined: TRtJsonSchema = rtAiChatSectionSchema({ section: RT_AI_CHAT_SECTION_SCHEMA });

        expect(field(branch(joined, 'section'), ['properties'])).toBeUndefined();
        expect(branches(joined)).toHaveLength(4);
    });
});
