// rt-kit v0.39.0 · checks/task-new-epic.github.mjs · 5c63e82c1699 · правится надстройкой, не здесь
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
 * working tree on the tip of the main branch: the working copy is not switched, and its edits go
 * nowhere. The commit and the push go through the hooks of the tree like any other. A tree whose hooks
 * need an install of their own names the command in `board.epicTreeInstall`; without it the
 * `node_modules` of the working copy are linked.
 *
 * FAIL-OPEN: no repository or no remote main branch — the draft is laid in the working copy.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { BOT, TASK_KEY } from './board.mjs';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const MAIN = CONFIG.deploy?.mainBranch || 'main';

const git = (args, cwd, env = process.env) => spawnSync('git', args, { cwd, env, encoding: 'utf8' });
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
        const run = spawnSync('bash', ['-c', install], { cwd: tree, env, encoding: 'utf8' });
        return run.status === 0 ? null : `${install}: ${said(run)}`;
    }
    const own = join(ROOT, 'node_modules');
    if (existsSync(own) && !existsSync(join(tree, 'node_modules'))) {
        symlinkSync(own, join(tree, 'node_modules'));
    }
    return null;
}

/** Commits the draft in the temporary tree and pushes the branch; the reason of a failure, or null. */
function commitAndPush(tree, { planPath, branch, number, text }, env) {
    const unprepared = prepare(tree, env);
    if (unprepared) {
        return unprepared;
    }
    mkdirSync(dirname(join(tree, planPath)), { recursive: true });
    writeFileSync(join(tree, planPath), text);
    for (const args of [
        ['add', '--', planPath],
        ['commit', '-q', '-m', `docs: план эпика ${TASK_KEY}-${number}`],
        ['push', '-q', '-u', 'origin', branch],
    ]) {
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
    git(['fetch', '-q', 'origin', MAIN], ROOT);
    const holder = mkdtempSync(join(tmpdir(), 'rt-epic-'));
    const tree = join(holder, 'tree');
    let why = null;
    try {
        const made = git(['worktree', 'add', '-q', '--no-track', '-b', draft.branch, tree, `origin/${MAIN}`], ROOT);
        why = made.status === 0 ? commitAndPush(tree, draft, identity()) : `git worktree: ${said(made)}`;
        return { sent: why === null, why };
    } finally {
        git(['worktree', 'remove', '--force', tree], ROOT);
        // The branch that did not reach the host is taken by hand, by the printed line: left here, it
        // would refuse that line. The draft lies in the working copy.
        if (why !== null) {
            git(['branch', '-q', '-D', draft.branch], ROOT);
        }
        rmSync(holder, { recursive: true, force: true });
        git(['worktree', 'prune'], ROOT);
    }
}

/**
 * The draft of the epic plan. An existing file is not overwritten: a plan written before the card is
 * a lawful order — the makeup is thought out first, and the card is created under a ready one. It is
 * that file that goes to the host then, and it stays in the working copy.
 */
export function layEpicPlan({ title, number, branch, planPath }) {
    const path = join(ROOT, planPath);
    const written = existsSync(path);
    const text = written ? readFileSync(path, 'utf8') : draftOf({ title, number, branch });
    const { sent, why } = send({ planPath, branch, number, text });
    if (sent) {
        console.log(`\nThe plan of the epic is in the branch ${branch} on the host: ${planPath}`);
        return { sent };
    }
    if (!written) {
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, text);
    }
    console.log(written ? `\nThe plan of the epic is already in place: ${planPath}` : `\nThe draft of the epic plan: ${planPath}`);
    if (why) {
        console.error(`task-new: the branch of the epic is not on the host — ${why}`);
    }
    return { sent };
}
