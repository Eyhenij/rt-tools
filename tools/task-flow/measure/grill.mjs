// rt-kit v0.40.0 · task-flow/measure/grill.mjs · 7bf3f9d87da5 · правится надстройкой, не здесь
/**
 * The measurer «measure.grill» — exit 1: the grill of the branch, or of a draft in the working copy,
 * holds the owner's request as a quote and an answer. The grill of the branch is read from the
 * working copy, and from the history once the folder is taken apart.
 */
import { grillAnswered, taskFolder } from './text.mjs';

export function written({ git, tree }) {
    return () => {
        const texts = [];
        const branch = git.branch();
        if (branch) {
            const path = `${taskFolder(branch)}/grill.md`;
            texts.push(tree.read(path) ?? git.lastVersion(path));
        }
        for (const name of tree.list('docs/tasks')) {
            if (name.startsWith('_draft-')) texts.push(tree.read(`docs/tasks/${name}/grill.md`));
        }
        return texts.some((text) => typeof text === 'string' && grillAnswered(text));
    };
}
