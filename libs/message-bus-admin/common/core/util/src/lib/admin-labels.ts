/**
 * Словарь админки: подписи её экранов и подписи, которые рисует кит.
 *
 * Оба набора лежат здесь, а не в разметке: разложенные по шаблонам, они правятся в десяти местах
 * и расходятся друг с другом. Кит при этом рисует часть текста сам — переключатель страниц,
 * пустое состояние, настройку столбцов, — и без своего набора ставит английское умолчание рядом
 * с русскими заголовками. Видно это только на собранном экране.
 *
 * Подписи экранов русские при любом выборе языка: многоязычия админка не делает, и словарь у неё
 * один. Выбор языка меняет только то, что рисует кит, — русский набор ниже сменяется его
 * английским умолчанием, вшитым в него самого. Загрузчика словарей здесь нет: ставить его ради
 * двух наборов значит завести настройку, которую нечем наполнить.
 *
 * Ключей у кита сто тридцать один, и переведены здесь не все: неназванный он берёт английским
 * умолчанием, и пустой подписи на экране не бывает никогда. Переводится то, что админка
 * показывает, — таблица, страницы, столбцы, панель.
 */
import { RtKitLabelKey, RtKitLabelParams } from '@rt-tools/ui-kit-v2';

/** Подписи экранов админки. Ключ читается в шаблоне, значение правится здесь. */
// eslint-disable-next-line @typescript-eslint/typedef -- аннотация стёрла бы литеральный тип, на котором стоит TAdminLabelKey
export const ADMIN_LABELS = {
    appTitle: 'Приёмник',
    navSections: 'Разделы',
    signOut: 'Выйти',
    theme: 'Тема',
    language: 'Язык',
    languageSwitch: 'Язык подписей',
    signInTitle: 'Вход в админку',

    sectionPostmortems: 'Разборы происшествий',
    sectionProposals: 'Предложения',
    sectionSummaries: 'Сводки деревьев',
    sectionInvites: 'Приглашения',

    hintPostmortems: 'Что и почему сломалось на деревьях — по разбору на происшествие',
    hintProposals: 'Что деревья предлагают править в слое правил',
    hintSummaries: 'Свод одного дерева за календарный месяц — по записи на пару',
    hintInvites: 'Чем дерево заводит себя само. Выдаётся командой message-bus tree:invite <имя>',

    filterTree: 'Дерево',
    filterTreeAll: 'Все деревья',

    columnTree: 'Дерево',
    columnFile: 'Файл',
    columnArrivedAt: 'Приехал',
    columnUpdatedAt: 'Обновлён',
    columnResource: 'Ресурс',
    columnAddress: 'Адрес',
    columnMonth: 'Месяц',
    columnSessions: 'Заходов',
    columnRanAt: 'Прогон',
    columnInviteName: 'Имя дерева',
    columnInviteState: 'Состояние',
    columnIssuedAt: 'Выдано',
    columnExpiresAt: 'Годно до',
    columnInviteTree: 'Заведённое дерево',

    inviteStateWaiting: 'Ждёт',
    inviteStateRedeemed: 'Погашено',
    inviteStateExpired: 'Просрочено',
    inviteStateRevoked: 'Отозвано',

    inviteRevoke: 'Отозвать',
    inviteRevokeTitle: 'Отозвать приглашение',
    inviteRevokeQuestion: 'Приглашение для «{{name}}» перестанет действовать. Вернуть его нельзя: дереву понадобится новое.',
    inviteRevokeDone: 'Приглашение для «{{name}}» отозвано',
    inviteRevokeFailed: 'Отозвать приглашение не удалось',

    listEmptyInvites: 'Приглашений нет',
    listEmptyInvitesFrom: 'Выдаются командой message-bus tree:invite <имя>',
    listEmpty: 'Записей нет',
    listEmptyFrom: 'Ни одно дерево их пока не присылало',
    listEmptyByFilter: 'По этому отбору записей нет',
    listEmptyByFilterFrom: 'Снимите отбор по дереву или выберите другое',
    listFailed: 'Прочитать не удалось',
    listSessionEnded: 'Вход кончился: представьтесь заново',
    listColumns: 'Настроить столбцы',
    listRefresh: 'Прочитать заново',
    listRetry: 'Повторить',
    listIncident: 'Обращение {{incident}}',

    detailsMissing: 'Записи нет: она могла быть удалена',
    detailsFailed: 'Прочитать запись не удалось',
    detailsClose: 'Закрыть',
    detailsPostmortem: 'Разбор происшествия',
    detailsProposal: 'Предложение',
    detailsText: 'Текст',
    detailsMonthRecord: 'Запись месяца',
    detailsSummary: 'Сводка',
    detailsSummaryMissing: 'Сводки в этом месяце ещё не было: запись завёл другой род груза',
} as const;

/** Ключ подписи админки. Опечатка в шаблоне не доживает до собранного экрана. */
export type TAdminLabelKey = keyof typeof ADMIN_LABELS;

/**
 * Подписи кита по-русски.
 *
 * Набор неполный намеренно: кит подставляет английское умолчание тому, чего здесь нет, и
 * пустой подписи на экране не бывает. Дописывается он тогда, когда админка начинает показывать
 * ещё один его компонент, — а не наперёд.
 */
const RT_KIT_LABELS_RU: Partial<Record<RtKitLabelKey, string>> = Object.freeze({
    bottomSheetClose: 'Закрыть',
    fieldErrorEmail: 'Неверный адрес почты',
    fieldErrorMax: 'Значение слишком велико',
    fieldErrorMaxLength: 'Значение слишком длинное',
    fieldErrorMin: 'Значение слишком мало',
    fieldErrorMinLength: 'Значение слишком короткое',
    fieldErrorPattern: 'Неверный формат',
    fieldErrorRequired: 'Обязательное поле',
    themeToggleLabel: 'Сменить тему',
    uiActions: 'Действия',
    uiBack: 'Назад',
    uiBackToList: 'К списку',
    uiCancel: 'Отмена',
    uiClear: 'Очистить',
    uiClose: 'Закрыть',
    uiColumnLocked: 'Столбец закреплён',
    uiColumnSettings: 'Настройка столбцов',
    uiColumnSettingsTitle: 'Какие столбцы показывать',
    uiConfirm: 'Подтвердить',
    uiCopied: 'Скопировано',
    uiCopy: 'Скопировать',
    uiDetails: 'Подробности',
    uiDragColumn: 'Перетащить столбец',
    uiFilters: 'Отбор',
    uiForward: 'Вперёд',
    uiHide: 'Скрыть',
    uiHideColumn: 'Скрыть столбец',
    uiItemsPerPage: 'Строк на странице',
    uiMainNav: 'Разделы',
    uiMore: 'Ещё',
    uiMoreActions: 'Другие действия',
    uiNavMenu: 'Разделы',
    uiNextPage: 'Следующая страница',
    uiNoOptions: 'Выбирать не из чего',
    uiNoRows: 'Записей нет',
    uiPageOf: 'Страница {{page}} из {{last}}',
    uiPagination: 'Страницы',
    uiPerPage: 'Строк на странице:',
    uiPrevPage: 'Предыдущая страница',
    uiProfile: 'Учётная запись',
    uiRangeOf: '{{from}}–{{to}} из {{total}}',
    uiResetDefaults: 'Вернуть как было',
    uiSave: 'Сохранить',
    uiSearch: 'Поиск',
    uiShow: 'Показать',
    uiShowColumn: 'Показать столбец',
});

/** Места вида `{{name}}` — их заполняет `fill`. Тот же вид, что у подписей кита. */
const PLACEHOLDER: RegExp = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;

/**
 * Подставляет параметры в подпись.
 *
 * Место, для которого параметра не дали, остаётся как есть: пустота на его месте прочиталась бы
 * как законченная фраза, а `{{name}}` виден и чинится.
 */
export function fill(text: string, params?: RtKitLabelParams): string {
    if (params === undefined) {
        return text;
    }

    return text.replace(PLACEHOLDER, (match: string, name: string): string => {
        const value: string | number | undefined = params[name];

        return value === undefined ? match : String(value);
    });
}

/** Подпись админки с подстановками. */
export function adminLabel(key: TAdminLabelKey, params?: RtKitLabelParams): string {
    return fill(ADMIN_LABELS[key], params);
}

/**
 * Функция, которой кит получает подписи.
 *
 * Ключа, которого в русском наборе нет, она не отвечает вовсе — кит берёт своё английское
 * умолчание. Пустая строка тут и означает «ответа нет»: так договорился сам кит.
 */
export function rtKitLabelsRu(key: RtKitLabelKey, params?: RtKitLabelParams): string {
    const found: string | undefined = RT_KIT_LABELS_RU[key];

    return found === undefined ? '' : fill(found, params);
}

/**
 * Язык, на котором кит рисует свои подписи, выбирает человек, и постоянной здесь больше нет:
 * выбор живёт в `AdminLocaleService` рядом. Русский набор выше — один из двух, а второй
 * английский, и он у кита свой.
 */
