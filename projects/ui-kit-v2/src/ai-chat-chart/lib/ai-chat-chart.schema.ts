import { ERtAiChatChartFormat, ERtAiChatChartKind } from './ai-chat-chart.enum';
import { RT_AI_CHAT_CHART_LIMITS } from './ai-chat-chart.model';

const CATEGORY_KINDS: string[] = [
    ERtAiChatChartKind.LINE,
    ERtAiChatChartKind.BAR,
    ERtAiChatChartKind.GROUPED_BAR,
    ERtAiChatChartKind.STACKED_BAR,
    ERtAiChatChartKind.PIE,
    ERtAiChatChartKind.HEATMAP,
];
const TREE_KINDS: string[] = [ERtAiChatChartKind.TREEMAP, ERtAiChatChartKind.SUNBURST];
const NON_NEGATIVE_KINDS: string[] = [ERtAiChatChartKind.STACKED_BAR, ERtAiChatChartKind.PIE, ERtAiChatChartKind.HISTOGRAM];

function seriesOf(x: object, y: object): object {
    return {
        type: 'array',
        maxItems: RT_AI_CHAT_CHART_LIMITS.series,
        items: {
            type: 'object',
            required: ['name', 'points'],
            properties: {
                name: { type: 'string' },
                points: {
                    type: 'array',
                    maxItems: RT_AI_CHAT_CHART_LIMITS.points,
                    items: { type: 'object', required: ['x', 'y'], properties: { x, y } },
                },
            },
        },
    };
}

/**
 * «Если условие — то следствие» в записи `anyOf`: условие не выполнено, или выполнено следствие.
 * Валидатор судит так же, как пару `if`/`then`.
 */
function implies(condition: object, consequence: object): object {
    return { anyOf: [{ not: condition }, consequence] };
}

/** «Если условие — то одно, иначе другое» в записи `anyOf`, как тройка `if`/`then`/`else`. */
function either(condition: object, consequence: object, alternative: object): object {
    return { anyOf: [{ allOf: [condition, consequence] }, { allOf: [{ not: condition }, alternative] }] };
}

/**
 * JSON-схема спецификации графика (JSON Schema 2020-12). Приложение отдаёт её модели как параметры
 * инструмента. Схема не считает различные листья дерева и не сравнивает X внутри ряда: эти два
 * отказа делает только проверка блока.
 */
export const RT_AI_CHAT_CHART_SCHEMA: Readonly<Record<string, unknown>> = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Chart',
    type: 'object',
    required: ['kind'],
    properties: {
        kind: { enum: Object.values(ERtAiChatChartKind) },
        title: { type: 'string' },
        subtitle: { type: 'string' },
        xLabel: { type: 'string' },
        yLabel: { type: 'string' },
        format: { enum: Object.values(ERtAiChatChartFormat) },
        currency: { type: 'string', pattern: '^[A-Z]{3}$' },
        series: true,
        hierarchy: {
            type: 'array',
            maxItems: RT_AI_CHAT_CHART_LIMITS.hierarchyEntries,
            items: {
                type: 'object',
                required: ['path', 'value'],
                properties: {
                    path: { type: 'array', minItems: 1, maxItems: RT_AI_CHAT_CHART_LIMITS.depth, items: { type: 'string' } },
                    value: { type: 'number', minimum: 0 },
                },
            },
        },
    },
    allOf: [
        implies({ properties: { format: { const: ERtAiChatChartFormat.CURRENCY } }, required: ['format'] }, { required: ['currency'] }),
        either({ properties: { kind: { enum: TREE_KINDS } } }, { required: ['hierarchy'] }, { required: ['series'] }),
        implies(
            { properties: { kind: { enum: CATEGORY_KINDS.filter((kind: string): boolean => !NON_NEGATIVE_KINDS.includes(kind)) } } },
            { properties: { series: seriesOf({ type: 'string' }, { type: 'number' }) } }
        ),
        implies(
            { properties: { kind: { enum: CATEGORY_KINDS.filter((kind: string): boolean => NON_NEGATIVE_KINDS.includes(kind)) } } },
            { properties: { series: seriesOf({ type: 'string' }, { type: 'number', minimum: 0 }) } }
        ),
        implies(
            { properties: { kind: { const: ERtAiChatChartKind.SCATTER } } },
            { properties: { series: seriesOf({ type: 'number' }, { type: 'number' }) } }
        ),
        implies(
            { properties: { kind: { const: ERtAiChatChartKind.HISTOGRAM } } },
            { properties: { series: { ...seriesOf({ type: 'number' }, { type: 'number', minimum: 0 }), minItems: 1, maxItems: 1 } } }
        ),
        implies({ properties: { kind: { const: ERtAiChatChartKind.PIE } } }, { properties: { series: { type: 'array', maxItems: 1 } } }),
    ],
};

function withoutDialect(schema: Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>> {
    return Object.fromEntries(Object.entries(schema).filter(([key]: [string, unknown]): boolean => key !== '$schema'));
}

/**
 * JSON-схема блока графика (JSON Schema 2020-12): спецификация лежит в поле `spec`, как её читает
 * блок. Эту схему, а не схему спецификации, приложение называет под именем `chart`, когда
 * собирает схему секции.
 */
export const RT_AI_CHAT_CHART_BLOCK_SCHEMA: Readonly<Record<string, unknown>> = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Chart block',
    type: 'object',
    required: ['spec'],
    properties: {
        spec: withoutDialect(RT_AI_CHAT_CHART_SCHEMA),
    },
};
