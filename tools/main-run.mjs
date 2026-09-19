#!/usr/bin/env node
// rt-kit v0.29.0 · checks/main-run.github.mjs · 03b6b10581a0 · правится надстройкой, не здесь
/**
 * The last run of the main branch in one line.
 *
 *   node tools/main-run.mjs
 *
 * Two readers call it: the session start prints the line into the context, and the executor
 * calls it after every known merge. The queue audit reads the same run and names the same two
 * findings; this command exists because the audit waits to be called, while a merge made
 * mid-session moves the main branch without anybody asking the audit.
 *
 * Silence here is never «green»: where the run could not be read — no pipeline file, a pipeline
 * asleep on a push to the main branch, no network — the line says so. The exit code is 1 on a red
 * or a pushed-out run and 0 in every other case, so that a chain after a merge stops on it.
 */
import { OfflineError, botToken } from './board.mjs';
import { HAS_PIPELINE, lastMainRun, pipelineText, pipelineWakesOnPush } from './board-runs.mjs';
import { CONFIG } from './rt-kit-checks.config.mjs';

const MAIN_BRANCH = CONFIG.deploy?.mainBranch ?? 'main';

/** The line for one reading of the run; exported so the suite can read it without the hosting. */
export function mainRunLine(run, mainBranch = MAIN_BRANCH) {
    const sha = String(run.sha ?? '').slice(0, 8);
    const day = String(run.at ?? '').slice(0, 10);
    switch (run.verdict) {
        case 'none':
            return `main-run: «${mainBranch}» has no run yet`;
        case 'running':
            return `main-run: «${mainBranch}» is being checked on ${sha} — ${run.url}`;
        case 'success':
            return `main-run: «${mainBranch}» is green on ${sha} of ${day}`;
        case 'evicted':
            return `main-run: the run of «${mainBranch}» on ${sha} was pushed out of the queue and never checked the merge — ${run.url}`;
        default:
            return `main-run: «${mainBranch}» is RED on ${sha} of ${day}: merges on top go out unchecked — ${run.url}`;
    }
}

function main() {
    if (!HAS_PIPELINE) {
        console.log('main-run: the main branch run was not read — the tree has no pipeline file');
        return 0;
    }
    if (!pipelineWakesOnPush(pipelineText(), MAIN_BRANCH)) {
        console.log(`main-run: the main branch run was not read — the pipeline does not wake on a push to «${MAIN_BRANCH}»`);
        return 0;
    }

    let run;
    try {
        run = lastMainRun(MAIN_BRANCH, { token: botToken() ?? undefined });
    } catch (error) {
        if (error instanceof OfflineError) {
            console.log(`main-run: the main branch run was not read — ${error.message}`);
            return 0;
        }
        throw error;
    }

    console.log(mainRunLine(run, MAIN_BRANCH));
    return run.verdict === 'failure' || run.verdict === 'evicted' ? 1 : 0;
}

// The suite imports the line without running the reading; the hosting is asked only when called.
const isEntryPoint = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isEntryPoint) {
    process.exit(main());
}
