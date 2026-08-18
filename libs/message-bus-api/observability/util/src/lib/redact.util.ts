/**
 * Вычистка секретов из того, что уезжает в журнал.
 *
 * Работа идёт по имени ключа, а не по виду значения: угадывать «похоже на токен» по форме
 * строки — значит однажды не угадать. Имя ключа известно заранее и стоит рядом со значением в
 * том же объекте.
 *
 * Приёмник держит токены деревьев и пароли учётных записей, и оба приходят в поля вместе с
 * телом запроса и подробностями хранилища. Вычищать записанное дороже, чем не записать.
 */

export const REDACTED: string = '***';

/** Ключи, значение которых не пишется никогда */
const SECRET_KEY: RegExp = /(pass(word|phrase)?|token|secret|authorization|cookie|api[-_]?key|jwt|credential|signature|salt|hash)/i;

/**
 * Ветки, внутри которых `message` — это текст ошибки, а не текст человека.
 *
 * Без этой оговорки правило про свободный текст съедало бы ровно то, ради чего всё заведено:
 * разобранная причина кладёт текст ошибки полем `message`, и он обязан дойти до вывода целиком.
 */
const ERROR_BRANCH: ReadonlySet<string> = new Set<string>(['error', 'cause', 'details']);

/** Ключи, значение которых — текст человека: в журнал не уезжает ни при каком уровне */
const FREE_TEXT_KEY: RegExp = /^(message|comment|text|body|html|note|description)$/i;

/**
 * Пределы обхода. Журнал — не выгрузка: объект глубже нескольких уровней или длиннее сотни
 * элементов в строке нечитаем, а стоит столько же, сколько сам запрос.
 */
const MAX_DEPTH: number = 6;
const MAX_ARRAY: number = 50;
const MAX_STRING: number = 2000;

function truncate(value: string): string {
    return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…(+${value.length - MAX_STRING})` : value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Свободный текст вычищается длиной, а не значением: по ней видно, что поле было и что в нём
 * что-то лежало.
 */
function hideFreeText(value: unknown): string {
    return typeof value === 'string' ? `<${value.length} симв.>` : REDACTED;
}

/**
 * Значение одного поля записи после вычистки: секрет прячется целиком, свободный текст — длиной,
 * остальное идёт тем же разбором, что и всё вложенное.
 */
function redactField(key: string, value: unknown, depth: number, insideError: boolean): unknown {
    if (SECRET_KEY.test(key)) {
        return REDACTED;
    }

    const errorBranch: boolean = insideError || ERROR_BRANCH.has(key);

    if (!errorBranch && FREE_TEXT_KEY.test(key)) {
        return hideFreeText(value);
    }

    // eslint-disable-next-line @typescript-eslint/no-use-before-define -- поле и значение зовут друг друга, и объявления функций поднимаются
    return redactValue(value, depth + 1, errorBranch);
}

/** Значение после вычистки — одной функцией на все роды сразу. */
function redactValue(value: unknown, depth: number, insideError: boolean): unknown {
    if (typeof value === 'string') {
        return truncate(value);
    }
    if (Array.isArray(value)) {
        const head: unknown[] = value.slice(0, MAX_ARRAY).map((item: unknown) => redactValue(item, depth + 1, insideError));

        return value.length > MAX_ARRAY ? [...head, `…(+${value.length - MAX_ARRAY})`] : head;
    }
    if (!isRecord(value)) {
        return value;
    }
    if (depth >= MAX_DEPTH) {
        return { '…': 'глубже предела' };
    }

    const result: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
        result[key] = redactField(key, nested, depth, insideError);
    }

    return result;
}

/**
 * Поля строки журнала после вычистки.
 *
 * Зовётся всегда, а не по решению того, кто пишет строку: решать на каждом вызове, есть ли в
 * полях секрет, — значит однажды ошибиться.
 *
 * Приведение здесь обязательно: обход объявлен над `unknown` ради вложенных значений, а на
 * входе всегда объект — вычищаются поля строки, а не произвольное значение.
 */
export function redact(fields: Record<string, unknown>): Record<string, unknown> {
    return redactValue(fields, 0, false) as Record<string, unknown>;
}
