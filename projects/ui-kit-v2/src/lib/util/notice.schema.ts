/**
 * JSON-схема блока плашки (JSON Schema 2020-12). Приложение отдаёт её модели как параметры
 * инструмента; в схему секции она попадает сама. Оттенки — те, что рисует `rt-message`: плашка
 * с другим оттенком показана заглушкой.
 */
export const RT_AI_CHAT_NOTICE_SCHEMA: Readonly<Record<string, unknown>> = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Notice',
    type: 'object',
    required: ['severity', 'text'],
    properties: {
        severity: { enum: ['info', 'success', 'warning', 'danger', 'secondary', 'neutral'] },
        text: { type: 'string', minLength: 1, description: 'The text of the notice.' },
    },
};
