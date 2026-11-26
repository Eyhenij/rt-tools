/**
 * What the coupling check says of the branch of a merge: the totals «was → now» and the overruns. The check
 * runs as a process of its own, and its printed lines are the only input: the suite of the rework command
 * runs it with the real check, so a reworded line of the check turns the suite red, not the count to zero.
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BUFFER = 64 * 1024 * 1024;
// A line of growth past the plan, refused or named as an overrun alike, ends with one of these.
const OVERRUN = /the branch named \d+|nobody named a number for it/g;

/** The tip of the branch is asked: at the merge itself the branch has no commits of its own. */
export function couplingOf(sha) {
    const check = join(dirname(fileURLToPath(import.meta.url)), 'check-coupling.mjs');
    const { stdout, stderr } = spawnSync('node', [check, `--base=${sha}^1`, `--at=${sha}^2`], { encoding: 'utf8', maxBuffer: BUFFER });
    const text = `${stdout}${stderr}`;
    const totals = text.split('\n').find((line) => line.startsWith('check-coupling: modules')) ?? '';
    const grown = (name) => {
        const found = new RegExp(`${name} (\\d+) → (\\d+)`).exec(totals);
        return found ? Number(found[2]) - Number(found[1]) : null;
    };
    return {
        cycles: grown('cycles'),
        past: grown('past the entry'),
        overruns: totals ? (text.match(OVERRUN) ?? []).length : null,
    };
}
