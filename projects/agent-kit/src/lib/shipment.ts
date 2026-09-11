/**
 * Сборка груза и команда отправки.
 *
 * Груз уезжает при каждом прогоне, а предложения и разборы — когда они есть: прогон без
 * замечаний тоже говорит, чем пользовались, чем не пользовались ни разу и что дерево
 * переопределило. Отправка, построенная вокруг предложения, эти данные теряла.
 *
 * Собирается груз здесь, а уезжает в `ship.ts`: сборка проверяется вызовом, а сеть в спеке
 * подменяется двойником.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import {
    CARGO_SCHEMA_VERSION,
    ICargoCount,
    ICargoOverride,
    IPostmortemItem,
    IPostmortemsCargo,
    IProposalItem,
    IProposalsCargo,
    ISummaryCargo,
} from './cargo.js';
import { IEnvironment, IOutcomeOfCommand } from './commands.js';
import { CONFIG_PATH, IConfig, readConfig } from './config.js';
import { IReadResult, ISummary, readObservations, summarize } from './observations.js';
import { IRefusedAnalysis, proseCheckOf, proseWhy, refusedAnalysesOf, TProseCheck } from './cargo-prose.js';
import {
    ILeak,
    IProposal,
    leaksIn,
    markProposals,
    markSent,
    marksOf,
    nearestMissing,
    ownMark,
    readProposals,
    skippedAsSentLines,
    TO_PACKAGE,
} from './proposals.js';
import { IShipment, IShipped, readToken, TShip } from './ship.js';
import { laidOutSkills, packagedNames, treeSnapshot, unpickedOf } from './snapshot.js';
import { byText } from './order.js';

/** Длина признака дерева. Двенадцати знаков хватает, чтобы деревья не сталкивались числом. */
const SLUG_LENGTH: number = 12;

/** Отказ команды: именованных кодов у пакета нет — есть код возврата и текст. */
const REFUSED: number = 1;

/** Ответ приёма о токене: по нему отказ добавляет строку про отзыв, а не гадает вслух. */
const TOKEN_REFUSED: number = 401;

/** Чем отправка живёт: чем отправлять, чем себя выдаёт дерево и за какой отрезок сводка. */
export interface IShipOptions {
    /** Печатать, что уехало бы, и не отправлять ничего. */
    readonly dryRun: boolean;
    readonly ship: TShip;
    /** Адрес удалённого репозитория этого дерева: из него считается признак. */
    readonly remote: string;
    /** Имена удалённых репозиториев. Нужны отказу: выбор между несколькими делает человек. */
    readonly remotes?: readonly string[];
    /** Сегодняшний день: своих часов у команды нет — иначе сводку за отрезок не проверить спекой. */
    readonly today: string;
    readonly days: number;
}

/**
 * Адрес удалённого репозитория, приведённый к одному виду.
 *
 * Форм у него несколько — `git@host:владелец/имя.git`, `https://host/владелец/имя`, — и все они
 * ведут к одному дереву. Две рабочие копии одного репозитория обязаны дать один признак, а
 * непривёденные формы дали бы два.
 */
export function remoteMarkOf(remote: string): string {
    const named: string = remote
        .trim()
        .replace(/\.git$/, '')
        .replace(/^[a-z+]+:\/\//i, '')
        .replace(/^[^@/]+@/, '')
        .replace(/:/g, '/');
    let end: number = named.length;

    while (end > 0 && named[end - 1] === '/') {
        end -= 1;
    }

    return named.slice(0, end).toLowerCase();
}

/**
 * Признак дерева: короткое значение, различающее деревья и не выдающее их адреса.
 *
 * Считается хешем от адреса репозитория: по нему адрес не восстанавливается, а у двух рабочих
 * копий одного репозитория он один. Репозитория нет — берётся то, что назвала настройка: иначе
 * все такие деревья слились бы в одно, и число деревьев в сводке стало бы неправдой молча.
 */
export function treeSlugOf(remote: string, spoken: string): string {
    const mark: string = remoteMarkOf(remote);

    return mark ? createHash('sha256').update(mark, 'utf8').digest('hex').slice(0, SLUG_LENGTH) : spoken;
}

/**
 * Счётчики по ресурсам пакета. Имя, которого пакет не знает, — имя правила самого дерева, и
 * наружу оно не едет: дерево называет свои правила по своим доменам и по себе самому.
 *
 * Число событий при этом остаётся полным: считается их столько, сколько было, — отброшены имена,
 * а не наблюдения.
 */
function knownCounts(counts: readonly ICargoCount[], known: ReadonlySet<string>): readonly ICargoCount[] {
    return counts.filter((count: ICargoCount): boolean => known.has(count.name));
}

/** Сводка наблюдений вместе со снимком надстроек — то, что уезжает первым запросом. */
export function summaryCargo(
    summary: ISummary,
    tree: string,
    overrides: readonly ICargoOverride[],
    unpicked: readonly string[],
    known: ReadonlySet<string>
): ISummaryCargo {
    return {
        tree,
        unpicked,
        overrides,
        schema: CARGO_SCHEMA_VERSION,
        days: summary.days,
        sessions: summary.sessions,
        loads: knownCounts(summary.loads, known),
        denials: knownCounts(summary.denials, known),
        // Род правки, на котором гейт отбивал, ресурсом не бывает: это `extension`, `command`
        // или `browser` — слова пакета, одинаковые у всех деревьев.
        kinds: summary.kinds,
        guards: knownCounts(summary.guards, known),
        unused: summary.unused,
        versions: summary.versions,
        total: summary.total,
    };
}

/**
 * Разборы происшествий, как они лежат на дереве.
 *
 * Текст едет целиком: разбор объясняет механизм промаха, и шапка без механизма не отвечает ни на
 * один вопрос, ради которого его читают.
 */
export function readPostmortems(root: string, dir: string): IPostmortemItem[] {
    const path: string = join(root, dir);

    if (!existsSync(path)) {
        return [];
    }

    return (
        readdirSync(path)
            // Описание каталога разбором не считается: оно объясняет, что здесь лежит, а не механизм
            // промаха, — и в приёме встало бы записью, которой нечего сказать.
            .filter((file: string): boolean => file.endsWith('.md') && file !== 'README.md')
            .sort(byText)
            .map((file: string): IPostmortemItem => ({ file, text: readFileSync(join(path, file), 'utf8') }))
    );
}

/**
 * Строки об отбитом: по строке на запись и одна на дерево, где судить было нечем.
 *
 * Печатаются они обоими прогонами: сухой показывает, что уехало бы, — и отбитое к этому
 * относится наравне с уезжающим. Молчание о неразложенной проверке читалось бы как проверка,
 * ничего не нашедшая.
 */
function refusalLines(
    refused: readonly IRefusedProposal[],
    analyses: readonly IRefusedAnalysis[],
    prose: TProseCheck,
    dir: string
): readonly string[] {
    const missing: readonly string[] = prose === null ? ['  слог не судился: проверка слога в дереве не разложена'] : [];

    return [
        ...refused.map((one: IRefusedProposal): string => `  отбито ${one.proposal.file}:${one.proposal.line} — ${one.why}`),
        ...analyses.map((one: IRefusedAnalysis): string => `  отбито ${dir}/${one.file} — ${one.why}`),
        ...missing,
    ];
}

/** Разборы, которые уезжают: те, что не отбиты по слогу. */
function sentAnalyses(analyses: readonly IPostmortemItem[], refused: readonly IRefusedAnalysis[]): readonly IPostmortemItem[] {
    return analyses.filter((one: IPostmortemItem): boolean => !refused.some((bad: IRefusedAnalysis): boolean => bad.file === one.file));
}

/** Что уезжает и в каком порядке: сводка первой — ею заводится запись месяца. */
export function shipmentsOf(summary: ISummaryCargo, proposals: IProposalsCargo, postmortems: IPostmortemsCargo): readonly IShipment[] {
    return [
        { kind: 'сводка', operation: 'summary', body: summary },
        ...(proposals.items.length ? [{ kind: 'предложения', operation: 'proposals', body: proposals }] : []),
        ...(postmortems.items.length ? [{ kind: 'разборы', operation: 'postmortems', body: postmortems }] : []),
    ];
}

/**
 * Что в грузе называет дерево, из которого он уезжает.
 *
 * Проверка накрывает сводку и предложения, но не разбор происшествия: разбор по устройству
 * называет файлы дерева, где промах случился, и накрытая проверка отбивала бы каждую его
 * отправку.
 */
export function leaksOfCargo(summary: ISummaryCargo, proposals: readonly IProposal[], marks: readonly string[]): string[] {
    const inSummary: string[] = leaksIn(JSON.stringify(summary, null, 1), marks).map(
        (leak: ILeak): string => `  сводка: ${leak.why}\n      ${leak.text}`
    );
    const inProposals: string[] = proposals.flatMap((entry: IProposal): string[] =>
        leaksIn(entry.body, marks).map(
            (leak: ILeak): string => `  ${entry.file}:${entry.line + leak.line} — ${leak.why}\n      ${leak.text}`
        )
    );

    return [...inSummary, ...inProposals];
}

/** Отказ строками. */
function refusal(...lines: readonly string[]): IOutcomeOfCommand {
    return { code: REFUSED, lines: [...lines] };
}

/** Что в отправляемом запросе, одной строкой: её читает человек перед тем, как отправить. */
function describe(shipment: IShipment, summary: ISummaryCargo, proposals: IProposalsCargo, postmortems: IPostmortemsCargo): string {
    if (shipment.operation === 'proposals') {
        return `предложений ${proposals.items.length}`;
    }
    if (shipment.operation === 'postmortems') {
        return `разборов ${postmortems.items.length}`;
    }

    return `наблюдений ${summary.total} за ${summary.days} дн., надстроек ${summary.overrides.length}, невыбранного ${summary.unpicked.length}`;
}

/** Блок, который не уехал, и причина этого. */
interface IRefusedProposal {
    readonly proposal: IProposal;
    readonly why: string;
}

/**
 * Отметка об отбое: отбитый блок остаётся на диске и несёт причину.
 *
 * Удалённый блок пишется следующим заходом заново — следа разбора нет, и повтор возвращается.
 * Отметка держит и то и другое: видно, что разбор был, и видно, почему он не стал правкой.
 */
function markRefused(root: string, refused: readonly IRefusedProposal[]): void {
    for (const one of refused) {
        const path: string = join(root, one.proposal.file);
        writeFileSync(path, markSent(readFileSync(path, 'utf8'), one.proposal, one.why, 'отбито'), 'utf8');
    }
}

/**
 * Перечень груза: что именно уедет и куда — строками, которые читаются до самой отправки.
 *
 * Печатается он обоими прогонами, и разделены они не окончанием глагола, а первой строкой:
 * «уехало» и «уехало бы» отличаются двумя буквами в хвосте, а строки под ними одинаковы до
 * знака. Прочитанный не тем прогоном, вывод сухого читается сделанной работой — и наоборот,
 * настоящая отправка читается пробой, после которой ничего не делают.
 */
function manifest(
    going: readonly IShipment[],
    summary: ISummaryCargo,
    proposals: IProposalsCargo,
    postmortems: IPostmortemsCargo
): readonly string[] {
    return going.map((shipment: IShipment): string => `  ${shipment.operation} — ${describe(shipment, summary, proposals, postmortems)}`);
}

/**
 * Что приём сказал о принятом: месяц записи, судьба самой записи и — у предложений — счёт
 * легшего и уже лежавшего.
 *
 * Без счёта строка одинакова и у прогона, привёзшего новое, и у прогона, у которого всё уже
 * лежало: человек читает второе как первое. Приём, счёта не приславший, оставляет строку
 * прежней — так же читаются сводка и разборы, у которых счёта нет вовсе.
 */
function accepted(shipped: IShipped): string {
    if (!shipped.accepted) {
        return 'принято';
    }

    const record: string = `${shipped.accepted.month}${shipped.accepted.created ? ', запись заведена' : ', запись дописана'}`;
    const added: number | undefined = shipped.accepted.added;

    return added === undefined ? record : `${record}, принято ${added}, уже лежало ${shipped.accepted.known ?? 0}`;
}

/**
 * Отказ, когда признак дерева считать не из чего. Случая два, и говорят они разное: репозитория
 * нет вовсе — считать не из чего; репозиториев несколько и `origin` среди них нет — адрес есть, а
 * выбрать его может только человек. Угаданное неверно сливает в сводке приёма два дерева в одно,
 * и увидеть это нечем.
 */
function noTreeMark(names: readonly string[]): IOutcomeOfCommand {
    if (names.length > 1) {
        return refusal(
            `признак дерева не считается: удалённых репозиториев несколько, а \`origin\` среди них нет — ${names.join(', ')}`,
            `переименуй тот, что называет это дерево, в \`origin\` — либо назови признак ключом \`tree\` в ${CONFIG_PATH}`
        );
    }

    return refusal(
        'признак дерева не считается: удалённого репозитория нет',
        `назови его ключом \`tree\` в ${CONFIG_PATH} — иначе деревья без репозитория сольются в одно`
    );
}

/**
 * Сами запросы. Отправленное помечается сразу, а не после всех: оборвавшаяся отправка иначе
 * увозит половину и не оставляет следа, по которому видно, какую именно.
 */
async function send(
    root: string,
    intake: string,
    tree: string,
    token: string,
    ship: TShip,
    going: readonly IShipment[],
    proposals: readonly IProposal[],
    listed: readonly string[]
): Promise<IOutcomeOfCommand> {
    // Что уедет, названо до того, как уехало: отказ на втором запросе иначе оставляет человека с
    // одной строкой о нём и без перечня, из которого видно, чего этот отказ стоил.
    const head: readonly string[] = [`ОТПРАВКА — груз уходит в ${intake}, дерево ${tree}:`, ...listed];
    const done: string[] = [];

    for (const shipment of going) {
        const shipped: IShipped = await ship(intake, token, shipment);

        if (!shipped.ok) {
            return {
                code: REFUSED,
                lines: [
                    ...head,
                    ...(done.length ? [`уехало до отказа: ${done.length}`, ...done] : ['не уехало ничего']),
                    `${shipment.kind}: ${intake} ответил ${shipped.status || 'молчанием'} — ${shipped.said}`,
                    ...(shipped.status === TOKEN_REFUSED
                        ? ['токен не принят: он отозван или заведён не тот — выдай новый командой приёма']
                        : []),
                ],
            };
        }

        done.push(`  ${shipment.kind} → ${accepted(shipped)}`);

        if (shipment.operation === 'proposals') {
            markProposals(root, proposals, ownMark(shipped.accepted?.month ?? 'принято'));
        }
    }

    return { code: 0, lines: [...head, 'уехало:', ...done] };
}

/**
 * Отправка груза в приём.
 *
 * Порядок отказов не случаен: выключенная запись отвечает нулём и молчит про адрес — она гасит
 * отправку целиком, вместе со снимком надстроек, и спрашивать про адрес у выключенного дерева
 * незачем.
 */
export async function propose(env: IEnvironment, options: IShipOptions): Promise<IOutcomeOfCommand> {
    const { root, assetsDir } = env;
    const config: IConfig | null = readConfig(root);

    if (!config) {
        return refusal(`конфига нет: ${CONFIG_PATH} — заводится \`agent-kit init\``);
    }
    if (!config.observe) {
        return {
            code: 0,
            lines: [
                'запись наблюдений выключена ключом `observe` в конфиге — наружу не ушло ничего',
                'выключатель гасит и отправку целиком, вместе со снимком надстроек',
            ],
        };
    }
    if (!config.intake) {
        return refusal(
            'отправлять некуда: адреса приёма нет',
            `он объявляется ключом \`intake\` в ${CONFIG_PATH}, а само значение берётся у владельца приёма — вместе с кодом приглашения`
        );
    }

    const tree: string = treeSlugOf(options.remote, config.tree);
    if (!tree) {
        return noTreeMark(options.remotes ?? []);
    }

    const token: string = readToken(root, config.token);
    if (!token) {
        return refusal(
            'токена дерева нет: груз остался неотправленным',
            `файл с ним называется ключом \`token\` в ${CONFIG_PATH} и лежит вне дерева`,
            'выдаётся токен командой приёма — `tree:add` или `tree:token`'
        );
    }

    const read: IReadResult = readObservations(root, options.today, options.days);
    const summary: ISummary = summarize(read.observations, laidOutSkills(config, assetsDir), options.days);
    const cargo: ISummaryCargo = summaryCargo(
        summary,
        tree,
        treeSnapshot(config, assetsDir, root),
        unpickedOf(config, assetsDir),
        packagedNames(config, assetsDir)
    );

    const addressed: readonly IProposal[] = readProposals(root).filter((entry: IProposal): boolean => entry.address === TO_PACKAGE);
    const ready: readonly IProposal[] = addressed.filter((entry: IProposal): boolean => !entry.sent);
    const skipped: readonly IProposal[] = addressed.filter((entry: IProposal): boolean => Boolean(entry.sent));
    // Блок, не назвавший ближайшего утверждения ресурса, не уезжает: разбор, кончившийся ещё
    // одной статьёй о том, о чём статья уже стоит, снаружи неотличим от разбора, кончившегося
    // исправлением. Отбивается он поимённо, а остальные едут: один непрочитанный ресурс не
    // повод задержать чужую работу.
    // Слог судится тем же отбором: запись груза читает человек, а пишет её заход — словами слоя
    // правил. Проверка берётся разложенной в дерево: её признаки лежат в настройке дерева, и
    // дерево без неё отправляет как прежде.
    const prose: TProseCheck = proseCheckOf(root, config.layout.checks);
    const refused: readonly IRefusedProposal[] = ready
        .map((entry: IProposal): IRefusedProposal => ({
            proposal: entry,
            why: nearestMissing(entry, assetsDir) || proseWhy(prose, entry.body),
        }))
        .filter((entry: IRefusedProposal): boolean => Boolean(entry.why));
    const mine: readonly IProposal[] = ready.filter(
        (entry: IProposal): boolean => !refused.some((one: IRefusedProposal): boolean => one.proposal === entry)
    );
    const proposals: IProposalsCargo = {
        tree,
        schema: CARGO_SCHEMA_VERSION,
        items: mine.map((entry: IProposal): IProposalItem => ({ text: entry.body, address: entry.address, resource: entry.resource })),
    };
    const analyses: readonly IPostmortemItem[] = readPostmortems(root, config.postmortems);
    const refusedAnalyses: readonly IRefusedAnalysis[] = refusedAnalysesOf(prose, analyses);
    const postmortems: IPostmortemsCargo = { tree, schema: CARGO_SCHEMA_VERSION, items: sentAnalyses(analyses, refusedAnalyses) };

    // Проверка на адрес дерева судит все готовые блоки, а не одни уезжающие: отбитый по цитате
    // лежит на диске и уедет, как только его починят, — а найденная в нём утечка отбивает
    // отправку целиком и должна называться сразу.
    const leaked: readonly string[] = leaksOfCargo(cargo, ready, marksOf(root, options.remote));
    if (leaked.length) {
        return refusal(
            `отправка не начата: в грузе назван адрес этого дерева — ${leaked.length}`,
            ...leaked,
            'найденное отбивает отправку целиком: «уехало два из трёх» читается как «всё в порядке»'
        );
    }

    const going: readonly IShipment[] = shipmentsOf(cargo, proposals, postmortems);

    const listed: readonly string[] = manifest(going, cargo, proposals, postmortems);
    const skippedLines: readonly string[] = skippedAsSentLines(skipped);
    // Отбитое называется обоими прогонами: сухой показывает, что уехало бы, — и отбитое к этому
    // относится наравне с уезжающим.
    const refusedLines: readonly string[] = refusalLines(refused, refusedAnalyses, prose, config.postmortems);

    if (options.dryRun) {
        return {
            code: 0,
            lines: [
                'СУХОЙ ПРОГОН — наружу не ушло ничего, отметок об отправке не поставлено',
                `уехало бы в ${config.intake}, дерево ${tree}:`,
                ...listed,
                ...refusedLines,
                ...skippedLines,
                ...(read.silent ? ['наблюдений не велось ни разу — сводка уезжает снимком надстроек'] : []),
                // Токен сухой прогон не проверяет: приём отвечает о нём только на настоящем
                // вызове. Молчание об этом читалось как «отправка пройдёт», и заход узнавал об
                // отказе приёма после того, как объявил груз уехавшим.
                'токен приём здесь не проверял: годен ли он, отвечает только настоящая отправка',
                'отправляет это тот же вызов без `--dry-run`',
            ],
        };
    }

    // Отметка ставится до отправки: отбитое наружу не едет вовсе, и ждать ответа приёма ей
    // незачем.
    markRefused(root, refused);

    const outcome: IOutcomeOfCommand = await send(root, config.intake, tree, token, options.ship, going, mine, [
        ...listed,
        ...refusedLines,
        ...skippedLines,
    ]);

    return outcome;
}
