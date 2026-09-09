/**
 * Судьба своих записей: что стало с тем, что дерево отправило в приём.
 *
 * Дерево шлёт предложение и не узнаёт о нём ничего: всё чтение приёма закрыто входом человека, а
 * учётной записи у потребителя нет. Чтобы работать дальше, оно кладёт надстройку рядом с
 * разложенным ресурсом — и держит её вечно: починка вышла в новой редакции, а сказать об этом
 * дереву некому.
 *
 * Половина связи в дереве уже есть: раздел надстройки помечен ресурсом, статьёй и днём отправки.
 * Здесь собирается вторая — состояние записи, починка и версия выпуска, — и обе сводятся вместе.
 *
 * Снимать раздел команда не берётся: пометка держит одну статью, а в раздел могли дописать и
 * другое. Она называет, что снимается сейчас, что ждёт обновления и какая пометка осталась без
 * записи.
 */
import { IEnvironment, IOutcomeOfCommand } from './commands.js';
import { CONFIG_PATH, IConfig, readConfig } from './config.js';
import { IOverrideMark, overrideMarks, staleOverrides } from './override-marks.js';
import { IOwnRead, IOwnRecord, readToken, TReadOwn } from './ship.js';

/** Отказ команды: именованных кодов у пакета нет — есть код возврата и текст. */
const REFUSED: number = 1;

/** Роды груза, у которых есть состояние. Сводка состояния не несёт и сюда не идёт. */
const KINDS: readonly string[] = ['proposal', 'postmortem'];

/** Состояние выпущенной записи: по нему решается, ждать ли обновления. */
const RELEASED: string = 'released';

/** Сколько страниц читать подряд, прежде чем остановиться. Дерево шлёт десятки записей, не тысячи. */
const PAGES_LIMIT: number = 20;

/** Чем живёт команда: чем читать приём. Сеть подменяется двойником в спеке. */
export interface IFateOptions {
    readonly read: TReadOwn;
}

/** Один пробел вместо любой последовательности пробелов: статья в разметке перенесена по ширине строки. */
function flat(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}

/** Все записи одного рода: страницы читаются подряд, пока их число не сойдётся с общим. */
async function recordsOf(read: TReadOwn, intake: string, token: string, kind: string): Promise<IOwnRead> {
    const rows: IOwnRecord[] = [];
    let page: number = 1;
    let last: IOwnRead = { ok: true, status: 200, said: '', rows: [], total: 0 };

    while (page <= PAGES_LIMIT) {
        last = await read(intake, token, kind, page);

        if (!last.ok) {
            return last;
        }

        rows.push(...last.rows);

        if (rows.length >= last.total || last.rows.length === 0) {
            break;
        }

        page += 1;
    }

    return { ...last, rows, total: last.total };
}

/** Пометка, заведённая ради статьи этой записи. Пусто — надстройки под запись нет. */
function markOf(record: IOwnRecord, marks: readonly IOverrideMark[]): IOverrideMark | null {
    const text: string = flat(record.text);

    return marks.find((mark: IOverrideMark): boolean => Boolean(mark.article) && text.includes(mark.article)) ?? null;
}

/** Строка записи: род, имя, состояние и то, чем и в какой редакции она починена. */
function recordLine(record: IOwnRecord): string {
    const fix: string = record.fixNote ? ` · починка: ${flat(record.fixNote)}` : '';
    const version: string = record.releaseVersion ? ` · выпущено ${record.releaseVersion}` : '';

    return `  ${record.kind} · ${record.name} · ${record.state}${version}${fix}`;
}

/**
 * Строка о надстройке под записью.
 *
 * Совет о снятии идёт по разложенной редакции, а не по слову приёма: приём знает день выхода
 * починки и не знает, дошла ли она до этого дерева. Выпущенная запись при отставшей редакции
 * зовёт обновление, а не снятие.
 */
function markLine(mark: IOverrideMark, record: IOwnRecord, stale: readonly IOverrideMark[]): string {
    const where: string = `      надстройка ${mark.file} · раздел «${mark.heading}»`;

    if (stale.some((one: IOverrideMark): boolean => one.file === mark.file && one.heading === mark.heading)) {
        return `${where} — снимается: статья уже в разложенной редакции`;
    }

    if (record.state === RELEASED && record.releaseVersion) {
        return `${where} — ждёт обновления: починка вышла в ${record.releaseVersion}`;
    }

    return `${where} — заведена ${mark.day}, починка ещё не вышла`;
}

/** Пометки, записей о которых приём не отдал: они называются отдельно, а не пропадают молча. */
function orphanLines(marks: readonly IOverrideMark[], tied: ReadonlySet<IOverrideMark>): readonly string[] {
    const orphans: readonly IOverrideMark[] = marks.filter((mark: IOverrideMark): boolean => !tied.has(mark));

    if (orphans.length === 0) {
        return [];
    }

    return [
        `пометок без записи в приёме: ${orphans.length}`,
        ...orphans.map((mark: IOverrideMark): string => `  ${mark.file} · раздел «${mark.heading}» · отправлено ${mark.day}`),
        '  — предложение не уехало, уехало из другого дерева либо запись в приёме потеряна',
    ];
}

/**
 * Отказ до сети: приём не назван либо токен не лежит.
 *
 * Называет оба места сразу: отказ, назвавший одно, отправляет исполнителя за вторым во второй раз
 * — а знать надо было оба ещё до вызова.
 */
function missingWay(config: IConfig, token: string): IOutcomeOfCommand | null {
    if (config.intake && token) {
        return null;
    }

    const named: string = config.token || 'ключ не назван';

    return {
        code: REFUSED,
        lines: [
            'судьбу записей не спросить: приём не назван или токен не лежит',
            `  адрес приёма — ключ \`intake\` в ${CONFIG_PATH}`,
            `  токен — файл ключа \`token\` (${named}), он лежит вне дерева`,
            '  токен выдаёт хозяин приёмника кодом приглашения: `agent-kit enroll --code <код>`',
        ],
    };
}

/** Строка отказа приёма: род груза, код ответа и то, что приём сказал сам. */
function refusedLine(kind: string, read: IOwnRead): string {
    const said: string = read.said ? ` — ${read.said}` : '';

    return `приём не отдал записи рода ${kind}: ответ ${read.status}${said}`;
}

/** Строки записей вместе с надстройками под ними. Связанные пометки складываются в общий набор. */
function recordLines(
    records: readonly IOwnRecord[],
    marks: readonly IOverrideMark[],
    stale: readonly IOverrideMark[],
    tied: Set<IOverrideMark>
): readonly string[] {
    const lines: string[] = [];

    for (const record of records) {
        const mark: IOverrideMark | null = markOf(record, marks);

        lines.push(recordLine(record));

        if (mark) {
            tied.add(mark);
            lines.push(markLine(mark, record, stale));
        }
    }

    return lines;
}

/**
 * Судьба своих записей.
 *
 * Отказ без токена или без адреса приёма идёт до сети: отказ, названный после запроса, ничего не
 * добавляет к тому, что и так было известно до него.
 */
export async function fate(env: IEnvironment, options: IFateOptions): Promise<IOutcomeOfCommand> {
    const config: IConfig | null = readConfig(env.root);

    if (!config) {
        return { code: REFUSED, lines: [`настройки дерева нет: ${CONFIG_PATH}. Заведите её командой \`init\``] };
    }

    const token: string = readToken(env.root, config.token);
    const missing: IOutcomeOfCommand | null = missingWay(config, token);

    if (missing) {
        return missing;
    }

    const marks: readonly IOverrideMark[] = overrideMarks(env.root);
    const stale: readonly IOverrideMark[] = staleOverrides(env.root, env.assetsDir);
    const tied: Set<IOverrideMark> = new Set<IOverrideMark>();
    const lines: string[] = [`СУДЬБА ЗАПИСЕЙ — приём ${config.intake}:`];
    let count: number = 0;

    for (const kind of KINDS) {
        const read: IOwnRead = await recordsOf(options.read, config.intake, token, kind);

        if (!read.ok) {
            return { code: REFUSED, lines: [refusedLine(kind, read)] };
        }

        count += read.rows.length;
        lines.push(...recordLines(read.rows, marks, stale, tied));
    }

    if (count === 0) {
        lines.push('  записей нет: дерево ничего не отправляло либо приём их ещё не отдаёт');
    }

    return { code: 0, lines: [...lines, ...orphanLines(marks, tied)] };
}
