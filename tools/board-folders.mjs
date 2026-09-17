#!/usr/bin/env node
// rt-kit v0.28.0 · checks/board-folders.mjs · 20e8b39185a0 · правится надстройкой, не здесь
/**
 * Task branches that have not carried their folder in by a single commit — a part of the work queue
 * audit.
 *
 * Moved into a file of its own because the audit itself has grown to the length limit: it has many
 * subjects, and this one stands apart — it is the only one that reads the local repository and does
 * without the network and without the hosting.
 */
import { execFileSync } from 'node:child_process';

import { TASK_KEY } from './board.mjs';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

/**
 * Does the branch name itself the branch of an epic.
 *
 * An epic branch is named exactly like a task branch — the key, a number, a slug — and carries no
 * task folder at all: it holds the plan of its epic and the merges of its tasks. Judged by the name
 * alone it gave a divergence line for every epic of the tree, forever, and such a line is
 * indistinguishable from a real one.
 *
 * The plan is read out of the branch, not off the disk: a plan of a young epic lives only in its
 * own branch, and the working tree stands on whichever branch the session happens to be on. The
 * pattern is the one the creating command writes the header with — a second pattern of our own
 * would drift from the first in silence.
 *
 * The check stays without the network: it is the only part of the audit that reads the local
 * repository, and the epic label lives at the hosting.
 */
function namesItselfEpic(git, branch) {
    if (!CONFIG.plansDir) {
        return false;
    }
    const named = new RegExp(`\\*\\*(?:Ветка эпика|Ветка|Branch):\\*\\*\\s*\`?${branch}\`?`);

    // The paths come NUL-separated: by default git quotes anything outside ASCII, and a plan named
    // in the tree's own language would come back as escapes — neither found on disk nor matching the
    // suffix. Here the plans are named in the owner's language more often than not.
    let files;
    try {
        files = git(['ls-tree', '-r', '-z', '--name-only', branch, '--', CONFIG.plansDir]).split('\0');
    } catch {
        return false;
    }

    for (const file of files.map((one) => one.trim()).filter((one) => one.endsWith('.md'))) {
        try {
            if (named.test(git(['show', `${branch}:${file}`]))) {
                return true;
            }
        } catch {
            // A plan that cannot be read names no branch: the rest are still read.
        }
    }

    return false;
}

/**
 * The plan guard asks the folder from the disk, so an uncommitted one lets edits through for the
 * whole of the work, and the refusal comes at the very end: the turn exit guard takes the sign of
 * handed-over work from the branch history, and there is no folder there. At that minute there is
 * nothing left to fix with — the folder was taken apart by one's own hands, and one assembled anew
 * gives two extra commits in a ready PR.
 *
 * The branch history is judged, not its tip: the folder is taken apart by the last commit before
 * the PR is opened, and the tip of finished work lawfully carries no folder.
 *
 * Read from the local repository, without the network: branches of other machines are not visible
 * from here, and this check says nothing about them.
 */
export function checkBranchFolders(report, mainBranch) {
    const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });

    let branches;
    try {
        branches = git(['branch', '--format=%(refname:short)', '--list', `${TASK_KEY}-*`]).split('\n');
    } catch {
        return;
    }

    // A branch without a task number is lawful and lives locally — for a trial and a grill; it is
    // due no folder, and demanding one would mean refusing work that will not go into the main
    // branch.
    const numbered = new RegExp(`^${TASK_KEY}-\\d+-`);

    for (const branch of branches.map((one) => one.trim()).filter((one) => numbered.test(one))) {
        // An epic branch has no task folder by design, and demanding one is a demand of the
        // impossible: it carries the plan of its epic and the merges of its tasks, nothing of its own.
        if (namesItselfEpic(git, branch)) {
            continue;
        }
        try {
            // The branch contribution is empty — nothing to judge: a folder is put in by the very
            // first commit, not by creating it.
            if (!git(['log', '--format=%h', '-1', `${mainBranch}..${branch}`]).trim()) {
                continue;
            }
            if (git(['log', '--format=%h', '-1', branch, '--', `${CONFIG.tasksDir}/${branch}`]).trim()) {
                continue;
            }
        } catch {
            continue;
        }
        report(
            `${branch}: the task folder never travelled into the branch — commit ${CONFIG.tasksDir}/${branch}/, ` +
                `otherwise the refusal arrives at the exit of a turn, when there is nothing left to fix`
        );
    }
}
