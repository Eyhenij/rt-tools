/**
 * Встраиваемая страница переписок: `apps/chat-talks-page`.
 *
 * Она показывает то же, что панель оператора, и теми же частями: модели раздела чата, переводы в
 * модель кита и строку списка страница берёт готовыми — второй их перевод разошёлся бы с первым
 * молча и показался бы репликой, вставшей в ленту не той стороной.
 *
 * Своего у страницы только обращения: операции её закрыты признаком страницы, а не входом
 * человека, и адреса у них свои. Предел ожидания и разбор отказа берутся у общего слоя админки —
 * там же, где их берут все остальные обращения дерева.
 *
 * Сторов раздела страница не видит намеренно: они читают операции оператора, и признак страницы им
 * не по чину.
 */
import { CORE_API, CORE_UTIL, CONTRACT, PACKAGE } from './message-bus-admin.tags.mjs';

const CHAT_UTIL = 'scope:message-bus-admin-chat-util';
const CHAT_UI = 'scope:message-bus-admin-chat-ui';

export const chatTalksPageBoundaries = [
    {
        sourceTag: 'scope:chat-talks-page-app',
        onlyDependOnLibsWithTags: [CHAT_UTIL, CHAT_UI, CORE_API, CORE_UTIL, CONTRACT, PACKAGE],
    },
];
