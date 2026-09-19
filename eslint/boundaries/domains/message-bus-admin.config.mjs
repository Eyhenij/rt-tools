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

import {
    AUTH_DATA_ACCESS,
    CONTRACT,
    CORE_API,
    CORE_DATA_ACCESS,
    CORE_FEATURE,
    CORE_UI,
    CORE_UTIL,
    PACKAGE,
} from './message-bus-admin.tags.mjs';

/** Слой утилит домена входа: род отказа и модели читают все, кто про вход говорит. */
const AUTH_UTIL = 'scope:message-bus-admin-auth-util';

/** Меню объявлением: его читает оболочка, а заводится оно вместе со своим экраном. */
const CONTAINER_UTIL = 'scope:message-bus-admin-common-container-util';

/**
 * Раздел разборов происшествий: модели и маппер, обращение к своим операциям, сторы списка и
 * записи, вид записи, экран списка, панель подробностей и маршруты раздела. Общий слой он зовёт
 * весь — механика списка живёт там; обратного пути нет.
 */
const POSTMORTEMS_UTIL = 'scope:message-bus-admin-postmortems-util';
const POSTMORTEMS_API = 'scope:message-bus-admin-postmortems-api';
const POSTMORTEMS_DATA_ACCESS = 'scope:message-bus-admin-postmortems-data-access';
const POSTMORTEMS_UI = 'scope:message-bus-admin-postmortems-ui';

/**
 * Раздел предложений по слою правил. Устроен теми же семью слоями и теми же рёбрами, что и
 * раздел разборов: собран он общей основой целиком, и своего у него только модели, столбцы и
 * поля панели.
 */
const PROPOSALS_UTIL = 'scope:message-bus-admin-proposals-util';
const PROPOSALS_API = 'scope:message-bus-admin-proposals-api';
const PROPOSALS_DATA_ACCESS = 'scope:message-bus-admin-proposals-data-access';
const PROPOSALS_UI = 'scope:message-bus-admin-proposals-ui';

/**
 * Раздел сводок деревьев. Устроен теми же семью слоями и теми же рёбрами, что и два соседних:
 * своего у него только модели, столбцы и поля панели.
 */
const SUMMARIES_UTIL = 'scope:message-bus-admin-summaries-util';
const SUMMARIES_API = 'scope:message-bus-admin-summaries-api';
const SUMMARIES_DATA_ACCESS = 'scope:message-bus-admin-summaries-data-access';
const SUMMARIES_UI = 'scope:message-bus-admin-summaries-ui';

/**
 * Раздел использования правил. Устроен теми же семью слоями и теми же рёбрами, что и разделы
 * груза: своего у него только модели, столбцы, отбор по периоду и панель сессий вместо панели
 * подробностей.
 */
const USAGE_UTIL = 'scope:message-bus-admin-usage-util';
const USAGE_API = 'scope:message-bus-admin-usage-api';
const USAGE_DATA_ACCESS = 'scope:message-bus-admin-usage-data-access';
const USAGE_UI = 'scope:message-bus-admin-usage-ui';

/**
 * Раздел приглашений: модели и решения раздела, отзыв приглашения, стор списка, экран и маршрут.
 * Слоя вида у него нет — ячейки строки показывают готовые поля, и своего вида разделу не нужно.
 */
const INVITES_UTIL = 'scope:message-bus-admin-invites-util';
const INVITES_API = 'scope:message-bus-admin-invites-api';
const INVITES_DATA_ACCESS = 'scope:message-bus-admin-invites-data-access';

export const messageBusAdminBoundaries = [
    // Приложение видит маршруты домена входа и оболочку. Экраны оно не знает ни одного: их
    // приносит отложенная загрузка по маршруту, объявленному тем, чей это экран.
    //
    // Словарь общего слоя приложение видит потому, что кит настраивается здесь: подписи кита
    // отдаются ему провайдером рядом с иконками, а лежат они там же, где подписи экранов, —
    // разложенные по двум местам, они расходятся молча
    //
    // Утилиты входа — ради слов адресов: маршруты собираются здесь, а объявлены адреса там,
    // рядом друг с другом. Своё слово в маршрутах разошлось бы с тем, по которому уводят стражи
    {
        sourceTag: 'scope:admin-app',
        onlyDependOnLibsWithTags: [
            'scope:message-bus-admin-auth-shell',
            AUTH_UTIL,
            'scope:message-bus-admin-common-container-feature',
            'scope:message-bus-admin-postmortems-shell',
            'scope:message-bus-admin-proposals-shell',
            'scope:message-bus-admin-summaries-shell',
            'scope:message-bus-admin-usage-shell',
            'scope:message-bus-admin-invites-shell',
            'scope:message-bus-admin-accounts-shell',
            CORE_UTIL,
            PACKAGE,
        ],
    },

    // Вход: экран берёт форму и состояние, состояние — обращение к приёмнику, обращение —
    // модели. Лесенка домена выписана ребро за ребром.
    //
    // Общий слой экран видит ради переключателей темы и языка: они стоят и здесь, и в попапе
    // профиля, а выбор у них один на приложение. Собранные на входе заново, они разошлись бы с
    // попапом набором языков и видом
    {
        sourceTag: 'scope:message-bus-admin-auth-feature-sign-in',
        onlyDependOnLibsWithTags: ['scope:message-bus-admin-auth-ui', AUTH_DATA_ACCESS, AUTH_UTIL, CORE_UI, CORE_UTIL, PACKAGE],
    },
    // Экран первой записи стоит на той же раскладке входа и видит то же, что экран входа, кроме
    // формы входа: у его формы своё слово отказа — то, что сказал приёмник, — а не род отказа
    // по паре. Форму он держит сам, на готовых полях кита
    {
        sourceTag: 'scope:message-bus-admin-auth-feature-setup',
        onlyDependOnLibsWithTags: [AUTH_DATA_ACCESS, AUTH_UTIL, CORE_UI, CORE_UTIL, PACKAGE],
    },
    // Стражи закрытой ветки стоят здесь оба, и второй читает право раздела из объявления пункта
    // меню: свой список прав рядом с маршрутами разошёлся бы с меню молча. Оболочку он при этом
    // не видит — она грузится по требованию, и статическая ссылка на неё это потеряла бы
    // Словарь маршруты входа видят по той же причине, что и меню: заголовок вкладки они называют
    // ключом, а текст по нему спрашивают на каждом переходе — написанный здесь строкой, он остался
    // бы на одном языке при любом выборе человека
    {
        sourceTag: 'scope:message-bus-admin-auth-shell',
        onlyDependOnLibsWithTags: [
            'scope:message-bus-admin-auth-feature-sign-in',
            'scope:message-bus-admin-auth-feature-setup',
            AUTH_DATA_ACCESS,
            AUTH_UTIL,
            CONTAINER_UTIL,
            CORE_UTIL,
            PACKAGE,
        ],
    },
    // Форма входа видит словарь по той же причине, что шапка и меню: подписи её полей, кнопки и
    // текстов отказа лежат там, где остальные подписи админки, — написанные здесь литералом, они
    // остались бы на одном языке при любом выборе человека
    {
        sourceTag: 'scope:message-bus-admin-auth-ui',
        onlyDependOnLibsWithTags: [AUTH_UTIL, CORE_UTIL, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-auth-data-access',
        onlyDependOnLibsWithTags: ['scope:message-bus-admin-auth-api', AUTH_UTIL, PACKAGE],
    },
    // Обращение входа видит общий слой обращений ради разбора отказа правки: заведение первой
    // записи отвечает словом приёмника, и читается оно тем же разбором, что у правок людей
    {
        sourceTag: 'scope:message-bus-admin-auth-api',
        onlyDependOnLibsWithTags: [AUTH_UTIL, CORE_API, PACKAGE],
    },

    // Оболочка: она знает, кто вошёл, куда его вывести при выходе, из чего собрано меню и чем
    // рисуется шапка. Сама шапка предмета не знает — разделы и вошедший приходят к ней входами
    // Оболочка видит словарь по той же причине, что шапка и меню: свою подпись она показывает
    // одну — экран для того, кому не открыт ни один раздел, — и написанная разметкой она
    // разошлась бы с остальными подписями админки молча
    {
        sourceTag: 'scope:message-bus-admin-common-container-feature',
        onlyDependOnLibsWithTags: [
            'scope:message-bus-admin-auth-shell',
            'scope:message-bus-admin-common-container-ui',
            AUTH_DATA_ACCESS,
            AUTH_UTIL,
            CONTAINER_UTIL,
            CORE_UTIL,
            PACKAGE,
        ],
    },

    // Слои, которые не зовут никого. Выписаны отдельными правилами, а не пропущены: правило
    // проверки раскладки требует, чтобы тег каждой либы стоял в границах, и молчание про либу
    // читается как «прав ей не давали», а не как «прав ей не нужно»
    {
        sourceTag: 'scope:message-bus-admin-auth-util',
        onlyDependOnLibsWithTags: [PACKAGE],
    },
    // Меню видит словарь: подписи разделов оно берёт оттуда же, откуда их берут сами разделы, —
    // переписанные в декларации литералом, они расходятся с заголовком экрана молча. Общую либу
    // оно видит ради имени права: тем же именем приёмник закрывает свою операцию, и свой список
    // имён в админке разошёлся бы с ним молча
    {
        sourceTag: 'scope:message-bus-admin-common-container-util',
        onlyDependOnLibsWithTags: [CONTRACT, CORE_UTIL, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-common-container-api',
        onlyDependOnLibsWithTags: [CONTAINER_UTIL, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-common-container-data-access',
        onlyDependOnLibsWithTags: ['scope:message-bus-admin-common-container-api', CONTAINER_UTIL, PACKAGE],
    },
    // Шапка видит словарь по той же причине, что и меню: название приложения и подпись ряда
    // разделов лежат там, где подписи экранов, — написанные в шапке литералом, они расходятся с
    // заголовком вкладки и заголовком экрана молча. Общий слой вида она видит ради выбора языка
    // в попапе профиля: тот же выбор стоит на экране входа, и собран он один раз
    {
        sourceTag: 'scope:message-bus-admin-common-container-ui',
        onlyDependOnLibsWithTags: [CONTAINER_UTIL, CORE_UI, CORE_UTIL, PACKAGE],
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

    // Раздел разборов происшествий. Лесенка домена та же, а сверх неё каждый слой видит свой
    // уровень общего слоя: экран — его основу и его вид, сторы — его основу стора, обращение —
    // его запрос. Тем и держится обещание «все три раздела собраны одним экраном»
    {
        sourceTag: 'scope:message-bus-admin-postmortems-util',
        onlyDependOnLibsWithTags: [CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-postmortems-api',
        onlyDependOnLibsWithTags: [POSTMORTEMS_UTIL, CORE_API, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-postmortems-data-access',
        onlyDependOnLibsWithTags: [POSTMORTEMS_API, POSTMORTEMS_UTIL, CORE_DATA_ACCESS, CORE_API, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-postmortems-ui',
        onlyDependOnLibsWithTags: [POSTMORTEMS_UTIL, CORE_UI, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-postmortems-feature-list',
        onlyDependOnLibsWithTags: [
            POSTMORTEMS_DATA_ACCESS,
            POSTMORTEMS_UI,
            POSTMORTEMS_UTIL,
            CORE_FEATURE,
            CORE_UI,
            CORE_DATA_ACCESS,
            CORE_UTIL,
            CONTRACT,
            PACKAGE,
        ],
    },
    {
        sourceTag: 'scope:message-bus-admin-postmortems-feature-details-aside',
        onlyDependOnLibsWithTags: [POSTMORTEMS_DATA_ACCESS, POSTMORTEMS_UI, POSTMORTEMS_UTIL, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-postmortems-shell',
        onlyDependOnLibsWithTags: [
            'scope:message-bus-admin-postmortems-feature-list',
            'scope:message-bus-admin-postmortems-feature-details-aside',
            POSTMORTEMS_UTIL,
            CORE_UTIL,
            PACKAGE,
        ],
    },

    // Раздел предложений. Лесенка та же, что у разборов, и тем же перечислением: раздел, у
    // которого рёбра выписаны иначе, собран не общей основой, а своим — а обещание всей работы
    // ровно в том, что все три раздела собраны одним экраном
    {
        sourceTag: 'scope:message-bus-admin-proposals-util',
        onlyDependOnLibsWithTags: [CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-proposals-api',
        onlyDependOnLibsWithTags: [PROPOSALS_UTIL, CORE_API, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-proposals-data-access',
        onlyDependOnLibsWithTags: [PROPOSALS_API, PROPOSALS_UTIL, CORE_DATA_ACCESS, CORE_API, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-proposals-ui',
        onlyDependOnLibsWithTags: [PROPOSALS_UTIL, CORE_UI, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-proposals-feature-list',
        onlyDependOnLibsWithTags: [
            PROPOSALS_DATA_ACCESS,
            PROPOSALS_UI,
            PROPOSALS_UTIL,
            CORE_FEATURE,
            CORE_UI,
            CORE_DATA_ACCESS,
            CORE_UTIL,
            CONTRACT,
            PACKAGE,
        ],
    },
    {
        sourceTag: 'scope:message-bus-admin-proposals-feature-details-aside',
        onlyDependOnLibsWithTags: [PROPOSALS_DATA_ACCESS, PROPOSALS_UI, PROPOSALS_UTIL, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-proposals-shell',
        onlyDependOnLibsWithTags: [
            'scope:message-bus-admin-proposals-feature-list',
            'scope:message-bus-admin-proposals-feature-details-aside',
            PROPOSALS_UTIL,
            CORE_UTIL,
            PACKAGE,
        ],
    },

    // Раздел сводок деревьев. Лесенка та же и тем же перечислением, что у двух соседних
    {
        sourceTag: 'scope:message-bus-admin-summaries-util',
        onlyDependOnLibsWithTags: [CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-summaries-api',
        onlyDependOnLibsWithTags: [SUMMARIES_UTIL, CORE_API, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-summaries-data-access',
        onlyDependOnLibsWithTags: [SUMMARIES_API, SUMMARIES_UTIL, CORE_DATA_ACCESS, CORE_API, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-summaries-ui',
        onlyDependOnLibsWithTags: [SUMMARIES_UTIL, CORE_UI, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-summaries-feature-list',
        onlyDependOnLibsWithTags: [
            SUMMARIES_DATA_ACCESS,
            SUMMARIES_UI,
            SUMMARIES_UTIL,
            CORE_FEATURE,
            CORE_UI,
            CORE_DATA_ACCESS,
            CORE_UTIL,
            CONTRACT,
            PACKAGE,
        ],
    },
    {
        sourceTag: 'scope:message-bus-admin-summaries-feature-details-aside',
        onlyDependOnLibsWithTags: [SUMMARIES_DATA_ACCESS, SUMMARIES_UI, SUMMARIES_UTIL, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-summaries-shell',
        onlyDependOnLibsWithTags: [
            'scope:message-bus-admin-summaries-feature-list',
            'scope:message-bus-admin-summaries-feature-details-aside',
            SUMMARIES_UTIL,
            CORE_UTIL,
            PACKAGE,
        ],
    },

    // Раздел использования правил. Лесенка та же и тем же перечислением, что у разделов груза
    {
        sourceTag: 'scope:message-bus-admin-usage-util',
        onlyDependOnLibsWithTags: [CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-usage-api',
        onlyDependOnLibsWithTags: [USAGE_UTIL, CORE_API, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-usage-data-access',
        onlyDependOnLibsWithTags: [USAGE_API, USAGE_UTIL, CORE_DATA_ACCESS, CORE_API, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-usage-ui',
        onlyDependOnLibsWithTags: [USAGE_UTIL, CORE_UI, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-usage-feature-list',
        onlyDependOnLibsWithTags: [
            USAGE_DATA_ACCESS,
            USAGE_UI,
            USAGE_UTIL,
            CORE_FEATURE,
            CORE_UI,
            CORE_DATA_ACCESS,
            CORE_UTIL,
            CONTRACT,
            PACKAGE,
        ],
    },
    {
        sourceTag: 'scope:message-bus-admin-usage-feature-sessions-aside',
        onlyDependOnLibsWithTags: [USAGE_DATA_ACCESS, USAGE_UI, USAGE_UTIL, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-usage-shell',
        onlyDependOnLibsWithTags: [
            'scope:message-bus-admin-usage-feature-list',
            'scope:message-bus-admin-usage-feature-sessions-aside',
            USAGE_UTIL,
            CORE_UTIL,
            PACKAGE,
        ],
    },

    // Раздел приглашений. Лесенка та же, что у трёх разделов груза, но слоёв шесть, а не семь:
    // вида своего у него нет — строка списка показывается готовыми ячейками. Панель у раздела
    // одна и другого рода: не подробности записи, а её создание — всё известное о приглашении
    // стоит в строке, а выдать новое из строки нечем
    {
        sourceTag: 'scope:message-bus-admin-invites-util',
        onlyDependOnLibsWithTags: [CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-invites-api',
        onlyDependOnLibsWithTags: [INVITES_UTIL, CORE_API, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-invites-data-access',
        onlyDependOnLibsWithTags: [INVITES_API, INVITES_UTIL, CORE_DATA_ACCESS, CORE_API, CORE_UTIL, CONTRACT, PACKAGE],
    },
    // Слой вида раздела пуст, но тег его выписан наравне с остальными: молчание про либу
    // проверка раскладки читает как «прав ей не давали», а не как «прав ей не нужно»
    {
        sourceTag: 'scope:message-bus-admin-invites-ui',
        onlyDependOnLibsWithTags: [INVITES_UTIL, CORE_UI, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-invites-feature-list',
        onlyDependOnLibsWithTags: [
            INVITES_DATA_ACCESS,
            INVITES_UTIL,
            CORE_FEATURE,
            CORE_UI,
            CORE_DATA_ACCESS,
            CORE_UTIL,
            CONTRACT,
            PACKAGE,
        ],
    },
    {
        sourceTag: 'scope:message-bus-admin-invites-feature-create-aside',
        onlyDependOnLibsWithTags: [INVITES_DATA_ACCESS, INVITES_UTIL, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-invites-shell',
        onlyDependOnLibsWithTags: [
            'scope:message-bus-admin-invites-feature-list',
            'scope:message-bus-admin-invites-feature-create-aside',
            INVITES_UTIL,
            CORE_UTIL,
            PACKAGE,
        ],
    },
];
