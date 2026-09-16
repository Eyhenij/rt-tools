// rt-kit v0.28.0 · checks/board-runs.github.mjs · 8e457772d545 · правится надстройкой, не здесь
/**
 * The state of the runs and of the rollout at the hosting: what stands on the head, how it ended
 * and by how much production has fallen behind the main branch.
 *
 * A file of its own, not inside the work with the queue: the queue has a subject of its own —
 * tasks, columns and PRs — while here the pipeline is asked. Together they outgrew the limit of
 * file length, and splitting them by subject is cheaper than by the number of lines: an edit of the
 * runs and an edit of the queue are done by different works.
 *
 * No network or no token — the calls throw `OfflineError`, like the rest of the work with the
 * hosting: an inability to ask does not count as a discrepancy.
 */
import { existsSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { OWNER, REPO, gh } from './board.mjs';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

/** The pipeline file of this tree; there is none — then it listens to no paths at all. */
const PIPELINE = CONFIG.pushGate?.pipelineFile ?? '';
export const HAS_PIPELINE = PIPELINE !== '' && existsSync(join(ROOT, PIPELINE));

/**
 * How many runs have started on this head.
 *
 * The head is asked about, not the branch: a run of an intermediate commit says nothing about the
 * state of the head, and the list of the runs of a branch hands them back mixed together.
 */
export function runsOnHead(sha, options) {
    const answer = gh(['api', `repos/${OWNER}/${REPO}/actions/runs?head_sha=${sha}&per_page=1`, '--jq', '.total_count'], options);
    return Number(String(answer).trim());
}

/**
 * The commit of the last successful rollout and by how much the main branch has gone away from it.
 *
 * The rollout itself is asked about, not the last run of the main branch. Where the rollout is
 * started by hand, a merge does not move production at all, and a run of the main branch says
 * nothing about it: production was 476 commits behind while the check stayed silent. Only a rollout
 * finished with success is judged — one still going may end with anything.
 *
 * Returns `null` if there were no rollouts at all: that is not a discrepancy but nothing to compare.
 */
export function deployLag(workflow, mainBranch, options) {
    const runs = gh(
        [
            'api',
            `repos/${OWNER}/${REPO}/actions/workflows/${encodeURIComponent(workflow)}/runs` +
                '?status=success&per_page=1',
            '--jq',
            '[.workflow_runs[] | {sha: .head_sha, at: .created_at}] | first // empty',
        ],
        options
    );
    const last = String(runs).trim();
    if (!last) {
        return null;
    }

    const run = JSON.parse(last);
    const behind = gh(
        ['api', `repos/${OWNER}/${REPO}/compare/${run.sha}...${encodeURIComponent(mainBranch)}`, '--jq', '.ahead_by'],
        options
    );
    return { sha: run.sha, at: run.at, behind: Number(String(behind).trim()) };
}

/**
 * How the last rollout ended: `success`, `failure`, `running` or `none`, if it was never started.
 *
 * It is asked about apart from the lag of production. The lag is counted by the last SUCCESSFUL
 * rollout, and two different troubles look the same through it: the rollout was not started and the
 * rollout fell. They lead to different things — the first one is started, the second is read by its
 * logs and repaired — and four merges in a row went out on top of a breakage the first one brought,
 * and production stood idle for almost two hours.
 *
 * A rollout still going does not count as a discrepancy: it may yet end with success.
 */
export function lastDeploy(workflow, options) {
    const runs = gh(
        [
            'api',
            `repos/${OWNER}/${REPO}/actions/workflows/${encodeURIComponent(workflow)}/runs?per_page=1`,
            '--jq',
            '[.workflow_runs[] | {status, conclusion, sha: .head_sha, at: .created_at, url: .html_url}] | first // empty',
        ],
        options
    );
    const last = String(runs).trim();
    if (!last) {
        return { verdict: 'none' };
    }

    const run = JSON.parse(last);
    if (run.status !== 'completed') {
        return { verdict: 'running', ...run };
    }

    return { verdict: run.conclusion === 'success' ? 'success' : 'failure', ...run };
}

/**
 * How the runs on this head ended: `success` if all of them finished with success, `running` if at
 * least one is still going, `failure` if at least one fell. There are no runs at all — `none`.
 *
 * The colour is asked about apart from the fact: the fact answers the question «the event arrived»,
 * the colour the question «the work can be handed over». The second question is asked where what is
 * ready stands as a draft.
 */
export function verdictOnHead(sha, options) {
    const answer = gh(
        [
            'api',
            `repos/${OWNER}/${REPO}/actions/runs?head_sha=${sha}&per_page=20`,
            '--jq',
            '[.workflow_runs[] | {status, conclusion}] | if length == 0 then "none"' +
                ' elif any(.status != "completed") then "running"' +
                ' elif any(.conclusion != "success") then "failure"' +
                ' else "success" end',
        ],
        options
    );
    return String(answer).trim();
}

/** When the head landed in the branch — by the commit time at the hosting, not by the local clock. */
export function headCommittedAt(sha, options) {
    const answer = gh(['api', `repos/${OWNER}/${REPO}/commits/${sha}`, '--jq', '.commit.committer.date'], options);
    return Date.parse(String(answer).trim());
}

/**
 * The runs of the head pushed out of the queue of the pipeline.
 *
 * The group of the queue keeps a running run and does not keep a waiting one: the hosting holds one
 * waiting run in a group, and the next one to come in pushes the previous one out. The one pushed
 * out finishes as cancelled and in the list is indistinguishable from a fallen one, though it did
 * not check the branch by a single line.
 *
 * They are told apart by the number of steps. Cancellation is a word shared by two cases: a run
 * stopped mid-way has steps and their logs can be read; one pushed out of the queue has zero of
 * them, because it never started. By a measurement over seven cancelled runs of the tree: six with
 * zero steps and one stopped mid-way with one.
 *
 * The number of steps is asked by a call of its own and only for the cancelled ones: asked for
 * every run it would cost a call per run at every check.
 *
 * A green run on the same head takes the answer away whole — the one pushed out behind it has
 * already been restarted, and there is nothing to say about it.
 */
export function evictedOnHead(sha, options) {
    const answer = gh(
        [
            'api',
            `repos/${OWNER}/${REPO}/actions/runs?head_sha=${sha}&per_page=20`,
            '--jq',
            '[.workflow_runs[] | {id, status, conclusion}] | tojson',
        ],
        options
    );
    const runs = JSON.parse(String(answer).trim() || '[]');
    if (runs.some((run) => run.status === 'completed' && run.conclusion === 'success')) {
        return [];
    }

    return runs
        .filter((run) => run.status === 'completed' && run.conclusion === 'cancelled')
        .filter((run) => jobCount(run.id, options) === 0)
        .map((run) => run.id);
}

/**
 * Whether the pipeline wakes on a push to the main branch.
 *
 * A pipeline that listens to requests alone never runs on the main branch, and the absence of a
 * run there says nothing: a tree like that gets no finding about the main run, and the audit says
 * so out loud. The trigger is read from the pipeline file by its `on` block: a `push` key without
 * a list of branches wakes on every branch, one with a list — on the branches named.
 */
export function pipelineWakesOnPush(pipelineText, mainBranch) {
    const lines = pipelineText.split('\n');
    const indentOf = (line) => line.length - line.trimStart().length;
    // The lines of a block: those below its key and indented deeper than it, blank ones included.
    const blockAfter = (index) => {
        const depth = indentOf(lines[index]);
        const body = [];
        for (let i = index + 1; i < lines.length; i += 1) {
            if (lines[i].trim() !== '' && indentOf(lines[i]) <= depth) {
                break;
            }
            body.push(lines[i]);
        }
        return body;
    };

    const onIndex = lines.findIndex((line) => /^on:\s*(#.*)?$/.test(line));
    if (onIndex === -1) {
        // The short form: `on: push` or `on: [push, pull_request]` — a push without a list of
        // branches wakes on every branch.
        return lines.some((line) => /^on:\s*(\[.*\bpush\b.*\]|push)\s*(#.*)?$/.test(line));
    }

    const on = blockAfter(onIndex);
    const pushIndex = on.findIndex((line) => /^\s+push:\s*(#.*)?$/.test(line));
    if (pushIndex === -1) {
        return on.some((line) => /^\s+push:\s*\S/.test(line));
    }

    const pushLines = on.slice(pushIndex);
    const pushDepth = indentOf(pushLines[0]);
    const push = pushLines.slice(1).filter((line) => line.trim() === '' || indentOf(line) > pushDepth);
    const branchesIndex = push.findIndex((line) => /^\s+branches:/.test(line));
    if (branchesIndex === -1) {
        return true;
    }

    const inline = /^\s+branches:\s*\[(.*)\]/.exec(push[branchesIndex]);
    const names = inline
        ? inline[1].split(',')
        : push
              .slice(branchesIndex + 1)
              .filter((line) => /^\s+-\s/.test(line))
              .map((line) => line.replace(/^\s+-\s*/, ''));
    return names.map((name) => name.trim().replace(/^['"]|['"]$/g, '')).includes(mainBranch);
}

/**
 * How the last run of the pipeline on the main branch ended: `success`, `failure`, `running`,
 * `evicted` if it was pushed out of the queue and never started, or `none` if there was no run.
 *
 * The main branch is asked about apart from the rollout and apart from the tips of open requests.
 * A merge is read as the end of the work, and the run it starts is read by nobody: a red run of the
 * main branch stood for a day and a half, the rollout behind it did not go, and the owner said so.
 * A cancelled run is told from a fallen one by its step count, the same way as on a request tip:
 * zero steps means the queue pushed it out for the next merge, and the merge was checked by nothing.
 */
export function lastMainRun(mainBranch, options) {
    const runs = gh(
        [
            'api',
            `repos/${OWNER}/${REPO}/actions/workflows/${encodeURIComponent(basename(PIPELINE))}/runs` +
                `?branch=${encodeURIComponent(mainBranch)}&per_page=1`,
            '--jq',
            '[.workflow_runs[] | {id, status, conclusion, sha: .head_sha, at: .created_at, url: .html_url}] | first // empty',
        ],
        options
    );
    const last = String(runs).trim();
    if (!last) {
        return { verdict: 'none' };
    }

    const run = JSON.parse(last);
    if (run.status !== 'completed') {
        return { verdict: 'running', ...run };
    }
    if (run.conclusion === 'success') {
        return { verdict: 'success', ...run };
    }
    if (run.conclusion === 'cancelled' && jobCount(run.id, options) === 0) {
        return { verdict: 'evicted', ...run };
    }

    return { verdict: 'failure', ...run };
}

/** The text of the pipeline file; an empty string where the tree has none. */
export function pipelineText() {
    return HAS_PIPELINE ? readFileSync(join(ROOT, PIPELINE), 'utf8') : '';
}

/** How many steps a run has started. Zero means it never started at all. */
function jobCount(id, options) {
    const answer = gh(['api', `repos/${OWNER}/${REPO}/actions/runs/${id}/jobs?per_page=1`, '--jq', '.total_count'], options);
    return Number(String(answer).trim());
}
