import { ERtTableColumn } from './table-data';

const VALUE: Readonly<Record<string, unknown>> = { type: ['number', 'string', 'null'] };

/**
 * JSON-схема блока таблицы (JSON Schema 2020-12). Приложение отдаёт её модели как параметры
 * инструмента. Блок мягче схемы: то, что схема отвергает, он всё равно рисует, выбросив или
 * опустошив испорченную часть, а принятое схемой рисует целиком.
 */
export const RT_AI_CHAT_TABLE_SCHEMA: Readonly<Record<string, unknown>> = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Table',
    type: 'object',
    required: ['columns', 'rows'],
    properties: {
        columns: {
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                required: ['label', 'type'],
                properties: {
                    label: { type: 'string' },
                    type: { enum: Object.values(ERtTableColumn) },
                    currency: { type: 'string', pattern: '^[A-Z]{3}$' },
                },
            },
        },
        rows: { type: 'array', items: { type: 'array', items: VALUE } },
        total: { type: 'array', items: VALUE },
    },
};
