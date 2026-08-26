#!/usr/bin/env node
// rt-kit v0.16.1 · checks/check-state-next.mjs · 1526c981b7da · правится надстройкой, не здесь
/**
 * Сверка того, что раздел состояния называет следующее движение.
 *
 * Раздел, обрывающийся на последнем приёме, читается как конец работы: исполнитель
 * доводит обязательное действие до конца, дочитывает раздел, следующего движения в
 * нём не находит — и отдаёт ход отчётом о сделанном. Так кончились два хода: один
 * на записанном замысле, второй на закрытом разборе просьбы. Сверка состояний этого
 * не видит: она сравнивает имена разделов с перечнем и внутрь не смотрит.
 *
 * Читаются четыре текста:
 *   перечень — таблица состояний в правиле ведения работы: имя и ведущий паттерн;
 *   разделы  — заголовки вида «Состояние `имя`» в этих паттернах;
 *   правило  — оно же: в нём стоит утверждение о границе состояния;
 *   карта и закон — там же стоит то же утверждение, если дерево их разложило.
 *
 * Строка следующего движения узнаётся по зачину, а называет своё: единая дословная
 * строка читается как шаблон и перестаёт замечаться на третьем разделе. Поэтому
 * повтор хвоста считается расхождением наравне с его отсутствием.
 *
 * FAIL-OPEN: правила ведения работы в дереве нет — сверять нечего, нулевой код.
 * Пустая таблица состояний отказом считается: она означает не «нечего сверять», а
 * «перечень сломан». Ведущий паттерн, которого в дереве нет, здесь не судится — его
 * называет сверка состояний, и два отказа об одном промахе читаются как две
 * претензии.
 *
 * Ненулевой код возврата и перечень расхождений.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const RULE = join(ROOT, '.claude/skills/task-flow/SKILL.md');
/**
 * Правило хода захода: граница состояния живёт там, а не в правиле ведения работы.
 * Разделились они, когда правило ведения работы вышло за предел длины: ход работы
 * остался в одном, выходы хода уехали в другое. Дерево, где разложено только первое,
 * судится по нему одному — второго файла у него нет.
 */
const TURN_RULE = join(ROOT, '.claude/skills/turn-conduct/SKILL.md');
const SKILLS = join(ROOT, '.claude/skills');
const MAP = join(ROOT, '.claude/rt-kit/defaults/turn-map.md');
const LAW = join(ROOT, 'docs/constitution/work-conduct.md');

/** Зачин строки: по нему её находят, а хвост у каждого раздела свой. */
const MARKER = '**Следующее движение:**';

/** Утверждение о границе состояния. Стоит в правиле, в карте и в законе теми же словами. */
const BOUNDARY = 'Переход из состояния в состояние';

/** Короче этого хвост движения не называет: зачин без движения — та же пустота. */
const MIN_TAIL = 20;

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

/** Разделы состояний паттерна: имя, заголовок целиком и найденные в разделе строки движения. */
function sectionsOf(pattern) {
    const file = join(SKILLS, pattern, 'SKILL.md');

    if (!existsSync(file)) {
        return null;
    }

    const sections = [];
    let current = null;

    for (const line of readFileSync(file, 'utf8').split('\n')) {
        const heading = line.match(/^#+\s+Состояние\s+`([^`]+)`/);

        if (heading) {
            current = { name: heading[1], heading: line.replace(/^#+\s+/, ''), moves: [] };
            sections.push(current);
            continue;
        }

        if (current && line.startsWith(MARKER)) {
            current.moves.push(line.slice(MARKER.length).trim());
        }
    }

    return sections;
}

if (!existsSync(RULE)) {
    console.log('check-state-next: правила ведения работы в дереве нет — сверять нечего');
    process.exit(0);
}

const ruleText = readFileSync(RULE, 'utf8');
const states = statesFromRule(ruleText);

if (states.length === 0) {
    console.error('check-state-next: в правиле ведения работы не нашлось таблицы состояний');
    process.exit(1);
}

const problems = [];
const patterns = new Map();
const tails = new Map();
let counted = 0;

for (const state of states) {
    if (!patterns.has(state.pattern)) {
        patterns.set(state.pattern, sectionsOf(state.pattern));
    }
}

for (const [pattern, sections] of patterns) {
    if (sections === null) {
        continue;
    }

    for (const section of sections) {
        counted += 1;

        const where = `\`${section.name}\` в паттерне \`${pattern}\``;

        if (section.moves.length === 0) {
            problems.push(`${where}: в разделе «${section.heading}» нет строки «${MARKER}»`);
            continue;
        }

        if (section.moves.length > 1) {
            problems.push(`${where}: в разделе «${section.heading}» таких строк ${section.moves.length}, а движение одно`);
            continue;
        }

        const tail = section.moves[0];

        if (tail.length < MIN_TAIL) {
            problems.push(`${where}: зачин есть, а движение за ним не названо`);
            continue;
        }

        const twin = tails.get(tail);

        if (twin) {
            problems.push(`${where}: движение слово в слово то же, что у ${twin}`);
            continue;
        }

        tails.set(tail, `\`${section.name}\` в паттерне \`${pattern}\``);
    }
}

if (counted === 0) {
    problems.push('ни одного раздела состояния не нашлось: паттерны не разложены или заголовки в них другие');
}

const turnText = existsSync(TURN_RULE) ? readFileSync(TURN_RULE, 'utf8') : '';
if (!ruleText.includes(BOUNDARY) && !turnText.includes(BOUNDARY)) {
    problems.push(`правило хода захода о границе состояния молчит: строки «${BOUNDARY}» в нём нет`);
}

for (const [file, what] of [
    [MAP, 'карта хода'],
    [LAW, 'закон о ведении работы'],
]) {
    if (existsSync(file) && !readFileSync(file, 'utf8').includes(BOUNDARY)) {
        problems.push(`${what} о границе состояния молчит: строки «${BOUNDARY}» в ней нет`);
    }
}

if (problems.length > 0) {
    console.error(`check-state-next: расхождений ${problems.length}`);

    for (const problem of problems) {
        console.error(`  ${problem}`);
    }

    console.error('\nСтрока следующего движения стоит в каждом разделе состояния: зачин общий, движение своё.');
    process.exit(1);
}

console.log(`check-state-next: разделов состояния ${counted}, у каждого названо следующее движение`);
