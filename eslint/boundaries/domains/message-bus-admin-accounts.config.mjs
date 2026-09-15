/**
 * Раздел людей семьи админки: `libs/message-bus-admin/accounts/*`.
 *
 * Своим файлом, а не строками в файле семьи: тот дорос до предела длины, и раздел с двумя
 * панелями и правом на правку в него не поместился. Правила те же, что у соседей: тег называет
 * либу, первое подходящее правило выигрывает, и общее разрешение пакетов лежит последним в своде.
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

/**
 * Раздел людей: модели и решения раздела, обращение к правкам, стор списка, экран, две панели и
 * маршруты. Своего вида у него нет — ячейки строки показывают готовые поля.
 */
const PEOPLE_UTIL = 'scope:message-bus-admin-accounts-util';
const PEOPLE_API = 'scope:message-bus-admin-accounts-api';
const PEOPLE_DATA_ACCESS = 'scope:message-bus-admin-accounts-data-access';

export const messageBusAdminAccountsBoundaries = [
    // Раздел людей. Лесенка та же, что у приглашений: своего слоя вида нет — строка списка
    // показывается готовыми ячейками, — а панелей две и обе другого рода, чем подробности: заведение
    // записи и новый пароль ей. Список читает и права вошедшего: кнопку над списком и меню строки
    // экран рисует только с правом на правку, и спрашивает об этом стор входа
    {
        sourceTag: 'scope:message-bus-admin-accounts-util',
        onlyDependOnLibsWithTags: [CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-accounts-api',
        onlyDependOnLibsWithTags: [PEOPLE_UTIL, CORE_API, CORE_UTIL, CONTRACT, PACKAGE],
    },
    // Слой вида раздела пуст, но тег его выписан наравне с остальными: молчание про либу
    // проверка слоёв читает как «прав ей не давали», а не как «прав ей не нужно»
    {
        sourceTag: 'scope:message-bus-admin-accounts-ui',
        onlyDependOnLibsWithTags: [PEOPLE_UTIL, CORE_UI, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-accounts-data-access',
        onlyDependOnLibsWithTags: [PEOPLE_API, PEOPLE_UTIL, CORE_DATA_ACCESS, CORE_API, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-accounts-feature-list',
        onlyDependOnLibsWithTags: [
            PEOPLE_DATA_ACCESS,
            PEOPLE_UTIL,
            AUTH_DATA_ACCESS,
            CORE_FEATURE,
            CORE_UI,
            CORE_DATA_ACCESS,
            CORE_UTIL,
            CONTRACT,
            PACKAGE,
        ],
    },
    {
        sourceTag: 'scope:message-bus-admin-accounts-feature-create-aside',
        onlyDependOnLibsWithTags: [PEOPLE_DATA_ACCESS, PEOPLE_UTIL, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-accounts-feature-password-aside',
        onlyDependOnLibsWithTags: [PEOPLE_DATA_ACCESS, PEOPLE_UTIL, CORE_UTIL, CONTRACT, PACKAGE],
    },
    {
        sourceTag: 'scope:message-bus-admin-accounts-shell',
        onlyDependOnLibsWithTags: [
            'scope:message-bus-admin-accounts-feature-list',
            'scope:message-bus-admin-accounts-feature-create-aside',
            'scope:message-bus-admin-accounts-feature-password-aside',
            PEOPLE_UTIL,
            CORE_UTIL,
            PACKAGE,
        ],
    },
];
