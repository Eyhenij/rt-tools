#!/usr/bin/env node
/**
 * Сверка перечня состояний работы с разделами паттернов, которые их ведут.
 *
 * Состояние без ведущего текста читается как конец работы: исполнитель дочитывает
 * паттерн до последнего раздела, следующего движения в нём нет, и ход кончается
 * отчётом. Так простояло состояние «замысел записан» — оно встречалось один раз,
 * клеткой таблицы, и дыру нашло происшествие, а не проверка. Разбор —
 * запись «2026-08-21-turn-ended-at-the-written-plan» в приёме.
 *
 * Сверяются два множества в обе стороны:
 *   перечень — таблица состояний в правиле ведения работы: имя и ведущий паттерн;
 *   разделы  — заголовки вида «Состояние `имя`» в паттернах.
 *
 * Состояние без раздела — расхождение. Раздел про состояние вне перечня — тоже:
 * переименованное состояние иначе оставляет прежний раздел, и тот выглядит
 * действующим.
 *
 * Ведущий паттерн берётся из самой таблицы, а не из имён файлов: раздел, лежащий
 * не в том паттерне, который назначен, читателя до себя не доводит — он открывает
 * назначенный.
 *
 * FAIL-OPEN: правила ведения работы в дереве нет — сверять нечего, нулевой код.
 * Пустая таблица состояний отказом считается: она означает не «нечего сверять», а
 * «перечень сломан».
 *
 * Ненулевой код возврата и перечень расхождений.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const RULE = join(ROOT, '.claude/skills/task-flow/SKILL.md');
const SKILLS = join(ROOT, '.claude/skills');

/** Имя состояния и паттерн, который его ведёт, — из таблицы правила. */
function statesFromRule(text) {
    const states = [];

    for (const line of text.split('\n')) {
        if (!line.startsWith('|')) {
            continue;
        }

        const cells = line
            .split('|')
            .slice(1, -1)
            .map((cell) => cell.trim());

        if (cells.length < 4) {
            continue;
        }

        const name = cells[0].match(/^`([^`]+)`$/);
        const pattern = cells[3].match(/^`([^`]+)`$/);

        if (name && pattern) {
            states.push({ name: name[1], pattern: pattern[1] });
        }
    }

    return states;
}

/** Состояния, про которые в паттерне есть раздел. Заголовок любого уровня. */
function sectionsOf(pattern) {
    const file = join(SKILLS, pattern, 'SKILL.md');

    if (!existsSync(file)) {
        return null;
    }

    const found = new Set();

    for (const line of readFileSync(file, 'utf8').split('\n')) {
        const heading = line.match(/^#+\s+Состояние\s+`([^`]+)`/);

        if (heading) {
            found.add(heading[1]);
        }
    }

    return found;
}

if (!existsSync(RULE)) {
    console.log('check-states: правила ведения работы в дереве нет — сверять нечего');
    process.exit(0);
}

const states = statesFromRule(readFileSync(RULE, 'utf8'));

if (states.length === 0) {
    console.error('check-states: в правиле ведения работы не нашлось таблицы состояний');
    process.exit(1);
}

const known = new Set(states.map((state) => state.name));
const problems = [];
const seen = new Map();

for (const state of states) {
    if (!seen.has(state.pattern)) {
        seen.set(state.pattern, sectionsOf(state.pattern));
    }

    const sections = seen.get(state.pattern);

    if (sections === null) {
        problems.push(`состояние \`${state.name}\`: ведущий паттерн \`${state.pattern}\` в дереве не разложен`);
        continue;
    }

    if (!sections.has(state.name)) {
        problems.push(`состояние \`${state.name}\`: в паттерне \`${state.pattern}\` нет раздела «Состояние \`${state.name}\`»`);
    }
}

for (const [pattern, sections] of seen) {
    if (sections === null) {
        continue;
    }

    for (const name of sections) {
        if (!known.has(name)) {
            problems.push(`паттерн \`${pattern}\`: раздел про \`${name}\`, а такого состояния в перечне нет`);
        }
    }
}

if (problems.length > 0) {
    console.error(`check-states: расхождений ${problems.length}`);

    for (const problem of problems) {
        console.error(`  ${problem}`);
    }

    console.error('\nПеречень состояний — правило `task-flow`, разделы — паттерны при нём.');
    process.exit(1);
}

console.log(`check-states: состояний ${states.length}, у каждого есть раздел в ведущем паттерне`);
