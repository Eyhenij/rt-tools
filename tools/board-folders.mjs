#!/usr/bin/env node
// rt-kit v0.29.0 · checks/board-folders.mjs · ff43d352c59d · правится надстройкой, не здесь
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
