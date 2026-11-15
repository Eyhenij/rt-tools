// A check of the plan of RT-3329: builds the prompt a subagent gets for judging recorded turns by a
// model hook. The prompt carries the hook text and every case of
// `projects/agent-kit/tests/fixtures/turn-replay/`. Expected verdicts live apart, in
// `projects/agent-kit/tests/turn-replay.expected.json`, and the prompt forbids reading that file.
// The session passes the printed text, without the last line, to the subagent as is.
// `judge-verdicts.mjs` finds that very call in the session records and compares the digest of its
// input with the digest of this prompt: a prompt written by hand, one that dictates verdicts, differs.
// Prints the prompt, then the line `prompt <sha12>`. Usage: node judge-prompt.mjs turn-judge|ask-judge
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const DIR = 'projects/agent-kit/tests/fixtures/turn-replay';
export const EXPECTED_FILE = 'projects/agent-kit/tests/turn-replay.expected.json';
const EXPECTED = ['judge', 'ask'];

export function sha12(text) {
    return createHash('sha256').update(text).digest('hex').slice(0, 12);
}

export function hookDigest(hookName) {
    return sha12(readFileSync(`projects/agent-kit/assets/hooks/${hookName}.md`));
}

export function expectedOf(hookName) {
    const field = hookName === 'ask-judge' ? 'ask' : 'judge';
    const all = JSON.parse(readFileSync(EXPECTED_FILE, 'utf8'));
    return Object.fromEntries(Object.entries(all).filter(([, v]) => v[field] !== undefined).map(([k, v]) => [k, v[field]]));
}

export function buildPrompt(hookName) {
    const hook = readFileSync(`projects/agent-kit/assets/hooks/${hookName}.md`, 'utf8');
    const wanted = expectedOf(hookName);
    const cases = readdirSync(DIR)
        .filter((f) => f.endsWith('.json') && !f.startsWith('judge-verdicts.') && f in wanted)
        .sort()
        .map((name) => {
            const fixture = JSON.parse(readFileSync(join(DIR, name), 'utf8'));
            const shown = Object.fromEntries(Object.entries(fixture).filter(([k]) => !EXPECTED.includes(k)));
            return `### ${name}\n\n\`\`\`json\n${JSON.stringify(shown, null, 2)}\n\`\`\``;
        });
    return [
        `You are the model hook \`${hookName}.md\`. Its text is below, then the recorded turns.`,
        'Judge every turn by the hook text alone, as the hook would at that minute.',
        `Read no file of the tree: everything you need is in this prompt, and \`${EXPECTED_FILE}\` is closed to you.`,
        'The verdict of a turn is one word: `allow` or `block`.',
        `Write \`${DIR}/judge-verdicts.${hookName}.json\` as`,
        `\`{"digest": "${hookDigest(hookName)}", "agentId": "<your agent id>", "verdicts": {"<case file>": "allow|block"}}\`.`,
        'End your report with the line `hook <digest> verdicts <v>`, where <v> is the first 12 hex signs',
        'of sha256 over JSON.stringify of the verdicts object.',
        '',
        '## The hook text',
        '',
        hook,
        '',
        `## Recorded turns (${cases.length})`,
        '',
        ...cases,
    ].join('\n');
}

export function promptDigest(hookName) {
    return sha12(buildPrompt(hookName));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const hookName = process.argv[2] || 'turn-judge';
    console.log(buildPrompt(hookName));
    console.log(`prompt ${promptDigest(hookName)}`);
}
