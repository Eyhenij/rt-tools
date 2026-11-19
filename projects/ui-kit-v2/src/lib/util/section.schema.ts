import { ERtSectionSpan, RT_SECTION_BLOCK_TYPE } from './section-data';

/** JSON-схема как запись полей: так её отдают модели и так её читает функция объединения. */
export type TRtJsonSchema = Readonly<Record<string, unknown>>;

const SCHEMA_DIALECT: string = 'https://json-schema.org/draft/2020-12/schema';

/** Место вложенного блока в ряду сетки: поле читает только секция. */
const SPAN: TRtJsonSchema = {
    enum: Object.values(ERtSectionSpan),
    description: 'The place of the block in a row: full is the whole row, column is one column of two.',
};

/**
 * JSON-схема блока секции (JSON Schema 2020-12). Она требует список `blocks` хотя бы с одним
 * блоком; блок называет свой `type`, и это не `section`: секция в секции не рисуется. Полей
 * вложенного блока эта схема не называет — их добавляет `rtAiChatSectionSchema`.
 */
export const RT_AI_CHAT_SECTION_SCHEMA: TRtJsonSchema = {
    $schema: SCHEMA_DIALECT,
    title: 'Section',
    type: 'object',
    required: ['blocks'],
    properties: {
        title: { type: 'string', description: 'The heading above the grid; optional.' },
        blocks: {
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                required: ['type'],
                properties: {
                    type: { type: 'string', not: { const: RT_SECTION_BLOCK_TYPE } },
                    span: SPAN,
                },
            },
        },
    },
};

function record(value: unknown): TRtJsonSchema {
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? { ...value } : {};
}

function strings(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item: unknown): item is string => typeof item === 'string') : [];
}

/** Схема вложенного блока: поля своей схемы, `type` закреплён за именем, `span` по желанию. */
function nestedSchema(type: string, schema: TRtJsonSchema): TRtJsonSchema {
    const own: Record<string, unknown> = { ...schema };
    delete own['$schema'];

    return {
        ...own,
        type: 'object',
        required: ['type', ...strings(schema['required']).filter((name: string): boolean => name !== 'type')],
        properties: { ...record(schema['properties']), type: { const: type }, span: SPAN },
    };
}

/**
 * Схема секции, в которой вложенный блок — один из названных: каждая схема закреплена за своим
 * именем типа и получает необязательный `span`. Приложение отдаёт результат модели как параметры
 * инструмента. Переданные схемы не меняются; схема под именем `section` не берётся, а без схем
 * возвращается схема секции как есть.
 */
export function rtAiChatSectionSchema(nested: Readonly<Record<string, TRtJsonSchema>>): TRtJsonSchema {
    const oneOf: TRtJsonSchema[] = Object.entries(nested)
        .filter(([type]: [string, TRtJsonSchema]): boolean => type !== RT_SECTION_BLOCK_TYPE)
        .map(([type, schema]: [string, TRtJsonSchema]): TRtJsonSchema => nestedSchema(type, schema));

    if (oneOf.length === 0) {
        return RT_AI_CHAT_SECTION_SCHEMA;
    }
    const properties: TRtJsonSchema = record(RT_AI_CHAT_SECTION_SCHEMA['properties']);

    return {
        ...RT_AI_CHAT_SECTION_SCHEMA,
        properties: { ...properties, blocks: { ...record(properties['blocks']), items: { oneOf } } },
    };
}
