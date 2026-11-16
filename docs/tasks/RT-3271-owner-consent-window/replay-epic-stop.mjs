#!/usr/bin/env node
/**
 * Replays the calls the end-of-epic guard refused on one day of a real record through the guard of
 * this tree, in a stub tree where the epic is over, with the record itself as the transcript.
 *
 *   node replay-epic-stop.mjs <record.jsonl> <day YYYY-MM-DD> [hook]
 *
 * Prints one line per decision and the last line `ask K pass P deny D of M`: what the guard answers
 * now to each call it refused that day. A refused call is a tool result that begins with the hook
 * error of the guard; a command whose output only quotes the refusal is not one. The record is
 * read, never written.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const [record, day, hookArg] = process.argv.slice(2);
if (!record || !day) {
    process.stderr.write('usage: replay-epic-stop.mjs <record.jsonl> <day> [hook]\n');
    process.exit(2);
}
const hook = resolve(hookArg ?? '.claude/hooks/epic-stop-guard.sh');

const entries = readFileSync(record, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
        try {
            return JSON.parse(line);
        } catch {
            return null;
        }
    })
    .filter(Boolean);

const commands = new Map();
for (const entry of entries) {
    for (const part of Array.isArray(entry.message?.content) ? entry.message.content : []) {
        if (part?.type === 'tool_use' && part.input?.command) commands.set(part.id, part.input.command);
    }
}

const refused = [];
for (const entry of entries) {
    if (!String(entry.timestamp ?? '').startsWith(day)) continue;
    for (const part of Array.isArray(entry.message?.content) ? entry.message.content : []) {
        if (part?.type !== 'tool_result') continue;
        const text = typeof part.content === 'string' ? part.content : JSON.stringify(part.content ?? '');
        if (/^PreToolUse:\S+ hook error: Refused: the epic is over/.test(text.replace(/^"/, '')) && commands.has(part.tool_use_id)) {
            refused.push(commands.get(part.tool_use_id));
        }
    }
}

const tree = mkdtempSync(join(tmpdir(), 'epic-stop-replay-'));
mkdirSync(join(tree, 'tools'));
mkdirSync(join(tree, '.claude'));
execFileSync('git', ['init', '-q'], { cwd: tree });
writeFileSync(join(tree, '.claude', 'rt-kit.json'), '{"layout":{"checks":"tools"}}\n');
writeFileSync(join(tree, 'tools', 'epic-table.mjs'), 'process.exit(0);\n');

const count = { ask: 0, pass: 0, deny: 0 };
for (const command of refused) {
    const input = JSON.stringify({ tool_name: 'Bash', tool_input: { command }, transcript_path: resolve(record) });
    let out = '';
    try {
        out = execFileSync('bash', [hook], { cwd: tree, input, encoding: 'utf8' });
    } catch (error) {
        out = String(error.stdout ?? '');
    }
    let decision = 'pass';
    if (out.trim()) {
        try {
            decision = JSON.parse(out).hookSpecificOutput?.permissionDecision ?? 'deny';
        } catch {
            decision = 'deny';
        }
    }
    count[decision] = (count[decision] ?? 0) + 1;
    process.stdout.write(`${decision}\t${command.split('\n')[0].slice(0, 100)}\n`);
}
process.stdout.write(`ask ${count.ask} pass ${count.pass} deny ${count.deny} of ${refused.length}\n`);
