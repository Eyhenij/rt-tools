#!/usr/bin/env node
/**
 * The scrub of recorded hosting answers: `scrub.mjs` over every answer and every output of the
 * readers in a directory, with the people named by the answers themselves — the `name` next to a
 * `login`. The arguments of a call stay as they were: the replay matches the calls by them, and they
 * name only what the tree settings already name.
 *
 *   node scrub-host.mjs <fixtures/real-host directory>
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { scrubber } from './scrub.mjs';

const dir = process.argv[2];
const answers = readdirSync(dir).filter((file) => file.endsWith('.json'));
const people = new Set();
for (const file of answers) {
    const text = readFileSync(join(dir, file), 'utf8');
    for (const match of text.matchAll(/\\?"login\\?":\s*\\?"[^"\\]*\\?",\s*\\?"name\\?":\s*\\?"([^"\\]+)\\?"/g)) people.add(match[1]);
}
const scrub = scrubber([...people]);
for (const file of answers) {
    const path = join(dir, file);
    const record = JSON.parse(readFileSync(path, 'utf8'));
    record.stdout = scrub(record.stdout);
    record.stderr = scrub(record.stderr);
    if ('json' in record) {
        try {
            record.json = JSON.parse(record.stdout);
        } catch {
            delete record.json;
        }
    }
    writeFileSync(path, JSON.stringify(record, null, 1) + '\n');
}
for (const file of readdirSync(dir).filter((name) => name.startsWith('.') && name.endsWith('.txt'))) {
    const path = join(dir, file);
    writeFileSync(path, scrub(readFileSync(path, 'utf8')));
}
console.log(`scrub-host: ${answers.length} answers, ${people.size} people named`);
