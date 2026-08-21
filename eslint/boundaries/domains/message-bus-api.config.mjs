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

/**
 * Слой утилит домена деревьев. Стоит в списке у каждого домена груза: дерево, опознанное по
 * токену, читают все три операции приёма, а вторая копия этого чтения разошлась бы с первой в
 * коде отказа.
 */
const TREES_UTIL = 'scope:message-bus-api-trees-util';

/**
 * Слой утилит домена учётных записей. Стоит в списке у каждой операции чтения груза: вошедшего
 * читают они все, и вторая копия этого чтения разошлась бы с первой в коде отказа.
 */
const ACCOUNTS_UTIL = 'scope:message-bus-api-accounts-util';

/**
 * Объявление доступа: чем закрыта операция — ничем, токеном дерева или входом человека. Стоит в
 * списке у каждого домена с операциями: необъявленная операция не отвечает никому, и объявить её
 * должен тот, кто её пишет.
 */
const ACCESS_UTIL = 'scope:message-bus-api-access-util';

/**
 * Слой служб доступа: сама проверка и счётчик ограничителя частоты. Счётчик один на приложение —
 * ключ клиента у всех публичных операций, заводящих запись, общий, и второй ответ на вопрос «кто
 * это» разошёлся бы с первым.
 */
const ACCESS_FEATURE = 'scope:message-bus-api-access-feature';

/**
 * Слой утилит наблюдаемости: разбор ошибки в поля и вычистка полей строки журнала. Стоит в
 * списке у приложения и у клиента хранилища — пишут о себе оба, а вторая копия разбора
 * разошлась бы с первой ровно на том поле, ради которого её и заводили.
 */
const OBSERVABILITY_UTIL = 'scope:message-bus-api-observability-util';

export const messageBusApiBoundaries = [
    // Приложение видит модули доменов и клиент хранилища. Проба живости спрашивает хранилище
    // напрямую: домена, чьей возможностью она была бы, у неё нет
    {
        sourceTag: 'scope:api-app',
        onlyDependOnLibsWithTags: [
            'scope:message-bus-api-observations-feature',
            'scope:message-bus-api-proposals-feature',
            'scope:message-bus-api-postmortems-feature',
            'scope:message-bus-api-trees-feature',
            'scope:message-bus-api-cargo-state-feature',
            // Единственная проверка доступа и операции входа: обе ставит приложение — цепочка
            // проверок его решение, а не решение домена
            'scope:message-bus-api-access-feature',
            'scope:message-bus-api-accounts-feature',
            // Признак команды учётных записей: точка входа разводит по нему две семьи команд
            ACCOUNTS_UTIL,
            // Метка открытой операции: пробу живости объявляет само приложение
            ACCESS_UTIL,
            // Дерево запроса читает разбор отказа: в журнал уходит признак того дерева, чей
            // груз отбит, а не признак, названный самим грузом
            TREES_UTIL,
            // Разбор ошибки в поля: его зовёт разбор отказов, стоящий у самого приложения
            OBSERVABILITY_UTIL,
            // Журнал приложения: его ставит приложение — вывод его решение, а не решение домена
            'scope:message-bus-api-observability-feature',
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
            // объявление доступа: операция приёма закрыта токеном дерева и говорит об этом сама
            ACCESS_UTIL,
            // дерево запроса: операция работает от токена, а не от признака, названного грузом
            TREES_UTIL,
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
            // Запись месяца, к которой предложения крепятся: ею владеет домен наблюдений —
            // сводка и есть её тело. Предложения, приехавшие раньше сводки, заводят запись сами,
            // и второй upsert той же пары «дерево — месяц» разошёлся бы с первым при первой правке
            'scope:message-bus-api-observations-data-access',
            // объявление доступа: операция приёма закрыта токеном дерева и говорит об этом сама
            ACCESS_UTIL,
            // дерево запроса: операция работает от токена, а не от признака, названного грузом
            TREES_UTIL,
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
            // Запись месяца: разбор её не заполняет, но заводит — ответ приёмника называет месяц,
            // а время прогона в записи говорит, отчитывается ли дерево, и разборами оно
            // отчитывается тоже. Владеет записью домен наблюдений
            'scope:message-bus-api-observations-data-access',
            // объявление доступа: операция приёма закрыта токеном дерева и говорит об этом сама
            ACCESS_UTIL,
            // дерево запроса: операция работает от токена, а не от признака, названного грузом
            TREES_UTIL,
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

    // Состояние груза: путь записи, которым дерево двигает свои разборы и предложения. Домен
    // заведён отдельно потому, что пакет правки везёт оба рода записей разом, а домену одного
    // рода не видно либ другого — и не должно быть видно: таблицу правит тот домен, чья она
    {
        sourceTag: 'scope:message-bus-api-cargo-state-feature',
        onlyDependOnLibsWithTags: [
            'scope:message-bus-api-cargo-state-util',
            'scope:message-bus-api-cargo-state-api',
            // Запись состояния у каждого рода своя: операция зовёт обе, а таблиц не касается
            'scope:message-bus-api-postmortems-data-access',
            'scope:message-bus-api-proposals-data-access',
            // объявление доступа: операция закрыта токеном дерева и говорит об этом сама
            ACCESS_UTIL,
            // дерево запроса: чьи записи правятся, берётся из токена, а не из тела запроса
            TREES_UTIL,
            // клиент хранилища: контроллер берёт его из контейнера и отдаёт запросам доводом
            PERSISTENCE_DATA_ACCESS,
            COMMON,
        ],
    },
    { sourceTag: 'scope:message-bus-api-cargo-state-util', onlyDependOnLibsWithTags: [COMMON] },
    {
        sourceTag: 'scope:message-bus-api-cargo-state-api',
        onlyDependOnLibsWithTags: ['scope:message-bus-api-cargo-state-util', COMMON],
    },
    {
        sourceTag: 'scope:message-bus-api-cargo-state-data-access',
        onlyDependOnLibsWithTags: [PERSISTENCE_DATA_ACCESS, COMMON],
    },

    // Деревья и их токены. Домен предметный, а не механика: у него своя пара сущностей, свой
    // отказ и свои команды строки запуска. Груза он не касается — его спрашивают, чьё это
    {
        sourceTag: 'scope:message-bus-api-trees-feature',
        onlyDependOnLibsWithTags: [
            'scope:message-bus-api-trees-data-access',
            TREES_UTIL,
            // Список деревьев для отбора в админке объявляет, чем он закрыт: входом человека, а
            // не токеном дерева — токен открывает приём и только своего дерева, а список называет все
            ACCESS_UTIL,
            // Счётчик ограничителя частоты: обращение за токеном — публичная операция, заводящая
            // запись, и предел ей обязателен. Счётчик один на приложение и живёт в домене
            // доступа: заведи его домен деревьев у себя, второй такой операции достался бы
            // второй счётчик, и ответ на вопрос «кто это» разошёлся бы с первым
            ACCESS_FEATURE,
            PERSISTENCE_DATA_ACCESS,
            COMMON,
        ],
    },
    {
        sourceTag: 'scope:message-bus-api-trees-data-access',
        onlyDependOnLibsWithTags: [TREES_UTIL, PERSISTENCE_DATA_ACCESS, PERSISTENCE_UTIL, COMMON],
    },
    { sourceTag: 'scope:message-bus-api-trees-api', onlyDependOnLibsWithTags: [TREES_UTIL, COMMON] },
    // Хеш токена и дерево запроса: чистые функции, ни базы, ни каркаса. Заголовок с токеном
    // приезжает из общей либы — его знают обе стороны, и второе объявление разошлось бы с первым.
    //
    // Тег здесь объявлен строкой, а не константой: `sourceTag` — это объявление либы, и проверка
    // раскладки ищет его буквально. За константой он от проверки прячется, и либа без описанных
    // границ выглядит описанной. В чужих списках прав константа остаётся — там тег упоминается
    { sourceTag: 'scope:message-bus-api-trees-util', onlyDependOnLibsWithTags: [COMMON] },

    // Учётные записи и входы людей. Домен предметный и от деревьев отделён намеренно: токен
    // дерева открывает приём груза, вход человека — чтение, и общая либа свела бы два способа
    // представиться к одному
    {
        sourceTag: 'scope:message-bus-api-accounts-feature',
        onlyDependOnLibsWithTags: [
            'scope:message-bus-api-accounts-data-access',
            ACCOUNTS_UTIL,
            // Операции входа объявляют, чем они закрыты: вход открыт всем, выход и ответ о
            // вошедшем — только вошедшему. Объявление общее у всех операций приёмника
            ACCESS_UTIL,
            PERSISTENCE_DATA_ACCESS,
            COMMON,
        ],
    },
    {
        sourceTag: 'scope:message-bus-api-accounts-data-access',
        onlyDependOnLibsWithTags: [ACCOUNTS_UTIL, PERSISTENCE_DATA_ACCESS, PERSISTENCE_UTIL, COMMON],
    },
    { sourceTag: 'scope:message-bus-api-accounts-api', onlyDependOnLibsWithTags: [ACCOUNTS_UTIL, COMMON] },
    // Хеш пароля, значение входа и вошедший в запросе: чистые функции, ни базы, ни каркаса
    { sourceTag: 'scope:message-bus-api-accounts-util', onlyDependOnLibsWithTags: [COMMON] },

    // Объявление доступа и единственная проверка приёмника. Проверка одна на оба способа
    // представиться: две глобальные подряд означали бы, что запрос с токеном дерева доходит до
    // чтения груза, если вторая забыла отказать
    {
        sourceTag: 'scope:message-bus-api-access-feature',
        onlyDependOnLibsWithTags: [
            ACCESS_UTIL,
            'scope:message-bus-api-accounts-data-access',
            ACCOUNTS_UTIL,
            'scope:message-bus-api-trees-data-access',
            TREES_UTIL,
            PERSISTENCE_DATA_ACCESS,
            COMMON,
        ],
    },
    { sourceTag: 'scope:message-bus-api-access-data-access', onlyDependOnLibsWithTags: [ACCESS_UTIL] },
    { sourceTag: 'scope:message-bus-api-access-api', onlyDependOnLibsWithTags: [ACCESS_UTIL, COMMON] },
    // Метки объявления: чистые декораторы каркаса, ни базы, ни доменов
    { sourceTag: 'scope:message-bus-api-access-util', onlyDependOnLibsWithTags: [] },

    // Хранилище: клиент лежит в слое утилит, служба над ним, модуль над службой. Доменных либ
    // домен не видит вовсе — его зовут, а не он зовёт
    { sourceTag: 'scope:message-bus-api-persistence-util', onlyDependOnLibsWithTags: [] },
    // Клиент хранилища пишет о себе сам, и разбор ошибки ему нужен тот же, что и разбору отказов
    { sourceTag: 'scope:message-bus-api-persistence-data-access', onlyDependOnLibsWithTags: [PERSISTENCE_UTIL, OBSERVABILITY_UTIL] },
    // Наблюдаемость: разбор ошибки в поля и вычистка полей строки журнала. Кроме утилит слои
    // пусты — своих записей, служб и выходов наружу у домена нет
    { sourceTag: 'scope:message-bus-api-observability-util', onlyDependOnLibsWithTags: [] },
    { sourceTag: 'scope:message-bus-api-observability-data-access', onlyDependOnLibsWithTags: [] },
    // Журнал зовёт вычистку: поля вычищаются всегда, а не по решению того, кто пишет строку
    { sourceTag: 'scope:message-bus-api-observability-feature', onlyDependOnLibsWithTags: [OBSERVABILITY_UTIL] },
    { sourceTag: 'scope:message-bus-api-observability-api', onlyDependOnLibsWithTags: [] },
    { sourceTag: 'scope:message-bus-api-persistence-feature', onlyDependOnLibsWithTags: [PERSISTENCE_DATA_ACCESS] },
    // Наружу домен не ходит: класть сюда выход к чужой службе нечего, приёмник принимает
    { sourceTag: 'scope:message-bus-api-persistence-api', onlyDependOnLibsWithTags: [PERSISTENCE_UTIL] },
];
