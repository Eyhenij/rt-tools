// rt-kit v0.41.1 · task-flow/measure/footprint.mjs · 52e1bec0b0ad · правится надстройкой, не здесь
/**
 * The measurer «measure.footprint» — exit 8: after the commit of the plan the branch changed at least
 * one file under every path of every footprint row marked «(правится)», and the directory of the
 * product agreement the grill or the plan names under `proposed/` is gone from the head. A plan
 * without marked rows is judged by `proposed/` alone.
 */
import { agreementLines, footprintRows, taskFolder, touches } from './text.mjs';

export function touched({ git }) {
    return () => {
        const branch = git.branch();
        if (!branch) return false;
        const folder = taskFolder(branch);
        const sha = git.addedBy(`${folder}/plan.md`);
        if (!sha) return false;
        const plan = git.versionAt(`${folder}/plan.md`, sha) ?? '';
        const commits = git.commits();
        const changed = commits
            .slice(commits.findIndex((c) => c.sha === sha) + 1)
            .flatMap((c) => [...c.added, ...c.deleted, ...c.modified]);
        const rowsMet = footprintRows(plan)
            .filter((row) => row.edited)
            .every((row) => row.paths.every((path) => changed.some((file) => touches(file, path))));
        const texts = [git.lastVersion(`${folder}/grill.md`), plan].filter((t) => typeof t === 'string');
        const proposed = texts.flatMap((t) => agreementLines(t).paths).filter((p) => p.includes('/proposed/'));
        return rowsMet && !proposed.some((p) => git.existsAtHead(p));
    };
}
