/**
 * Виджет чата: `apps/chat-widget`.
 *
 * Он стоит в чужой странице и приезжает туда одним файлом, поэтому видит ровно одну либу — форму
 * ответов сервиса. Кит, основание и утилиты дерева ему не разрешены намеренно: разрешённые, они
 * приехали бы в каждую страницу каждого потребителя вместе с каркасом.
 */
export const chatWidgetBoundaries = [
    {
        sourceTag: 'scope:chat-widget-app',
        onlyDependOnLibsWithTags: ['scope:message-bus-common'],
    },
];
