/**
 * Разбор тела правки состояния: из присланного пакета получаются строки правки по родам.
 *
 * Разбор стоит отдельно от операции нарочно. Форма запроса отбивается до похода в базу, а
 * решение «годен ли пакет» — чистое: у него нет ни хранилища, ни токена, и проверяется оно
 * вызовом, а не поднятым приложением.
 */
import { ECargoState, TCargoBody } from '@rt/message-bus-common';

/** Род записи груза, названный строкой правки. Набор закрыт: состояние есть у двух родов. */
export enum ECargoStateKind {
    /** Разбор происшествия: ключ — имя файла на дереве. */
    Postmortem = 'postmortem',
    /** Предложение: ключ — признак его текста. */
    Proposal = 'proposal',
}

/** Строка правки, разобранная из пакета: место в нём, род записи, ключ и целевое состояние. */
export interface ICargoStateLine {
    /** Место строки в пакете, считая с нуля: им отбитая строка называется в ответе. */
    readonly at: number;
    readonly kind: ECargoStateKind;
    readonly key: string;
    readonly state: ECargoState;
    /**
     * Чем недочёт исправлен. Поле необязательное: строка без него законна, а строка из одних
     * пробелов приходит сюда пустотой — иначе требование текста обходилось бы одним пробелом.
     */
    readonly fixNote: string | null;
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

/** Набор родов целиком: по нему и сверяется присланное слово. */
const KINDS: readonly ECargoStateKind[] = Object.values(ECargoStateKind);

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
 * Текст починки, приведённый к тому, чем его судят дальше.
 *
 * Поля нет вовсе — пусто; текст из одних пробелов — тоже пусто: строка из пробелов отбивается
 * так же, как отсутствие поля, иначе требование текста обходится одним пробелом. Поле не
 * строкой — промах формы, и его отличает от пустоты второй возврат.
 */
function fixNoteOf(raw: TCargoBody): { readonly value: string | null; readonly bad: boolean } {
    const value: unknown = raw[FIX_NOTE_FIELD];

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
        const raw: unknown = items[at];

        if (!isLine(raw)) {
            return faulty(ECargoStateBodyFault.BadLine, at);
        }

        const kind: ECargoStateKind | undefined = KINDS.find((one: ECargoStateKind): boolean => one === raw['kind']);

        if (kind === undefined) {
            return faulty(ECargoStateBodyFault.UnknownKind, at);
        }

        const state: ECargoState | undefined = STATES.find((one: ECargoState): boolean => one === raw['state']);

        if (state === undefined) {
            return faulty(ECargoStateBodyFault.UnknownState, at);
        }

        const fixNote: { value: string | null; bad: boolean } = fixNoteOf(raw);

        if (fixNote.bad) {
            return faulty(ECargoStateBodyFault.BadFixNote, at);
        }

        lines.push({ at, kind, state, key: String(raw['key']), fixNote: fixNote.value });
    }

    return { lines, at: null, fault: null };
}
