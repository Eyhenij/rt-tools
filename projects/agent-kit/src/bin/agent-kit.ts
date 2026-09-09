#!/usr/bin/env node
/**
 * Точка входа. Разбирает аргументы, добывает выбор проекта, зовёт команду и печатает то, что
 * она вернула. Своей работы у неё нет: всё, что решает, живёт в `commands.ts` и проверяется
 * спеками — кроме одного, чего команде знать не по чину: откуда взялся выбор законов. У строки
 * запуска это флаг, у терминала — вопрос, у прогона без терминала нет ни того ни другого.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

import { unknownFlagsIn } from '../lib/argv.js';
import { IEntryOfCatalog, readCatalog, resolveSelection } from '../lib/catalog.js';
import { adopt, doctor, IEnvironment, init, IOutcomeOfCommand, list, stats, sync } from '../lib/commands.js';
import { CONFIG_PATH, IConfig, readConfig } from '../lib/config.js';
import { costLines, costOf, CostUnavailableError, ICost } from '../lib/cost.js';
import { enroll, httpEnroll } from '../lib/enroll.js';
import { httpReadOwn, httpShip } from '../lib/ship.js';
import { fate } from '../lib/fate.js';
import { propose, treeSlugOf } from '../lib/shipment.js';
import { DEFAULT_DAYS } from '../lib/observations.js';
import { staleBuild } from '../lib/freshness.js';
import { packageRootFrom } from '../lib/package-root.js';
import { IChoice } from '../lib/picker.js';
import { IAxis, IOptionOfAxis, readAxes } from '../lib/variants.js';
import { ask, askOne, canAsk } from './prompt.js';

const USAGE: readonly string[] = [
    'agent-kit <команда>',
    '',
    '  init            завести .claude/rt-kit.json и каталог надстроек',
    '  list            что везёт пакет и что из этого взято здесь',
    '  sync            разложить ресурсы пакета в дерево проекта',
    '  sync --check    ничего не писать, отказать при расхождении — для гейта пуша',
    '  doctor          рассказать о состоянии раскладки, ничего не меняя',
    '  cost            посчитать цену контекста: вход в работу, одно правило, весь слой',
    '  cost --rule <имя>   какое правило взвесить; без довода берётся самое тяжёлое',
    '  cost --json     то же машиночитаемо — этим числа кладут в замысел',
    '  stats           свести наблюдения: чем пользовались, чем ни разу, обо что спотыкались',
    '  stats --days N  за сколько дней; без довода — за три',
    '  stats --json    то же машиночитаемо — этим сводку прикладывают к предложению',
    '  propose         отправить груз в приём: сводку со снимком надстроек, предложения и разборы',
    '  fate            судьба своих записей в приёме и надстройки, которые пора снять',
    '  propose --dry-run   показать, что уехало бы, и ничего не отправлять',
    '  adopt [файлы]   отдать пакету файлы, лежащие на его путях не от него',
    '  enroll --code <код>    завести дерево по приглашению владельца: обмен кода на токен',
    '  enroll --token <токен> завести дерево токеном, выданным в админке приёма; в сеть не идёт',
    '  enroll --force         перезаписать уже лежащий токен намеренно',
    '',
    '  --root <путь>   корень проекта; по умолчанию текущий каталог',
    '',
    'Выбор законов при `init`:',
    '',
    '  --all             взять все законы, ни о чём не спрашивая',
    '  --laws a,b,c      взять только названные; имена — из `agent-kit list`',
    '  без обоих         спросить галочками; без терминала — отказ',
    '',
    'Вид ресурсов при `init` — там, где один закон исполняется разными командами:',
    '',
    '  --<ось> <вид>     например `--host gitlab`; оси и виды — из `agent-kit list`',
    '  без флага         спросить; без терминала — отказ, кроме `--all`',
];

/**
 * Доводы отправки. Довод со значением помечен `<>`: за ним идёт отдельным словом путь, и без
 * пометки этот путь читался бы как ещё один незнакомый довод.
 */
const PROPOSE_FLAGS: readonly string[] = ['--dry-run', '--root <>'];

/** Что печатает отказ на незнакомом доводе: режимы команды, а не весь свод. */
const PROPOSE_USAGE: readonly string[] = [
    '  propose             отправить груз в приём',
    '  propose --dry-run   показать, что уехало бы, и ничего не отправлять',
    '  --root <путь>       корень проекта; по умолчанию текущий каталог',
];

/**
 * Единственное место, где пакет узнаёт собственное расположение. `import.meta` живёт только
 * здесь: библиотечные модули получают каталог ресурсов входным значением, и трансформ тестов,
 * разбирающий модули как CommonJS, на них уже не спотыкается.
 */
function environmentOf(root: string): IEnvironment {
    const pkg: string = packageRootFrom(dirname(fileURLToPath(import.meta.url)));
    const manifest: { name: string; version: string } = JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8')) as {
        name: string;
        version: string;
    };

    return {
        root,
        version: manifest.version,
        // Имя из манифеста, а не записанное здесь: по нему пакет ищет себя в зависимостях дерева,
        // и своя копия имени разошлась бы с манифестом молча — у всякого, кто пакет переименовал.
        name: manifest.name,
        assetsDir: join(pkg, 'assets'),
        // Сверка со своими исходниками возможна только отсюда: здесь пакет знает, где лежит сам.
        // У потребителя исходников рядом нет, и сверка молчит.
        stale: staleBuild(pkg, manifest.name),
    };
}

/** Вывод git в этом дереве. Отказ и пустота здесь одно и то же: адреса нет — и это не отказ. */
function gitSays(root: string, args: readonly string[]): string {
    try {
        // eslint-disable-next-line sonarjs/no-os-command-from-path -- путь к git у каждой машины свой, и прибитый здесь сделал бы пакет непереносимым
        return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
        return '';
    }
}

/** Имена удалённых репозиториев этого дерева, по одному в строке. */
function remoteNames(root: string): readonly string[] {
    return gitSays(root, ['remote'])
        .split('\n')
        .map((name: string): string => name.trim())
        .filter(Boolean);
}

/**
 * Чем это дерево себя выдаёт снаружи. Нет удалённого репозитория — нечем, и это не отказ.
 *
 * Имя `origin` — соглашение, а не устройство: рабочая копия, назвавшая свои remotes по хостам,
 * на которые смотрит, оставалась без адреса вовсе, и отправка отказывала словами «удалённого
 * репозитория нет» — при том что репозиторий у неё есть, и не один. Порядок поэтому такой:
 * `origin`, если он есть; ровно один remote — он; несколько без `origin` — адреса нет, и выбор
 * за человеком. Угадать здесь нельзя: угаданное неверно сливает в сводке приёма два дерева в
 * одно, а увидеть это нечем.
 */
function remoteOf(root: string): string {
    const names: readonly string[] = remoteNames(root);

    if (names.includes('origin')) {
        return gitSays(root, ['remote', 'get-url', 'origin']);
    }

    return names.length === 1 ? gitSays(root, ['remote', 'get-url', names[0]]) : '';
}

function optionOf(argv: readonly string[], name: string, fallback: string): string {
    const index: number = argv.indexOf(name);

    return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
}

const isOutcome: (value: unknown) => value is IOutcomeOfCommand = (value: unknown): value is IOutcomeOfCommand =>
    typeof value === 'object' && value !== null && 'code' in value;

/**
 * Выбор законов для `init`: список идентификаторов, `null` на брошенном выборе или готовый
 * отказ. Пустой список означает «взять всё», поэтому брошенный выбор отличается от него не
 * значением, а `null`: подставить «всё» вместо неотвеченного вопроса значило бы разложить
 * пятнадцать законов тому, кто как раз просил спросить.
 */
async function selectionFor(argv: readonly string[], assetsDir: string): Promise<readonly string[] | null | IOutcomeOfCommand> {
    if (argv.includes('--all')) {
        return [];
    }

    const catalog: readonly IEntryOfCatalog[] = readCatalog(assetsDir);
    const spoken: string = optionOf(argv, '--laws', '');

    if (spoken) {
        const named: string[] = spoken
            .split(',')
            .map((name: string): string => name.trim())
            .filter(Boolean);
        const { ids, unknown } = resolveSelection(named, 'laws', catalog);

        return unknown.length
            ? { code: 1, lines: [`таких законов пакет не везёт: ${unknown.join(', ')}`, 'что везёт — `agent-kit list`'] }
            : ids;
    }

    if (!canAsk()) {
        return {
            code: 1,
            lines: [
                'спросить некого: запуск без терминала',
                'назови законы флагом `--laws a,b,c` или возьми все флагом `--all`',
                'что везёт пакет — `agent-kit list`',
            ],
        };
    }

    const choices: readonly IChoice[] = catalog
        .filter((entry: IEntryOfCatalog): boolean => entry.kind === 'laws')
        .map((entry: IEntryOfCatalog): IChoice => ({ id: entry.id, name: entry.name, title: entry.title }));

    return ask(choices, 'Какие законы разложить в этом проекте?');
}

/**
 * Виды для `init` по осям, объявленным пакетом: что взято из флага, что спрошено.
 *
 * `--all` берёт первый объявленный вид оси и **говорит об этом**: в CI спрашивать некого, а
 * отказ там означал бы, что пакет нельзя разложить без человека. Первый вид — умолчание, а не
 * догадка: порядок в объявлении оси и есть порядок предпочтения.
 */
async function variantOfAxis(axis: IAxis, argv: readonly string[]): Promise<string | null | IOutcomeOfCommand> {
    const spoken: string = optionOf(argv, `--${axis.name}`, '');
    const values: readonly string[] = axis.options.map((option: IOptionOfAxis): string => option.value);

    if (spoken) {
        return values.includes(spoken)
            ? spoken
            : {
                  code: 1,
                  lines: [`такого вида по оси «${axis.name}» пакет не везёт: ${spoken}`, `есть: ${values.join(', ')}`],
              };
    }

    if (argv.includes('--all')) {
        return axis.options[0]?.value ?? '';
    }

    if (!canAsk()) {
        return {
            code: 1,
            lines: ['спросить некого: запуск без терминала', `назови вид флагом \`--${axis.name} <вид>\`: ${values.join(', ')}`],
        };
    }

    return askOne(
        axis.options.map((option: IOptionOfAxis): IChoice => ({ id: option.value, name: option.value, title: option.title })),
        axis.question
    );
}

async function variantsFor(argv: readonly string[], assetsDir: string): Promise<Record<string, string> | null | IOutcomeOfCommand> {
    const axes: readonly IAxis[] = readAxes(assetsDir);
    const chosen: Record<string, string> = {};

    for (const axis of axes) {
        const answer: string | null | IOutcomeOfCommand = await variantOfAxis(axis, argv);

        if (isOutcome(answer)) {
            return answer;
        }

        if (answer === null) {
            return null;
        }

        chosen[axis.name] = answer;
    }

    return chosen;
}

/** Заведение настройки: выбор ресурсов и видов, брошенный выбор ничего не пишет. */
async function runInit(env: IEnvironment, argv: readonly string[]): Promise<IOutcomeOfCommand> {
    const selection: readonly string[] | null | IOutcomeOfCommand = await selectionFor(argv, env.assetsDir);
    if (isOutcome(selection)) {
        return selection;
    }
    if (selection === null) {
        return { code: 1, lines: ['выбор брошен — ничего не заведено'] };
    }

    const variants: Record<string, string> | null | IOutcomeOfCommand = await variantsFor(argv, env.assetsDir);
    if (isOutcome(variants)) {
        return variants;
    }

    return variants === null
        ? { code: 1, lines: ['выбор брошен — ничего не заведено'] }
        : init(env.root, selection, variants, env.assetsDir);
}

/**
 * Цена контекста: три веса и то, чем они сняты.
 *
 * Отказ печатается тем же выводом, а не броском: команду зовут глазами, и трассировка стека
 * говорит ей читателю меньше, чем строка о том, чего в дереве нет.
 */
function runCost(env: IEnvironment, argv: readonly string[]): IOutcomeOfCommand {
    const named: string = optionOf(argv, '--rule', '');
    let cost: ICost;
    try {
        cost = costOf(env.root, named === '' ? null : named);
    } catch (failure: unknown) {
        if (failure instanceof CostUnavailableError) {
            return { code: 1, lines: [failure.message] };
        }
        throw failure;
    }

    return { code: 0, lines: [...costLines(cost, argv.includes('--json'))] };
}

/** Сводка наблюдений: отрезок из флага, сегодняшний день — с края. */
function runStats(env: IEnvironment, argv: readonly string[]): IOutcomeOfCommand {
    const spoken: number = Number(optionOf(argv, '--days', ''));

    return stats(env, {
        days: Number.isFinite(spoken) && spoken > 0 ? Math.floor(spoken) : DEFAULT_DAYS,
        // Сегодняшний день берётся здесь: у команды своих часов нет, иначе сводку за
        // отрезок не проверить спекой — вчерашняя фикстура завтра станет позавчерашней.
        today: new Date().toISOString().slice(0, 10),
        json: argv.includes('--json'),
    });
}

/**
 * Отправка накопленного.
 *
 * Единственное действие этой команды необратимо и уходит наружу, поэтому незнакомый довод её
 * кончает, а не пропускается молча: вызов ради списка режимов отправил в приём всё накопленное, и
 * по выводу это не отличалось от «команда ничего не сделала». Прочие команды такого разбора не
 * знают — их действие обратимо.
 */
async function runPropose(env: IEnvironment, argv: readonly string[]): Promise<IOutcomeOfCommand> {
    const unknown: readonly string[] = unknownFlagsIn(argv.slice(1), PROPOSE_FLAGS);
    if (unknown.length) {
        return {
            code: 1,
            lines: [`таких доводов у \`propose\` нет: ${unknown.join(', ')}`, '', ...PROPOSE_USAGE],
        };
    }

    return propose(env, {
        dryRun: argv.includes('--dry-run'),
        ship: httpShip,
        remote: remoteOf(env.root),
        // Имена доезжают до отказа: выбор за человеком, и отказ, не назвавший, из чего выбирать,
        // отправляет его смотреть то же самое своими руками.
        remotes: remoteNames(env.root),
        // Отрезок тот же, что у сводки по умолчанию: отправку зовут по свежей задаче.
        days: DEFAULT_DAYS,
        today: new Date().toISOString().slice(0, 10),
    });
}

/** Судьба своих записей: чтение приёма по токену дерева и надстройки под ними. */
function runFate(env: IEnvironment): Promise<IOutcomeOfCommand> {
    return fate(env, { read: httpReadOwn });
}

/** Приписка дерева к приёмнику по коду приглашения. */
async function runEnroll(env: IEnvironment, argv: readonly string[]): Promise<IOutcomeOfCommand> {
    const config: IConfig | null = readConfig(env.root);

    if (!config) {
        return { code: 1, lines: [`настройки дерева нет: ${CONFIG_PATH}. Заведите её командой \`init\``] };
    }

    return enroll({
        root: env.root,
        intake: config.intake,
        code: optionOf(argv, '--code', ''),
        issued: optionOf(argv, '--token', ''),
        tree: treeSlugOf(remoteOf(env.root), config.tree),
        token: config.token,
        force: argv.includes('--force'),
        call: httpEnroll,
    });
}

/** Ветка команды: окружение и доводы строки запуска на входе, вывод и код возврата на выходе. */
type TCommandRun = (env: IEnvironment, argv: readonly string[]) => IOutcomeOfCommand | Promise<IOutcomeOfCommand>;

/** Что делает каждая команда строки запуска. Ключ — слово, которым её зовут. */
const COMMANDS: Readonly<Record<string, TCommandRun>> = {
    init: runInit,
    list: (env: IEnvironment): IOutcomeOfCommand => list(env),
    sync: (env: IEnvironment, argv: readonly string[]): IOutcomeOfCommand => sync(env, argv.includes('--check')),
    cost: runCost,
    stats: runStats,
    propose: runPropose,
    fate: runFate,
    enroll: runEnroll,
    doctor: (env: IEnvironment): IOutcomeOfCommand => doctor(env),
    adopt: (env: IEnvironment, argv: readonly string[]): IOutcomeOfCommand =>
        adopt(
            env,
            argv.slice(1).filter((value: string): boolean => !value.startsWith('--') && value !== optionOf(argv, '--root', ''))
        ),
};

export async function main(argv: readonly string[]): Promise<IOutcomeOfCommand> {
    const command: string = argv[0] ?? '';
    const env: IEnvironment = environmentOf(resolve(optionOf(argv, '--root', process.cwd())));
    const run: TCommandRun | undefined = Object.hasOwn(COMMANDS, command) ? COMMANDS[command] : undefined;

    if (!run) {
        return { code: command ? 1 : 0, lines: command ? [`неизвестная команда «${command}»`, '', ...USAGE] : USAGE };
    }

    return run(env, argv);
}

const outcome: IOutcomeOfCommand = await main(process.argv.slice(2));
for (const line of outcome.lines) {
    // eslint-disable-next-line no-console
    console.log(line);
}
process.exit(outcome.code);
