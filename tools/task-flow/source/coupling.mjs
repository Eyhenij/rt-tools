// rt-kit v0.39.1 · task-flow/source/coupling.mjs · 8c4947ad4950 · правится надстройкой, не здесь
/**
 * The source «source.coupling» of the task flow description: the answer of the command
 * `check-coupling.mjs --base=<revision>`, the only count of the links.
 *
 *   from(sha)  { answered, problems, now } — whether the command answered against the plan `sha`, the
 *              lines it refuses by and path → the outgoing links a module of the branch has now, 0 for a
 *              removed one
 *
 * An answer is a run with no refusal or with the line of violations: an unknown revision, an absent or a
 * broken command answers nothing. The command takes seconds and an exit is measured at every stop, so an
 * answer is kept in the common directory of git by the head, the branch, the base and the unsaved edits.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const NAME = 'check-coupling.mjs';
const SILENT = { answered: false, problems: [], now: new Map() };
const run = (args, cwd) => spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 }).stdout ?? '';

/** The command laid out in the tree, in the directory of the checks the engine is laid out in too. */
const commandIn = (root) => [join(root, process.env.RT_CHECKS_DIR || 'tools', NAME)].find((path) => existsSync(path));

/** What the answer depends on: a new file outside the history counts too. */
function keyOf(root, sha) {
    const fresh = run(['ls-files', '-z', '--others', '--exclude-standard'], root).split('\0').filter(Boolean);
    const hash = createHash('sha256');
    [sha, run(['rev-parse', 'HEAD'], root), run(['branch', '--show-current'], root), run(['diff', 'HEAD', '--binary'], root)].forEach((part) => hash.update(`${part}\0`));
    fresh.forEach((path) => hash.update(path).update(existsSync(join(root, path)) ? readFileSync(join(root, path)) : ''));
    return hash.digest('hex');
}

/**
 * The plan, or the tip the newest merge after it brought, when that tip holds what stood before the plan and not the
 * plan: a cycle a merge brought is no edit of the branch, a tip without the lower task of a stack would judge that task
 * by this plan, and a tip of the branch itself on the server would hide its own growth.
 */
function baseOf(root, sha) {
    const holds = (part, tip) => spawnSync('git', ['merge-base', '--is-ancestor', part, tip], { cwd: root }).status === 0;
    const tips = run(['log', '--merges', '--format=%P', `${sha}..HEAD`], root).split('\n').flatMap((line) => line.split(' ').slice(1));
    return tips.filter(Boolean).find((tip) => holds(`${sha}^`, tip) && !holds(sha, tip)) ?? sha;
}

function ask(root, sha) {
    const command = commandIn(root);
    if (!command) return SILENT;
    const { status, stdout, stderr } = spawnSync(process.execPath, [command, `--base=${baseOf(root, sha)}`], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    const [, refusal] = /check-coupling: violations \d+\n\n((?:  .*\n)+)/.exec(stderr ?? '') ?? [];
    if (status !== 0 && !refusal) return SILENT;
    const changed = [...stdout.matchAll(/^  (\S+): incoming .*?, outgoing \d+ → (\d+),/gm)].map(([, path, links]) => [path, Number(links)]);
    const removed = [...stdout.matchAll(/^  (\S+): removed, outgoing was/gm)].map(([, path]) => [path, 0]);
    return { answered: true, problems: (refusal ?? '').split('\n').map((line) => line.trim()).filter(Boolean), now: new Map([...changed, ...removed]) };
}

export function open() {
    return {
        from(sha) {
            const root = run(['rev-parse', '--show-toplevel']).trim();
            if (!root) return SILENT;
            const dir = join(resolve(root, run(['rev-parse', '--git-common-dir'], root).trim()), 'rt-kit', 'coupling');
            const file = join(dir, `${keyOf(root, sha)}.json`);
            try {
                const { problems, now } = JSON.parse(readFileSync(file, 'utf8'));
                return { answered: true, problems, now: new Map(now) };
            } catch {
                const answer = ask(root, sha);
                try {
                    if (answer.answered) {
                        mkdirSync(dir, { recursive: true });
                        writeFileSync(file, JSON.stringify({ problems: answer.problems, now: [...answer.now] }));
                    }
                } catch {
                    // An answer not kept is asked again: a directory closed to writes costs time, not the measurement.
                }
                return answer;
            }
        },
    };
}
