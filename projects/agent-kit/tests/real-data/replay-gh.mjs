#!/usr/bin/env node
/**
 * The `gh` of the suites on saved data: answers a call from the hosting answers recorded by
 * `record-host.sh`.
 *
 *   REPLAY_DIR=<fixtures/real-host> REPLAY_TOKEN_FILE=<file> node replay-gh.mjs <gh arguments…>
 *
 * A call is matched by its arguments; a hash of forty or seven hex digits matches any other, since
 * the tree moves its heads between the recording and the run. The kind of the token decides too:
 * a call recorded under the machine token and asked without it, or under another token, gets the
 * refusal of rights the hosting gave such a call — the stub that answers whatever token came is the
 * one that let an audit through its suite and down on the real host. A call nothing answers exits 1
 * and names itself.
 */
import { existsSync, readdirSync, readFileSync, writeSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.env.REPLAY_DIR ?? '';
const args = process.argv.slice(2);
const tokenFile = process.env.REPLAY_TOKEN_FILE ?? '';
const machine = tokenFile && existsSync(tokenFile) ? readFileSync(tokenFile, 'utf8').trim() : '';
const kind = !process.env.GH_TOKEN ? 'none' : process.env.GH_TOKEN === machine ? 'machine' : 'other';

const records = readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => JSON.parse(readFileSync(join(dir, file), 'utf8')));
const shape = (list) => list.map((arg) => arg.replace(/\b[0-9a-f]{40}\b|\b[0-9a-f]{7}\b/g, '<sha>')).join('\u0000');
const exact = args.join('\u0000');
const same = records.filter((record) => record.args.join('\u0000') === exact);
const found = same.length > 0 ? same : records.filter((record) => shape(record.args) === shape(args));

const answer = found.find((record) => record.token === kind);
// The answer is written synchronously: an exit right after a write into a pipe cuts a long answer.
if (answer) {
    writeSync(1, answer.stdout);
    writeSync(2, answer.stderr);
    process.exit(answer.code);
}
if (found.length > 0) {
    // Recorded under another kind of token: the hosting answers by the rights of the account.
    const refusal = records.find(
        (record) => record.code !== 0 && /scope|permission|not granted|Resource not accessible/i.test(record.stderr)
    );
    process.stderr.write(
        refusal ? refusal.stderr : `replay-gh: the call was recorded under the ${found[0].token} token, asked under ${kind}\n`
    );
    process.exit(1);
}
process.stderr.write(`replay-gh: no recorded answer for: gh ${args.join(' ')}\n`);
process.exit(1);
