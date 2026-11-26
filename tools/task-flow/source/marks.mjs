// rt-kit v0.41.1 · task-flow/source/marks.mjs · 2a1b6c82565c · правится надстройкой, не здесь
/**
 * The source «source.marks» of the task flow description: the marks the engine writes into the
 * common directory of git, `rt-kit/` under `git rev-parse --git-common-dir`. Every working copy of
 * the tree sees the same marks: an approval given in one copy holds in another.
 *
 *   approval(branch)              the approval mark of the plan of the branch: { answer, plan }, or null
 *   step(branch, number)          the mark of a step of the plan: { matched, … }, or null
 *   writeApproval(branch, mark)   writes the approval mark
 *   writeStep(branch, number, mark)  writes the mark of a step
 *   dropStep(branch, number)      removes the mark of a step, if one lies
 *
 * A mark that does not parse as JSON reads as absent: a broken mark never reads as a met exit. Only
 * the engine writes the marks.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';

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

const writeMark = (file, mark) => {
    if (!file) throw new Error('source.marks: no repository, no place for a mark');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, `${JSON.stringify(mark, null, 2)}\n`);
};

export function open() {
    const dir = marksDir();
    const approvalFile = (branch) => dir && join(dir, 'approval', `${branch}.json`);
    const stepFile = (branch, number) => dir && join(dir, 'steps', branch, `${number}.json`);
    return {
        approval: (branch) => readMark(approvalFile(branch)),
        step: (branch, number) => readMark(stepFile(branch, number)),
        writeApproval: (branch, mark) => writeMark(approvalFile(branch), mark),
        writeStep: (branch, number, mark) => writeMark(stepFile(branch, number), mark),
        dropStep: (branch, number) => {
            const file = stepFile(branch, number);
            if (file) rmSync(file, { force: true });
        },
    };
}
