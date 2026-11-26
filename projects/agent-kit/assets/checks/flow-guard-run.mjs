/**
 * The reading half of the guard of the course of work: the hook input as a call, and the context the
 * decisions of `flow-guard.mjs` take. The owner's last word comes from the source «source.owner» of
 * the description.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative } from 'node:path';

import { approvalFault, openRecords } from './flow-step.mjs';

/**
 * The path with its symbolic links resolved, the part that does not exist yet kept as written: a
 * temporary directory under a link and the root git names must give one relative path.
 */
export function realPath(path) {
    if (existsSync(path)) return realpathSync(path);
    const parent = dirname(path);
    return parent === path ? path : join(realPath(parent), basename(path));
}

/** The call of the hook input: the tool and what it writes, with the path relative to the root. */
export function callOf(input, root) {
    const tool = input.tool_name ?? '';
    const args = input.tool_input ?? {};
    const raw = args.file_path ?? args.notebook_path ?? '';
    const path = raw ? relative(realPath(root), realPath(isAbsolute(raw) ? raw : join(input.cwd ?? root, raw))) : '';
    if (tool === 'Bash') return { tool, command: args.command ?? '' };
    if (tool === 'Write') return { tool, path, content: args.content ?? '' };
    if (tool === 'Edit') return { tool, path, edits: [{ oldString: args.old_string ?? '', newString: args.new_string ?? '', replaceAll: Boolean(args.replace_all) }] };
    if (tool === 'MultiEdit') {
        return { tool, path, edits: (args.edits ?? []).map((edit) => ({ oldString: edit.old_string ?? '', newString: edit.new_string ?? '', replaceAll: Boolean(edit.replace_all) })) };
    }
    return null;
}

const git = (root, ...args) => {
    const out = spawnSync('git', ['-C', root, ...args], { encoding: 'utf8' });
    return out.status === 0 ? out.stdout.trim() : null;
};

const EPIC_BRANCH = /\*\*(?:Ветка эпика|Epic branch):\*\*\s*`([^`]+)`/u;

/** The epic branch a plan file names, or null: a directory, a dangling link or an unreadable file names none. */
const epicOf = (path) => {
    try {
        return statSync(path).isFile() ? (readFileSync(path, 'utf8').match(EPIC_BRANCH)?.[1] ?? null) : null;
    } catch {
        return null;
    }
};

/**
 * The merge in progress of a reviewed base: its head lies in the remote main branch or in the remote
 * branch of an epic a plan of `plansDir` names. Its unmerged paths, relative to the root, and the root;
 * null with no merge, with a head nobody pushed, or when the merge cannot be read: then the rule of the
 * guarded files judges, never a failed engine that lets every call through.
 */
export function reviewedMerge(root, plansDir) {
    try {
        const head = git(root, 'rev-parse', '-q', '--verify', 'MERGE_HEAD');
        if (!head) return null;
        const holds = (ref) => spawnSync('git', ['-C', root, 'merge-base', '--is-ancestor', head, ref]).status === 0;
        const mains = [git(root, 'symbolic-ref', '-q', '--short', 'refs/remotes/origin/HEAD'), 'origin/main'].filter(Boolean);
        const dir = join(root, plansDir);
        const epics = () => (existsSync(dir) ? readdirSync(dir).filter((name) => name.endsWith('.md')).map((name) => epicOf(join(dir, name))).filter(Boolean) : []);
        if (!mains.some(holds) && !epics().some((branch) => holds(`origin/${branch}`))) return null;
        const unmerged = new Set((git(root, 'diff', '--name-only', '--diff-filter=U') ?? '').split('\n').filter(Boolean));
        return { unmerged, roots: [...new Set([root, realPath(root)])] };
    } catch {
        return null;
    }
}

/**
 * The context of the decisions for the tree at `root`. `measure` is a thunk the engine gives: the
 * index of the measured state, read only when an edit moves the state line.
 */
export function guardContext({ root, model, marks, owner, measure, settings }) {
    const branch = git(root, 'rev-parse', '--abbrev-ref', 'HEAD') ?? '';
    const common = git(root, 'rev-parse', '--git-common-dir') ?? '.git';
    const marksAbs = join(isAbsolute(common) ? common : join(root, common), 'rt-kit');
    const states = model.states.map((state) => state.title);
    let merged;
    return {
        branch,
        key: branch.match(/^([A-Z]+)-\d+/)?.[1] ?? settings.key,
        tasksDir: settings.tasksDir,
        plansDir: settings.plansDir,
        marksDir: relative(root, marksAbs),
        overridePath: settings.overridePath,
        protectedPaths: settings.protectedPaths,
        legacy: model.words.legacyBranches ?? [],
        // The merge of a reviewed base in progress, read once and only by a decision on a guarded file.
        get merge() {
            return (merged ??= { value: reviewedMerge(root, settings.plansDir) }).value;
        },
        read: (path) => (existsSync(join(root, path)) ? readFileSync(join(root, path), 'utf8') : null),
        committed: (path) => {
            // The text the oldest commit of the branch that added the file wrote, or null.
            const sha = (git(root, 'log', '--diff-filter=A', '--format=%H', 'HEAD', '--', path) ?? '').split('\n').filter(Boolean).pop();
            return sha ? git(root, 'show', `${sha}:${path}`) : null;
        },
        stepMark: (number) => marks.step(branch, number),
        // The approval holds when the owner's answer stands at the place the mark names, for the plan
        // commit the mark names; the reason when it does not.
        approvalFault: () => {
            const plan = `${settings.tasksDir}/${branch}/plan.md`;
            const sha = (git(root, 'log', '--diff-filter=A', '--format=%H', 'HEAD', '--', plan) ?? '').split('\n').filter(Boolean).pop() ?? null;
            const task = branch.match(/^([A-Z]+-\d+)-/)?.[1] ?? branch;
            return approvalFault(marks.approval(branch), sha, task, openRecords(root));
        },
        approved() {
            return this.approvalFault() === null;
        },
        isRecord: (path) => openRecords(root).holds(isAbsolute(path) ? path : join(realPath(root), path)),
        ownerLast: () => owner.last(),
        // The place counts from one, as the measured index does; a word outside the list is -1.
        stateIndex: (name) => (states.includes(name) ? states.indexOf(name) + 1 : -1),
        measured: () => {
            try {
                return measure();
            } catch {
                return null;
            }
        },
    };
}
