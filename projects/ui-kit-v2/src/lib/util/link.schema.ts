/**
 * JSON-схема блока ссылки на страницу (JSON Schema 2020-12). Приложение отдаёт её модели как
 * параметры инструмента. В схеме то, что пишет модель: исход открытия и причину отказа приложение
 * дописывает само после вызова, поэтому `state` и `reason` в ней нет. Блок мягче схемы: то, что
 * схема отвергает, он всё равно рисует, выбросив испорченную необязательную часть.
 */
export const RT_AI_CHAT_LINK_SCHEMA: Readonly<Record<string, unknown>> = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Link',
    type: 'object',
    required: ['title', 'url'],
    properties: {
        title: { type: 'string', minLength: 1, description: 'The title of the page.' },
        url: { type: 'string', minLength: 1, description: 'The address the application opens.' },
        section: { type: 'string', description: 'The menu section of the page, a ready text: «Reports · Sales».' },
        icon: { type: 'string', description: 'The name of a kit icon; link by default.' },
    },
};
