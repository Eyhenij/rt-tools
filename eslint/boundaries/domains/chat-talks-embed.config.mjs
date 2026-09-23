/**
 * Скрипт установки встраиваемой страницы: `apps/chat-talks-embed`.
 *
 * Он стоит в чужой админке и приезжает туда одним файлом, поэтому видит ровно одну либу — общие
 * слова обмена с сервисом. Кит, основание и утилиты дерева ему не разрешены намеренно:
 * разрешённые, они приехали бы в каждую админку каждого потребителя вместе с каркасом.
 */
export const chatTalksEmbedBoundaries = [
    {
        sourceTag: 'scope:chat-talks-embed-app',
        onlyDependOnLibsWithTags: ['scope:message-bus-common'],
    },
];
