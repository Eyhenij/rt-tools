// rt-kit v0.41.0 · task-flow/measure/agreement.mjs · de56bbe0e02c · правится надстройкой, не здесь
/**
 * The measurer «measure.agreement» — exit 3: the grill or the plan of the branch names the directory
 * of the product agreement, found on disk or in the history, or the reason there is none. The forms
 * of the line are those the task folder sample writes: `**Описание фичи:**`, `**Draft:**` and
 * `**Spec:**` with a path, `**Описание фичи:** не нужно — <reason>` and
 * `**Behaviour:** unchanged — <reason>`.
 */
import { agreementLines, taskFolder } from './text.mjs';

export function named({ git, tree }) {
    return () => {
        const branch = git.branch();
        if (!branch) return false;
        for (const file of ['grill.md', 'plan.md']) {
            const path = `${taskFolder(branch)}/${file}`;
            const text = tree.read(path) ?? git.lastVersion(path);
            if (typeof text !== 'string') continue;
            const { paths, reasons } = agreementLines(text);
            if (reasons.length > 0) return true;
            if (paths.some((p) => tree.exists(p) || git.everExisted(p))) return true;
        }
        return false;
    };
}
