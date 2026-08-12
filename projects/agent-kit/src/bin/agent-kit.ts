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

import { IEntryOfCatalog, readCatalog, resolveSelection } from '../lib/catalog.js';
import { adopt, doctor, IEnvironment, init, IOutcomeOfCommand, list, propose, stats, sync } from '../lib/commands.js';
import { DEFAULT_DAYS } from '../lib/observations.js';
import { ghIssue, repositoryOf } from '../lib/submit.js';
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
    '  stats           свести наблюдения: чем пользовались, чем ни разу, обо что спотыкались',
    '  stats --days N  за сколько дней; без довода — за три',
    '  stats --json    то же машиночитаемо — этим сводку прикладывают к предложению',
    '  propose         отправить предложения с адресом «пакет» в очередь работ пакета',
    '  propose --dry-run   показать, что уехало бы, и ничего не отправлять',
    '  adopt [файлы]   отдать пакету файлы, лежащие на его путях не от него',
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
 * Единственное место, где пакет узнаёт собственное расположение. `import.meta` живёт только
 * здесь: библиотечные модули получают каталог ресурсов входным значением, и трансформ тестов,
 * разбирающий модули как CommonJS, на них уже не спотыкается.
 */
function environmentOf(root: string): IEnvironment {
    const pkg: string = packageRootFrom(dirname(fileURLToPath(import.meta.url)));
    const manifest: { name: string; version: string; repository?: { url?: string } } = JSON.parse(
        readFileSync(join(pkg, 'package.json'), 'utf8')
    ) as {
        name: string;
        version: string;
        repository?: { url?: string };
    };

    return {
        root,
        version: manifest.version,
        assetsDir: join(pkg, 'assets'),
        // Сверка со своими исходниками возможна только отсюда: здесь пакет знает, где лежит сам.
        // У потребителя исходников рядом нет, и сверка молчит.
        stale: staleBuild(pkg, manifest.name),
        // Куда уезжают предложения. Читается из манифеста: зашитый в код адрес назвал бы чужое
        // дерево в текстах пакета — и врал бы у всякого, кто пакет форкнул.
        repository: repositoryOf(manifest.repository?.url ?? ''),
    };
}

/** Чем это дерево себя выдаёт снаружи. Нет удалённого репозитория — нечем, и это не отказ. */
function remoteOf(root: string): string {
    try {
        return execFileSync('git', ['-C', root, 'remote', 'get-url', 'origin'], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
    } catch {
        return '';
    }
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
async function variantsFor(argv: readonly string[], assetsDir: string): Promise<Record<string, string> | null | IOutcomeOfCommand> {
    const axes: readonly IAxis[] = readAxes(assetsDir);
    const chosen: Record<string, string> = {};

    for (const axis of axes) {
        const spoken: string = optionOf(argv, `--${axis.name}`, '');
        const known: (value: string) => boolean = (value: string): boolean =>
            axis.options.some((option: IOptionOfAxis): boolean => option.value === value);

        if (spoken) {
            if (!known(spoken)) {
                return {
                    code: 1,
                    lines: [
                        `такого вида по оси «${axis.name}» пакет не везёт: ${spoken}`,
                        `есть: ${axis.options.map((option: IOptionOfAxis): string => option.value).join(', ')}`,
                    ],
                };
            }
            chosen[axis.name] = spoken;
            continue;
        }

        if (argv.includes('--all')) {
            chosen[axis.name] = axis.options[0]?.value ?? '';
            continue;
        }

        if (!canAsk()) {
            return {
                code: 1,
                lines: [
                    'спросить некого: запуск без терминала',
                    `назови вид флагом \`--${axis.name} <вид>\`: ${axis.options.map((option: IOptionOfAxis): string => option.value).join(', ')}`,
                ],
            };
        }

        const answer: string | null = await askOne(
            axis.options.map((option: IOptionOfAxis): IChoice => ({ id: option.value, name: option.value, title: option.title })),
            axis.question
        );
        if (answer === null) {
            return null;
        }
        chosen[axis.name] = answer;
    }

    return chosen;
}

export async function main(argv: readonly string[]): Promise<IOutcomeOfCommand> {
    const command: string = argv[0] ?? '';
    const env: IEnvironment = environmentOf(resolve(optionOf(argv, '--root', process.cwd())));

    switch (command) {
        case 'init': {
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
        case 'list':
            return list(env);
        case 'sync':
            return sync(env, argv.includes('--check'));
        case 'stats': {
            const spoken: number = Number(optionOf(argv, '--days', ''));

            return stats(env, {
                days: Number.isFinite(spoken) && spoken > 0 ? Math.floor(spoken) : DEFAULT_DAYS,
                // Сегодняшний день берётся здесь: у команды своих часов нет, иначе сводку за
                // отрезок не проверить спекой — вчерашняя фикстура завтра станет позавчерашней.
                today: new Date().toISOString().slice(0, 10),
                json: argv.includes('--json'),
            });
        }
        case 'propose': {
            // Сводка едет вместе с предложением: без цифр оно читается как мнение. Берётся тем
            // же отрезком, что и сводка по умолчанию, — предложение пишут по свежей задаче.
            const summary: IOutcomeOfCommand = stats(env, {
                days: DEFAULT_DAYS,
                today: new Date().toISOString().slice(0, 10),
                json: false,
            });

            return propose(env, {
                dryRun: argv.includes('--dry-run'),
                submit: ghIssue,
                repository: env.repository ?? '',
                remote: remoteOf(env.root),
                summary: summary.lines,
            });
        }
        case 'doctor':
            return doctor(env);
        case 'adopt':
            return adopt(
                env,
                argv.slice(1).filter((value: string): boolean => !value.startsWith('--') && value !== optionOf(argv, '--root', ''))
            );
        default:
            return { code: command ? 1 : 0, lines: command ? [`неизвестная команда «${command}»`, '', ...USAGE] : USAGE };
    }
}

const outcome: IOutcomeOfCommand = await main(process.argv.slice(2));
for (const line of outcome.lines) {
    // eslint-disable-next-line no-console
    console.log(line);
}
process.exit(outcome.code);
