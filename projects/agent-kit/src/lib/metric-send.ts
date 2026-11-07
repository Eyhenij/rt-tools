/**
 * Отправка строк дня без команды человека.
 *
 * Едут только числа: разборы, предложения и сводка несут текст и уходят командой `propose`, и пути к ним
 * у этой отправки нет. Запускают её проверки, поэтому она обязана молчать, не падать и не повторять
 * то, что уже не получилось: сбой пишется в метку, а не на экран.
 */
import { createHash, randomBytes } from 'node:crypto';
import { closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { collectAssets, IAsset } from './assets.js';
import { CARGO_SCHEMA_VERSION, ICargoOverride, IMetricsDayCargo } from './cargo.js';
import { IEnvironment, IOutcomeOfCommand } from './commands.js';
import { CONFIG_PATH, IConfig, readConfig } from './config.js';
import { dayMetrics, ITreeFacts } from './metric-lines.js';
import { IMetricsReport, METRICS_DEFAULT_DAYS, reportOf } from './metrics.js';
import { dayBefore, IObservation, KEEP_DAYS, OBSERVATIONS_DIR, observationsOfDay, readObservations } from './observations.js';
import { byText } from './order.js';
import { collectOutcomes, EOutcomesRead } from './outcomes.js';
import { IShipped, readToken, TShip } from './ship.js';
import { packageSections, treeSnapshot } from './snapshot.js';
import { treeSlugOf } from './tree-mark.js';

/** Копия пробует не чаще: проверки срабатывают сотнями за сессию. */
export const SEND_EVERY_MS: number = 15 * 60 * 1000;

/** Замок мёртвой отправки: дольше живой она не идёт, а файл не должен закрыть копию навсегда. */
const LOCK_STALE_MS: number = 10 * 60 * 1000;

const DAY_FILE: RegExp = /^(\d{4}-\d{2}-\d{2})\.jsonl$/;

/** Причина сбоя числом: в строке дня текста быть не может. */
export enum ESendFault {
    None = 0,
    Network = 1,
    TokenRefused = 2,
    LineRefused = 3,
    Intake = 4,
}

/** Что отправка помнит о себе. Лежит в копии: у каждой свой отрезок и свой сбой. */
export interface ISendMark {
    readonly tried: number;
    readonly succeeded: number;
    /** День последней удачной отправки: окно идёт от него. */
    readonly day: string;
    readonly fault: ESendFault;
    readonly reason: string;
    /** Сумма токена, который приём отказал: новый файл снимает остановку. */
    readonly refusedToken: string;
}

export interface ISendOptions {
    /** Запустила проверка: ни строки на экран, срок и отказанный токен соблюдаются. */
    readonly quiet: boolean;
    /** Конец сессии: срок не важен, замок важен. */
    readonly now: Date;
    readonly force: boolean;
    readonly remote: string;
    readonly ship: TShip;
}

const EMPTY_MARK: ISendMark = { tried: 0, succeeded: 0, day: '', fault: ESendFault.None, reason: '', refusedToken: '' };

function marksDir(root: string): string {
    return join(root, OBSERVATIONS_DIR, '.marks');
}

function markPath(root: string): string {
    return join(marksDir(root), 'send.json');
}

/** Метка копии. Битая читается как пустая: отправка не должна остановиться из-за своей записи. */
export function readSendMark(root: string): ISendMark {
    try {
        return { ...EMPTY_MARK, ...(JSON.parse(readFileSync(markPath(root), 'utf8')) as Partial<ISendMark>) };
    } catch {
        return EMPTY_MARK;
    }
}

function writeSendMark(root: string, mark: ISendMark): void {
    writeFileSync(markPath(root), `${JSON.stringify(mark)}\n`);
}

/** Признак копии: случайное значение, первая отправка заводит его сама. */
function copySign(root: string): string {
    const path: string = join(marksDir(root), 'copy');

    if (existsSync(path)) {
        return readFileSync(path, 'utf8').trim();
    }
    const sign: string = randomBytes(8).toString('hex');

    writeFileSync(path, `${sign}\n`);

    return sign;
}

function tokenSign(token: string): string {
    return createHash('sha256').update(token).digest('hex').slice(0, 16);
}

/** Замок копии. `false`: идёт другая отправка. */
function takeLock(root: string, now: Date): boolean {
    const path: string = join(marksDir(root), 'send.lock');

    if (existsSync(path) && now.getTime() - statSync(path).mtimeMs > LOCK_STALE_MS) {
        rmSync(path, { force: true });
    }
    try {
        closeSync(openSync(path, 'wx'));

        return true;
    } catch {
        return false;
    }
}

function dropLock(root: string): void {
    rmSync(join(marksDir(root), 'send.lock'), { force: true });
}

/** Дни окна: от последней удачи, не дальше срока хранения. Сегодняшний идёт всегда: он несёт числа дерева. */
export function windowDays(names: readonly string[], lastDay: string, today: string): readonly string[] {
    const edge: string = dayBefore(today, KEEP_DAYS);
    const since: string = byText(lastDay, edge) > 0 ? lastDay : edge;
    const days: readonly string[] = names
        .map((name: string): string | null => DAY_FILE.exec(name)?.[1] ?? null)
        .filter((day: string | null): day is string => day !== null && byText(day, since) >= 0 && byText(day, today) < 0);

    return [...new Set([...days, today])].sort(byText);
}

function dayOf(root: string, day: string): readonly IObservation[] {
    const path: string = join(root, OBSERVATIONS_DIR, `${day}.jsonl`);

    return existsSync(path) ? observationsOfDay(path) : [];
}

function factsOf(env: IEnvironment, config: IConfig, today: string, read: EOutcomesRead, fault: ESendFault): ITreeFacts {
    const report: IMetricsReport = reportOf(
        env,
        config,
        today,
        readObservations(env.root, today, METRICS_DEFAULT_DAYS),
        METRICS_DEFAULT_DAYS,
        read
    );
    const overridden: number = treeSnapshot(config, env.assetsDir, env.root).filter(
        (one: ICargoOverride): boolean => one.kind === 'replace'
    ).length;

    return {
        rulesLaidOut: report.rules,
        rulesDead: report.deadRules?.length ?? null,
        sectionsTotal: packageSections(config, env.assetsDir),
        sectionsOverridden: overridden,
        entryChars: report.entryChars,
        outcomesBroken: read === EOutcomesRead.Read || read === EOutcomesRead.NobodyToAsk ? 0 : 1,
        sendFault: fault,
    };
}

function faultOf(shipped: IShipped): ESendFault {
    if (shipped.status === 0) {
        return ESendFault.Network;
    }
    if (shipped.status === 401) {
        return ESendFault.TokenRefused;
    }

    return shipped.status < 500 ? ESendFault.LineRefused : ESendFault.Intake;
}

/** Старый штамп значит, что новая строка уже лежит: это не сбой. */
function went(shipped: IShipped): boolean {
    return shipped.ok || shipped.status === 409;
}

interface ISendWork {
    readonly env: IEnvironment;
    readonly config: IConfig;
    readonly tree: string;
    readonly token: string;
    readonly options: ISendOptions;
}

/** Строки окна по одной: упавшая останавливает отправку, следующая попытка начнёт с того же дня. */
async function shipLines(work: ISendWork, mark: ISendMark, today: string): Promise<IShipped | null> {
    const { env, config, tree, token, options } = work;
    const assets: readonly IAsset[] = collectAssets(config, env.assetsDir);
    const read: EOutcomesRead = collectOutcomes(env.root, today, env.version);
    const origin: string = copySign(env.root);
    const names: readonly string[] = readdirSync(join(env.root, OBSERVATIONS_DIR));

    for (const day of windowDays(names, mark.day, today)) {
        const facts: ITreeFacts | null = day === today ? factsOf(env, config, today, read, mark.fault) : null;
        const cargo: IMetricsDayCargo = {
            tree,
            origin,
            day,
            schema: CARGO_SCHEMA_VERSION,
            version: env.version,
            stamp: options.now.getTime(),
            metrics: dayMetrics(dayOf(env.root, day), assets, facts),
        };
        const shipped: IShipped = await options.ship(config.intake, token, {
            kind: 'строка дня',
            operation: 'metrics',
            body: cargo,
        });

        if (!went(shipped)) {
            return shipped;
        }
    }

    return null;
}

/** Причина для человека: сама метка и строка команды. */
function failed(mark: ISendMark, shipped: IShipped, token: string, now: Date): ISendMark {
    const fault: ESendFault = faultOf(shipped);

    return {
        ...mark,
        tried: now.getTime(),
        fault,
        reason: `${shipped.status || 'нет ответа'}: ${shipped.said}`.slice(0, 200),
        refusedToken: fault === ESendFault.TokenRefused ? tokenSign(token) : '',
    };
}

async function sendLocked(work: ISendWork, mark: ISendMark, today: string): Promise<ISendMark> {
    const { env, token, options } = work;

    writeSendMark(env.root, { ...mark, tried: options.now.getTime() });

    const stopped: IShipped | null = await shipLines(work, mark, today);
    const next: ISendMark = stopped
        ? failed(mark, stopped, token, options.now)
        : { ...EMPTY_MARK, tried: options.now.getTime(), succeeded: options.now.getTime(), day: today };

    writeSendMark(env.root, next);

    return next;
}

function said(options: ISendOptions, code: number, lines: readonly string[]): IOutcomeOfCommand {
    return { code: options.quiet ? 0 : code, lines: options.quiet ? [] : lines };
}

/** Рано ли пробовать: срок не вышел или приём отказал этот же токен. */
function tooEarly(mark: ISendMark, token: string, options: ISendOptions): boolean {
    if (!options.quiet) {
        return false;
    }

    return mark.refusedToken === tokenSign(token) || (!options.force && options.now.getTime() - mark.tried < SEND_EVERY_MS);
}

/** Команда `agent-kit send`: строки дня окна и ничего больше. */
export async function sendMetrics(env: IEnvironment, options: ISendOptions): Promise<IOutcomeOfCommand> {
    const config: IConfig | null = readConfig(env.root);

    if (!config) {
        return said(options, 1, [`конфига нет: ${CONFIG_PATH} — заводится \`agent-kit init\``]);
    }
    if (!config.observe || !config.send) {
        return said(options, 0, ['отправка выключена ключом в конфиге: запрос не уходит']);
    }
    const token: string = readToken(env.root, config.token);
    const tree: string = treeSlugOf(options.remote, config.tree);

    if (!config.intake || !token || !tree) {
        return said(options, 0, ['адреса приёма, токена или признака дерева нет: запрос не уходит']);
    }
    mkdirSync(marksDir(env.root), { recursive: true });

    const mark: ISendMark = readSendMark(env.root);

    if (tooEarly(mark, token, options) || !takeLock(env.root, options.now)) {
        return said(options, 0, ['отправка идёт или только что была: запрос не уходит']);
    }
    try {
        const done: ISendMark = await sendLocked({ env, config, tree, token, options }, mark, options.now.toISOString().slice(0, 10));

        return done.fault === ESendFault.None
            ? said(options, 0, ['строки дня отправлены'])
            : said(options, 1, [`отправка не удалась — ${done.reason}`]);
    } finally {
        dropLock(env.root);
    }
}

/** Сбой отправки словами: его называют `doctor` и начало сессии. Пусто: сбоя нет. */
export function sendFaultLines(root: string): readonly string[] {
    const mark: ISendMark = readSendMark(root);

    if (mark.fault === ESendFault.None) {
        return [];
    }

    return [
        `последняя отправка чисел не удалась: ${mark.reason}`,
        ...(mark.refusedToken ? ['попытки остановлены, пока файл токена не сменится'] : []),
    ];
}
