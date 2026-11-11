#!/usr/bin/env node
/**
 * Writes the merge driver of the code graphs into the git config of this copy.
 *
 * `.gitattributes` names the driver `graphify` on every `graph.json`, and git reads its command from
 * the config, not from history: without this step a merge of two branches with different graphs is
 * a plain text merge of a 40 MB file, with conflict markers inside JSON. The driver joins the nodes
 * and the edges of both sides.
 *
 * Called by the install step, and only inside a git repository: an image build installs the
 * dependencies before it copies `tools/`, so the install step asks git first and does not reach for
 * this file there. The check below repeats it for a call by hand.
 */
import { spawnSync } from 'node:child_process';

const inRepo = spawnSync('git', ['rev-parse', '--git-dir'], { encoding: 'utf8' }).status === 0;
if (!inRepo) {
    process.exit(0);
}

const settings = [
    ['merge.graphify.name', 'graphify: union of two code graphs'],
    ['merge.graphify.driver', 'graphify merge-driver %O %A %B'],
];
for (const [key, value] of settings) {
    const run = spawnSync('git', ['config', key, value], { encoding: 'utf8' });
    if (run.status !== 0) {
        console.error(`graph-merge-driver: git config ${key} failed\n${run.stderr}`);
        process.exit(1);
    }
}
