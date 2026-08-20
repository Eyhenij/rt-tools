#!/usr/bin/env node
/**
 * Проверка того, что модули пакета не ссылаются друг на друга по кругу.
 *
 * Цикл заводится молча и почти всегда через баррель каталога: файл берёт соседа не прямо, а
 * из `index.ts` рядом, а тот собирает и его самого. Ни сборка, ни линтер этого не судят —
 * сборщик разрывает круг сам, отдавая половине участников недособранный модуль. Всплывает это
 * у потребителя: символ, прочитанный на старте, оказывается `undefined`, и стоит это отладки
 * в чужом приложении.
 *
 * Считается только то, что видно без сборщика: относительные импорты внутри одного пакета.
 * Импорт по имени пакета сюда не идёт — круги между пакетами судит проверка раскладки либ.
 *
 * Ненулевой код возврата и перечень кругов: по одному на строку, участниками от файла к файлу.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const ROOT = resolve(process.argv[2] ?? 'projects');
const SKIP = new Set(['node_modules', 'dist', '.angular', 'coverage', '__snapshots__']);

/** Все файлы кода пакета: спеки и истории считаются наравне с остальными — круг у них общий. */
function filesOf(dir) {
    const found = [];

    for (const entry of readdirSync(dir)) {
        if (SKIP.has(entry)) {
            continue;
        }

        const path = join(dir, entry);

        if (statSync(path).isDirectory()) {
            found.push(...filesOf(path));
        } else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) {
            found.push(path);
        }
    }

    return found;
}

/**
 * Путь импорта → файл на диске. Расширение в импорте бывает написано как `.js` — так требует
 * сборка пакета утилит, — поэтому кандидаты перебираются, а не выводятся из строки.
 */
function fileOf(from, spec) {
    const base = resolve(dirname(from), spec.replace(/\.js$/, ''));
    const candidates = [`${base}.ts`, join(base, 'index.ts'), `${base}/index.ts`];

    for (const candidate of candidates) {
        if (existsSync(candidate) && statSync(candidate).isFile()) {
            return candidate;
        }
    }

    return null;
}

/**
 * Импорт бывает многострочным — список символов в фигурных скобках переносят, — поэтому образец
 * не запрещает перевод строки внутри. Иначе круг, замкнутый длинным импортом, не виден вовсе:
 * ровно так один из них и пережил первый прогон этой проверки.
 */
const IMPORT = /(?:^|\n)\s*(?:import|export)\b[\s\S]*?from\s*['"](\.[^'"]+)['"]/g;

function edgesOf(file) {
    const text = readFileSync(file, 'utf8');
    const links = new Set();

    for (const match of text.matchAll(IMPORT)) {
        const target = fileOf(file, match[1]);

        if (target && target !== file) {
            links.add(target);
        }
    }

    return links;
}

const graph = new Map();

for (const file of filesOf(ROOT)) {
    graph.set(file, edgesOf(file));
}

/** Обход в глубину: круг называется участниками от места, где он замкнулся. */
const cycles = [];
const seen = new Set();
const stack = [];
const onStack = new Set();

function walk(node) {
    seen.add(node);
    stack.push(node);
    onStack.add(node);

    for (const next of graph.get(node) ?? []) {
        if (onStack.has(next)) {
            cycles.push([...stack.slice(stack.indexOf(next)), next]);
        } else if (!seen.has(next)) {
            walk(next);
        }
    }

    stack.pop();
    onStack.delete(node);
}

for (const node of graph.keys()) {
    if (!seen.has(node)) {
        walk(node);
    }
}

const shown = new Map();

for (const cycle of cycles) {
    const names = cycle.map((file) => relative(ROOT, file));
    const key = [...names].sort().join('|');

    if (!shown.has(key)) {
        shown.set(key, names);
    }
}

if (shown.size === 0) {
    console.log(`check-cycles: файлов ${graph.size}, кругов нет`);
    process.exit(0);
}

console.log(`check-cycles: файлов ${graph.size}, кругов ${shown.size}\n`);

for (const names of shown.values()) {
    console.log(`  ${names.join(' → ')}`);
}

console.log('\nКруг разрывается прямым импортом файла вместо барреля каталога.');
process.exit(1);
