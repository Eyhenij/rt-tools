/**
 * Семья приёмника груза: `apps/message-bus` и `libs/message-bus-api/*`.
 *
 * Лесенка слоёв выписана перечислением, ребро за ребром. Подстановок нет ни одной, хотя три
 * домена груза устроены одинаково: тег, собранный в цикле, в тексте файла не встречается, и
 * проверка раскладки, которая ищет объявление буквальной строкой, видела бы либу неописанной.
 * Заодно новое ребро попадает в разбор — при подстановке оно проходило бы молча.
 *
 * Первое подходящее правило выигрывает, поэтому конкретные теги стоят до общего разрешения,
 * которое живёт в `packages.config.mjs`.
 */

/** Типы груза: их знают обе стороны — и отправляющее дерево, и приёмник. */
const COMMON = 'scope:message-bus-common';

/** Слои домена хранилища. `util` держит клиент генератора, `data-access` — службу над ним. */
const PERSISTENCE_UTIL = 'scope:message-bus-api-persistence-util';
const PERSISTENCE_DATA_ACCESS = 'scope:message-bus-api-persistence-data-access';
const PERSISTENCE_FEATURE = 'scope:message-bus-api-persistence-feature';

export const messageBusApiBoundaries = [
    // Приложение видит модули доменов и клиент хранилища. Проба живости спрашивает хранилище
    // напрямую: домена, чьей возможностью она была бы, у неё нет
    {
        sourceTag: 'scope:api-app',
        onlyDependOnLibsWithTags: [
            'scope:message-bus-api-observations-feature',
            'scope:message-bus-api-proposals-feature',
            'scope:message-bus-api-postmortems-feature',
            PERSISTENCE_FEATURE,
            PERSISTENCE_DATA_ACCESS,
            COMMON,
        ],
    },

    // Наблюдения: сводка последнего прогона и запись месяца, к которой она ложится
    {
        sourceTag: 'scope:message-bus-api-observations-feature',
        onlyDependOnLibsWithTags: [
            'scope:message-bus-api-observations-data-access',
            'scope:message-bus-api-observations-api',
            'scope:message-bus-api-observations-util',
            // клиент хранилища: запросы домена берут его доводом, а контроллер — из контейнера.
            // Модуль хранилища при этом не нужен — он глобальный, и подключает его приложение
            PERSISTENCE_DATA_ACCESS,
            COMMON,
        ],
    },
    {
        sourceTag: 'scope:message-bus-api-observations-data-access',
        onlyDependOnLibsWithTags: ['scope:message-bus-api-observations-util', PERSISTENCE_DATA_ACCESS, PERSISTENCE_UTIL, COMMON],
    },
    {
        sourceTag: 'scope:message-bus-api-observations-api',
        onlyDependOnLibsWithTags: ['scope:message-bus-api-observations-util', COMMON],
    },
    { sourceTag: 'scope:message-bus-api-observations-util', onlyDependOnLibsWithTags: [COMMON] },

    // Предложения: копятся в записи месяца, отбираются по тексту
    {
        sourceTag: 'scope:message-bus-api-proposals-feature',
        onlyDependOnLibsWithTags: [
            'scope:message-bus-api-proposals-data-access',
            'scope:message-bus-api-proposals-api',
            'scope:message-bus-api-proposals-util',
            // клиент хранилища: запросы домена берут его доводом, а контроллер — из контейнера.
            // Модуль хранилища при этом не нужен — он глобальный, и подключает его приложение
            PERSISTENCE_DATA_ACCESS,
            COMMON,
        ],
    },
    {
        sourceTag: 'scope:message-bus-api-proposals-data-access',
        onlyDependOnLibsWithTags: ['scope:message-bus-api-proposals-util', PERSISTENCE_DATA_ACCESS, PERSISTENCE_UTIL, COMMON],
    },
    {
        sourceTag: 'scope:message-bus-api-proposals-api',
        onlyDependOnLibsWithTags: ['scope:message-bus-api-proposals-util', COMMON],
    },
    { sourceTag: 'scope:message-bus-api-proposals-util', onlyDependOnLibsWithTags: [COMMON] },

    // Разборы происшествий: опознаются именем файла на дереве, к записи месяца не крепятся
    {
        sourceTag: 'scope:message-bus-api-postmortems-feature',
        onlyDependOnLibsWithTags: [
            'scope:message-bus-api-postmortems-data-access',
            'scope:message-bus-api-postmortems-api',
            'scope:message-bus-api-postmortems-util',
            // клиент хранилища: запросы домена берут его доводом, а контроллер — из контейнера.
            // Модуль хранилища при этом не нужен — он глобальный, и подключает его приложение
            PERSISTENCE_DATA_ACCESS,
            COMMON,
        ],
    },
    {
        sourceTag: 'scope:message-bus-api-postmortems-data-access',
        onlyDependOnLibsWithTags: ['scope:message-bus-api-postmortems-util', PERSISTENCE_DATA_ACCESS, PERSISTENCE_UTIL, COMMON],
    },
    {
        sourceTag: 'scope:message-bus-api-postmortems-api',
        onlyDependOnLibsWithTags: ['scope:message-bus-api-postmortems-util', COMMON],
    },
    { sourceTag: 'scope:message-bus-api-postmortems-util', onlyDependOnLibsWithTags: [COMMON] },

    // Хранилище: клиент лежит в слое утилит, служба над ним, модуль над службой. Доменных либ
    // домен не видит вовсе — его зовут, а не он зовёт
    { sourceTag: 'scope:message-bus-api-persistence-util', onlyDependOnLibsWithTags: [] },
    { sourceTag: 'scope:message-bus-api-persistence-data-access', onlyDependOnLibsWithTags: [PERSISTENCE_UTIL] },
    { sourceTag: 'scope:message-bus-api-persistence-feature', onlyDependOnLibsWithTags: [PERSISTENCE_DATA_ACCESS] },
    // Наружу домен не ходит: класть сюда выход к чужой службе нечего, приёмник принимает
    { sourceTag: 'scope:message-bus-api-persistence-api', onlyDependOnLibsWithTags: [PERSISTENCE_UTIL] },
];
