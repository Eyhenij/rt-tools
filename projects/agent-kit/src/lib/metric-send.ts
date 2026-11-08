/**
 * Отправка строк дня без команды человека.
 *
 * Едут только числа: разборы, предложения и сводка несут текст и уходят командой `propose`, и пути к ним
 * у этой отправки нет. Запускают её проверки, поэтому она обязана молчать, не падать и не повторять
 * то, что уже не получилось: сбой пишется в метку, а не на экран.
 */
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { collectAssets, IAsset } from './assets.js';
import { CARGO_SCHEMA_VERSION, ICargoOverride, IMetricsDayCargo, isMetricVersion } from './cargo.js';
import { IEnvironment, IOutcomeOfCommand } from './commands.js';
import { CONFIG_PATH, IConfig, readConfig } from './config.js';
import { dropFileLock, takeFileLock } from './file-lock.js';
import { dayMetrics } from './metric-lines.js';
import { ESendFault, ISendMark, ITreeFacts, marksDir, markPath, readSendMark } from './metric-send-mark.js';
import { IMetricsReport, METRICS_DEFAULT_DAYS, reportOf } from './metrics.js';
import { dayBefore, IObservation, KEEP_DAYS, OBSERVATIONS_DIR, observationsOfDay, openMarksDir, readObservations } from './observations.js';
import { byText } from './order.js';
import { collectOutcomes, EOutcomesRead } from './outcomes.js';
import { ILeak, leaksIn } from './proposals.js';
import { IShipped, readToken, TShip } from './ship.js';
import { packageSections, treeSnapshot } from './snapshot.js';
import { treeSlugOf } from './tree-mark.js';

/** Копия пробует не чаще: проверки срабатывают сотнями за сессию. */
export const SEND_EVERY_MS: number = 15 * 60 * 1000;

const DAY_FILE: RegExp = /^(\d{4}-\d{2}-\d{2})\.jsonl$/;

/** Код строки, которую отказала сама отправка: до приёма она не дошла. */
const LEAK_STATUS: number = -1;

export interface ISendOptions {
    /** Запустила проверка: ни строки на экран, срок и отказанный токен соблюдаются. */
    readonly quiet: boolean;
    /** Конец сессии: срок не важен, замок важен. */
    readonly now: Date;
    readonly force: boolean;
    readonly remote: string;
    readonly ship: TShip;
}

/** Чем удачная отправка чистит следы сбоя. */
const CLEAN_MARK: Pick<ISendMark, 'fault' | 'reason' | 'refusedToken' | 'faultSince'> = {
    fault: ESendFault.None,
    reason: '',
    refusedToken: '',
    faultSince: 0,
};

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

/**
 * Версия дня берётся из его записей. Вчерашний день уходит заново каждое утро, и версия пакета на эту
 * минуту перенесла бы последний день перед обновлением в счёт после него.
 */
function versionOfDay(observations: readonly IObservation[], version: string): string {
    const written: string | undefined = observations
        .map((entry: IObservation): string => entry.version)
        .filter((one: string): boolean => isMetricVersion(one))
        .at(-1);

    return written ?? version;
}

function factsOf(env: IEnvironment, config: IConfig, today: string, read: EOutcomesRead, fault: ESendFault): ITreeFacts {
    const report: IMetricsReport = reportOf(
        env,
        config,
        today,
        readObservations(env.root, today, METRICS_DEFAULT_DAYS, false),
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
        outcomesBroken: read === EOutcomesRead.Failed ? 1 : 0,
        outcomesUnread: read === EOutcomesRead.NobodyToAsk ? 1 : 0,
        sendFault: fault,
    };
}

function faultOf(shipped: IShipped): ESendFault {
    if (shipped.status === LEAK_STATUS) {
        return ESendFault.Leak;
    }
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

/** Чем кончились строки окна. `facts` заполнены, только если сегодняшняя строка дошла. */
interface IShipOutcome {
    readonly stopped: IShipped | null;
    readonly facts: ITreeFacts | null;
}

/** Сбой держится в числах своего дня: следующая удачная строка того же дня не должна его снять. */
function faultOfDay(mark: ISendMark, today: string): ESendFault {
    return mark.fault || (mark.factsByDay[today]?.sendFault ?? ESendFault.None);
}

/**
 * Строка уходит, только если в именах её ключей нет адреса дерева. Числа и имена пакета его не несут, а
 * проверка стоит на случай, когда это перестанет быть правдой: такая строка не уходит, пока груз не
 * изменится. Последнее звено пути здесь не судится: копия по имени `testing` закрыла бы правило пакета.
 */
async function shipLine(work: ISendWork, cargo: IMetricsDayCargo): Promise<IShipped> {
    const marks: readonly string[] = [work.env.root, work.options.remote];
    const leak: ILeak | undefined = leaksIn(Object.keys(cargo.metrics).join('\n'), marks)[0];

    if (leak) {
        return { ok: false, status: LEAK_STATUS, said: leak.why, accepted: null };
    }

    return work.options.ship(work.config.intake, work.token, { kind: 'строка дня', operation: 'metrics', body: cargo });
}

/** Отказанная строка закрывает только свой день: остальные дни, сегодняшний тоже, дойти могут. */
function stopsTheWindow(shipped: IShipped): boolean {
    const fault: ESendFault = faultOf(shipped);

    return fault !== ESendFault.LineRefused && fault !== ESendFault.Leak;
}

/** Строки окна по одной: сбой останавливает отправку, следующая попытка начнёт с того же дня. */
async function shipLines(work: ISendWork, mark: ISendMark, today: string): Promise<IShipOutcome> {
    const { env, config, tree, options } = work;
    const assets: readonly IAsset[] = collectAssets(config, env.assetsDir);
    const read: EOutcomesRead = collectOutcomes(env.root, today, env.version);
    const origin: string = copySign(env.root);
    const names: readonly string[] = readdirSync(join(env.root, OBSERVATIONS_DIR));
    const fresh: ITreeFacts = factsOf(env, config, today, read, faultOfDay(mark, today));
    let refused: IShipped | null = null;
    let sent: ITreeFacts | null = null;

    for (const day of windowDays(names, mark.day, today)) {
        const observations: readonly IObservation[] = dayOf(env.root, day);
        const cargo: IMetricsDayCargo = {
            tree,
            origin,
            day,
            schema: CARGO_SCHEMA_VERSION,
            version: versionOfDay(observations, env.version),
            stamp: options.now.getTime(),
            metrics: dayMetrics(observations, assets, day === today ? fresh : (mark.factsByDay[day] ?? null)),
        };
        const shipped: IShipped = await shipLine(work, cargo);

        if (went(shipped)) {
            sent = day === today ? fresh : sent;
        } else if (stopsTheWindow(shipped)) {
            return { facts: sent, stopped: shipped };
        } else {
            refused ??= shipped;
        }
    }

    return { facts: sent, stopped: refused };
}

/** Причина для человека: сама метка и строка команды. */
function failed(mark: ISendMark, shipped: IShipped, token: string, now: Date): ISendMark {
    const fault: ESendFault = faultOf(shipped);

    return {
        ...mark,
        tried: now.getTime(),
        faultSince: mark.faultSince || now.getTime(),
        fault,
        reason: (fault === ESendFault.Leak ? shipped.said : `${shipped.status || 'нет ответа'}: ${shipped.said}`).slice(0, 200),
        refusedToken: fault === ESendFault.TokenRefused ? tokenSign(token) : '',
    };
}

async function sendLocked(work: ISendWork, mark: ISendMark, today: string): Promise<ISendMark> {
    const { env, token, options } = work;

    writeSendMark(env.root, { ...mark, tried: options.now.getTime() });

    const { stopped, facts }: IShipOutcome = await shipLines(work, mark, today);
    const counted: Readonly<Record<string, ITreeFacts>> = facts ? { [today]: facts } : {};
    const next: ISendMark = stopped
        ? failed({ ...mark, factsByDay: { ...mark.factsByDay, ...counted } }, stopped, token, options.now)
        : { ...mark, ...CLEAN_MARK, factsByDay: counted, tried: options.now.getTime(), succeeded: options.now.getTime(), day: today };

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
        return said(options, 1, ['адреса приёма, токена или признака дерева нет: запрос не уходит']);
    }
    openMarksDir(marksDir(env.root));

    const mark: ISendMark = readSendMark(env.root);
    const lock: string = join(marksDir(env.root), 'send.lock');

    if (tooEarly(mark, token, options) || !takeFileLock(lock, options.now.getTime())) {
        return said(options, 0, ['отправка идёт или только что была: запрос не уходит']);
    }
    try {
        const done: ISendMark = await sendLocked({ env, config, tree, token, options }, mark, options.now.toISOString().slice(0, 10));

        return done.fault === ESendFault.None
            ? said(options, 0, ['строки дня отправлены'])
            : said(options, 1, [`отправка не удалась — ${done.reason}`]);
    } finally {
        dropFileLock(lock);
    }
}
