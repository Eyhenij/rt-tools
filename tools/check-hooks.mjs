#!/usr/bin/env node
/**
 * The scenarios of the tree's guards: a guard is run for real, with a substituted input and a
 * substituted host helper, and its verdict is matched against the expected one.
 *
 * Why this exists. A guard is the only part of the rules layer a machine carries out rather than a
 * person reads. An error in it stays silent: a broken guard lets a turn through, and that is
 * indistinguishable from "everything is fine". The draft-lifting guard was written, checked live on
 * one outcome and in the same hour let the second one through — because the second outcome was not
 * in it at all, and that could be seen only by going through them. The analysis is the record
 * «2026-08-16-draft-guard-half-closed» in the intake.
 *
 * Every scenario raises a temporary repository of its own: the branch, the history, the progress,
 * the task folder. The host is substituted through `RT_GH_BIN` — the scenarios do not touch the
 * network and go on a plane the same as on a desk. The guard's cache is led away by a `TMPDIR` of
 * its own, otherwise one scenario's answer would reach the next.
 *
 * A non-zero exit code and a list of what diverged.
 */
import { execFileSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
/**
 * The path to the guard is overridden by a variable so that the set can be pointed at a copy broken
 * on purpose: a set that does not turn red on a breakage checks nothing, and one can be sure of
 * that only by breaking it.
 */
const GUARD = process.env.RT_GUARD_PATH || join(ROOT, '.claude/hooks/git-guard-draft-ready.sh');

const BRANCH = 'RT-900-probe';
/** The scenario's neighbouring branch: its request is the one abandoned by leaving. */
const OTHER = 'RT-901-neighbour';
/** The head is known only after the commit, so the drafts carry a mark rather than a sha. */
const HEAD_MARK = '__HEAD__';
const OTHER_MARK = '__OTHER__';

/**
 * The substituted host helper: it answers with the scenario's draft and does not go to the network.
 *
 * A scenario may give no list of requests — then the helper answers with a refusal, as a real one
 * without the network does, and the guard's second tier must stay silent. The runs differ by
 * branch: the neighbouring request has its own head and its own outcome, otherwise an abandoned
 * draft could not be told from the current one.
 */
function fakeGh(dir, repo, { pr, runs, prList, otherRuns }) {
    const path = join(dir, 'gh');
    const subst = `sed "s/${HEAD_MARK}/$head/g;s/${OTHER_MARK}/$other/g"`;
    writeFileSync(
        path,
        `#!/usr/bin/env bash
head="$(git -C '${repo}' rev-parse HEAD)"
other="$(git -C '${repo}' rev-parse ${OTHER} 2>/dev/null)"
case "$1 $2" in
    'pr view') printf '%s' '${JSON.stringify(pr)}' | ${subst} ;;
    'pr list') ${prList ? `printf '%s' '${JSON.stringify(prList)}' | ${subst}` : 'exit 1'} ;;
    'run list')
        case "$4" in
            '${OTHER}') printf '%s' '${JSON.stringify(otherRuns ?? [])}' | ${subst} ;;
            *) printf '%s' '${JSON.stringify(runs)}' | ${subst} ;;
        esac
        ;;
    *) exit 1 ;;
esac
`,
    );
    chmodSync(path, 0o755);
    return path;
}

/** The scenario's repository: the branch, the progress and the task folder the scenario describes. */
function makeRepo(dir, { taskFolder, stageLine, stageKey = 'Stage', bot = 'rt-probe-bot', otherFolder }) {
    const repo = join(dir, 'repo');
    mkdirSync(repo, { recursive: true });
    const git = (...args) => execFileSync('git', ['-C', repo, ...args], { stdio: 'pipe' });

    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'probe@example.invalid');
    git('config', 'user.name', 'probe');
    git('config', 'commit.gpgsign', 'false');
    writeFileSync(join(repo, 'README.md'), '# a probe\n');
    git('add', '-A');
    git('commit', '-q', '-m', 'the base');

    // The machine account's name the guard reads from the tree's profile. A scenario that does not
    // put it there checks exactly a tree without a machine account: it gets no second tier.
    if (bot) {
        mkdirSync(join(repo, '.claude/rt-kit'), { recursive: true });
        writeFileSync(join(repo, '.claude/rt-kit/checks.json'), JSON.stringify({ board: { bot } }));
        git('add', '-A');
        git('commit', '-q', '-m', 'the tree profile');
    }

    // A neighbouring branch with a request of its own: a folder taken apart means ready work, one
    // lying means work in progress.
    if (otherFolder !== undefined) {
        git('checkout', '-q', '-b', OTHER);
        if (otherFolder) {
            const folder = join(repo, 'docs/tasks', OTHER);
            mkdirSync(folder, { recursive: true });
            writeFileSync(join(folder, 'plan.md'), '# The plan\n');
        } else {
            mkdirSync(join(repo, 'docs'), { recursive: true });
            writeFileSync(join(repo, 'docs/neighbour.md'), 'the folder is taken apart\n');
        }
        git('add', '-A');
        git('commit', '-q', '-m', 'the neighbouring branch');
        git('checkout', '-q', 'main');
    }

    git('checkout', '-q', '-b', BRANCH);

    if (taskFolder) {
        const folder = join(repo, 'docs/tasks', BRANCH);
        mkdirSync(folder, { recursive: true });
        writeFileSync(join(folder, 'plan.md'), '# The plan\n');
        writeFileSync(
            join(folder, 'progress.md'),
            `# The progress\n\n## Where we stand\n\n- **${stageKey}:** ${stageLine}\n`,
        );
    } else {
        mkdirSync(join(repo, 'docs'), { recursive: true });
        writeFileSync(join(repo, 'docs/note.md'), 'the folder is taken apart\n');
    }
    git('add', '-A');
    git('commit', '-q', '-m', 'the state of the branch');
    return repo;
}

/** A run of the guard. Returns `pass` when the turn is allowed, otherwise the refusal text. */
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
                RT_GH_BIN: scenario.noGh ? join(dir, 'no-such-helper') : gh,
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

/** The list of the machine account's open drafts — what the guard sees neighbouring branches by. */
const OTHER_LIST = [{ number: 901, headRefName: OTHER, headRefOid: OTHER_MARK }];
const SELF_LIST = [{ number: 900, headRefName: BRANCH, headRefOid: HEAD_MARK }];
const GREEN_OTHER = [{ headSha: OTHER_MARK, status: 'completed', conclusion: 'success' }];
const RUNNING_OTHER = [{ headSha: OTHER_MARK, status: 'in_progress', conclusion: null }];

const PASS = 'the turn is allowed';

const SCENARIOS = [
    {
        name: 'the folder is taken apart, the run is green — refuses and demands the draft be lifted',
        pr: DRAFT,
        runs: GREEN,
        taskFolder: false,
        expect: /is still a draft[\s\S]*pr ready 900/,
    },
    {
        name: 'the stages are closed, the folder is still in the branch — demands it be taken apart first',
        pr: DRAFT,
        runs: GREEN,
        taskFolder: true,
        stageLine: 'all three are closed',
        expect: /the work is not cleaned up after[\s\S]*the task folder is taken apart by the last commit/,
    },
    {
        name: 'the stage line is written under the Russian name — read the same way',
        pr: DRAFT,
        runs: GREEN,
        taskFolder: true,
        stageKey: 'Этап',
        stageLine: 'все три закрыты',
        expect: /the work is not cleaned up after[\s\S]*the task folder is taken apart by the last commit/,
    },
    {
        name: 'the stages are open — silent: the work is still going, and a draft with it is lawful',
        pr: DRAFT,
        runs: GREEN,
        taskFolder: true,
        stageLine: '2 of 3, the forward is laid',
        expect: PASS,
    },
    {
        name: 'the run is still going — silent: of the work it is known only that it was sent',
        pr: DRAFT,
        runs: RUNNING,
        taskFolder: false,
        expect: PASS,
    },
    {
        name: 'the run is red — silent: the guard speaks of readiness, not of a breakage',
        pr: DRAFT,
        runs: FAILED,
        taskFolder: false,
        expect: PASS,
    },
    {
        name: "a green run of a foreign commit — silent: the PR's head is judged",
        pr: DRAFT,
        runs: ALIEN,
        taskFolder: false,
        expect: PASS,
    },
    {
        name: 'the draft is already lifted — silent: there is nothing to refuse',
        pr: READY,
        runs: GREEN,
        taskFolder: false,
        expect: PASS,
    },
    {
        name: 'the PR is closed — silent',
        pr: { ...DRAFT, state: 'CLOSED' },
        runs: GREEN,
        taskFolder: false,
        expect: PASS,
    },
    {
        name: 'a repeated approach on the same turn — silent: the guard said its word once',
        pr: DRAFT,
        runs: GREEN,
        taskFolder: false,
        again: true,
        expect: PASS,
    },
    {
        name: 'there is no host helper — silent: a refusal in favour of the work',
        pr: DRAFT,
        runs: GREEN,
        taskFolder: false,
        noGh: true,
        expect: PASS,
    },
    {
        name: "a neighbouring branch's draft is abandoned — refuses and names its number",
        pr: READY,
        runs: GREEN,
        taskFolder: false,
        prList: OTHER_LIST,
        otherRuns: GREEN_OTHER,
        otherFolder: false,
        expect: /abandoned as a draft[\s\S]*pr ready 901/,
    },
    {
        name: 'the neighbouring branch carries its task folder — silent: the work there is still going',
        pr: READY,
        runs: GREEN,
        taskFolder: false,
        prList: OTHER_LIST,
        otherRuns: GREEN_OTHER,
        otherFolder: true,
        expect: PASS,
    },
    {
        name: "the neighbouring request's run is still going — silent: it says nothing about readiness",
        pr: READY,
        runs: GREEN,
        taskFolder: false,
        prList: OTHER_LIST,
        otherRuns: RUNNING_OTHER,
        otherFolder: false,
        expect: PASS,
    },
    {
        name: 'the machine account is not named by the tree — silent: there is nobody to ask the list of',
        pr: READY,
        runs: GREEN,
        taskFolder: false,
        bot: '',
        prList: OTHER_LIST,
        otherRuns: GREEN_OTHER,
        otherFolder: false,
        expect: PASS,
    },
    {
        name: 'the host gave no list of requests — silent: a refusal in favour of the work',
        pr: READY,
        runs: GREEN,
        taskFolder: false,
        otherRuns: GREEN_OTHER,
        otherFolder: false,
        expect: PASS,
    },
    {
        name: "the current branch's request is in the list — the second tier does not judge it twice",
        pr: DRAFT,
        runs: GREEN,
        taskFolder: true,
        stageLine: '2 of 3, the forward is laid',
        prList: SELF_LIST,
        expect: PASS,
    },
];

const failures = [];
for (const scenario of SCENARIOS) {
    let got;
    try {
        got = runGuard(scenario);
    } catch (error) {
        failures.push(`${scenario.name}\n      the guard fell: ${String(error.message).split('\n')[0]}`);
        continue;
    }
    const ok = scenario.expect === PASS ? got === 'pass' : got !== 'pass' && scenario.expect.test(got);
    if (!ok) {
        const shown = got === 'pass' ? PASS : `the refusal «${got.split('\n')[0]}»`;
        failures.push(`${scenario.name}\n      expected: ${scenario.expect}\n      came out: ${shown}`);
    }
}

if (failures.length > 0) {
    console.error(`check-hooks: scenarios ${SCENARIOS.length}, diverged ${failures.length}\n`);
    for (const failure of failures) console.error(`  ${failure}\n`);
    process.exit(1);
}

console.log(`check-hooks: scenarios ${SCENARIOS.length} — all matched`);
