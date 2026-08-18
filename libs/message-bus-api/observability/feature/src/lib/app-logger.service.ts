/**
 * Журнал приёмника: одна строка на запись.
 *
 * Ставится в `app.useLogger()`, и из-за этого уже написанные `Logger.warn(...)` в доменах
 * начинают писать машинно, ничего в них не правя; новые места зовут журнал с полями объектом
 * вместо подстановки в текст.
 *
 * Вид по умолчанию — машинный: строки читает команда вывода контейнера и то, что встанет за
 * ней, а не человек в терминале. Вне прода включается читаемый вид — иначе свой прогон
 * превращается в чтение машинного вида глазами.
 */
import { Injectable, LoggerService } from '@nestjs/common';

import { redact } from '@rt/message-bus-api/observability/util';

/** Ступени важности: их же именами каркас зовёт свои методы. */
export type TLogLevel = 'verbose' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/** Цвет ступени в читаемом виде. Машинная запись цвета не несёт вовсе. */
const COLOR: Readonly<Record<TLogLevel, string>> = {
    verbose: '[90m',
    debug: '[36m',
    info: '[32m',
    warn: '[33m',
    error: '[31m',
    fatal: '[35m',
};
const COLOR_OFF: string = '[0m';

/** Ширина колонки уровня в читаемом виде: с ней имена строк стоят друг под другом. */
const LEVEL_WIDTH: number = 7;

/** Что каркас передал хвостом вызова: контекст строкой, поля объектом, остальное — текстом. */
interface ISplitTail {
    readonly context?: string;
    readonly detail?: string;
    readonly fields: Record<string, unknown>;
}

/**
 * Разбор хвоста, с которым каркас зовёт журнал: `log(message, context)` и
 * `error(message, stack, context)`.
 *
 * Последняя строка хвоста — всегда контекст, остальные строки уходят подробностью, а объекты
 * становятся полями записи.
 */
function splitTail(tail: readonly unknown[]): ISplitTail {
    const params: unknown[] = [...tail];
    const context: string | undefined = typeof params.at(-1) === 'string' ? (params.pop() as string) : undefined;

    const texts: string[] = [];
    const fields: Record<string, unknown> = {};
    for (const param of params) {
        if (typeof param === 'string') {
            texts.push(param);
            continue;
        }
        if (param !== null && typeof param === 'object') {
            Object.assign(fields, param as Record<string, unknown>);
        }
    }

    return { context, fields, detail: texts.length ? texts.join('\n') : undefined };
}

/** Имя строки: то, что пришло первым доводом. Не строка — приводится, иначе запись безымянна. */
function nameOf(message: unknown): string {
    return typeof message === 'string' ? message : String(message);
}

/**
 * Запись в строку.
 *
 * Собирать её умеет и сериализатор каркаса, но он не знает ни вычистки, ни того, что запись
 * обязана дойти до вывода даже с циклической ссылкой в полях: брошенное здесь исключение
 * уронило бы запрос, ради журнала которого поля и складывали.
 */
function safeStringify(record: Record<string, unknown>): string {
    try {
        return JSON.stringify(record);
    } catch {
        return JSON.stringify({ ts: record['ts'], level: record['level'], name: record['name'], fields: 'не сериализуются' });
    }
}

@Injectable()
export class AppLoggerService implements LoggerService {
    /** Вид записи выбирается на подъёме: настройка среды по ходу работы не меняется. */
    readonly #machineReadable: boolean = process.env['NODE_ENV'] === 'production';

    /**
     * Одна запись. Момент приходит доводом: правило проверяется вызовом, а не подкруткой часов
     * вокруг теста. Возвращается написанная строка — по ней спека и судит.
     */
    public write(level: TLogLevel, message: unknown, tail: readonly unknown[], now: Date = new Date()): string {
        const { context, detail, fields }: ISplitTail = splitTail(tail);
        const clean: Record<string, unknown> = redact(fields);
        const name: string = nameOf(message);

        const line: string = this.#machineReadable
            ? this.#machineLine(level, name, context, detail, clean, now)
            : this.#humanLine(level, name, context, detail, clean, now);

        process.stdout.write(`${line}\n`);

        return line;
    }

    public log(message: unknown, ...tail: readonly unknown[]): void {
        this.write('info', message, tail);
    }

    public error(message: unknown, ...tail: readonly unknown[]): void {
        this.write('error', message, tail);
    }

    public warn(message: unknown, ...tail: readonly unknown[]): void {
        this.write('warn', message, tail);
    }

    public debug(message: unknown, ...tail: readonly unknown[]): void {
        this.write('debug', message, tail);
    }

    public verbose(message: unknown, ...tail: readonly unknown[]): void {
        this.write('verbose', message, tail);
    }

    public fatal(message: unknown, ...tail: readonly unknown[]): void {
        this.write('fatal', message, tail);
    }

    /**
     * Машинная запись. Пустые поля в строку не идут: контекст есть не у каждого вызова, а
     * запись с пустыми ключами читается хуже, чем без них.
     */
    #machineLine(
        level: TLogLevel,
        name: string,
        context: string | undefined,
        detail: string | undefined,
        fields: Record<string, unknown>,
        now: Date
    ): string {
        const record: Record<string, unknown> = { ts: now.toISOString(), level, name, ...fields };
        if (context) {
            record['context'] = context;
        }
        if (detail) {
            record['detail'] = detail;
        }

        return safeStringify(record);
    }

    /** Читаемая запись: те же поля, но глазами. */
    #humanLine(
        level: TLogLevel,
        name: string,
        context: string | undefined,
        detail: string | undefined,
        fields: Record<string, unknown>,
        now: Date
    ): string {
        const head: string = `${COLOR[level]}${level.toUpperCase().padEnd(LEVEL_WIDTH)}${COLOR_OFF}`;
        const where: string = context ? ` [${context}]` : '';
        const tail: string = Object.keys(fields).length ? ` ${safeStringify(fields)}` : '';
        const under: string = detail ? `\n${detail}` : '';

        return `${now.toISOString()} ${head}${where} ${name}${tail}${under}`;
    }
}
