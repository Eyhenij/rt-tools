/**
 * The source «source.marks» of the task flow description: the marks the engine writes into the
 * common directory of git, `rt-kit/` under `git rev-parse --git-common-dir`. Every working copy of
 * the tree sees the same marks: an approval given in one copy holds in another.
 *
 *   approval(branch)      the approval mark of the plan of the branch: { answer, plan }, or null
 *   step(branch, number)  the mark of a step of the plan: { matched, … }, or null
 *
 * A mark that does not parse as JSON reads as absent: a broken mark never reads as a met exit.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';

/** The directory of the marks, or null outside a repository. */
export function marksDir() {
    const out = spawnSync('git', ['rev-parse', '--git-common-dir'], { encoding: 'utf8' });
    if (out.status !== 0) return null;
    const common = out.stdout.trim();
    return join(isAbsolute(common) ? common : join(process.cwd(), common), 'rt-kit');
}

const readMark = (file) => {
    if (!file || !existsSync(file)) return null;
    try {
        return JSON.parse(readFileSync(file, 'utf8'));
    } catch {
        return null;
    }
};

export function open() {
    const dir = marksDir();
    return {
        approval: (branch) => readMark(dir && join(dir, 'approval', `${branch}.json`)),
        step: (branch, number) => readMark(dir && join(dir, 'steps', branch, `${number}.json`)),
    };
}
