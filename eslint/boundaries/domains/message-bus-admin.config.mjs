/**
 * Семья админки приёмника: `apps/message-bus-admin` и `libs/message-bus-admin/*`.
 *
 * Приложение здесь тонкое: оно поднимает каркас и объявляет маршруты, а экраны приходят к нему
 * слоями `shell` и `feature` своих доменов. Публикуемые пакеты дерева — киты, основание и
 * утилиты — в списке не стоят: их разрешает общее правило, которое лежит последним во всём
 * своде.
 *
 * Рёбра выписаны перечислением, как и у серверной стороны: тег, собранный подстановкой, в тексте
 * файла не встречается, и проверка раскладки видела бы либу неописанной.
 */

/** Слой утилит домена входа: род отказа и модели читают все, кто про вход говорит. */
const AUTH_UTIL = 'scope:message-bus-admin-auth-util';

/** Состояние входа. Живёт в одном экземпляре: второй ответил бы на вопрос «вошёл ли» иначе. */
const AUTH_DATA_ACCESS = 'scope:message-bus-admin-auth-data-access';

/** Меню объявлением: его читает оболочка, а заводится оно вместе со своим экраном. */
const CONTAINER_UTIL = 'scope:message-bus-admin-common-container-util';

/**
 * Публикуемые пакеты дерева: киты, основание и утилиты. Стоят в списке у каждой либы админки —
 * из них она и собрана целиком. Метка нужна именно как имя цели: без неё либа с объявленным
 * списком не видит пакет вовсе, потому что первое подходящее правило выигрывает и до общего
 * разрешения дело не доходит.
 */
const PACKAGE = 'scope:package';

/**
 * Общий слой админки: словарь, обращение к операциям чтения, выборка в адресе, основа
 * списочного стора и общий вид страницы списка. Механика, а не предмет: разделы груза зовут её
 * все три, и разложенная по ним заново она расходилась бы молча.
 */
const CORE_UTIL = 'scope:message-bus-admin-common-core-util';
const CORE_API = 'scope:message-bus-admin-common-core-api';
const CORE_DATA_ACCESS = 'scope:message-bus-admin-common-core-data-access';
const CORE_UI = 'scope:message-bus-admin-common-core-ui';

/**
 * Форма того, что отдаёт приёмник: страница, выборка и дерево. Её знают обе стороны, и админка
 * читает её у источника, а не заводит свою копию — копия разошлась бы с контрактом молча.
 */
const CONTRACT = 'scope:message-bus-common';

export const messageBusAdminBoundaries = [
    // Приложение видит маршруты домена входа и оболочку. Экраны оно не знает ни одного: их
    // приносит отложенная загрузка по маршруту, объявленному тем, чей это экран
    {
        sourceTag: 'scope:admin-app',
        onlyDependOnLibsWithTags: ['scope:message-bus-admin-auth-shell', 'scope:message-bus-admin-common-container-feature', PACKAGE],
    },

    // Вход: экран берёт форму и состояние, состояние — обращение к приёмнику, обращение —
    // модели. Лесенка домена выписана ребро за ребром
    {
        sourceTag: 'scope:message-bus-admin-auth-feature-sign-in',
        onlyDependOnLibsWithTags: ['scope:message-bus-admin-auth-ui', AUTH_DATA_ACCESS, AUTH_UTIL, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-auth-shell',
        onlyDependOnLibsWithTags: ['scope:message-bus-admin-auth-feature-sign-in', AUTH_DATA_ACCESS, AUTH_UTIL, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-auth-ui',
        onlyDependOnLibsWithTags: [AUTH_UTIL, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-auth-data-access',
        onlyDependOnLibsWithTags: ['scope:message-bus-admin-auth-api', AUTH_UTIL, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-auth-api',
        onlyDependOnLibsWithTags: [AUTH_UTIL, PACKAGE],
    },

    // Оболочка: она знает, кто вошёл, куда его вывести при выходе и из чего собрано меню
    {
        sourceTag: 'scope:message-bus-admin-common-container-feature',
        onlyDependOnLibsWithTags: ['scope:message-bus-admin-auth-shell', AUTH_DATA_ACCESS, AUTH_UTIL, CONTAINER_UTIL, PACKAGE],
    },

    // Слои, которые не зовут никого. Выписаны отдельными правилами, а не пропущены: правило
    // проверки раскладки требует, чтобы тег каждой либы стоял в границах, и молчание про либу
    // читается как «прав ей не давали», а не как «прав ей не нужно»
    {
        sourceTag: 'scope:message-bus-admin-auth-util',
        onlyDependOnLibsWithTags: [PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-common-container-util',
        onlyDependOnLibsWithTags: [PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-common-container-api',
        onlyDependOnLibsWithTags: [CONTAINER_UTIL, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-common-container-data-access',
        onlyDependOnLibsWithTags: ['scope:message-bus-admin-common-container-api', CONTAINER_UTIL, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-common-container-ui',
        onlyDependOnLibsWithTags: [CONTAINER_UTIL, PACKAGE],
    },

    // Общий слой админки. Лесенка та же, что у домена: вид знает словарь, состояние — обращение,
    // обращение — словарь и форму контракта. Предмета ни один из них не знает: разделы зовут их,
    // а не наоборот
    {
        sourceTag: 'scope:message-bus-admin-common-core-util',
        onlyDependOnLibsWithTags: [CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-common-core-api',
        onlyDependOnLibsWithTags: [CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-common-core-data-access',
        onlyDependOnLibsWithTags: [CORE_API, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-common-core-ui',
        onlyDependOnLibsWithTags: [CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-common-core-feature',
        onlyDependOnLibsWithTags: [CORE_UI, CORE_DATA_ACCESS, CORE_API, CORE_UTIL, CONTRACT, PACKAGE],
    },
];
