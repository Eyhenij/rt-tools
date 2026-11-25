/**
 * The task folders of the tree: recognising a number in a name, walking the folders and removing
 * the layout header from a copy of the template.
 *
 * A file of its own because the subject is the tree, not the work queue: these three go to disk
 * and never to the network, and the queue module they lived in stood at the file length limit.
 * The queue module re-exports them under their old names — three neighbouring modules and the
 * tree's commands call them from there, and rewriting them would mean paying for the split twice.
 */
import { cpSync, existsSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const TASK_KEY = CONFIG.board?.taskKey ?? '';

/**
 * The task number by the folder name. The key in front is optional: a branch name of the kind
 * `chore/312-slug` is lawful too, and the folder under it is named by the bare number. If the
 * audit does not recognise a number in the name, the folder will lie among the current ones for
 * any length of time — one such was found by grep, not by a check.
 */
export function numberFromTaskDir(name) {
    // The key is substituted only if the tree has set it: an empty one would give `^(?:-)?`, and
    // a folder with the key in its name would stop being recognised at all.
    const prefix = TASK_KEY ? `(?:${TASK_KEY}-)?` : '';
    const match = new RegExp(`^${prefix}(\\d+)-`).exec(name ?? '');
    return match ? Number(match[1]) : null;
}

/**
 * Task folders, including nested ones. The path repeats the branch name in full, slash included,
 * so the folder of branch `chore/312-slug` lies on the second level — a walk over the top level
 * alone does not see it.
 *
 * We descend exactly one level: a branch name has one slash, and anything deeper is no longer a
 * task folder — but the archive would get in there, if the tree keeps it inside.
 */
/** The layout header: by it the laid-out copy is recognised, and so is the edit-place guard. */
const STAMP = /^<!-- rt-kit v[^\n]*-->\n/m;

/**
 * Remove the layout header from copies of the template.
 *
 * The template carries the header by right: the layout puts it there and updates it. A copy under
 * a task is already the project's text, by the same argument by which the companion draft is laid
 * out without a header: from the first edit there is nothing to audit in it. Left in the copy, the
 * header refuses the very first edit of the grill and sends one to edit the package template
 * instead. It was removed by three lines by hand, anew with every piece of work.
 *
 * Returns the names of the files the header was removed from: by them the scenario judges that
 * the removal works, and the caller that the folder is assembled.
 */
export function unstampFolder(folder) {
    const cleaned = [];

    if (!existsSync(folder)) {
        return cleaned;
    }

    for (const name of readdirSync(folder)) {
        if (!name.endsWith('.md')) {
            continue;
        }

        const path = join(folder, name);
        const before = readFileSync(path, 'utf8');
        const after = before.replace(STAMP, '');

        if (after !== before) {
            writeFileSync(path, after);
            cleaned.push(name);
        }
    }

    return cleaned;
}

/**
 * The draft of a task becomes the folder of its branch, or the folder is assembled from the sample.
 *
 * It is renamed at the creation, because the number and the branch name are known at that moment for
 * the first time: the grill goes before the task and lies in `docs/tasks/_draft-<slug>`. Left as a
 * draft, it stays outside the history, the next session does not find it, and one count of it answers
 * for a second card.
 */
export function adoptDraft({ slug, branch, number }) {
    if (!slug) {
        console.log(`\nThe task folder: --slug is not set, there is nothing to rename the draft by.`);
        return;
    }
    const draft = join(ROOT, 'docs/tasks', `_draft-${slug}`);
    const target = join(ROOT, 'docs/tasks', branch);

    if (existsSync(target)) {
        console.log(`\nThe task folder is already in place: docs/tasks/${branch}/`);
    } else if (existsSync(draft)) {
        renameSync(draft, target);
        // The draft too is assembled from the sample, and the header in it is the same: it is
        // taken off here as well.
        unstampFolder(target);
        console.log(`\nThe task folder: docs/tasks/_draft-${slug}/ → docs/tasks/${branch}/`);
    } else {
        const template = join(ROOT, 'docs/tasks/_template');

        if (!existsSync(template)) {
            console.log(`\nThere is no task folder and nothing to assemble it from: the sample ${'docs/tasks/_template'} does not lie in the tree`);
            return;
        }

        cpSync(template, target, { recursive: true });
        unstampFolder(target);
        console.log(`\nThe task folder is assembled from the sample: docs/tasks/${branch}/`);
    }

    // The header of the plan is read by a guard: by it the guard finds the product agreement. The
    // number in it is set right here — by hand it is copied over from a hint and mistyped.
    const plan = join(target, 'plan.md');
    if (!existsSync(plan)) {
        return;
    }
    const before = readFileSync(plan, 'utf8');
    // The key is read under two names: the package sample is English, and a tree folder created
    // before the layer was translated is Russian. It is written in English.
    const after = before.replace(/^\*\*(?:Task|Задача):\*\*.*$/m, `**Task:** ${TASK_KEY}-${number} · **Branch:** ${branch}`);
    if (after !== before) {
        writeFileSync(plan, after);
        console.log(`The header of the plan is filled in: docs/tasks/${branch}/plan.md`);
    }
}

export function taskDirs(dir = join(ROOT, CONFIG.tasksDir), prefix = '') {
    if (!existsSync(dir)) {
        return [];
    }
    const found = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name === '_template') {
            continue;
        }
        const name = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.name.startsWith('_draft-') || numberFromTaskDir(entry.name) !== null) {
            found.push(name);
            continue;
        }
        if (!prefix) {
            found.push(...taskDirs(join(dir, entry.name), name));
        }
    }
    return found;
}
