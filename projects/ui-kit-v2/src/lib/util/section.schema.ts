import { RT_AI_CHAT_KPI_SCHEMA } from './kpi.schema';
import { RT_AI_CHAT_LINK_SCHEMA } from './link.schema';
import { RT_AI_CHAT_MARKDOWN_SCHEMA } from './markdown.schema';
import { RT_AI_CHAT_NOTICE_SCHEMA } from './notice.schema';
import { ERtSectionSpan, RT_SECTION_BLOCK_TYPE } from './section-data';
import { RT_AI_CHAT_SOURCES_SCHEMA } from './sources.schema';
import { RT_AI_CHAT_TABLE_SCHEMA } from './table.schema';

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
 * вложенного блока эта схема не называет — их называет схема из `rtAiChatSectionSchema`.
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

/** Схемы блоков, которые кит рисует сам: в схему секции они попадают без слова приложения. */
const OWN_SCHEMAS: Readonly<Record<string, TRtJsonSchema>> = {
    markdown: RT_AI_CHAT_MARKDOWN_SCHEMA,
    notice: RT_AI_CHAT_NOTICE_SCHEMA,
    kpi: RT_AI_CHAT_KPI_SCHEMA,
    table: RT_AI_CHAT_TABLE_SCHEMA,
    link: RT_AI_CHAT_LINK_SCHEMA,
    sources: RT_AI_CHAT_SOURCES_SCHEMA,
};

function record(value: unknown): TRtJsonSchema {
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? { ...value } : {};
}

function strings(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item: unknown): item is string => typeof item === 'string') : [];
}

/** Копия значения схемы на всю глубину: результат не делит ни одного узла с тем, из чего собран. */
function copy(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map((item: unknown): unknown => copy(item));
    }
    if (typeof value === 'object' && value !== null) {
        return Object.fromEntries(Object.entries(value).map(([key, item]: [string, unknown]): [string, unknown] => [key, copy(item)]));
    }

    return value;
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
 * Схема секции, в которой вложенный блок — один из названных. Блоки, которые кит рисует сам, —
 * `markdown`, `notice`, `kpi` и `table` — в ней уже есть; приложение добавляет схемы остальных
 * типов по их именам, и схема под именем своего типа кита заменяет его схему. Каждая схема
 * закреплена за своим именем типа и получает необязательный `span`. Приложение отдаёт результат
 * модели как параметры инструмента. Результат — каждый раз новая запись: он не делит узлов ни с
 * переданными схемами, ни со схемой секции. Схема под именем `section` не берётся.
 *
 * Переданная схема встаёт не в корень результата, поэтому должна быть цельной: ссылка `$ref` от
 * корня в ней перестаёт находить свою цель. Поле `span` во вложенном блоке принадлежит секции: своё
 * поле с этим именем в переданной схеме заменяется.
 */
export function rtAiChatSectionSchema(nested: Readonly<Record<string, TRtJsonSchema>> = {}): TRtJsonSchema {
    const oneOf: TRtJsonSchema[] = Object.entries({ ...OWN_SCHEMAS, ...nested })
        .filter(([type]: [string, TRtJsonSchema]): boolean => type !== RT_SECTION_BLOCK_TYPE)
        .map(([type, schema]: [string, TRtJsonSchema]): TRtJsonSchema => nestedSchema(type, schema));
    const properties: TRtJsonSchema = record(RT_AI_CHAT_SECTION_SCHEMA['properties']);

    return record(
        copy({
            ...RT_AI_CHAT_SECTION_SCHEMA,
            properties: { ...properties, blocks: { ...record(properties['blocks']), items: { oneOf } } },
        })
    );
}
