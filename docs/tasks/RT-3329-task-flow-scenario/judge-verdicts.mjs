// A check of the plan of RT-3329: the narrowed model hooks give the expected verdict on every
// recorded turn. A subagent gets the prompt `judge-prompt.mjs` prints and writes its verdicts to
// `judge-verdicts.<hook>.json` next to the fixtures, with the digest of the hook text and the id of
// its own call. This script compares the verdicts with `turn-replay.expected.json`.
//
// The verdicts count only when the session records of this copy hold the call that made them: a
// call of the Agent tool whose input prompt has the digest of the prompt `judge-prompt.mjs` builds
// now, and whose result carries the whole agent id and the line
// `hook <digest> verdicts <sha12 of the verdicts object>`. Verdicts typed by hand, edited after the
// call, or made by a call with another prompt — one that dictates them — do not match.
// Prints `cases <n>, mismatches <m>`. Usage: node judge-verdicts.mjs turn-judge|ask-judge
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { DIR, expectedOf, hookDigest, promptDigest, sha12 } from './judge-prompt.mjs';

const hookName = process.argv[2] || 'turn-judge';
const file = join(DIR, `judge-verdicts.${hookName}.json`);
const digest = hookDigest(hookName);
if (!existsSync(file)) {
    console.log(`no verdicts: ${file} is absent`);
    process.exit(1);
}
const read = JSON.parse(readFileSync(file, 'utf8'));
if (read.digest !== digest) {
    console.log(`stale verdicts: read for ${read.digest}, the hook is ${digest}`);
    process.exit(1);
}

const seal = `hook ${digest} verdicts ${sha12(JSON.stringify(read.verdicts))}`;
const prompt = promptDigest(hookName);
const idOk = /^[a-z0-9]{12,}$/.test(read.agentId ?? '');
const idRe = new RegExp(`agentId: ${read.agentId}(?![a-z0-9])`);

function contents(entry) {
    const c = entry?.message?.content;
    return Array.isArray(c) ? c : [];
}

function textOf(item) {
    if (typeof item.content === 'string') return item.content;
    if (Array.isArray(item.content)) return item.content.map((x) => x.text ?? '').join('\n');
    return '';
}

// One record file: the Agent call with this prompt, and its result with the id and the seal.
function proved(path) {
    const calls = new Set();
    for (const line of readFileSync(path, 'utf8').split('\n')) {
        if (!line.trim()) continue;
        let entry;
        try { entry = JSON.parse(line); } catch { continue; }
        for (const item of contents(entry)) {
            // Only the general agent, called in the foreground: an agent of the tree's own carries a
            // system prompt that may dictate verdicts, and a background call returns no report here.
            if (item.type === 'tool_use' && ['Agent', 'Task'].includes(item.name)
                && [undefined, 'general-purpose'].includes(item.input?.subagent_type)
                && item.input?.run_in_background !== true
                && typeof item.input?.prompt === 'string' && sha12(item.input.prompt) === prompt) {
                calls.add(item.id);
            }
            if (item.type === 'tool_result' && calls.has(item.tool_use_id)) {
                const text = textOf(item);
                if (idRe.test(text) && text.includes(seal)) return true;
            }
        }
    }
    return false;
}

const records = join(homedir(), '.claude/projects', process.cwd().replace(/\//g, '-'));
const called = idOk && existsSync(records) && readdirSync(records)
    .filter((f) => f.endsWith('.jsonl'))
    .some((f) => proved(join(records, f)));
if (!called) {
    console.log(`unproved verdicts: no Agent call with prompt ${prompt} whose result carries ${read.agentId ?? '(none)'} and «${seal}»`);
    process.exit(1);
}

const expected = expectedOf(hookName);
let cases = 0;
let mismatches = 0;
for (const [name, want] of Object.entries(expected)) {
    cases += 1;
    const got = read.verdicts[name];
    if (got !== want) {
        mismatches += 1;
        console.log(`  expected ${want} · got ${got ?? 'none'} — ${name}`);
    }
}
console.log(`cases ${cases}, mismatches ${mismatches}`);
