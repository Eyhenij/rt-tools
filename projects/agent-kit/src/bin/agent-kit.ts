#!/usr/bin/env node
/**
 * Точка входа. Разбирает аргументы, зовёт команду и печатает то, что она вернула, — своей
 * работы у неё нет: всё, что решает, живёт в `commands.ts` и проверяется спеками.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

import { doctor, IEnvironment, init, IOutcomeOfCommand, sync } from '../lib/commands.js';
import { packageRootFrom } from '../lib/package-root.js';

const USAGE: readonly string[] = [
    'agent-kit <команда>',
    '',
    '  init            завести .claude/rt-kit.json и каталог надстроек',
    '  sync            разложить ресурсы пакета в дерево проекта',
    '  sync --check    ничего не писать, отказать при расхождении — для гейта пуша',
    '  doctor          рассказать о состоянии раскладки, ничего не меняя',
    '',
    '  --root <путь>   корень проекта; по умолчанию текущий каталог',
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

export function main(argv: readonly string[]): IOutcomeOfCommand {
    const command: string = argv[0] ?? '';
    const env: IEnvironment = environmentOf(resolve(optionOf(argv, '--root', process.cwd())));

    switch (command) {
        case 'init':
            return init(env.root);
        case 'sync':
            return sync(env, argv.includes('--check'));
        case 'doctor':
            return doctor(env);
        default:
            return { code: command ? 1 : 0, lines: command ? [`неизвестная команда «${command}»`, '', ...USAGE] : USAGE };
    }
}

const outcome: IOutcomeOfCommand = main(process.argv.slice(2));
for (const line of outcome.lines) {
    // eslint-disable-next-line no-console
    console.log(line);
}
process.exit(outcome.code);
