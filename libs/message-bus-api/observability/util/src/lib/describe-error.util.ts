/**
 * Разбор ошибки в поля, по которым её видно в журнале.
 *
 * До этого приёмник писал об отказе род груза, признак дерева, код ответа и номер обращения —
 * и на этом кончал. Пятисотый на приёме предложений пришлось разбирать тремя разовыми
 * доказательствами подряд: настоящий текст ошибки удалось увидеть только своим прогоном с
 * включённой отладкой клиента хранилища, то есть уже после того, как отказ повторили. Здесь
 * этот текст достаётся из ошибки штатно.
 *
 * Ошибки хранилища узнаются по форме кода, а не по классу: тянуть сюда клиент генератора ради
 * `instanceof` значило бы дать слою журнала зависимость от домена хранилища — при том, что
 * признак у ошибки один и он устойчивый, код вида `P2022`.
 */

/** Насколько глубоко разворачивается цепочка причин: дальше идут обёртки, одинаковые у всех */
const MAX_CAUSE_DEPTH: number = 4;

/** Сколько строк стека остаётся: дальше — обвязка каркаса, одинаковая у любого отказа */
const STACK_LINES: number = 12;

/** Код клиента хранилища: `P2022` — колонки нет, `P2002` — нарушено ограничение уникальности */
const STORAGE_CODE: RegExp = /^P\d{4}$/;

/** Ошибка, разложенная полями. Пустое поле в строку журнала не попадает вовсе. */
export interface IErrorDetails {
    readonly name: string;
    readonly message: string;
    /** Код клиента хранилища: `P2022`, `P2002` */
    readonly storageCode?: string;
    /** Что клиент хранилища знает о месте отказа: модель, поле, имя ограничения */
    readonly storageMeta?: Record<string, unknown>;
    /** Ответ самого драйвера: для постгреса — `42703` и его текст */
    readonly driverCause?: string;
    readonly stack?: string;
    readonly cause?: IErrorDetails;
}

/**
 * Поле, которого нет в объявлении типа.
 *
 * У ошибок клиента хранилища код и подробности приходят полями, которых в его типах не
 * объявлено, а `cause` объявлен только в библиотеке типов ES2022 — приёмник собирается с более
 * ранней, хотя в исполнении поле есть.
 */
function fieldOf(value: object, key: string): unknown {
    return Reflect.get(value, key);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function shortStack(stack: string | undefined): string | undefined {
    return stack?.split('\n').slice(0, STACK_LINES).join('\n');
}

function safeJson(value: unknown): string {
    try {
        return JSON.stringify(value) ?? String(value);
    } catch {
        return String(value);
    }
}

/**
 * Причина от драйвера базы.
 *
 * Форма у неё не описана типами и менялась между редакциями клиента, поэтому берётся то, что
 * есть, и приводится к строке: потерять `42703` из-за неожиданной вложенности хуже, чем
 * записать её сырым видом.
 */
function driverCauseOf(meta: Record<string, unknown>): string | undefined {
    const adapterError: unknown = meta['driverAdapterError'];
    if (!isRecord(adapterError)) {
        return undefined;
    }

    const cause: unknown = adapterError['cause'];
    if (cause === undefined || cause === null) {
        return typeof adapterError['kind'] === 'string' ? adapterError['kind'] : undefined;
    }

    return typeof cause === 'string' ? cause : safeJson(cause);
}

/**
 * Не-`Error` в броске — редкость, но именно она обычно и остаётся без разбора: строка, объект
 * от чужой библиотеки, `undefined` из отвалившегося обещания.
 */
function fromUnknown(error: unknown): IErrorDetails {
    if (typeof error === 'string') {
        return { name: 'ThrownString', message: error };
    }
    if (isRecord(error)) {
        return { name: 'ThrownObject', message: safeJson(error) };
    }

    return { name: 'ThrownValue', message: String(error) };
}

/** Код хранилища и его подробности, если ошибка пришла от клиента хранилища. */
function storageFieldsOf(error: Error): Pick<IErrorDetails, 'storageCode' | 'storageMeta' | 'driverCause'> {
    const code: unknown = fieldOf(error, 'code');
    if (typeof code !== 'string' || !STORAGE_CODE.test(code)) {
        return {};
    }

    const meta: unknown = fieldOf(error, 'meta');
    if (!isRecord(meta)) {
        return { storageCode: code };
    }

    return { storageCode: code, storageMeta: meta, driverCause: driverCauseOf(meta) };
}

/**
 * Ошибка полями. Стек берётся срезанным, причина разворачивается до предела глубины.
 *
 * Глубина приходит доводом только от самой функции, когда она зовёт себя на причину: снаружи
 * её не задают.
 */
export function describeError(error: unknown, depth: number = 0): IErrorDetails {
    if (!(error instanceof Error)) {
        return fromUnknown(error);
    }

    const details: IErrorDetails = {
        name: error.name,
        message: error.message,
        stack: shortStack(error.stack),
        ...storageFieldsOf(error),
    };

    const cause: unknown = fieldOf(error, 'cause');
    if (cause === undefined || cause === null || depth >= MAX_CAUSE_DEPTH) {
        return details;
    }

    return { ...details, cause: describeError(cause, depth + 1) };
}

/**
 * Отказ хранилища или что-то другое.
 *
 * Узнаётся именем класса: клиент генератора кладёт свои ошибки классами `PrismaClient*`, и это
 * единственное, что у них общего. По этому же признаку выбирается код ответа — «повтори»
 * вместо «внутренняя ошибка».
 */
export function isStorageFailure(error: unknown): boolean {
    return error instanceof Error && error.name.startsWith('PrismaClient');
}
