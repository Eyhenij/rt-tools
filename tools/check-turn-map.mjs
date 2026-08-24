#!/usr/bin/env node
// rt-kit v0.13.0 · checks/check-turn-map.mjs · a3dc166fa4a7 · правится надстройкой, не здесь
/**
 * Сверка карты хода: её размер и её полнота.
 *
 * Карту кладёт в контекст хук входа в заход — целиком, до первой реплики. Тем она и
 * отличается от правила: правило исполнитель читает сам и платит за это ходом, карта
 * приходит даром. Даром — пока она короткая: карта, выросшая до правила, съедает то
 * самое окно, ради которого её и заводили, и заметить это нечем — она продолжает
 * приходить и продолжает быть верной.
 *
 * Второе, чего не видно без сверки: состояние, заведённое в правиле и забытое в карте.
 * Заход тогда получает карту, не находит в ней своего состояния и идёт читать правило —
 * то есть карта работает ровно до первого нового состояния.
 *
 * Сверяются три вещи:
 *   размер    — байты разложенной карты против объявленного предела;
 *   состояния — имена из таблицы правила против имён в карте, в обе стороны;
 *   выходы    — все четыре выхода хода названы.
 *
 * FAIL-OPEN: карты в дереве нет — сверять нечего, нулевой код. Дерево может её не
 * раскладывать. Пустая таблица состояний в карте отказом считается: это не «нечего
 * сверять», а «карта сломана».
 *
 * Ненулевой код возврата и перечень расхождений.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const MAP = join(ROOT, '.claude/rt-kit/defaults/turn-map.md');
const RULE = join(ROOT, '.claude/skills/task-flow/SKILL.md');

/**
 * Предел размера карты в байтах.
 *
 * Число одно и живёт здесь: карта приходит в каждый заход целиком, и предел ей — свойство
 * приёма, а не дерева. Шесть килобайт взяты замером, а не на глаз: карта в день заведения
 * весит 4495 байт, правило, из которого она выжата, — 63803. Запас в полтора килобайта —
 * это два-три новых состояния; выйдя за него, карта перестаёт быть выжимкой, и делить её
 * тогда надо, а не поднимать предел.
 */
const LIMIT_BYTES = 6144;

/** Имена состояний из таблицы: первая ячейка в обратных кавычках и всё, что за ней. */
function statesOf(text) {
    const states = [];

    for (const line of text.split('\n')) {
        if (!line.startsWith('|')) {
            continue;
        }

        const cells = line
            .split('|')
            .slice(1, -1)
            .map((cell) => cell.trim());

        if (cells.length < 2) {
            continue;
        }

        const name = cells[0].match(/^`([^`]+)`$/);

        if (name) {
            states.push({ name: name[1], rest: cells.slice(1) });
        }
    }

    return states;
}

/** Выходы хода, названные законом. Ищутся по началу строки таблицы, а не по всему тексту. */
const EXITS = ['вопрос владельцу', 'отказ гарда', 'заполненное окно', 'работа отдана'];

function main() {
    if (!existsSync(MAP)) {
        console.log('check-turn-map: карты хода в дереве нет — сверять нечего');

        return 0;
    }

    const text = readFileSync(MAP, 'utf8');
    const bytes = statSync(MAP).size;
    const faults = [];

    if (bytes > LIMIT_BYTES) {
        faults.push(`карта выросла: ${bytes} байт при пределе ${LIMIT_BYTES}`);
    }

    const inMap = statesOf(text);

    if (inMap.length === 0) {
        faults.push('в карте нет ни одного состояния — таблица сломана');
    }

    for (const state of inMap) {
        if (!state.rest[0]) {
            faults.push(`${state.name}: в карте нет обязательного действия`);
        }
    }

    if (existsSync(RULE)) {
        const inRule = statesOf(readFileSync(RULE, 'utf8'));
        const mapNames = new Set(inMap.map((state) => state.name));
        const ruleNames = new Set(inRule.map((state) => state.name));

        for (const state of ruleNames) {
            if (!mapNames.has(state)) {
                faults.push(`${state}: состояние объявлено правилом и забыто в карте`);
            }
        }

        for (const state of mapNames) {
            if (!ruleNames.has(state)) {
                faults.push(`${state}: состояние стоит в карте, а правило его не объявляет`);
            }
        }
    }

    for (const exit of EXITS) {
        if (!text.includes(exit)) {
            faults.push(`выход хода «${exit}» в карте не назван`);
        }
    }

    if (faults.length > 0) {
        console.log(`check-turn-map: расхождений ${faults.length}, размер ${bytes} байт при пределе ${LIMIT_BYTES}\n`);

        for (const fault of faults) {
            console.log(`  ${fault}`);
        }

        console.log('\nКарта короче правила — этим она и полезна. Выросшая, она съедает то окно, ради');
        console.log('которого её кладут в контекст. Правится она в ресурсе пакета, а не в разложенной копии.');

        return 1;
    }

    console.log(
        `check-turn-map: ${inMap.length} состояний, ${EXITS.length} выхода хода, ` + `${bytes} байт при пределе ${LIMIT_BYTES} — сошлось`
    );

    return 0;
}

process.exit(main());
