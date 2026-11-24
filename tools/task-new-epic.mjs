// rt-kit v0.39.1 · checks/task-new-epic.github.mjs · 846c939b3a88 · правится надстройкой, не здесь
/**
 * The draft of the epic plan and its way to the host.
 *
 * The draft is assembled here and not copied from a sample: the sample would have to be laid out at a
 * fixed address, while the directory of plans is each tree's own — and a draft assembled here comes
 * with the number, the title and the branch already filled in, which a copied one would leave to be
 * typed by hand.
 *
 * An epic is declared in the middle of other work, and the working copy then stands on the branch of
 * that work with its edits. So the branch of the epic is taken, committed and pushed from a temporary
 * clone on the tip of the main branch: the working copy is not switched, and its edits go nowhere. The
 * commit and the push go through the hooks of the tree like any other. A tree whose hooks need an
 * install of their own names the command in `board.epicTreeInstall`; without it the `node_modules` of
 * the working copy are linked.
 *
 * It is a clone and not a linked working tree: git gives the hooks of a linked one `GIT_DIR` of the
 * shared repository, and a check that makes a repository of its own writes its settings there. A live
 * call from a linked tree left the shared repository bare.
 *
 * The push waits for the whole set of the tree before a push, and a call may be cut short there. So the
 * draft lies in the working copy before the push and leaves it after: a call cut short loses nothing.
 *
 * FAIL-OPEN: no repository or no remote main branch — the draft is laid in the working copy.
 */
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, resolve } from 'node:path';

import { BOT, TASK_KEY } from './board.mjs';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const MAIN = CONFIG.deploy?.mainBranch || 'main';

/** A push prints the whole set of the tree: past the default limit of the output the call would be killed. */
const OUTPUT = { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 };

const git = (args, cwd, env = process.env) => spawnSync('git', args, { cwd, env, ...OUTPUT });
const said = (run) => (run.stderr || run.stdout || `exited ${run.status}`).trim().split('\n').slice(-5).join('\n');

function draftOf({ title, number, branch }) {
    return [
        `# ${title}`,
        '',
        `**Эпик:** ${TASK_KEY}-${number} · **Ветка эпика:** \`${branch}\``,
        '',
        '## Что даёт',
        '',
        '<Возможность, ради которой эпик заведён: что владелец получит и чего не может сегодня.>',
        '',
        '## Точки',
        '',
        '- **A:** <где продукт стоит сейчас>',
        `- **B (${TASK_KEY}-<номер>):** <изменение, которое увидит человек>. Признак: <команда, страница или число>`,
        '- **G (веха эпика):** <состояние продукта, ради которого заведены задачи>. Признак: <команда, страница или число>',
        '',
        '## Как стоят ветки',
        '',
        'Ветка эпика отведена от главной, ветки задач — от неё, заявки задач идут в неё. <Стопкой',
        'ветки задач стоят или каждая от ветки эпика — решает этот план, а не тот, кто заводит',
        'ветку.>',
        '',
        '## Состав',
        '',
        '| #   | Задача                                   | Состояние |',
        '| --- | ---------------------------------------- | --------- |',
        `| 1   | ${TASK_KEY}-<номер> — <что делает>        | впереди   |`,
        '',
        '## Чего эпик не делает',
        '',
        '- <Что лежит рядом и в эпик не входит.>',
        '',
    ].join('\n');
}

/** Removes the directories the draft made and nothing else lies in, up to the root of the tree. */
function rmdirEmpty(dir) {
    if (dir !== ROOT && readdirSync(dir).length === 0) {
        rmdirSync(dir);
        rmdirEmpty(dirname(dir));
    }
}

/** The identity of the commit: the caller's own, or the machine mail the tree profile names. */
function identity() {
    if (process.env.GIT_AUTHOR_EMAIL) {
        return process.env;
    }
    const profile = '. .claude/rt-kit/defaults/project.sh; . .claude/rt-kit/project.sh; printf %s "${RT_COMMIT_EMAIL:-}"';
    const mail = (spawnSync('bash', ['-c', profile], { cwd: ROOT, encoding: 'utf8' }).stdout ?? '').trim();
    if (!mail || !BOT) {
        return process.env;
    }
    return { ...process.env, GIT_AUTHOR_NAME: BOT, GIT_AUTHOR_EMAIL: mail, GIT_COMMITTER_NAME: BOT, GIT_COMMITTER_EMAIL: mail };
}

/** What the hooks of the tree run on: an install of its own, or the modules of the working copy. */
function prepare(tree, env) {
    const install = CONFIG.board?.epicTreeInstall;
    if (install) {
        const run = spawnSync('bash', ['-c', install], { cwd: tree, env, ...OUTPUT });
        return run.status === 0 ? null : `${install}: ${said(run)}`;
    }
    const own = join(ROOT, 'node_modules');
    if (existsSync(own) && !existsSync(join(tree, 'node_modules'))) {
        symlinkSync(own, join(tree, 'node_modules'));
    }
    return null;
}

/**
 * Commits the draft in the clone and pushes the branch; the reason of a failure, or null. A plan the
 * main branch already holds is not overwritten: over it the draft is not laid, and one written in the
 * working copy that differs from it is not sent.
 */
function commitAndPush(tree, { planPath, branch, number, text, written }, env) {
    const unprepared = prepare(tree, env);
    if (unprepared) {
        return unprepared;
    }
    const plan = join(tree, planPath);
    const held = existsSync(plan);
    if (held && written && readFileSync(plan, 'utf8') !== text) {
        return `the branch ${MAIN} of the host holds another ${planPath}`;
    }
    if (!held) {
        mkdirSync(dirname(plan), { recursive: true });
        writeFileSync(plan, text);
    }
    const commit = [
        ['add', '--', planPath],
        ['commit', '-q', '-m', `docs: план эпика ${TASK_KEY}-${number}`],
    ];
    for (const args of [...(held ? [] : commit), ['push', '-q', '-u', 'origin', branch]]) {
        const run = git(args, tree, env);
        if (run.status !== 0) {
            return `git ${args[0]}: ${said(run)}`;
        }
    }
    return null;
}

/**
 * Takes the branch of the epic with the draft to the host. Answers `{ sent, why }`: not sent and no
 * reason — there is nowhere to send to, and the draft lies in the working copy.
 */
function send(draft) {
    if (git(['rev-parse', '--verify', '--quiet', `origin/${MAIN}`], ROOT).status !== 0) {
        return { sent: false, why: null };
    }
    const holder = mkdtempSync(join(tmpdir(), 'rt-epic-'));
    const tree = join(holder, 'tree');
    console.log(`The branch ${draft.branch} goes to the host from ${tree}; a call cut short leaves that directory`);
    try {
        const why = cloneAt(tree, draft.branch) ?? commitAndPush(tree, draft, identity());
        if (why === null) {
            git(['fetch', '-q', 'origin', `+refs/heads/${draft.branch}:refs/remotes/origin/${draft.branch}`], ROOT);
        }
        return { sent: why === null, why };
    } finally {
        rmSync(holder, { recursive: true, force: true });
    }
}

/** The settings of the working copy a push from the clone rests on: who commits, by which road and through which hooks. */
const CARRIED = /^(user|credential|url|http|https|commit|gpg|includeif)\.|^remote\.origin\.(url|pushurl)$|^core\.(sshcommand|hookspath)$/;

/** A relative address of the host is read from the working copy, not from the clone. */
const addressed = (key, value) => (/^remote\.origin\./.test(key) && /^\.{1,2}\//.test(value) ? resolve(ROOT, value) : value);

/** The temporary clone on the tip of the main branch of the host, with its settings and hooks; the reason of a failure, or null. */
function cloneAt(tree, branch) {
    const entries = git(['config', '--local', '--null', '--list'], ROOT)
        .stdout.split('\0')
        .map((entry) => [entry.slice(0, entry.indexOf('\n')), entry.slice(entry.indexOf('\n') + 1)])
        .filter(([key]) => CARRIED.test(key));
    for (const [args, cwd] of [
        [['clone', '-q', '--shared', '--no-checkout', ROOT, tree], ROOT],
        [['config', '--unset-all', 'remote.origin.url'], tree],
        ...entries.map(([key, value]) => [['config', '--add', key, addressed(key, value)], tree]),
        [['fetch', '-q', '--prune', 'origin', '+refs/heads/*:refs/remotes/origin/*'], tree],
        [['checkout', '-q', '--no-track', '-b', branch, `origin/${MAIN}`], tree],
    ]) {
        const run = git(args, cwd);
        if (run.status !== 0) {
            return `git ${args[0]}: ${said(run)}`;
        }
    }
    carryHooks(tree);
    return null;
}

/** Hooks history does not hold — those of `.git/hooks` and of a directory an install made — are copied into the clone. */
function carryHooks(tree) {
    const path = git(['config', 'core.hooksPath'], ROOT).stdout.trim();
    const own = path ? resolve(ROOT, path) : resolve(ROOT, git(['rev-parse', '--git-path', 'hooks'], ROOT).stdout.trim());
    const copy = path ? join(tree, path) : join(tree, '.git/hooks');
    if (!isAbsolute(path) && existsSync(own) && !(path && existsSync(copy))) {
        cpSync(own, copy, { recursive: true });
    }
}

/**
 * The draft of the epic plan. An existing file is not overwritten: a plan written before the card is
 * a lawful order — the makeup is thought out first, and the card is created under a ready one. It is
 * that file that goes to the host then. Sent, a file history does not hold leaves the working copy: it
 * lies in the branch word for word, and the checkout of that branch would refuse over it.
 */
export function layEpicPlan({ title, number, branch, planPath }) {
    const path = join(ROOT, planPath);
    const written = existsSync(path);
    if (!written) {
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, draftOf({ title, number, branch }));
    }
    const text = readFileSync(path, 'utf8');
    const { sent, why } = send({ planPath, branch, number, text, written });
    if (sent) {
        if (git(['ls-files', '--error-unmatch', '--', planPath], ROOT).status !== 0 && readFileSync(path, 'utf8') === text) {
            rmSync(path);
            rmdirEmpty(dirname(path));
        }
        console.log(`\nThe plan of the epic is in the branch ${branch} on the host: ${planPath}`);
        return { sent };
    }
    console.log(written ? `\nThe plan of the epic is already in place: ${planPath}` : `\nThe draft of the epic plan: ${planPath}`);
    if (why) {
        console.error(`task-new: the branch of the epic is not on the host — ${why}`);
    }
    return { sent };
}
