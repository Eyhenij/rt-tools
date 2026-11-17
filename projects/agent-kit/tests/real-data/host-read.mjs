#!/usr/bin/env node
/**
 * The readings of the hosting the task flow engine asks for, through the laid-out `host.mjs`:
 * the PRs of a branch with their reviewers and the count of merged PRs.
 *
 *   node host-read.mjs <tree root> <branch>
 *
 * `record-host.sh` runs it on the real host and keeps the output; the suite on saved data runs it
 * on the recorded answers and compares. The answers that live by the clock are dropped first: a
 * cached answer would come from neither host.
 */
const [root, branch] = process.argv.slice(2);
const { open } = await import(`${root}/tools/task-flow/source/host.mjs`);
const host = open();
host.reset();
const pulls = host.pulls(branch);
const merged = host.mergedPulls();
console.log(`pulls of ${branch}: ${JSON.stringify(pulls)}`);
console.log(`merged pulls: ${Array.isArray(merged) ? merged.length : String(merged)}`);
console.log(`silent: ${host.silent()}`);
