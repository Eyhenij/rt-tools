#!/usr/bin/env node
// rt-kit v0.17.0 · checks/check-push-gate.mjs · 2e342aaeee82 · правится надстройкой, не здесь
/**
 * Проверка того, что набор гейта пуша не уже набора конвейера.
 *
 * Гейт пуша — обещание, что пуш не приедет красным. Пока его набор уже набора
 * конвейера, обещание шире того, что гейт проверяет, и неверно оно молча: ни
 * гейт, ни его вывод не говорят, чего в нём нет. Дважды подряд правка, прошедшая
 * гейт целиком, была отбита конвейером — и оба раза зелёный гейт был прочитан
 * как «локально всё зелено».
 *
 * Файл конвейера машиной не толкуется: команды там произвольны, а часть шагов
 * локально неисполнима вовсе — кэш, выгрузка следов, вход в реестр. Отсюда
 * берутся только ИМЕНА шагов, а чем каждое из них закрывается в гейте,
 * объявляет дерево. Необъявленное имя краснеет: дыра видна на месте, а не
 * выводится сверкой двух списков глазами.
 *
 * Объявление бывает двух родов. Строка — та самая команда, которую печатает
 * `rt_push_checks` профиля; она сверяется с его выводом, потому что объявление
 * без исполнения — та же дыра. Исключение — причина, по которой шага в гейте
 * нет; пустая причина исключением не считается: она единственное, чем
 * постоянная дыра отличается от забытой строки. Причина, называющая задачу,
 * судится ещё и на живость этой задачи: отсрочка со сроком и отсрочка без срока
 * выглядят одинаково, пока номер никто не спросил.
 *
 * Дерево без файла конвейера сверки не получает: проверка, падающая там, где
 * конвейера нет, отбивала бы работу вместо промаха.
 *
 * Ненулевой код возврата и перечень расхождений.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const GATE = CONFIG.pushGate ?? {};
const PIPELINE = GATE.pipelineFile ?? '';
const DECLARED = GATE.steps ?? {};
/** Ключ задач дерева: по нему номер в причине отличается от версии, порта и года. */
const TASK_KEY = CONFIG.board?.taskKey ?? '';

/**
 * Профиль дерева ищется той же цепочкой, что и у гарда пуша: умолчание пакета, поверх него
 * надстройка проекта. Разойдись они — проверка судила бы не тот набор, который гоняет гард.
 */
const PROFILES = ['.claude/rt-kit/defaults/project.sh', '.claude/rt-kit/project.sh'];

if (!PIPELINE || !existsSync(join(ROOT, PIPELINE))) {
    console.log('check-push-gate: пропущено — файла конвейера в дереве нет');
    process.exit(0);
}

/**
 * Имена шагов конвейера. Образец задаёт дерево: у каждого хостинга своя форма записи, и
 * угадывать её за все три пакет не берётся. Умолчание — форма GitHub Actions.
 */
const stepPattern = new RegExp(GATE.stepPattern ?? '^\\s*-\\s*name:\\s*(.+?)\\s*$');

function pipelineSteps() {
    return readFileSync(join(ROOT, PIPELINE), 'utf8')
        .split('\n')
        .map((line) => line.match(stepPattern)?.[1])
        .filter(Boolean)
        .map((name) => name.replace(/^['"]|['"]$/g, ''));
}

/**
 * Набор гейта берётся у профиля его же оболочкой, а не переписывается сюда: два списка одного
 * набора расходятся молча, и расходиться начинают в тот день, когда правят один из них.
 *
 * Профиля нет, функции в нём нет или оболочка отказала — набор неизвестен, и тогда проверка
 * судит только полноту объявлений: сверять строки не с чем.
 */
function gateChecks() {
    const present = PROFILES.filter((path) => existsSync(join(ROOT, path)));
    if (present.length === 0) {
        return null;
    }
    const script = `${present.map((path) => `. "${path}"`).join('\n')}
command -v rt_push_checks >/dev/null 2>&1 || exit 42
rt_push_checks ""`;
    try {
        return execFileSync('bash', ['-c', script], { cwd: ROOT, encoding: 'utf8' })
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
    } catch {
        return null;
    }
}

/**
 * Номера задач, названные причиной. Ключ дерева обязателен: без него «663» неотличимо от порта,
 * года и номера редакции, и проверка спрашивала бы очередь работ обо всём подряд.
 */
function taskNumbers(reason) {
    if (!TASK_KEY) {
        return [];
    }
    return [...reason.matchAll(new RegExp(`\\b${TASK_KEY}-(\\d+)\\b`, 'g'))].map((match) => Number(match[1]));
}

/**
 * Очередь работ ищется разрешением модуля, а не собирается здесь: у каждого хостинга она своя, и
 * дерево, у которого её нет, судится как прежде. Ярус тот же, что у гарда поставки: есть чем
 * спросить — спрашивает, нет — молчит.
 */
async function boardModule() {
    if (!TASK_KEY) {
        return null;
    }
    try {
        const module = await import('./board.mjs');
        return typeof module.taskState === 'function' ? module : null;
    } catch {
        return null;
    }
}

const steps = pipelineSteps();
const checks = gateChecks();
const problems = [];
/** Задачи, названные причинами исключений: спрашиваются пачкой после разбора всех шагов. */
const deferrals = [];

for (const step of steps) {
    const declaration = DECLARED[step];

    if (declaration === undefined) {
        problems.push(
            `шаг конвейера «${step}» не объявлен: закрой его строкой набора в pushGate.steps ` + 'либо объяви исключением с причиной'
        );
        continue;
    }

    if (typeof declaration === 'object' && declaration !== null) {
        const reason = String(declaration.skip ?? '').trim();
        if (!reason) {
            problems.push(`шаг конвейера «${step}» объявлен исключением без причины — пустая причина не считается`);
            continue;
        }
        for (const number of taskNumbers(reason)) {
            deferrals.push({ step, number });
        }
        continue;
    }

    const line = String(declaration).trim();
    if (!line) {
        problems.push(`шаг конвейера «${step}» объявлен пустой строкой — назови команду либо объяви исключение`);
        continue;
    }

    if (checks && !checks.some((check) => check.includes(line))) {
        problems.push(`шаг конвейера «${step}» объявлен строкой «${line}», а набор гейта её не печатает`);
    }
}

/** Строка о шаге, которого в конвейере нет, — устаревшая: иначе объявления копят мёртвое. */
const known = new Set(steps);
for (const step of Object.keys(DECLARED)) {
    if (!known.has(step)) {
        problems.push(`объявление «${step}» устарело — такого шага в ${PIPELINE} нет`);
    }
}

/**
 * Мёртвый номер в причине делает исключение бессрочным, не сказав об этом ни строкой. Первый же
 * отказ сети кончает опрос целиком: спрашивать остальные незачем, а падать проверке, которую
 * гоняют в самолёте, — тем более.
 */
const board = deferrals.length > 0 ? await boardModule() : null;
if (board) {
    for (const { step, number } of deferrals) {
        let state;
        try {
            state = board.taskState(number);
        } catch {
            break;
        }
        if (state && state.exists === false) {
            problems.push(`шаг конвейера «${step}» отложен до задачи ${TASK_KEY}-${number}, а такой задачи в очереди работ нет — отсрочка бессрочная`);
        }
    }
}

if (problems.length > 0) {
    console.error(`check-push-gate: расхождений ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    console.error('\nНабор гейта пуша не бывает уже набора конвейера — правило поставки.');
    process.exit(1);
}

const skipped = Object.values(DECLARED).filter((value) => typeof value === 'object' && value !== null).length;
console.log(
    `check-push-gate: шагов конвейера ${steps.length}, закрыто набором ${steps.length - skipped}, ` + `объявлено исключениями ${skipped}`
);
