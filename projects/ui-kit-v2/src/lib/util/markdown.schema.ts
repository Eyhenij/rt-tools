/**
 * JSON-схема блока текста (JSON Schema 2020-12). Приложение отдаёт её модели как параметры
 * инструмента; в схему секции она попадает сама.
 */
export const RT_AI_CHAT_MARKDOWN_SCHEMA: Readonly<Record<string, unknown>> = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Markdown',
    type: 'object',
    required: ['text'],
    properties: {
        text: { type: 'string', minLength: 1, description: 'The text of the answer in markdown.' },
    },
};
