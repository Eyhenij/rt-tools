// rt-kit v0.40.0 · task-flow/measure/folder.mjs · b7497719cf91 · правится надстройкой, не здесь
/**
 * The measurer «measure.folder» — exit 9: one commit of the branch removed the task folder and added
 * a record to the description of the past.
 */
import { taskFolder, under } from './text.mjs';

export function archived({ git }) {
    return () => {
        const branch = git.branch();
        if (!branch) return false;
        const folder = taskFolder(branch);
        return git
            .commits()
            .some((c) => c.deleted.some((p) => under(p, folder)) && c.added.some((p) => under(p, 'docs/archive')));
    };
}
