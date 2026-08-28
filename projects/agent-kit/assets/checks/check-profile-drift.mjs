#!/usr/bin/env node
/**
 * Сверка надстроек профиля с таблицами компаньонов.
 *
 * Правило говорит одно, а дерево работает по-другому — и оба места законны. Расхождение
 * объявляется переменной профиля, а читатель ищет его в компаньоне правила, где перечислено, чем
 * здесь зовётся сказанное правилом. Пока эти два места никто не сравнивает, компаньон обещает
 * пакетное умолчание там, где дерево давно работает по-своему: правило требовало одной формы
 * заголовка заявки, дерево замещало её переменной, и гард, читавший форму, номера не доставал
 * вовсе — сверка номера молча не выполнялась, выглядя сошедшейся.
 *
 * Что сверяется: имя каждой переменной профиля, чьё значение разошлось с умолчанием пакета,
 * против текстов компаньонов правил. Значение не сверяется ни с чем: сказать, верно ли оно,
 * машине нечем, а назвать замещённое в компаньоне — можно.
 *
 * FAIL-OPEN: нет профиля, нет умолчаний, нет каталога правил — сверять нечего, нулевой код.
 * Дерево вправе не держать ни того, ни другого.
 *
 * Ненулевой код возврата и перечень расхождений.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const PROFILE = join(ROOT, '.claude/rt-kit/project.sh');
const DEFAULTS = join(ROOT, '.claude/rt-kit/defaults/project.sh');
const RULES = join(ROOT, '.claude/skills');

/** Присвоение верхнего уровня: `RT_ИМЯ='значение'` либо `RT_ИМЯ="значение"`. */
const ASSIGN = /^(RT_[A-Z0-9_]+)=(.*)$/;

/** Умолчание пакета: `RT_ИМЯ="${RT_ИМЯ:-значение}"` — значение берётся из подстановки. */
const FALLBACK = /^RT_[A-Z0-9_]+="\$\{RT_[A-Z0-9_]+:-(.*)\}"$/;

/** Значение без окружающих кавычек: сравниваются строки, а не их запись. */
function unquote(text) {
    const trimmed = text.trim();
    const paired = trimmed.length > 1 && (trimmed.startsWith("'") || trimmed.startsWith('"')) && trimmed.endsWith(trimmed[0]);

    return paired ? trimmed.slice(1, -1) : trimmed;
}

/** Карта «имя переменной → значение» по присвоениям верхнего уровня. */
function valuesOf(path) {
    const values = new Map();

    for (const line of readFileSync(path, 'utf8').split('\n')) {
        const assign = line.match(ASSIGN);
        if (!assign) {
            continue;
        }

        const fallback = line.match(FALLBACK);
        values.set(assign[1], fallback ? unquote(fallback[1]) : unquote(assign[2]));
    }

    return values;
}

/** Тексты всех компаньонов правил дерева, склеенные в один: ищется в них имя, а не место. */
function companionsText() {
    if (!existsSync(RULES)) {
        return null;
    }

    const texts = [];

    for (const rule of readdirSync(RULES, { withFileTypes: true })) {
        if (!rule.isDirectory()) {
            continue;
        }

        const companion = join(RULES, rule.name, 'implementation.md');
        if (existsSync(companion)) {
            texts.push(readFileSync(companion, 'utf8'));
        }
    }

    return texts.length > 0 ? texts.join('\n') : null;
}

function main() {
    if (!existsSync(PROFILE) || !existsSync(DEFAULTS)) {
        console.log('check-profile-drift: профиля дерева или умолчаний пакета нет — сверять нечего');

        return 0;
    }

    const companions = companionsText();
    if (companions === null) {
        console.log('check-profile-drift: компаньонов правил в дереве нет — сверять не с чем');

        return 0;
    }

    const defaults = valuesOf(DEFAULTS);
    const profile = valuesOf(PROFILE);
    const overridden = [...profile].filter(([name, value]) => !defaults.has(name) || defaults.get(name) !== value);
    const unnamed = overridden.filter(([name]) => !companions.includes(name));

    if (unnamed.length > 0) {
        console.log(`check-profile-drift: замещено ${overridden.length}, не названо компаньоном ${unnamed.length}\n`);

        for (const [name, value] of unnamed) {
            console.log(`  ${name} = ${value.length > 60 ? `${value.slice(0, 57)}…` : value}`);
        }

        console.log('\nЗамещённое читают в компаньоне правила: там перечислено, чем здесь зовётся сказанное');
        console.log('правилом. Не названное там, оно оставляет читателю пакетное умолчание вместо того, по');
        console.log('чему дерево работает на самом деле.');

        return 1;
    }

    console.log(`check-profile-drift: замещено ${overridden.length}, все названы компаньонами — сошлось`);

    return 0;
}

process.exit(main());
