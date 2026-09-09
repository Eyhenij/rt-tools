/**
 * Разбор тела правки состояния: из присланного пакета получаются строки правки по родам.
 *
 * Разбор стоит отдельно от операции нарочно. Форма запроса отбивается до похода в базу, а
 * решение «годен ли пакет» — чистое: у него нет ни хранилища, ни токена, и проверяется оно
 * вызовом, а не поднятым приложением.
 */
import {
    CARGO_RELEASE_VERSION_FIELD,
    CARGO_RELEASE_VERSION_LIMIT,
    cargoKindOf,
    ECargoKind,
    ECargoState,
    TCargoBody,
} from '@rt/message-bus-common';

/** Строка правки, разобранная из пакета: место в нём, род записи, ключ и целевое состояние. */
export interface ICargoStateLine {
    /** Место строки в пакете, считая с нуля: им отбитая строка называется в ответе. */
    readonly at: number;
    readonly kind: ECargoKind;
    readonly key: string;
    readonly state: ECargoState;
    /**
     * Чем недочёт исправлен. Поле необязательное: строка без него законна, а строка из одних
     * пробелов приходит сюда пустотой — иначе требование текста обходилось бы одним пробелом.
     */
    readonly fixNote: string | null;
    /**
     * В какой версии искать фикс. Поле необязательное и приходит сюда тем же приёмом, что и
     * текст починки: пробелы — пустота, форма не разбирается вовсе.
     */
    readonly releaseVersion: string | null;
    /**
     * Чем запись спорна. Поле необязательное и приходит сюда тем же приёмом, что и текст починки:
     * пробелы — пустота, иначе требование причины обходилось бы одним пробелом.
     */
    readonly quarantineNote: string | null;
}

/** Почему пакет не разобрался. Отбивает он весь запрос: годных строк в нём ещё не выделено. */
export enum ECargoStateBodyFault {
    /** Список строк отсутствует или не список. */
    NotAList = 'not-a-list',
    /** Пакет пуст: правке нечего делать. */
    Empty = 'empty',
    /** У строки нет обязательного поля либо оно не строка. */
    BadLine = 'bad-line',
    /** Род записи назван словом вне набора. */
    UnknownKind = 'unknown-kind',
    /** Состояние названо значением вне набора. */
    UnknownState = 'unknown-state',
    /** Текст починки прислан не строкой. Форма запроса при этом неверна, и отбивается он весь. */
    BadFixNote = 'bad-fix-note',
    /** Версия выпуска прислана не строкой. Форма запроса при этом неверна, и отбивается он весь. */
    BadReleaseVersion = 'bad-release-version',
    /** Версия выпуска длиннее предела: вместо метки приехало что-то другое. */
    LongReleaseVersion = 'long-release-version',
    /** Причина карантина прислана не строкой. Форма запроса при этом неверна, и отбивается он весь. */
    BadQuarantineNote = 'bad-quarantine-note',
}

/** Чем кончился разбор пакета: либо строки, либо причина с местом промаха. */
export interface ICargoStateParsed {
    readonly lines: readonly ICargoStateLine[] | null;
    readonly fault: ECargoStateBodyFault | null;
    /** Место строки, на которой разбор встал; у промаха всего пакета — пусто. */
    readonly at: number | null;
}

/** Поля, которые строка правки несёт всегда. */
const LINE_FIELDS: readonly string[] = ['kind', 'key', 'state'];

/** Поле текста починки. Стоит отдельно от обязательных: строка без него законна. */
const FIX_NOTE_FIELD: string = 'fixNote';

/** Поле причины карантина. Стоит отдельно от обязательных по той же причине. */
const QUARANTINE_NOTE_FIELD: string = 'quarantineNote';

/** Набор состояний целиком. Незнакомое отбивает запрос, а не ложится в колонку опечаткой. */
const STATES: readonly ECargoState[] = Object.values(ECargoState);

/** Отказ разбора: причина и место, если промах у строки. */
function faulty(fault: ECargoStateBodyFault, at: number | null): ICargoStateParsed {
    return { lines: null, fault, at };
}

/** Строка пакета: все три обязательных поля на месте и строками. */
function isLine(raw: unknown): raw is TCargoBody {
    return (
        typeof raw === 'object' &&
        raw !== null &&
        !Array.isArray(raw) &&
        LINE_FIELDS.every((field: string): boolean => typeof (raw as TCargoBody)[field] === 'string')
    );
}

/**
 * Приложенное к строке значение, приведённое к тому, чем его судят дальше.
 *
 * Поля нет вовсе — пусто; строка из одних пробелов — тоже пусто: она отбивается так же, как
 * отсутствие поля, иначе требование значения обходится одним пробелом. Поле не строкой — промах
 * формы, и его отличает от пустоты второй возврат.
 *
 * Приём один на текст починки и на версию выпуска: разбираются они одинаково, а различает их
 * только предел длины, и он спрашивается отдельно.
 */
function stringOf(raw: TCargoBody, field: string): { readonly value: string | null; readonly bad: boolean } {
    const value: unknown = raw[field];

    if (value === undefined || value === null) {
        return { value: null, bad: false };
    }

    if (typeof value !== 'string') {
        return { value: null, bad: true };
    }

    const trimmed: string = value.trim();

    return { value: trimmed === '' ? null : trimmed, bad: false };
}

/**
 * Приложенные к строке значения, разобранные вместе.
 *
 * Стоят рядом, а не в теле разбора пакета: их два, у каждого своя причина отказа и свой предел,
 * и написанные подряд в цикле они переваливают предел ветвления, объявленный линтером.
 */
function attachedOf(raw: TCargoBody): {
    readonly fixNote: string | null;
    readonly releaseVersion: string | null;
    readonly quarantineNote: string | null;
    readonly fault: ECargoStateBodyFault | null;
} {
    const fixNote: { value: string | null; bad: boolean } = stringOf(raw, FIX_NOTE_FIELD);

    if (fixNote.bad) {
        return { fixNote: null, releaseVersion: null, quarantineNote: null, fault: ECargoStateBodyFault.BadFixNote };
    }

    const releaseVersion: { value: string | null; bad: boolean } = stringOf(raw, CARGO_RELEASE_VERSION_FIELD);

    if (releaseVersion.bad) {
        return { fixNote: null, releaseVersion: null, quarantineNote: null, fault: ECargoStateBodyFault.BadReleaseVersion };
    }

    if (releaseVersion.value !== null && releaseVersion.value.length > CARGO_RELEASE_VERSION_LIMIT) {
        return { fixNote: null, releaseVersion: null, quarantineNote: null, fault: ECargoStateBodyFault.LongReleaseVersion };
    }

    const quarantineNote: { value: string | null; bad: boolean } = stringOf(raw, QUARANTINE_NOTE_FIELD);

    if (quarantineNote.bad) {
        return { fixNote: null, releaseVersion: null, quarantineNote: null, fault: ECargoStateBodyFault.BadQuarantineNote };
    }

    return { fixNote: fixNote.value, releaseVersion: releaseVersion.value, quarantineNote: quarantineNote.value, fault: null };
}

/**
 * Одна строка пакета: род, ключ, состояние и приложенные значения либо причина отказа.
 *
 * Место строки сюда не передаётся: разбор одной строки о её соседях не знает, а место
 * приставляет тот, кто идёт по пакету.
 */
function lineOf(raw: unknown): { readonly line: Omit<ICargoStateLine, 'at'> | null; readonly fault: ECargoStateBodyFault | null } {
    if (!isLine(raw)) {
        return { line: null, fault: ECargoStateBodyFault.BadLine };
    }

    const kind: ECargoKind | null = cargoKindOf(raw['kind']);

    if (kind === null) {
        return { line: null, fault: ECargoStateBodyFault.UnknownKind };
    }

    const state: ECargoState | undefined = STATES.find((one: ECargoState): boolean => one === raw['state']);

    if (state === undefined) {
        return { line: null, fault: ECargoStateBodyFault.UnknownState };
    }

    const attached: {
        fixNote: string | null;
        releaseVersion: string | null;
        quarantineNote: string | null;
        fault: ECargoStateBodyFault | null;
    } = attachedOf(raw);

    if (attached.fault !== null) {
        return { line: null, fault: attached.fault };
    }

    return {
        line: {
            kind,
            state,
            key: String(raw['key']),
            fixNote: attached.fixNote,
            releaseVersion: attached.releaseVersion,
            quarantineNote: attached.quarantineNote,
        },
        fault: null,
    };
}

/**
 * Разобрать пакет правки.
 *
 * Пакет отбивается целиком, а не построчно: здесь судится форма запроса, а не запись дерева.
 * Строка, у которой не тот род или не то состояние, — промах отправителя, и исполнить остальные
 * значило бы принять запрос, половину которого никто не читал. Построчно отбивается другое:
 * запись, которой у дерева нет, и переход, которого порядок не разрешает, — но это видно уже
 * в хранилище.
 */
export function cargoStateBody(items: unknown): ICargoStateParsed {
    if (!Array.isArray(items)) {
        return faulty(ECargoStateBodyFault.NotAList, null);
    }

    if (items.length === 0) {
        return faulty(ECargoStateBodyFault.Empty, null);
    }

    const lines: ICargoStateLine[] = [];

    for (let at: number = 0; at < items.length; at += 1) {
        const parsed: { line: Omit<ICargoStateLine, 'at'> | null; fault: ECargoStateBodyFault | null } = lineOf(items[at]);

        if (parsed.fault !== null || parsed.line === null) {
            return faulty(parsed.fault as ECargoStateBodyFault, at);
        }

        lines.push({ at, ...parsed.line });
    }

    return { lines, at: null, fault: null };
}
