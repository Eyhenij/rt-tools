#!/usr/bin/env node
// rt-kit v0.17.0 · checks/check-profile-drift.mjs · 9bc72a7850b6 · правится надстройкой, не здесь
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
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';

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

/**
 * Набор гейта пуша, собранный оболочкой: с надстройкой дерева и без неё.
 *
 * Собирается вызовом, а не чтением текста: набор — функция, и она смотрит на дерево — есть ли
 * настройка раскладки, лежит ли конфиг оформления, исполним ли набор сценариев. Прочитанный
 * текстом, он назвал бы командами то, чего в этом дереве нет вовсе.
 *
 * Пусто — собрать нечем: нет оболочки, нет функции, отказ вызова. Сверять тогда нечего.
 */
function gateSet(withProfile) {
    const source = withProfile ? `. '${DEFAULTS}'; . '${PROFILE}';` : `. '${DEFAULTS}';`;
    const run = spawnSync('bash', ['-c', `${source} command -v rt_push_checks >/dev/null 2>&1 || exit 9; rt_push_checks ''`], {
        cwd: ROOT,
        encoding: 'utf8',
    });

    return run.status === 0 && typeof run.stdout === 'string' ? run.stdout.split('\n').filter(Boolean) : null;
}

/**
 * Проверки, названные в наборе, — по имени файла, а не по всей строке команды.
 *
 * Строка целиком сверке не годится: дерево вправе позвать ту же проверку другим запускателем или
 * с другим доводом, и расхождением это не является. Пропажа самой проверки — является.
 */
function checksIn(lines) {
    const names = new Set();

    for (const line of lines) {
        for (const [word] of line.matchAll(/[\w./-]+\.(?:mjs|sh)/g)) {
            names.add(basename(word));
        }
    }

    return names;
}

/**
 * Проверки, которые умолчание пакета зовёт, а набор дерева — нет.
 *
 * Набор гейта собирается умолчанием и надстройкой, и надстройка вправе объявить функцию заново.
 * Выкушенная так проверка ничем не отличима от проверки, которой в дереве нет вовсе: гейт зелен,
 * потому что её никто не звал, а сводка раскладки о наборе не знает ничего — она сличает
 * переменные, а тут заменена функция.
 *
 * Отказ в пользу работы: собрать набор нечем — строк нет, и сверка идёт дальше своим делом.
 */
function cutFromGate() {
    const packaged = gateSet(false);
    const here = gateSet(true);
    if (packaged === null || here === null) {
        return [];
    }

    const mine = checksIn(here);

    return [...checksIn(packaged)].filter((name) => !mine.has(name)).sort((first, second) => first.localeCompare(second, 'ru'));
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

    const cut = cutFromGate();
    if (cut.length > 0) {
        console.log(`check-profile-drift: набор гейта пуша не зовёт проверок умолчания: ${cut.length}\n`);

        for (const name of cut) {
            console.log(`  ${name}`);
        }

        console.log('\nНабор гейта собирается умолчанием пакета и надстройкой дерева. Проверка, выкушенная');
        console.log('надстройкой, ничем не отличима от проверки, которой в дереве нет: гейт зелен потому,');
        console.log('что её никто не звал. Верни её в набор либо объясни отказ в компаньоне правила поставки.');

        return 1;
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
