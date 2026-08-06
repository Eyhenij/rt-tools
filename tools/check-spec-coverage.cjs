#!/usr/bin/env node
/**
 * Сверяет описание работы с тем, что её проверяет.
 *
 * Отказывает, когда:
 *   - ветка не названа по задаче (`type/<номер>-<slug>`);
 *   - ветка меняет код пакетов, а описания `specs/<номер>-*​/spec.md` нет;
 *   - сценарий объявлен, но не попал в сводку покрытия;
 *   - сводка называет сценарий, которого нет среди объявленных;
 *   - строка сводки говорит «покрыт», но названный ею файл не существует
 *     или не упоминает этот сценарий;
 *   - спека упоминает сценарий, которого не объявляла ни одна работа.
 *
 * Печатает сводку покрытия всегда: непокрытое обязано быть видно, а не выясняться потом.
 */

const { execFileSync } = require('node:child_process');
const { existsSync, readFileSync, readdirSync } = require('node:fs');
const { join, relative } = require('node:path');

const REPO_ROOT = join(__dirname, '..');
const SPECS_DIR = join(REPO_ROOT, 'specs');
const BRANCH_RE = /^(?:feat|fix|refactor|docs|chore|style|test|perf|ci|build)\/(\d+)-[a-z0-9-]+$/;
const SCENARIO_RE = /\bAS-(\d{3})\b/g;
const MAIN_BRANCHES = new Set(['main', 'master', 'HEAD']);
/** Роды файлов, ради которых работа обязана начинаться с описания. */
const CODE_PREFIX = 'projects/';

/** @param {string[]} args */
function git(args) {
    return execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
}

/**
 * Имя ветки. На запросе слияния HEAD отделён и `rev-parse` вернёт «HEAD»: тогда имя берётся
 * из окружения, иначе проверка молча пропустила бы ровно то место, ради которого заведена.
 */
function currentBranch() {
    if (process.env.GITHUB_HEAD_REF) return process.env.GITHUB_HEAD_REF;
    try {
        return git(['rev-parse', '--abbrev-ref', 'HEAD']);
    } catch {
        return '';
    }
}

/** Файлы, которые эта ветка добавляет к главной. Пусто, если сравнить не с чем. */
function changedFiles() {
    for (const base of ['origin/main', 'main']) {
        try {
            const mergeBase = git(['merge-base', base, 'HEAD']);
            return git(['diff', '--name-only', `${mergeBase}...HEAD`])
                .split('\n')
                .filter(Boolean);
        } catch {
            /* база недоступна — пробуем следующую */
        }
    }
    return [];
}

/** @param {number} taskNumber */
function findSpecFile(taskNumber) {
    if (!existsSync(SPECS_DIR)) return null;
    const prefix = `${taskNumber}-`;
    const dir = readdirSync(SPECS_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .find((name) => name === String(taskNumber) || name.startsWith(prefix));
    if (!dir) return null;
    const file = join(SPECS_DIR, dir, 'spec.md');
    return existsSync(file) ? file : null;
}

/** Все `*.spec.ts` дерева — по ним видно, какие сценарии упомянуты в тестах. */
function specFiles(dir, found = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) continue;
        const full = join(dir, entry.name);
        if (entry.isDirectory()) specFiles(full, found);
        else if (entry.name.endsWith('.spec.ts')) found.push(full);
    }
    return found;
}

/** @param {string} text */
function collectScenarios(text) {
    const [before, after] = splitOnCoverage(text);
    const declared = new Set();
    for (const match of before.matchAll(SCENARIO_RE)) declared.add(`AS-${match[1]}`);

    /** @type {{id: string, source: string, state: string}[]} */
    const rows = [];
    for (const line of after.split('\n')) {
        if (!line.trim().startsWith('|')) continue;
        const cells = line.split('|').map((cell) => cell.trim());
        // | сценарий | чем проверяется | состояние |
        if (cells.length < 5) continue;
        const id = cells[1];
        if (!/^AS-\d{3}$/.test(id)) continue;
        rows.push({ id, source: cells[2], state: cells[3].toLowerCase() });
    }
    return { declared, rows };
}

/** Делит спеку на «до сводки покрытия» и «сводка покрытия». */
function splitOnCoverage(text) {
    const lines = text.split('\n');
    const index = lines.findIndex((line) => /^##\s+Покрытие сценариев/i.test(line));
    if (index === -1) return [text, ''];
    return [lines.slice(0, index).join('\n'), lines.slice(index).join('\n')];
}

function main() {
    /** @type {string[]} */
    const failures = [];
    const branch = currentBranch();

    if (MAIN_BRANCHES.has(branch)) {
        console.log(`проверка описания: ветка ${branch} — сверять нечего`);
        return 0;
    }

    const branchMatch = BRANCH_RE.exec(branch);
    if (!branchMatch) {
        console.error(`✗ ветка «${branch}» не названа по задаче.`);
        console.error('  Имя ветки — единственное, что связывает правку с задачей: type/<номер>-<slug>.');
        return 1;
    }

    const taskNumber = Number(branchMatch[1]);
    const touchesCode = changedFiles().some((file) => file.startsWith(CODE_PREFIX));
    const specFile = findSpecFile(taskNumber);

    if (!specFile) {
        if (!touchesCode) {
            console.log(`проверка описания: задача #${taskNumber} не трогает ${CODE_PREFIX} — описание не требуется`);
            return 0;
        }
        console.error(`✗ задача #${taskNumber} меняет ${CODE_PREFIX}, но описания нет.`);
        console.error(`  Ожидался файл specs/${taskNumber}-<короткое-имя>/spec.md.`);
        console.error('  Работа начинается с описания: иначе обещанное восстанавливается по коду, который его нарушил.');
        return 1;
    }

    const text = readFileSync(specFile, 'utf8');
    const shortPath = relative(REPO_ROOT, specFile);
    const { declared, rows } = collectScenarios(text);

    if (declared.size === 0) {
        console.error(`✗ ${shortPath} не объявляет ни одного сценария AS-NNN.`);
        console.error('  Обещанное поведение называется сценарием — иначе его нечем назвать в тесте.');
        return 1;
    }

    const summarised = new Set(rows.map((row) => row.id));
    for (const id of [...declared].sort()) {
        if (!summarised.has(id)) failures.push(`${id} объявлен, но не попал в сводку покрытия ${shortPath}`);
    }
    for (const row of rows) {
        if (!declared.has(row.id)) failures.push(`сводка ${shortPath} называет ${row.id}, которого нет среди объявленных`);
    }

    for (const row of rows) {
        if (!row.state.startsWith('покрыт') && !row.state.startsWith('частично')) continue;
        const named = row.source.match(/[\w./-]+\.spec\.ts/);
        if (!named) {
            failures.push(`${row.id} помечен «${row.state}», но не назвал файла, который его проверяет`);
            continue;
        }
        const testPath = join(REPO_ROOT, named[0]);
        if (!existsSync(testPath)) {
            failures.push(`${row.id} ссылается на ${named[0]} — такого файла нет`);
            continue;
        }
        if (!readFileSync(testPath, 'utf8').includes(row.id)) {
            failures.push(`${row.id} помечен покрытым, но ${named[0]} его не упоминает`);
        }
    }

    // Сценарий, названный в тесте, но нигде не объявленный: так ловится переименованный
    // или выкинутый сценарий — без этого он пропадает молча.
    const declaredEverywhere = new Set();
    if (existsSync(SPECS_DIR)) {
        for (const entry of readdirSync(SPECS_DIR, { withFileTypes: true })) {
            if (!entry.isDirectory()) continue;
            const file = join(SPECS_DIR, entry.name, 'spec.md');
            if (!existsSync(file)) continue;
            for (const id of collectScenarios(readFileSync(file, 'utf8')).declared) declaredEverywhere.add(id);
        }
    }
    for (const file of specFiles(join(REPO_ROOT, 'projects'))) {
        const mentioned = new Set([...readFileSync(file, 'utf8').matchAll(SCENARIO_RE)].map((m) => `AS-${m[1]}`));
        for (const id of mentioned) {
            if (!declaredEverywhere.has(id)) {
                failures.push(`${relative(REPO_ROOT, file)} упоминает ${id}, которого не объявляла ни одна работа`);
            }
        }
    }

    const counted = { покрыт: 0, частично: 0, непокрыт: 0 };
    for (const row of rows) {
        if (row.state.startsWith('покрыт')) counted.покрыт += 1;
        else if (row.state.startsWith('частично')) counted.частично += 1;
        else counted.непокрыт += 1;
    }
    console.log(
        `проверка описания: ${shortPath} — сценариев ${declared.size}; ` +
            `покрыто ${counted.покрыт}, частично ${counted.частично}, не покрыто ${counted.непокрыт}`
    );
    for (const row of rows) {
        if (row.state.startsWith('покрыт')) continue;
        console.log(`  · ${row.id} — ${row.state}`);
    }

    if (failures.length > 0) {
        console.error('');
        for (const failure of failures) console.error(`✗ ${failure}`);
        return 1;
    }
    return 0;
}

process.exit(main());
