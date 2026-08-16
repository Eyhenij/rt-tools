#!/usr/bin/env node
/**
 * Сценарии гардов дерева: гард запускается по-настоящему, с подставленным вводом и подставленным
 * помощником хостинга, и его вердикт сверяется с ожидаемым.
 *
 * Зачем это есть. Гард — единственная часть слоя правил, которую исполняет машина, а не читает
 * человек. Ошибка в нём молчит: сломанный гард пропускает ход, и пропуск неотличим от «всё в
 * порядке». Гард снятия черновика был написан, проверен вживую на одном исходе и в тот же час
 * пропустил второй — потому что второго исхода в нём не было вовсе, а увидеть это можно было
 * только перебором. Разбор — `docs/postmortems/handled/2026-08-16-draft-guard-half-closed.md`.
 *
 * Каждый сценарий поднимает свой временный репозиторий: ветка, история, ход работы, папка задачи.
 * Хостинг подставляется через `RT_GH_BIN` — сети сценарии не трогают и в самолёте идут так же,
 * как на столе. Кэш гарда уводится своим `TMPDIR`, иначе ответ одного сценария доставался бы
 * следующему.
 *
 * Ненулевой код возврата и перечень разошедшегося.
 */
import { execFileSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
/**
 * Путь к гарду переопределяется переменной затем, чтобы набор можно было натравить на нарочно
 * сломанную копию: набор, который не краснеет на поломке, не проверяет ничего, и убедиться в
 * этом можно только сломав.
 */
const GUARD = process.env.RT_GUARD_PATH || join(ROOT, '.claude/hooks/git-guard-draft-ready.sh');

const BRANCH = 'RT-900-probe';
/** Вершина известна только после коммита, поэтому в заготовках стоит метка, а не sha. */
const HEAD_MARK = '__HEAD__';

/** Подставной помощник хостинга: отвечает заготовкой сценария и в сеть не ходит. */
function fakeGh(dir, repo, { pr, runs }) {
    const path = join(dir, 'gh');
    writeFileSync(
        path,
        `#!/usr/bin/env bash
head="$(git -C '${repo}' rev-parse HEAD)"
case "$1 $2" in
    'pr view') printf '%s' '${JSON.stringify(pr)}' | sed "s/${HEAD_MARK}/$head/g" ;;
    'run list') printf '%s' '${JSON.stringify(runs)}' | sed "s/${HEAD_MARK}/$head/g" ;;
    *) exit 1 ;;
esac
`,
    );
    chmodSync(path, 0o755);
    return path;
}

/** Репозиторий сценария: ветка, ход работы и папка задачи — ровно те, что сценарий описывает. */
function makeRepo(dir, { taskFolder, stageLine }) {
    const repo = join(dir, 'repo');
    mkdirSync(repo, { recursive: true });
    const git = (...args) => execFileSync('git', ['-C', repo, ...args], { stdio: 'pipe' });

    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'probe@example.invalid');
    git('config', 'user.name', 'probe');
    git('config', 'commit.gpgsign', 'false');
    writeFileSync(join(repo, 'README.md'), '# проба\n');
    git('add', '-A');
    git('commit', '-q', '-m', 'основание');
    git('checkout', '-q', '-b', BRANCH);

    if (taskFolder) {
        const folder = join(repo, 'docs/tasks', BRANCH);
        mkdirSync(folder, { recursive: true });
        writeFileSync(join(folder, 'plan.md'), '# Замысел\n');
        writeFileSync(join(folder, 'progress.md'), `# Ход работы\n\n## Где стоим\n\n- **Этап:** ${stageLine}\n`);
    } else {
        mkdirSync(join(repo, 'docs'), { recursive: true });
        writeFileSync(join(repo, 'docs/note.md'), 'папка разобрана\n');
    }
    git('add', '-A');
    git('commit', '-q', '-m', 'состояние ветки');
    return repo;
}

/** Прогон гарда. Возвращает `pass`, когда ход разрешён, иначе текст отбивки. */
function runGuard(scenario) {
    const dir = mkdtempSync(join(tmpdir(), 'rt-hook-spec-'));
    try {
        const repo = makeRepo(dir, scenario);
        const gh = fakeGh(dir, repo, scenario);
        const cache = join(dir, 'cache');
        mkdirSync(cache, { recursive: true });

        const out = execFileSync('bash', [GUARD], {
            cwd: repo,
            input: JSON.stringify({ stop_hook_active: scenario.again === true }),
            env: {
                ...process.env,
                CLAUDE_PROJECT_DIR: repo,
                RT_GH_BIN: scenario.noGh ? join(dir, 'нет-такого-помощника') : gh,
                TMPDIR: cache,
            },
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore'],
        }).trim();

        if (!out) return 'pass';
        try {
            return JSON.parse(out).reason ?? 'pass';
        } catch {
            return 'pass';
        }
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
}

const DRAFT = { number: 900, isDraft: true, state: 'OPEN', headRefOid: HEAD_MARK, url: 'x' };
const READY = { ...DRAFT, isDraft: false };
const GREEN = [{ headSha: HEAD_MARK, status: 'completed', conclusion: 'success' }];
const RUNNING = [{ headSha: HEAD_MARK, status: 'in_progress', conclusion: null }];
const FAILED = [{ headSha: HEAD_MARK, status: 'completed', conclusion: 'failure' }];
const ALIEN = [{ headSha: '0'.repeat(40), status: 'completed', conclusion: 'success' }];

const PASS = 'ход разрешён';

const SCENARIOS = [
    {
        name: 'папка разобрана, прогон зелёный — отбивает и требует снять черновик',
        pr: DRAFT,
        runs: GREEN,
        taskFolder: false,
        expect: /всё ещё черновик[\s\S]*pr ready 900/,
    },
    {
        name: 'этапы закрыты, папка ещё в ветке — отбивает и требует сперва разобрать папку',
        pr: DRAFT,
        runs: GREEN,
        taskFolder: true,
        stageLine: 'все три закрыты',
        expect: /работа не убрана[\s\S]*папка задачи разбирается последним коммитом/,
    },
    {
        name: 'этапы открыты — молчит: работа ещё идёт, и черновик при ней законен',
        pr: DRAFT,
        runs: GREEN,
        taskFolder: true,
        stageLine: '2 из 3, форвард положен',
        expect: PASS,
    },
    {
        name: 'прогон ещё идёт — молчит: о работе известно только что она запушена',
        pr: DRAFT,
        runs: RUNNING,
        taskFolder: false,
        expect: PASS,
    },
    {
        name: 'прогон красный — молчит: гард говорит о готовности, а не о поломке',
        pr: DRAFT,
        runs: FAILED,
        taskFolder: false,
        expect: PASS,
    },
    {
        name: 'зелёный прогон чужого коммита — молчит: судится вершина PR',
        pr: DRAFT,
        runs: ALIEN,
        taskFolder: false,
        expect: PASS,
    },
    {
        name: 'черновик уже снят — молчит: отбивать нечего',
        pr: READY,
        runs: GREEN,
        taskFolder: false,
        expect: PASS,
    },
    {
        name: 'PR закрыт — молчит',
        pr: { ...DRAFT, state: 'CLOSED' },
        runs: GREEN,
        taskFolder: false,
        expect: PASS,
    },
    {
        name: 'повторный заход по тому же ходу — молчит: гард сказал своё один раз',
        pr: DRAFT,
        runs: GREEN,
        taskFolder: false,
        again: true,
        expect: PASS,
    },
    {
        name: 'помощника хостинга нет — молчит: отказ в пользу работы',
        pr: DRAFT,
        runs: GREEN,
        taskFolder: false,
        noGh: true,
        expect: PASS,
    },
];

const failures = [];
for (const scenario of SCENARIOS) {
    let got;
    try {
        got = runGuard(scenario);
    } catch (error) {
        failures.push(`${scenario.name}\n      гард упал: ${String(error.message).split('\n')[0]}`);
        continue;
    }
    const ok = scenario.expect === PASS ? got === 'pass' : got !== 'pass' && scenario.expect.test(got);
    if (!ok) {
        const shown = got === 'pass' ? PASS : `отбивка «${got.split('\n')[0]}»`;
        failures.push(`${scenario.name}\n      ждали: ${scenario.expect}\n      вышло: ${shown}`);
    }
}

if (failures.length > 0) {
    console.error(`check-hooks: сценариев ${SCENARIOS.length}, разошлось ${failures.length}\n`);
    for (const failure of failures) console.error(`  ${failure}\n`);
    process.exit(1);
}

console.log(`check-hooks: сценариев ${SCENARIOS.length} — все сошлись`);
