/**
 * Форма груза: то, что уезжает с дерева в приём.
 *
 * Место объявления одно на обе стороны — правило договорённости приёма. Объявляет его
 * отправляющая сторона: пакет уходит в реестр, и импорт внутренней либы приёма уехал бы в
 * описания его типов и сломал бы установку. Приём берёт форму отсюда, а своей копии не заводит:
 * из двух копий компилируется только одна, а расходятся они молча.
 *
 * Файл держится без единого импорта намеренно: его читает и приём, и всякий, кто ставит пакет,
 * — а всё остальное в пакете написано под запуск из строки запуска.
 */

/**
 * Версия формата запроса приёма. Меняется, когда меняется состав полей самого груза.
 *
 * `2` — четвёртый род груза, строки наблюдений: дерево прежней редакции шлёт три рода под `1`,
 * и приём берёт их как прежде.
 */
export const CARGO_SCHEMA_VERSION: string = '2';

/** Род загруженного скила: чей он — пакета или самого дерева. Считает отправитель по раскладке. */
export type TSkillKind = 'rule' | 'pattern' | 'skill' | 'own';

/** Роды событий, которые пишут гарды дерева. Приём чужой род не принимает. */
export const OBSERVATION_EVENTS: readonly string[] = ['skill-load', 'gate-deny', 'guard-deny', 'push-gate'];

/**
 * Одна строка наблюдения — как лежит в файле дня, плюс род скила у загрузки.
 *
 * Имена полей повторяют файл: `t` время, `ev` событие, `res` ресурс, `kind` род правки у отказа
 * гейта, `sid` признак сессии, `v` версия пакета. Пути в строке нет, признак сессии — контрольная
 * сумма: груз не говорит о дереве больше, чем сводка.
 */
export interface IObservationLine {
    readonly t: string;
    readonly ev: string;
    readonly res: string;
    readonly kind?: string;
    readonly sid: string;
    readonly v: string;
    readonly skill?: TSkillKind;
}

/** Строки одного дня. День уезжает целиком: приём замещает день целиком. */
export interface IObservationDay {
    /** День вида `2026-09-14`, по всемирному времени — как назван файл. */
    readonly day: string;
    readonly lines: readonly IObservationLine[];
}

/**
 * Строки наблюдений за отрезок отправки, по дням.
 *
 * `origin` — признак рабочей копии: у одного дерева их несколько, признак дерева у них общий, а
 * файлы наблюдений у каждой свои. Приём замещает день по паре «копия — день», иначе последняя
 * отправившая копия стирала бы строки соседней. Контрольная сумма пути, самого пути в грузе нет.
 */
export interface IObservationsCargo extends ICargoHead {
    readonly origin: string;
    readonly days: readonly IObservationDay[];
}

/** Заголовок, которым дерево представляется приёму. */
export const TREE_TOKEN_HEADER: string = 'x-tree-token';

/** Род правки надстройки: дерево замещает раздел пакета, дописывает свой или снимает пакетный. */
export type TOverrideKind = 'replace' | 'append' | 'drop';

/** Сколько раз что-то встретилось за отрезок сводки. */
export interface ICargoCount {
    readonly name: string;
    readonly count: number;
}

/**
 * Одна правка надстройки. У замещения и снятия заголовок раздела пакетный и общий у всех, потому
 * называется; у своего раздела заголовок придумало дерево — он не уезжает вовсе.
 */
export interface ICargoOverride {
    readonly resource: string;
    readonly section: string | null;
    readonly kind: TOverrideKind;
}

/** Общее у всякого груза: чем разбирать и от какого дерева приехало. */
export interface ICargoHead {
    readonly schema: string;
    readonly tree: string;
}

/** Сводка наблюдений дерева за отрезок дней вместе со снимком надстроек. */
export interface ISummaryCargo extends ICargoHead {
    readonly days: number;
    readonly sessions: number;
    readonly loads: readonly ICargoCount[];
    readonly denials: readonly ICargoCount[];
    readonly kinds: readonly ICargoCount[];
    readonly guards: readonly ICargoCount[];
    /** Ресурсы, разложенные в дерево и не загруженные за отрезок ни разу. */
    readonly unused: readonly string[];
    /** Ресурсы пакета, которых дерево не разложило вовсе. */
    readonly unpicked: readonly string[];
    readonly overrides: readonly ICargoOverride[];
    /** Версии схемы строк наблюдения, встреченные за отрезок. Приём их не судит. */
    readonly versions: readonly string[];
    readonly total: number;
}

/** Одно предложение по слою правил. */
export interface IProposalItem {
    readonly text: string;
    readonly address: string;
    readonly resource: string;
}

export interface IProposalsCargo extends ICargoHead {
    readonly items: readonly IProposalItem[];
}

/** Один разбор происшествия: имя файла на дереве и текст целиком. */
export interface IPostmortemItem {
    readonly file: string;
    readonly text: string;
}

export interface IPostmortemsCargo extends ICargoHead {
    readonly items: readonly IPostmortemItem[];
}

/**
 * Обращение дерева за токеном.
 *
 * Имени дерева в нём нет вовсе: его приём берёт из приглашения — принятое из обращения, оно
 * позволило бы назваться чужим именем тому, кто добыл код.
 */
export interface IEnrollCargo {
    readonly schema: string;
    /** Признак дерева: его дерево считает у себя, а приём только сверяет. */
    readonly tree: string;
    /** Код приглашения, выданный владельцем. Уходит один раз и в журнал не попадает. */
    readonly code: string;
}

/** Ответ приёма на годное обращение: токен уходит дереву единственным этим ответом. */
export interface IEnrollGranted {
    readonly tree: string;
    /** Имя дерева, как его назвал владелец в приглашении. */
    readonly name: string;
    readonly token: string;
}

/** Ответ приёма на принятый груз: дерево и месяц печатаются владельцу отправляющей стороной. */
export interface IIntakeAccepted {
    readonly tree: string;
    /** Месяц записи в форме `2026-08`, по всемирному времени приёма. */
    readonly month: string;
    /** Запись месяца заведена этим запросом, а не обновлена. */
    readonly created: boolean;
    /**
     * Сколько записей легло этим запросом и сколько приехало повторно.
     *
     * Есть только у предложений: у них приём отбирает уже приехавшее по признаку, и без этих
     * двух чисел отправитель печатает «уехало» в том числе тогда, когда нового не уехало ничего.
     * Приём прежней редакции их не присылает вовсе — отсюда необязательность.
     */
    readonly added?: number;
    readonly known?: number;
}

/** Ответ приёма на груз наблюдений: сколько дней замещено и сколько строк легло. */
export interface IObservationsAccepted {
    readonly tree: string;
    readonly days: number;
    readonly rows: number;
}

/**
 * Числа строки дня без имени ресурса. Ключи только добавляются: приложения обновляются не сразу, и
 * убранный ключ отказал бы всю строку каждому дереву на старой версии.
 */
export const METRIC_KEYS: readonly string[] = [
    'tasksAccepted',
    'tasksClosed',
    'tasksFirstPass',
    'tasksLost',
    'tasksNoHandover',
    'ownerCorrections',
    'sessions',
    'edits',
    'editsRefused',
    'examSessions',
    'examsFirstPass',
    'entryChars',
    'rulesLaidOut',
    'rulesDead',
    'sectionsTotal',
    'sectionsOverridden',
    'refusalsWithRule',
    'outcomesBroken',
    'outcomesUnread',
    'sendFault',
    'settingsChanged',
];

/** Числа строки дня по ресурсу пакета или роду шага: ключ пишется `<основа>:<имя>`. */
export const METRIC_RESOURCE_KEYS: readonly string[] = [
    'guardRefusals',
    'guardEmpty',
    'guardCompared',
    'gateRefusals',
    'rulesAfterLoad',
    'ruleLoads',
    'roleCalls',
    'roleRefused',
    'roleVerdicts',
    'commandCalls',
    'runs',
    'runSeconds',
    'wastedRuns',
    'wastedSeconds',
];

/** Предел ключей одной строки дня: ресурсов пакета сотни, а не тысячи. */
export const METRIC_KEYS_CAP: number = 2000;

/**
 * Имя ресурса в ключе. Приёмник судит только форму: список имён у него отстаёт от пакета, и новое имя
 * отказало бы всю строку. Имена по списку пакета оставляет отправитель, своё он пишет постоянным словом.
 * Длинный ряд шестнадцатеричных знаков запрещён: это сумма или ключ, а не имя.
 */
const METRIC_RESOURCE_NAME: RegExp = /^(?!.*[0-9a-f]{12})[a-z0-9][a-z0-9-]{0,47}$/;

/** Признак копии: случайное значение или контрольная сумма, без пути и пробелов. */
const METRIC_ORIGIN: RegExp = /^[a-z0-9][a-z0-9-]{5,63}$/;

/** Версия пакета: только номер. */
const METRIC_VERSION: RegExp = /^\d+\.\d+\.\d+(?:-[0-9a-z.-]+)?$/;

/** Ключ из закрытого списка. Одна проверка на обе стороны: отправитель выбрасывает, приём отказывает. */
export function isMetricKey(key: string): boolean {
    const at: number = key.indexOf(':');

    if (at < 0) {
        return METRIC_KEYS.includes(key);
    }

    return METRIC_RESOURCE_KEYS.includes(key.slice(0, at)) && METRIC_RESOURCE_NAME.test(key.slice(at + 1));
}

/** Признак копии в строке дня. */
export function isMetricOrigin(value: unknown): boolean {
    return typeof value === 'string' && METRIC_ORIGIN.test(value);
}

/** Версия пакета в строке дня. */
export function isMetricVersion(value: unknown): boolean {
    return typeof value === 'string' && METRIC_VERSION.test(value);
}

/** Значение строки дня: целое и не меньше нуля. */
export function isMetricValue(value: unknown): boolean {
    return Number.isSafeInteger(value) && Number(value) >= 0;
}

/** Строка дня одной рабочей копии: всё, что уходит с дерева без команды человека. */
export interface IMetricsDayCargo extends ICargoHead {
    readonly origin: string;
    /** День в форме `2026-09-14`. */
    readonly day: string;
    /** Версия пакета. */
    readonly version: string;
    /** Миллисекунды сборки строки: более старая не заменяет более новую. */
    readonly stamp: number;
    readonly metrics: Readonly<Record<string, number>>;
}

/** Ответ приёма на строку дня. */
export interface IMetricsDayAccepted {
    readonly tree: string;
    readonly day: string;
}

/** Род записи груза, у которой есть состояние. Набор закрыт: сводка месяца состояния не несёт. */
export type TCargoStateKind = 'postmortem' | 'proposal';

/**
 * Состояния записи груза: шаг идёт вперёд на соседнее, назад — только из «в работе».
 *
 * Карантин стоит последним и в порядок шагов не входит: в него запись уходит из «нового» и
 * возвращается только туда же. Набор здесь один на обе стороны — приём судит переход сам, а
 * отправляющее дерево по этому набору отбивает неизвестное состояние до сети.
 */
export const CARGO_STATES: readonly string[] = ['new', 'in_work', 'fixed', 'released', 'quarantined'];

/** Одна строка правки состояния: род записи, ключ и состояние, в которое её переводят. */
export interface ICargoStateItem {
    readonly kind: TCargoStateKind;
    /** Ключ записи: имя файла у разбора происшествия, признак текста у предложения. */
    readonly key: string;
    readonly state: string;
    /**
     * Чем недочёт исправлен. Едет только при переходе в «починено и не выпущено» — с другим
     * переходом приём отбивает строку, а без него отбивает переход в починку.
     */
    readonly fixNote?: string;
    /**
     * В какой версии искать фикс. Едет только при переходе в «выпущено» — с другим переходом
     * приём отбивает строку, а без него отбивает переход в выпуск.
     */
    readonly releaseVersion?: string;
    /**
     * Чем запись спорна. Едет только при переходе в карантин — с другим переходом приём отбивает
     * строку, а без него отбивает сам переход в карантин.
     */
    readonly quarantineNote?: string;
}

/** Пакет правки состояния: то же общее, что у всякого груза, плюс строки правки. */
export interface ICargoStateBody extends ICargoHead {
    readonly items: readonly ICargoStateItem[];
}

/** Строка, которую приём не исполнил: место в пакете, род записи, ключ и причина. */
export interface ICargoStateDenied {
    readonly at: number;
    readonly kind: TCargoStateKind;
    readonly key: string;
    /** Почему не исполнена: записи у дерева нет либо переход не разрешён. */
    readonly denial: string;
}

/** Ответ приёма на правку состояния: признак дерева, два числа и отбитые строки. */
export interface ICargoStateAccepted {
    readonly tree: string;
    /** Сколько записей переведено. */
    readonly changed: number;
    /** Сколько уже стояло в названном состоянии: переходом это не считается. */
    readonly same: number;
    readonly denied: readonly ICargoStateDenied[];
}
