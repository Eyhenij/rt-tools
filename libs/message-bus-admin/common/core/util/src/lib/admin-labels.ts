/**
 * Словарь админки: подписи её экранов и подписи, которые рисует кит.
 *
 * Оба набора лежат здесь, а не в разметке: разложенные по шаблонам, они правятся в десяти местах
 * и расходятся друг с другом. Кит при этом рисует часть текста сам — переключатель страниц,
 * пустое состояние, настройку столбцов, — и без своего набора ставит английское умолчание рядом
 * с русскими заголовками. Видно это только на собранном экране.
 *
 * Наборов два — этот и английский рядом, — и выбор языка меняет оба: и подписи админки, и те, что
 * рисует кит. Ключ у обоих один: тип ключа выведен из этого набора, и английский объявлен им же.
 * Загрузчика словарей здесь нет: ставить его ради двух наборов значит завести настройку, которую
 * нечем наполнить.
 *
 * Ключей у кита сто тридцать один, и переведены здесь не все: неназванный он берёт английским
 * умолчанием, и пустой подписи на экране не бывает никогда. Переводится то, что админка
 * показывает, — таблица, страницы, столбцы, панель.
 */
import { ERefusal } from '@rt/message-bus-common';
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
    signInTab: 'Вход',
    signInName: 'Учётная запись',
    signInNameHint: 'Имя проекта или владельца',
    signInPassword: 'Пароль',
    signInPasswordHint: 'Пароль учётной записи',
    signInSubmit: 'Войти',
    signInFaultPair: 'Имя или пароль не подошли',
    signInFaultForm: 'Заполните имя и пароль',
    signInFaultService: 'Приёмник не ответил. Попробуйте ещё раз',
    setupTitle: 'Первая запись',
    setupHint: 'Записей в приёмнике ещё нет. Первая получает все права; этими именем и паролем вы войдёте сразу.',
    setupName: 'Имя',
    setupPassword: 'Пароль',
    setupSubmit: 'Завести',
    setupFailed: 'Завести первую запись не удалось',
    noSectionsTitle: 'Доступа ни к одному разделу нет',
    noSectionsFrom: 'Права выдаёт владелец приёмника — попросите его открыть нужные разделы',

    sectionPostmortems: 'Разборы происшествий',
    sectionProposals: 'Предложения',
    sectionSummaries: 'Сводки проектов',
    sectionInvites: 'Приглашения',
    sectionPeople: 'Пользователи',
    sectionUsage: 'Использование',

    hintPostmortems: 'Что и почему сломалось в проектах — по разбору на происшествие',
    hintProposals: 'Что проекты предлагают править в слое правил',
    hintSummaries: 'Свод одного проекта за календарный месяц — по записи на пару',
    hintInvites: 'Чем проект подключает себя сам. Выдаётся здесь же кнопкой «Пригласить проект»',
    hintPeople: 'Кто входит в приёмник, с какой ролью и когда входил в последний раз',
    hintUsage: 'Какие правила, паттерны и скилы проект грузит в сессиях — по строке на скил за период',

    filterTree: 'Проект',
    filterTreeAll: 'Все проекты',
    filterState: 'Состояние',
    filterStateAll: 'Все состояния',
    filterVersionAll: 'Все версии',
    filterVersionNone: 'Без версии',
    filterPeriodFrom: 'С',
    filterPeriodTo: 'По',

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
    columnPersonName: 'Имя',
    columnPersonRole: 'Роль',
    columnPersonState: 'Состояние',
    columnLastLoginAt: 'Последний вход',
    columnState: 'Состояние',
    columnSkill: 'Скил',
    columnKind: 'Род',
    columnLoads: 'Загрузок',
    columnUsageSessions: 'Сессий',
    columnDenials: 'Отказов',
    columnDay: 'День',
    columnSession: 'Сессия',
    columnCount: 'Раз',
    kindRule: 'правило',
    kindPattern: 'паттерн',
    kindSkill: 'скил пакета',
    kindOwn: 'свой скил проекта',
    digestLoadsByDay: 'Загрузки по дням',
    digestTopSkills: 'Топ скилов',
    digestKinds: 'По роду',
    digestDenials: 'Отказы гейта',
    digestEmpty: 'За период загрузок не было',
    digestNoDenials: 'За период отказов не было',
    digestFailed: 'Прочитать сводку периода не удалось',
    quickPeriodAria: 'Быстрый выбор периода',
    quickPeriod7: '7 дней',
    quickPeriod30: '30 дней',
    quickPeriod90: '90 дней',
    // Один ключ на все показы версии: столбец списка, отбор над ним и строка панели. Второе
    // объявление разошлось бы с первым молча, и человек читал бы одно и то же поле двумя словами.
    releaseVersion: 'В какой версии',
    quarantineNote: 'Чем спорна',

    // Приписка к состоянию, а не свой столбец: список отвечает на вопрос «где стоит запись», и
    // закрытие издателем — часть того же ответа
    closedByPublisher: 'закрыто издателем',

    cargoStateNew: 'Новое',
    cargoStateInWork: 'В работе',
    cargoStateFixed: 'Готово',
    cargoStateReleased: 'Выпущено',
    cargoStateQuarantined: 'В карантине',

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

    // Роли нет — это состояние записи, а не пропуск: словом его называет экран, приёмник
    // отдаёт пустоту. Тем же приёмом называется запись, которой ещё не входили.
    personRoleNone: 'Роли нет',
    personStateLive: 'Действует',
    personStateDisabled: 'Отключена',
    personNeverLoggedIn: 'Не входили',
    personCreate: 'Завести пользователя',
    personCreateTitle: 'Новый пользователь',
    personCreateName: 'Имя',
    personCreateNameHint: 'Им пользователь входит. Сменить его потом нельзя.',
    personCreatePassword: 'Первый пароль',
    personCreatePasswordHint: 'Передайте его пользователю сами: приёмник пароль не показывает и не рассылает.',
    personCreateSubmit: 'Завести',
    personCreateDone: 'Пользователь «{{name}}» заведён',
    personCreateFailed: 'Завести пользователя не удалось',
    personPasswordTitle: 'Новый пароль',
    personPasswordFor: 'Пользователь «{{name}}»',
    personPasswordField: 'Новый пароль',
    personPasswordHint: 'Прежний пароль перестанет приниматься сразу; открытые входы пользователя останутся.',
    personPasswordSubmit: 'Сменить',
    personPasswordDone: 'Пароль пользователя «{{name}}» сменён',
    personPasswordFailed: 'Сменить пароль не удалось',
    personPasswordMenu: 'Сменить пароль',
    personDisable: 'Отключить',
    personDisableTitle: 'Отключить пользователя',
    personDisableQuestion:
        'Пользователь «{{name}}» больше не войдёт, а его открытые входы оборвутся. Вернуть запись нельзя: понадобится новая.',
    personDisableDone: 'Пользователь «{{name}}» отключён',
    personDisableFailed: 'Отключить пользователя не удалось',
    personAccessMenu: 'Права',
    personAccessTitle: 'Права: {{name}}',
    personAccessRole: 'Роль',
    personAccessRoleNone: 'Без роли',
    personAccessRoleHint: 'Права роли — основа. Ниже любое право можно дать или отнять лично этому пользователю.',
    personAccessRights: 'Права',
    personAccessByRole: 'По роли',
    personAccessGranted: 'Дано',
    personAccessRevoked: 'Отнято',
    personAccessHas: 'есть',
    personAccessHasNot: 'нет',
    personAccessSubmit: 'Сохранить',
    personAccessDone: 'Права пользователя «{{name}}» сохранены',
    personAccessFailed: 'Сохранить права не удалось',
    panelClose: 'Закрыть',

    sectionRoles: 'Роли',
    hintRoles: 'Что открывает каждая роль и сколько пользователей её держат',
    columnRoleName: 'Роль',
    columnRoleRights: 'Права',
    columnRolePeople: 'Пользователей',
    roleRightsNone: 'Ни одного права',
    roleCreate: 'Завести роль',
    roleCreateTitle: 'Новая роль',
    roleEditTitle: 'Роль',
    roleName: 'Название',
    roleNameHint: 'Так роль видна в списке и в панели прав пользователя.',
    roleRights: 'Права',
    roleCreateSubmit: 'Завести',
    roleSaveSubmit: 'Сохранить',
    roleCreateDone: 'Роль «{{name}}» заведена',
    roleCreateFailed: 'Завести роль не удалось',
    roleSaveDone: 'Роль «{{name}}» сохранена',
    roleSaveFailed: 'Сохранить роль не удалось',
    roleEditMenu: 'Изменить',
    roleDelete: 'Удалить',
    roleDeleteTitle: 'Удалить роль',
    roleDeleteQuestion: 'Роль «{{name}}» будет удалена. Её никто не держит; вернуть её нельзя — только завести заново.',
    roleDeleteDone: 'Роль «{{name}}» удалена',
    roleDeleteFailed: 'Удалить роль не удалось',
    rightRead: 'чтение',
    rightManage: 'правка',
    listEmptyRoles: 'Ролей нет',
    listEmptyRolesFrom: 'Заводятся кнопкой «Завести роль» над списком',

    listEmptyPeople: 'Записей людей нет',
    listEmptyPeopleFrom: 'Заводятся кнопкой «Завести пользователя» над списком',
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
    detailsMonthRecord: 'Запись месяца',
    detailsSummary: 'Сводка',
    detailsSummaryMissing: 'Сводки в этом месяце ещё не было: запись завёл другой род груза',
    detailsUsageSessions: 'Сессии',
    detailsSessionsMissing: 'За период этот скил не грузила ни одна сессия',
    detailsSessionsFailed: 'Прочитать сессии не удалось',
    // Тексты отказов приёмника. Ключ — код отказа общей либы: второе имя под одну причину
    // разошлось бы с первым молча, а незнакомый код даром получает признак ненайденного ключа.
    [ERefusal.AccountNameTaken]: 'Пользователь «{{name}}» уже заведён: имя занято',
    [ERefusal.AccountNotFound]: 'Пользователя с именем «{{name}}» нет',
    [ERefusal.AccountSelfDisable]: 'Свою запись отключить нельзя: это оборвало бы и ваш вход',
    [ERefusal.AccountAlreadyOff]: 'Пользователь «{{name}}» уже отключён',
    [ERefusal.AccountGone]: 'Запись пропала между правкой и ответом',
    [ERefusal.RoleNameTaken]: 'Роль «{{name}}» уже заведена: имя занято',
    [ERefusal.RoleNotFound]: 'Роли с ключом «{{key}}» нет',
    [ERefusal.RoleHeld]: 'Роль «{{name}}» держат записи: {{people}}. Сначала дайте им другую',
    [ERefusal.RoleRightsLost]: 'Правка оставила бы вас без права на роли: сначала дайте его другой записи',
    [ERefusal.RoleNameEmpty]: 'Роль ждёт имя',
    [ERefusal.RightUnknown]: 'Права «{{right}}» нет в наборе',
    [ERefusal.RightRepeated]: 'Право «{{right}}» названо дважды',
    [ERefusal.EditMalformed]: 'Правка называет право и дано ли оно',
    [ERefusal.InviteNameEmpty]: 'Выдача ждёт имя будущего проекта',
    [ERefusal.InviteProjectExists]: 'Проект «{{name}}» уже заведён: приглашение ему не нужно, а имя занято',
    [ERefusal.InviteAlreadyIssued]: 'Годное приглашение для «{{name}}» уже выдано. Отзовите его, чтобы выдать новое',
    [ERefusal.InviteNotFound]: 'Годного приглашения для «{{name}}» нет',
    [ERefusal.InviteRejected]: 'Приглашение не принято',
    [ERefusal.PostmortemNotFound]: 'Разбора происшествия с таким признаком нет',
    [ERefusal.ProposalNotFound]: 'Предложения с таким признаком нет',
    [ERefusal.SummaryNotFound]: 'Записи месяца с таким признаком нет',
    [ERefusal.TreeUnknown]: 'Проекта с признаком «{{slug}}» приёмник не знает',
    [ERefusal.PersonNameEmpty]: 'Заведение ждёт имя пользователя',
    [ERefusal.PersonPasswordEmpty]: 'Пользователю нужен пароль: пустой не принимается',
    [ERefusal.SetupClosed]: 'Первая запись уже заведена: вход — по имени и паролю',
    [ERefusal.OwnerRoleMissing]: 'Роли владельца «{{key}}» нет в хранилище: миграции не применены',
    [ERefusal.SignInEmpty]: 'В запросе нет имени или пароля',
    [ERefusal.EnrollThrottled]: 'Обращений с одного клиента больше предела: подождите и повторите',
    [ERefusal.EnrollMalformed]: 'Обращение ожидает код приглашения и признак проекта',
    [ERefusal.TreeTaken]: 'Проект с таким признаком или именем уже заведён; приглашение осталось годным',
    [ERefusal.SignInRequired]: 'Операция требует входа',
    [ERefusal.RightRequired]: 'На эту операцию у вас нет права',
    [ERefusal.TreeTokenRequired]: 'Операция требует токен проекта',
    [ERefusal.TreeTokenRejected]: 'Токен не принят',
    [ERefusal.AccessUndeclared]: 'Операция доступа не объявила',
    [ERefusal.ChatSiteKeyEmpty]: 'Обращение ожидает ключ сайта',
    [ERefusal.ChatSiteRejected]: 'Ключ сайта не принят',
    [ERefusal.ChatOriginRejected]: 'Сайт не принимает обращений с этого адреса',
    [ERefusal.ChatConversationNotFound]: 'Переписки с таким признаком нет',
    [ERefusal.ChatTextEmpty]: 'Реплика без текста не принимается',
    [ERefusal.ChatTextTooLong]: 'В реплике больше {{limit}} знаков',
    [ERefusal.ChatThrottled]: 'Реплик с одного посетителя больше {{limit}} за окно: повторите через {{after}} с',
    [ERefusal.ChatStateUnknown]: 'Состояние переписки ожидается одним из: live, closed',
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
    uiNoData: 'Данных пока нет',
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
