// A check of the plan of RT-3329 that replaces `judge-verdicts.mjs` for steps 3.15 and 3.16: the
// host runs every Agent call in the background, so the report of a judge never stands in the result
// of the call. It arrives later as a message of that agent, `<agent-message from="<id>">`.
//
// The verdicts count when the session records of this copy hold: an Agent call of the general agent
// whose prompt has the digest of the prompt `judge-prompt.mjs` builds now; its result naming the id
// of the launched agent; and a later message of that very agent carrying the line
// `hook <digest> verdicts <sha12 of the verdicts object>`. Verdicts typed by hand, edited after the
// report, or made by a call with another prompt do not match. The id written in the verdicts file is
// not read: the judge cannot know it.
// Prints `cases <n>, mismatches <m>`. Usage: node judge-seal.mjs turn-judge|ask-judge
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { DIR, expectedOf, hookDigest, promptDigest, sha12 } from './judge-prompt.mjs';

const hookName = process.argv[2] || 'turn-judge';
const file = join(DIR, `judge-verdicts.${hookName}.json`);
if (!existsSync(file)) {
    console.log(`no verdicts: ${file} is absent`);
    process.exit(1);
}
const read = JSON.parse(readFileSync(file, 'utf8'));
const digest = hookDigest(hookName);
if (read.digest !== digest) {
    console.log(`stale verdicts: read for ${read.digest}, the hook is ${digest}`);
    process.exit(1);
}
const seal = `hook ${digest} verdicts ${sha12(JSON.stringify(read.verdicts))}`;
const prompt = promptDigest(hookName);

const textOf = (content) =>
    typeof content === 'string'
        ? content
        : Array.isArray(content)
          ? content.map((part) => (typeof part === 'string' ? part : (part?.text ?? textOf(part?.content)))).join('\n')
          : '';

// One record file: the call with this prompt, the id its result names, then a message of that agent with the seal.
function proved(path) {
    const calls = new Set();
    const agents = new Set();
    for (const line of readFileSync(path, 'utf8').split('\n')) {
        if (!line.trim()) continue;
        let entry;
        try {
            entry = JSON.parse(line);
        } catch {
            continue;
        }
        const parts = Array.isArray(entry?.message?.content) ? entry.message.content : [];
        for (const part of parts) {
            if (
                part?.type === 'tool_use' &&
                ['Agent', 'Task'].includes(part.name) &&
                [undefined, 'general-purpose'].includes(part.input?.subagent_type) &&
                typeof part.input?.prompt === 'string' &&
                sha12(part.input.prompt) === prompt
            ) {
                calls.add(part.id);
            }
            if (part?.type === 'tool_result' && calls.has(part.tool_use_id)) {
                const id = textOf(part.content).match(/agentId: ([a-z0-9]{12,})/)?.[1];
                if (id) agents.add(id);
            }
        }
        const text = textOf(entry?.content ?? entry?.message?.content);
        for (const id of agents) {
            if (text.includes(`<agent-message from="${id}">`) && text.includes(seal)) return true;
        }
    }
    return false;
}

const records = join(homedir(), '.claude/projects', process.cwd().replace(/\//g, '-'));
const called =
    existsSync(records) &&
    readdirSync(records)
        .filter((name) => name.endsWith('.jsonl'))
        .some((name) => proved(join(records, name)));
if (!called) {
    console.log(`unproved verdicts: no Agent call with prompt ${prompt} followed by a message of that agent with «${seal}»`);
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
