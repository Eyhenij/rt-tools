// rt-kit v0.26.0 · checks/board-paths.github.mjs · 7c7a8bfe33bf · правится надстройкой, не здесь
// The paths the pipeline does not listen to, and a PR whose contribution lies entirely under them.
//
// Moved out of the queue audit into a module of its own: parsing the pipeline patterns has nothing
// to do with the state of the work queue and reads on its own, while the audit was growing past the
// length limit because of it.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ghJson } from './board.mjs';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const PIPELINE = CONFIG.pushGate?.pipelineFile ?? '';
const HAS_PIPELINE = PIPELINE !== '' && existsSync(join(ROOT, PIPELINE));

/**
 * The paths the pipeline does not listen to: the `paths-ignore` of its events.
 *
 * Parsed line by line, not by a markup parser: the check has none, and the list is a flat
 * enumeration of lines under one key. There can be several keys in the file — one per event — and
 * they all add up into one set: a branch whose contribution lies entirely under them creates no run
 * on any event.
 */
export function ignoredPaths() {
    if (!HAS_PIPELINE) {
        return [];
    }

    const lines = readFileSync(join(ROOT, PIPELINE), 'utf8').split('\n');
    const found = [];
    let inside = false;

    for (const line of lines) {
        if (/^\s*paths-ignore:\s*$/.test(line)) {
            inside = true;
            continue;
        }
        if (!inside) {
            continue;
        }
        const item = /^\s*-\s+['"]?([^'"\s]+)['"]?\s*$/.exec(line);
        if (item) {
            found.push(item[1]);
            continue;
        }
        inside = false;
    }

    return found;
}

const IGNORED_PATHS = ignoredPaths();

/**
 * Pattern characters that have a meaning of their own in an expression: apart from the asterisks,
 * they stand for themselves.
 */
const escapeForRegExp = (value) => value.replace(/[.+?^${}()|[\]\\-]/g, '\\$&');

/** Whether a path falls under a pipeline pattern: `**` is any tail, `*` a piece of a name. */
function underPattern(path, pattern) {
    const body = pattern
        .split('**')
        .map((piece) => piece.split('*').map(escapeForRegExp).join('[^/]*'))
        .join('.*');

    return new RegExp(`^${body}$`).test(path);
}

/**
 * The contribution of a PR lies entirely under the paths the pipeline does not listen to.
 *
 * Such a branch will never have a run, and demanding one is the same as demanding it of a branch
 * without a single commit: the sign is true by the letter and lies on the merits, and the action it
 * advises cannot be carried out. Meanwhile the red line stands next to real discrepancies and
 * teaches one to skip the audit whole.
 *
 * The makeup cannot be read — we answer "no": staying silent at random costs more than one extra
 * line.
 */
export function onlyIgnoredPaths(pull, options) {
    if (!IGNORED_PATHS.length) {
        return false;
    }

    let files = [];
    try {
        files = ghJson(['pr', 'view', String(pull.number), '--json', 'files'], options).files ?? [];
    } catch {
        return false;
    }

    return files.length > 0 && files.every((file) => IGNORED_PATHS.some((pattern) => underPattern(file.path, pattern)));
}
