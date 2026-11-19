import { ERtKpiDeltaUnit, ERtKpiFormat } from './kpi-data';

/**
 * JSON-схема блока KPI (JSON Schema 2020-12). Приложение отдаёт её модели как параметры
 * инструмента. Блок мягче схемы: то, что схема отвергает, он всё равно рисует, выбросив
 * испорченную карточку или часть, а принятое схемой рисует целиком.
 */
export const RT_AI_CHAT_KPI_SCHEMA: Readonly<Record<string, unknown>> = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'KPI',
    type: 'object',
    required: ['items'],
    properties: {
        items: {
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                required: ['label', 'value'],
                properties: {
                    label: { type: 'string', minLength: 1 },
                    value: {
                        type: ['number', 'string'],
                        description: 'The figure. A percent value is a fraction: 0.78 is 78 %.',
                    },
                    format: { enum: Object.values(ERtKpiFormat) },
                    currency: { type: 'string', pattern: '^[A-Z]{3}$' },
                    delta: {
                        type: 'number',
                        description: 'The change against the base in percent: 12.5 is +12.5 %, not a fraction.',
                    },
                    deltaUnit: {
                        enum: Object.values(ERtKpiDeltaUnit),
                        description: 'percent by default; points when the delta is a change in percentage points.',
                    },
                    base: { type: 'string', description: 'A short caption of the base: «vs LY».' },
                    period: { type: 'string' },
                    growthIsGood: { type: 'boolean', description: 'Whether growth of the figure is good; true by default.' },
                },
            },
        },
    },
};
