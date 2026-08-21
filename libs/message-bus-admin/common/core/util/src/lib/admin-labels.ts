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
import { TRtKitLabelKey, TRtKitLabelParams } from '@rt-tools/ui-kit-v2';

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
    sectionSummaries: 'Сводки проектов',
    sectionInvites: 'Приглашения',

    hintPostmortems: 'Что и почему сломалось в проектах — по разбору на происшествие',
    hintProposals: 'Что проекты предлагают править в слое правил',
    hintSummaries: 'Свод одного проекта за календарный месяц — по записи на пару',
    hintInvites: 'Чем проект подключает себя сам. Выдаётся здесь же кнопкой «Пригласить проект»',

    filterTree: 'Проект',
    filterTreeAll: 'Все проекты',
    filterState: 'Состояние',
    filterStateAll: 'Все состояния',

    columnTree: 'Проект',
    columnFile: 'Файл',
    columnArrivedAt: 'Приехал',
    columnUpdatedAt: 'Обновлён',
    columnResource: 'Ресурс',
    columnAddress: 'Адрес',
    columnMonth: 'Месяц',
    columnSessions: 'Заходов',
    columnRanAt: 'Прогон',
    columnInviteName: 'Имя проекта',
    columnInviteState: 'Состояние',
    columnIssuedAt: 'Выдано',
    columnExpiresAt: 'Годно до',
    columnInviteTree: 'Заведённый проект',
    columnState: 'Состояние',

    cargoStateNew: 'Новое',
    cargoStateInWork: 'В работе',
    cargoStateFixed: 'Готово',
    cargoStateReleased: 'Выпущено',

    inviteStateWaiting: 'Ждёт',
    inviteStateRedeemed: 'Погашено',
    inviteStateExpired: 'Просрочено',
    inviteStateRevoked: 'Отозвано',

    inviteCreate: 'Пригласить проект',
    inviteCreateTitle: 'Приглашение проекту',
    inviteCreateName: 'Имя будущего проекта',
    inviteCreateNameHint: 'По нему проект будет виден в списках. Сменить его потом нельзя.',
    inviteCreateSubmit: 'Выдать',
    inviteCreateWarn: 'Код появится здесь один раз: показать его второй раз будет неоткуда.',
    inviteCreateCode: 'Код приглашения',
    inviteCreateCopy: 'Скопировать',
    inviteCreateCopied: 'Код скопирован',
    inviteCreateExpires: 'Годен до {{until}}',
    inviteCreateDone: 'Приглашение для «{{name}}» выдано',
    inviteCreateFailed: 'Выдать приглашение не удалось',
    inviteCreateClose: 'Закрыть',
    inviteRevoke: 'Отозвать',
    inviteRevokeTitle: 'Отозвать приглашение',
    inviteRevokeQuestion: 'Приглашение для «{{name}}» перестанет действовать. Вернуть его нельзя: проекту понадобится новое.',
    inviteRevokeDone: 'Приглашение для «{{name}}» отозвано',
    inviteRevokeFailed: 'Отозвать приглашение не удалось',

    listEmptyInvites: 'Приглашений нет',
    listEmptyInvitesFrom: 'Выдаются кнопкой «Пригласить проект» над списком',
    listEmpty: 'Записей нет',
    listEmptyFrom: 'Ни один проект их пока не присылал',
    listEmptyByFilter: 'По этому отбору записей нет',
    listEmptyByFilterFrom: 'Снимите отбор над списком или выберите в нём другое значение',
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
    detailsFixNote: 'Чем исправлено',
    detailsReleaseVersion: 'В какой версии',
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
const RT_KIT_LABELS_RU: Partial<Record<TRtKitLabelKey, string>> = Object.freeze({
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
const PLACEHOLDER: RegExp = /\{\{\s*(\w+)\s*\}\}/g;

/**
 * Подставляет параметры в подпись.
 *
 * Место, для которого параметра не дали, остаётся как есть: пустота на его месте прочиталась бы
 * как законченная фраза, а `{{name}}` виден и чинится.
 */
export function fill(text: string, params?: TRtKitLabelParams): string {
    if (params === undefined) {
        return text;
    }

    return text.replace(PLACEHOLDER, (match: string, name: string): string => (Object.hasOwn(params, name) ? String(params[name]) : match));
}

/** Подпись админки с подстановками. */
export function adminLabel(key: TAdminLabelKey, params?: TRtKitLabelParams): string {
    return fill(ADMIN_LABELS[key], params);
}

/**
 * Функция, которой кит получает подписи.
 *
 * Ключа, которого в русском наборе нет, она не отвечает вовсе — кит берёт своё английское
 * умолчание. Пустая строка тут и означает «ответа нет»: так договорился сам кит.
 */
export function rtKitLabelsRu(key: TRtKitLabelKey, params?: TRtKitLabelParams): string {
    const found: string | undefined = RT_KIT_LABELS_RU[key];

    return found === undefined ? '' : fill(found, params);
}

/**
 * Язык, на котором кит рисует свои подписи, выбирает человек, и постоянной здесь больше нет:
 * выбор живёт в `AdminLocaleService` рядом. Русский набор выше — один из двух, а второй
 * английский, и он у кита свой.
 */
