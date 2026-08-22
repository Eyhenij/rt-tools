#!/usr/bin/env node
/**
 * Проверка того, что пакет правил везёт потребителю только исполнимое им.
 *
 * Пакет ставят чужие деревья. Ресурс, у которого в чужом дереве нет предмета или некому его
 * позвать, читается там как всякий другой: та же шапка, тот же закон сверху, то же место в
 * перечне. Исполнитель берёт его в работу и упирается в пустой компаньон — и это лучший исход;
 * худший — он заполняет компаньон догадкой.
 *
 * Признак — два вопроса к ресурсу, и оба ищутся образцами в его тексте:
 *   предмета нет — ресурс говорит о приёме груза, его админке или разборе приехавшего;
 *   звать некому — ресурс сам пишет, что зовётся в репозитории пакета.
 *
 * Отправляющая сторона под признак не идёт: форма груза, отправка и команда предложения — то,
 * ради чего пакет ставят. Слово «приём» у них стоит как адрес, куда груз уезжает, поэтому
 * образцы ловят обороты о работе принимающей стороны, а не само слово.
 *
 * Перечень отменяемого этой проверкой не читается: строка в нём снимает раскладку здесь и
 * оставляет везение всем остальным, а судится тут состав пакета.
 *
 * FAIL-OPEN: ресурсов пакета в дереве нет — сверять нечего, нулевой код.
 *
 * Ненулевой код возврата и перечень ресурсов: по одному на строку, с причиной.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(process.argv[2] ?? 'projects/agent-kit');

/**
 * Известный долг: ресурсы не для везения, которые ещё лежат в пакете и переезжают своей задачей.
 * Держится он перечнем, а не молчанием проверки: без перечня она краснела бы до конца переезда
 * и отбивала бы пуш каждой ветки, включая те, что переезд и делают. Каждая строка называет,
 * куда ресурс уедет, и вычёркивается тем же изменением, которым он уезжает.
 */
const DEBT = join(resolve('tools'), 'boundary-debt.json');

/**
 * Судится то, что раскладка везёт: ресурсы и код. Описание пакета и его журнал изменений
 * потребителю не едут и о дереве пакета говорят законно — это их предмет.
 */
const CARRIED = ['assets', 'src'];
const SKIP = new Set(['node_modules', 'dist', 'coverage']);

/**
 * Образцы признака. Левое — что ищется в тексте ресурса, правое — какой из двух вопросов
 * ответил «нет». Образец берётся длинным намеренно: короткий ловит отправляющую сторону,
 * которая о приёме тоже говорит — как об адресе, а не как о своей работе.
 */
const MARKS = [
    ['админка приёма', 'предмета нет: админки приёма у потребителя не бывает'],
    ['приёмник груза', 'предмета нет: приёмник живёт в одном дереве мастерской'],
    ['разбор приехавшего груза', 'предмета нет: разбирает груз принимающая сторона'],
    ['разбирается груз, приехавший в приём', 'предмета нет: разбирает груз принимающая сторона'],
    ['команда отметки', 'предмета нет: отметки ставит принимающая сторона'],
    ['Отметка состояния груза', 'предмета нет: отметки ставит принимающая сторона'],
    ['Зовётся **в репозитории самого пакета**', 'звать некому: ресурс сам объявил себя работой дерева пакета'],
    ['в чужом дереве команда бессмысленна', 'звать некому: ресурс сам это и объявил'],
    ['в чужом дереве бессмысленна', 'звать некому: ресурс сам это и объявил'],
];

/** Все файлы ресурсов и кода пакета: судятся наравне — везёт их одна раскладка. */
function filesOf(dir) {
    const found = [];

    for (const entry of readdirSync(dir)) {
        if (SKIP.has(entry)) {
            continue;
        }

        const full = join(dir, entry);

        if (statSync(full).isDirectory()) {
            found.push(...filesOf(full));
            continue;
        }

        if (/\.(md|ts|mjs|sh|json)$/.test(entry)) {
            found.push(full);
        }
    }

    return found;
}

if (!existsSync(ROOT)) {
    process.exit(0);
}

const debt = existsSync(DEBT) ? (JSON.parse(readFileSync(DEBT, 'utf8')).accepted ?? {}) : {};
const problems = [];
const carried = [];

for (const file of CARRIED.flatMap((dir) => (existsSync(join(ROOT, dir)) ? filesOf(join(ROOT, dir)) : []))) {
    const text = readFileSync(file, 'utf8');
    const hit = MARKS.find(([mark]) => text.includes(mark));

    if (hit) {
        const where = relative(process.cwd(), file);

        (Object.hasOwn(debt, where) ? carried : problems).push(`  ${where} — ${hit[1]}`);
    }
}

/**
 * Паттерн наследует судьбу своего правила: он весь о том, как это правило исполняют, и
 * образцами ловится не всегда — готовые вызовы бывают короче любой оговорки.
 */
const namesOfRules = new Set(
    [...problems, ...carried]
        .map((line) => /assets\/rules\/([\w-]+)\.md/.exec(line))
        .filter(Boolean)
        .map((found) => found[1])
);

if (namesOfRules.size > 0) {
    const patterns = join(ROOT, 'assets/patterns');

    if (existsSync(patterns)) {
        for (const file of filesOf(patterns)) {
            const rule = /^rule:\s*([\w-]+)\s*$/m.exec(readFileSync(file, 'utf8'));

            if (rule && namesOfRules.has(rule[1])) {
                const where = relative(process.cwd(), file);

                (Object.hasOwn(debt, where) ? carried : problems).push(
                    `  ${where} — паттерн правила \`${rule[1]}\`, которое не для везения`
                );
            }
        }
    }
}

if (carried.length > 0) {
    console.log(`check-boundary: известного долга ${carried.length} — переезжает своими задачами\n`);
    carried.forEach((line) => console.log(line));
    console.log('');
}

if (problems.length === 0) {
    console.log('check-boundary: нового ресурса не для везения нет');
    process.exit(0);
}

console.log(`check-boundary: ресурсов не для везения ${problems.length}\n`);
problems.forEach((line) => console.log(line));
console.log('\nТакой ресурс живёт своим ресурсом дерева, а не отменяется перечнем. Правило — скил `agent-kit`.');
process.exit(1);
