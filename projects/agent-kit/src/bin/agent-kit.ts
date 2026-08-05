#!/usr/bin/env node
/**
 * Точка входа. Разбирает аргументы, добывает выбор проекта, зовёт команду и печатает то, что
 * она вернула. Своей работы у неё нет: всё, что решает, живёт в `commands.ts` и проверяется
 * спеками — кроме одного, чего команде знать не по чину: откуда взялся выбор законов. У строки
 * запуска это флаг, у терминала — вопрос, у прогона без терминала нет ни того ни другого.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

import { IEntryOfCatalog, readCatalog, resolveSelection } from '../lib/catalog.js';
import { doctor, IEnvironment, init, IOutcomeOfCommand, list, sync } from '../lib/commands.js';
import { packageRootFrom } from '../lib/package-root.js';
import { IChoice } from '../lib/picker.js';
import { ask, canAsk } from './prompt.js';

const USAGE: readonly string[] = [
    'agent-kit <команда>',
    '',
    '  init            завести .claude/rt-kit.json и каталог надстроек',
    '  list            что везёт пакет и что из этого взято здесь',
    '  sync            разложить ресурсы пакета в дерево проекта',
    '  sync --check    ничего не писать, отказать при расхождении — для гейта пуша',
    '  doctor          рассказать о состоянии раскладки, ничего не меняя',
    '',
    '  --root <путь>   корень проекта; по умолчанию текущий каталог',
    '',
    'Выбор законов при `init`:',
    '',
    '  --all             взять все законы, ни о чём не спрашивая',
    '  --laws a,b,c      взять только названные; имена — из `agent-kit list`',
    '  без обоих         спросить галочками; без терминала — отказ',
];

/**
 * Единственное место, где пакет узнаёт собственное расположение. `import.meta` живёт только
 * здесь: библиотечные модули получают каталог ресурсов входным значением, и трансформ тестов,
 * разбирающий модули как CommonJS, на них уже не спотыкается.
 */
function environmentOf(root: string): IEnvironment {
    const pkg: string = packageRootFrom(dirname(fileURLToPath(import.meta.url)));
    const version: string = (JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8')) as { version: string }).version;

    return { root, version, assetsDir: join(pkg, 'assets') };
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

export async function main(argv: readonly string[]): Promise<IOutcomeOfCommand> {
    const command: string = argv[0] ?? '';
    const env: IEnvironment = environmentOf(resolve(optionOf(argv, '--root', process.cwd())));

    switch (command) {
        case 'init': {
            const selection: readonly string[] | null | IOutcomeOfCommand = await selectionFor(argv, env.assetsDir);
            if (isOutcome(selection)) {
                return selection;
            }

            return selection === null ? { code: 1, lines: ['выбор брошен — ничего не заведено'] } : init(env.root, selection);
        }
        case 'list':
            return list(env);
        case 'sync':
            return sync(env, argv.includes('--check'));
        case 'doctor':
            return doctor(env);
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
