#!/usr/bin/env node
// rt-kit v0.8.2 · checks/check-push-gate.mjs · 69763c18d801 · правится надстройкой, не здесь
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
 * постоянная дыра отличается от забытой строки.
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

const steps = pipelineSteps();
const checks = gateChecks();
const problems = [];

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
