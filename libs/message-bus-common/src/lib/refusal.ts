/**
 * Чем приёмник отбил обращение — и по чему та сторона напишет об этом слово.
 *
 * До этого набора приёмник отказывал готовым русским предложением, и админка показывала его как
 * есть: человек, выбравший английский, получал экран по-английски и отказ на нём по-русски.
 * Предложение живёт в одном языке и переводу не поддаётся — его не найти по ключу и не отдать
 * переводчику.
 *
 * Код и есть ключ словаря админки: второе имя под одну причину расходится с первым молча, а
 * незнакомый код даром получает готовый признак ненайденного ключа.
 *
 * Русское предложение остаётся в теле ответа, пока деревья не знают кодов: дерево в поле печатает
 * слово приёмника своему владельцу, и эта работа деревья не выкатывает. Собирается оно здесь, по
 * тому же коду, одной таблицей — оставленное у броска, оно жило бы там, куда проверка текстов не
 * достаёт.
 *
 * Внутренняя ошибка приёмника кодом не называется вовсе: её читает тот, кто держит приёмник, а не
 * человек, и чинить по ней человеку нечего.
 */

/** Чем приёмник отбил обращение. Значение — ключ словаря админки: имя одно на обе стороны. */
export enum ERefusal {
    /** Учётная запись с таким именем уже заведена. */
    AccountNameTaken = 'accountNameTaken',
    /** Учётной записи с таким именем нет. */
    AccountNotFound = 'accountNotFound',
    /** Человек отключает свою же запись. */
    AccountSelfDisable = 'accountSelfDisable',
    /** Запись уже отключена. */
    AccountAlreadyOff = 'accountAlreadyOff',
    /** Запись пропала между правкой и ответом. */
    AccountGone = 'accountGone',
    /** Роль с таким именем уже заведена. */
    RoleNameTaken = 'roleNameTaken',
    /** Роли с таким ключом нет. */
    RoleNotFound = 'roleNotFound',
    /** Роль держат учётные записи. */
    RoleHeld = 'roleHeld',
    /** Правка оставила бы правящего без права на роли. */
    RoleRightsLost = 'roleRightsLost',
    /** Роль пришла без имени. */
    RoleNameEmpty = 'roleNameEmpty',
    /** Права нет в наборе. */
    RightUnknown = 'rightUnknown',
    /** Право названо дважды. */
    RightRepeated = 'rightRepeated',
    /** Правка не называет право и дано ли оно. */
    EditMalformed = 'editMalformed',
    /** Выдача приглашения просит имя будущего проекта. */
    InviteNameEmpty = 'inviteNameEmpty',
    /** Проект уже заведён, и приглашение ему не нужно. */
    InviteProjectExists = 'inviteProjectExists',
    /** Годное приглашение проекту уже выдано. */
    InviteAlreadyIssued = 'inviteAlreadyIssued',
    /** Годного приглашения проекту нет. */
    InviteNotFound = 'inviteNotFound',
    /** Разбора происшествия с таким признаком нет. */
    PostmortemNotFound = 'postmortemNotFound',
    /** Предложения с таким признаком нет. */
    ProposalNotFound = 'proposalNotFound',
    /** Записи месяца с таким признаком нет. */
    SummaryNotFound = 'summaryNotFound',
    /** Дерево с таким признаком приёмнику не известно. */
    TreeUnknown = 'treeUnknown',
    /** Заведение записи просит имя пользователя. */
    PersonNameEmpty = 'personNameEmpty',
    /** Заведение записи просит пароль. */
    PersonPasswordEmpty = 'personPasswordEmpty',
    /** Первая запись уже заведена, и заведение закрыто. */
    SetupClosed = 'setupClosed',
    /** Роли владельца нет в хранилище. */
    OwnerRoleMissing = 'ownerRoleMissing',
    /** В запросе входа нет имени или пароля. */
    SignInEmpty = 'signInEmpty',
    /** Обращений с одного клиента больше предела. */
    EnrollThrottled = 'enrollThrottled',
    /** Обращение о заведении дерева пришло без кода приглашения или признака. */
    EnrollMalformed = 'enrollMalformed',
    /** Приглашение не принято: один отказ на четыре негодных состояния и на ненайденный код. */
    InviteRejected = 'inviteRejected',
    /** Дерево с таким признаком или именем уже заведено. */
    TreeTaken = 'treeTaken',
    /** Операция требует входа. */
    SignInRequired = 'signInRequired',
    /** У вошедшего нет права на операцию. */
    RightRequired = 'rightRequired',
    /** Операция требует токен дерева. */
    TreeTokenRequired = 'treeTokenRequired',
    /** Токен дерева не принят. */
    TreeTokenRejected = 'treeTokenRejected',
    /** Операция доступа не объявила: это промах устройства, а не человека. */
    AccessUndeclared = 'accessUndeclared',
    /** Обращение к чату пришло без ключа сайта. */
    ChatSiteKeyEmpty = 'chatSiteKeyEmpty',
    /** Ключ сайта не принят: один отказ на ненайденный ключ и на выключенный сайт. */
    ChatSiteRejected = 'chatSiteRejected',
    /** Адреса страницы нет в списке сайта. */
    ChatOriginRejected = 'chatOriginRejected',
    /** Переписки с таким признаком у этого посетителя нет. */
    ChatConversationNotFound = 'chatConversationNotFound',
    /** Реплика пришла без текста. */
    ChatTextEmpty = 'chatTextEmpty',
    /** В реплике знаков больше предела. */
    ChatTextTooLong = 'chatTextTooLong',
    /** Реплик с одного посетителя больше предела. */
    ChatThrottled = 'chatThrottled',
    /** Состояние переписки названо словом не из набора. */
    ChatStateUnknown = 'chatStateUnknown',
}

/** Подстановки отказа: причина названа кодом, а значения идут рядом по имени. */
export type TRefusalParams = Readonly<Record<string, string | number>>;

/** Тело ответа с отказом: код, подстановки и предложение для дерева. */
export interface IRefusalBody {
    readonly code: ERefusal;
    /** Пусто, когда у причины значений нет. */
    readonly params?: TRefusalParams;
    readonly message: string;
}

/** Отказ, прочитанный из ответа. Пусто — тело не о том, и рисовать по нему нечего. */
export interface IRefusal {
    readonly code: ERefusal;
    readonly params?: TRefusalParams;
}

/** Место подстановки в предложении. Та же форма, что у подписей админки: набор один. */
const PLACEHOLDER: RegExp = /\{\{(\w+)\}\}/g;

/**
 * Русское предложение по коду — одно на приёмник.
 *
 * Пишется здесь, а не у броска: проверка текстов до бросков не достаёт, а дерево в поле читает
 * именно это поле. Админка сюда не заглядывает — у неё свой набор на каждый язык.
 */
const SAID: Readonly<Record<ERefusal, string>> = {
    [ERefusal.AccountNameTaken]: 'пользователь «{{name}}» уже заведён: имя занято',
    [ERefusal.AccountNotFound]: 'пользователя с именем «{{name}}» нет',
    [ERefusal.AccountSelfDisable]: 'свою запись отключить нельзя: это оборвало бы и ваш вход',
    [ERefusal.AccountAlreadyOff]: 'пользователь «{{name}}» уже отключён',
    [ERefusal.AccountGone]: 'запись пропала между правкой и ответом',
    [ERefusal.RoleNameTaken]: 'роль «{{name}}» уже заведена: имя занято',
    [ERefusal.RoleNotFound]: 'роли с ключом «{{key}}» нет',
    [ERefusal.RoleHeld]: 'роль «{{name}}» держат записи: {{people}}; сначала дайте им другую',
    [ERefusal.RoleRightsLost]: 'правка оставила бы вас без права на роли: сначала дайте его другой записи',
    [ERefusal.RoleNameEmpty]: 'роль ждёт имя',
    [ERefusal.RightUnknown]: 'права «{{right}}» нет в наборе',
    [ERefusal.RightRepeated]: 'право «{{right}}» названо дважды',
    [ERefusal.EditMalformed]: 'правка называет право и дано ли оно',
    [ERefusal.InviteNameEmpty]: 'выдача ждёт имя будущего проекта',
    [ERefusal.InviteProjectExists]: 'проект «{{name}}» уже заведён: приглашение ему не нужно, а имя занято',
    [ERefusal.InviteAlreadyIssued]: 'годное приглашение для «{{name}}» уже выдано; отзовите его, чтобы выдать новое',
    [ERefusal.InviteNotFound]: 'годного приглашения для «{{name}}» нет',
    [ERefusal.PostmortemNotFound]: 'разбора происшествия с таким признаком нет',
    [ERefusal.ProposalNotFound]: 'предложения с таким признаком нет',
    [ERefusal.SummaryNotFound]: 'записи месяца с таким признаком нет',
    [ERefusal.TreeUnknown]: 'дерево с признаком «{{slug}}» не известно приёмнику',
    [ERefusal.PersonNameEmpty]: 'заведение ждёт имя пользователя',
    [ERefusal.PersonPasswordEmpty]: 'пользователю нужен пароль: пустой не принимается',
    [ERefusal.SetupClosed]: 'первая запись уже заведена: вход — по имени и паролю',
    [ERefusal.OwnerRoleMissing]: 'роли владельца «{{key}}» нет в хранилище: миграции не применены',
    [ERefusal.SignInEmpty]: 'в запросе нет имени или пароля',
    [ERefusal.EnrollThrottled]: 'обращений с одного клиента больше предела: подождите и повторите',
    [ERefusal.EnrollMalformed]: 'обращение ожидает код приглашения и признак дерева',
    [ERefusal.InviteRejected]: 'приглашение не принято',
    [ERefusal.TreeTaken]: 'дерево с таким признаком или именем уже заведено; приглашение осталось годным',
    [ERefusal.SignInRequired]: 'операция требует входа',
    [ERefusal.RightRequired]: 'операция требует права',
    [ERefusal.TreeTokenRequired]: 'операция требует токен дерева',
    [ERefusal.TreeTokenRejected]: 'токен не принят',
    [ERefusal.AccessUndeclared]: 'операция доступа не объявила',
    [ERefusal.ChatSiteKeyEmpty]: 'обращение ожидает ключ сайта',
    [ERefusal.ChatSiteRejected]: 'ключ сайта не принят',
    [ERefusal.ChatOriginRejected]: 'сайт не принимает обращений с этого адреса',
    [ERefusal.ChatConversationNotFound]: 'переписки с таким признаком нет',
    [ERefusal.ChatTextEmpty]: 'реплика без текста не принимается',
    [ERefusal.ChatTextTooLong]: 'в реплике больше {{limit}} знаков',
    [ERefusal.ChatThrottled]: 'реплик с одного посетителя больше {{limit}} за окно: повторите через {{after}} с',
    [ERefusal.ChatStateUnknown]: 'состояние переписки ожидается одним из: live, closed',
};

/**
 * Предложение для дерева с подставленными значениями.
 *
 * Место, для которого значения не дали, остаётся как есть: пустота на его месте прочиталась бы как
 * законченная фраза, а `{{name}}` виден и чинится.
 */
export function refusalSaid(code: ERefusal, params?: TRefusalParams): string {
    const text: string = SAID[code] ?? '';

    if (params === undefined) {
        return text;
    }

    return text.replace(PLACEHOLDER, (match: string, name: string): string => (Object.hasOwn(params, name) ? String(params[name]) : match));
}

/** Тело ответа с отказом целиком: код, подстановки и собранное по ним предложение. */
export function refusalBody(code: ERefusal, params?: TRefusalParams): IRefusalBody {
    return params === undefined ? { code, message: refusalSaid(code) } : { code, params, message: refusalSaid(code, params) };
}

/** Подстановки из тела ответа. Пусто — их не прислали или прислали не набором значений. */
function paramsOf(body: object): TRefusalParams | undefined {
    const params: unknown = Reflect.get(body, 'params');

    if (typeof params !== 'object' || params === null) {
        return undefined;
    }

    const named: [string, unknown][] = Object.entries(params).filter(
        ([, value]: [string, unknown]): boolean => typeof value === 'string' || typeof value === 'number'
    );

    return named.length > 0 ? (Object.fromEntries(named) as TRefusalParams) : undefined;
}

/**
 * Отказ из тела ответа. Пусто — код не назван.
 *
 * Разбор лежит здесь, а не у показывающего: набор один на обе стороны, и вторая копия разбора
 * разошлась бы с первой молча.
 *
 * Код, которого нет в наборе читающей стороны, не отбрасывается: стороны выкатываются порознь, и
 * отброшенный код показал бы запасную строку экрана — то есть скрыл бы расхождение. Отданный как
 * есть, он виден признаком ненайденного ключа и чинится по имени.
 */
export function refusalOf(body: unknown): IRefusal | null {
    if (typeof body !== 'object' || body === null) {
        return null;
    }

    const code: unknown = Reflect.get(body, 'code');

    if (typeof code !== 'string' || code.length === 0) {
        return null;
    }

    const params: TRefusalParams | undefined = paramsOf(body);
    // Приведение здесь одно на обе стороны: незнакомый код доезжает до показа именем, а не пустотой
    const named: ERefusal = code as ERefusal;

    return params === undefined ? { code: named } : { code: named, params };
}
