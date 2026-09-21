/**
 * Раздел чата семьи админки: `libs/message-bus-admin/chat/*`.
 *
 * Своим файлом, а не строками в файле семьи: тот дорос до предела длины, и шесть слоёв раздела в
 * него не поместились. Правила те же, что у соседей: тег называет либу, первое подходящее правило
 * выигрывает, и общее разрешение пакетов лежит последним в своде.
 */
import { CONTRACT, CORE_API, CORE_DATA_ACCESS, CORE_FEATURE, CORE_UI, CORE_UTIL, PACKAGE } from './message-bus-admin.tags.mjs';

/**
 * Раздел чата: модели панели и разбор ответа приёмника, обращения к операциям, сторы списка и
 * ленты, строка списка и сообщение ленты, экран раздела и его маршрут.
 */
const CHAT_UTIL = 'scope:message-bus-admin-chat-util';
const CHAT_API = 'scope:message-bus-admin-chat-api';
const CHAT_DATA_ACCESS = 'scope:message-bus-admin-chat-data-access';
const CHAT_UI = 'scope:message-bus-admin-chat-ui';
const CHAT_FEATURE_PANEL = 'scope:message-bus-admin-chat-feature-panel';

export const messageBusAdminChatBoundaries = [
    // Слой моделей видит только словарь общего слоя и форму контракта; обращения берут предел
    // ожидания и разбор отказа готовыми у общего слоя; стор видит обращения и общую основу стора —
    // второй свой способ читать страницу разошёлся бы с первым
    {
        sourceTag: 'scope:message-bus-admin-chat-util',
        onlyDependOnLibsWithTags: [CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-chat-api',
        onlyDependOnLibsWithTags: [CHAT_UTIL, CORE_API, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-chat-data-access',
        onlyDependOnLibsWithTags: [CHAT_API, CHAT_UTIL, CORE_DATA_ACCESS, CORE_API, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-chat-ui',
        onlyDependOnLibsWithTags: [CHAT_UTIL, CORE_UI, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-chat-feature-panel',
        onlyDependOnLibsWithTags: [
            CHAT_UI,
            CHAT_DATA_ACCESS,
            CHAT_API,
            CHAT_UTIL,
            CORE_FEATURE,
            CORE_UI,
            CORE_DATA_ACCESS,
            CORE_API,
            CORE_UTIL,
            CONTRACT,
            PACKAGE,
        ],
    },
    {
        sourceTag: 'scope:message-bus-admin-chat-shell',
        onlyDependOnLibsWithTags: [CHAT_FEATURE_PANEL, CHAT_UTIL, CORE_UTIL, CONTRACT, PACKAGE],
    },
];
