// rt-kit v0.37.0 · checks/flow-guard-run.mjs · dcaa75df4267 · правится надстройкой, не здесь
/**
 * The reading half of the guard of the course of work: the hook input as a call, the owner's last
 * word from the record of the conversation, and the context the decisions of `flow-guard.mjs` take.
 *
 * The owner's last word is the last entry of the record the owner made: a typed message, or the
 * options chosen in a menu. A message of a hook, a summary of a compaction and a meta entry are no
 * word of the owner.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative } from 'node:path';

import { readRecord } from './flow-plan.mjs';

/** The menu answer as the tool result text carries it. */
const ANSWERED = /^(?:The user answered|Your questions have been answered):/;

const ownerEntry = (entry) =>
    entry?.type === 'user' && !entry.isMeta && !entry.isCompactSummary && (entry.origin?.kind ?? 'human') === 'human';

const resultText = (content) =>
    typeof content === 'string' ? content : Array.isArray(content) ? content.map((part) => (typeof part === 'object' ? (part.text ?? '') : '')).join(' ') : '';

/** The word of one entry of the record: typed text or chosen options; null when it carries neither. */
export function wordOf(entry) {
    if (!ownerEntry(entry)) return null;
    if (entry.toolUseResult?.answers) return Object.values(entry.toolUseResult.answers).join('\n');
    const content = entry.message?.content;
    if (typeof content === 'string') return content;
    if (!Array.isArray(content)) return null;
    const words = [];
    for (const part of content) {
        if (part?.type === 'text' && part.text) words.push(part.text);
        if (part?.type === 'tool_result') {
            const text = resultText(part.content);
            if (ANSWERED.test(text)) words.push([...text.matchAll(/"=\s*"([^"]*)"/g)].map((match) => match[1]).join('\n'));
        }
    }
    return words.length > 0 ? words.join('\n') : null;
}

/** The owner's last word in the record, or null. */
export function ownerLast(entries) {
    for (let index = entries.length - 1; index >= 0; index -= 1) {
        const word = wordOf(entries[index]);
        if (word !== null) return word;
    }
    return null;
}

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

/**
 * The context of the decisions for the tree at `root`. `measure` is a thunk the engine gives: the
 * index of the measured state, read only when an edit moves the state line.
 */
export function guardContext({ root, model, marks, record, measure, settings }) {
    const branch = git(root, 'rev-parse', '--abbrev-ref', 'HEAD') ?? '';
    const common = git(root, 'rev-parse', '--git-common-dir') ?? '.git';
    const marksAbs = join(isAbsolute(common) ? common : join(root, common), 'rt-kit');
    const states = model.states.map((state) => state.title);
    let last;
    return {
        branch,
        key: branch.match(/^([A-Z]+)-\d+/)?.[1] ?? settings.key,
        tasksDir: settings.tasksDir,
        plansDir: settings.plansDir,
        marksDir: relative(root, marksAbs),
        overridePath: settings.overridePath,
        protectedPaths: settings.protectedPaths,
        legacy: model.words.legacyBranches ?? [],
        read: (path) => (existsSync(join(root, path)) ? readFileSync(join(root, path), 'utf8') : null),
        stepMark: (number) => marks.step(branch, number),
        approved: () => Boolean(marks.approval(branch)),
        ownerLast: () => {
            if (last === undefined) last = ownerLast(record);
            return last;
        },
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

/** Reads the record the hook names; a missing record is an empty one. */
export const recordOf = (input) => readRecord(input.transcript_path ?? process.env.RT_FLOW_TRANSCRIPT);
