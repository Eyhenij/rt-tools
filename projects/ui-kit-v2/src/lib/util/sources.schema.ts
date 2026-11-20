/**
 * JSON-схема блока источников цифр ответа (JSON Schema 2020-12). Приложение отдаёт её модели как
 * параметры инструмента. В схеме то, что пишет модель: названия источников, их уточнения, имена
 * значков и адреса. Блок мягче схемы: то, что схема отвергает, он всё равно рисует, выбросив
 * испорченную необязательную часть или источник без названия.
 */
export const RT_AI_CHAT_SOURCES_SCHEMA: Readonly<Record<string, unknown>> = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Sources',
    type: 'object',
    required: ['items'],
    properties: {
        items: {
            type: 'array',
            minItems: 1,
            description: 'The sources the numbers of the answer came from.',
            items: {
                type: 'object',
                required: ['title'],
                properties: {
                    title: {
                        type: 'string',
                        minLength: 1,
                        pattern: '[^\\s\\u200B-\\u200D\\u2060\\uFEFF]',
                        description: 'The name of the source: a report, a page, a table.',
                    },
                    detail: { type: 'string', description: 'What narrows the source: a page, a period, filters.' },
                    icon: { type: 'string', description: 'The name of a kit icon for the kind of source; file by default.' },
                    url: { type: 'string', description: 'The address the application opens; without it the source is not pressable.' },
                },
            },
        },
    },
};
