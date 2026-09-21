/**
 * Границы зависимостей между проектами (`@nx/enforce-module-boundaries`).
 *
 * У каждой либы ровно один тег: `scope:` плюс путь от `libs/` с дефисами вместо слэшей. Тег
 * называет либу, а не её слой: слой читается из пути и сверяется проверкой раскладки.
 *
 * Свод собирается здесь, а сами рёбра живут файлами доменов: пока они лежали одним списком в
 * конфиге линтера, проверка раскладки не могла их прочитать вовсе — конфиг в CommonJS, а
 * читает она модулем.
 *
 * Порядок значим: первое подходящее правило выигрывает, поэтому общее разрешение публикуемых
 * пакетов стоит последним.
 */
import { messageBusAdminAccountsBoundaries } from './domains/message-bus-admin-accounts.config.mjs';
import { messageBusAdminChatBoundaries } from './domains/message-bus-admin-chat.config.mjs';
import { messageBusAdminBoundaries } from './domains/message-bus-admin.config.mjs';
import { messageBusApiBoundaries } from './domains/message-bus-api.config.mjs';
import { messageBusCommonBoundaries } from './domains/message-bus-common.config.mjs';
import { packagesBoundaries } from './domains/packages.config.mjs';

export const allBoundaries = [
    ...messageBusAdminBoundaries,
    ...messageBusAdminAccountsBoundaries,
    ...messageBusAdminChatBoundaries,
    ...messageBusApiBoundaries,
    ...messageBusCommonBoundaries,
    ...packagesBoundaries,
];
