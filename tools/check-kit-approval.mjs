#!/usr/bin/env node
/**
 * A kit edit the person sees leaves the machine only with two approvals of the owner: of the
 * mockup and of the showcase. The rule is `kit-approval`, the law is `mockups`.
 *
 * The approval is the owner's answer, written down by the executor as a quote. A quote proves
 * nothing by itself — the executor writes it — so every quote is looked for among the owner's own
 * messages in the session transcripts of this machine. A quote the owner never wrote is a refusal.
 *
 *   node tools/check-kit-approval.mjs                       # the branch against origin/main: push, PR
 *   node tools/check-kit-approval.mjs --publish ui-kit-v2   # every merge since the last version bump
 *
 * Where the record lies: `docs/tasks/<branch>/approvals.md` while the task folder lives, and the
 * same lines in `docs/archive/<branch>.md` after the folder is taken apart. Two lines are read:
 *
 *   - **Макет:** «<the owner's words>» — <the Figma link>
 *   - **Витрина:** «<the owner's words>»
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const KITS = { 'ui-kit': 'projects/ui-kit/', 'ui-kit-v2': 'projects/ui-kit-v2/' };
const RULE = 'kit-approval';

/**
 * A file the person sees in a kit: the components' code, templates, styles, tokens, icons. Pure
 * logic — `*.logic.ts` and `*.core.ts` — draws nothing, and its behaviour is held by its specs; a
 * barrel `index.ts` only gives out what its neighbours declare.
 */
export function isVisibleKitFile(path) {
    const kit = Object.values(KITS).find((root) => path.startsWith(`${root}src/`));

    if (kit === undefined) {
        return false;
    }

    return !/(\.spec\.ts|\.stories\.ts|\.logic\.ts|\.core\.ts|\/index\.ts|\.mdx|\.md)$|\/__snapshots__\/|\/stories\/|\/testing\/|\/showcase\//.test(
        path
    );
}

function spawnOk(command, args) {
    try {
        execFileSync(command, args, { stdio: 'ignore' });

        return true;
    } catch {
        return false;
    }
}

function git(...args) {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

/** The two quotes and the link from a record text; a missing piece stays null. */
export function parseApprovals(text) {
    const mockup = /^- \*\*Макет:\*\* «(.+?)» — (https:\/\/(?:www\.)?figma\.com\/\S+)/m.exec(text);
    const showcase = /^- \*\*Витрина:\*\* «(.+?)»/m.exec(text);
    const match = /^- \*\*Совпадение:\*\* (\d+) из (\d+) чисел/m.exec(text);

    return {
        mockup: mockup ? mockup[1] : null,
        figma: mockup ? mockup[2] : null,
        showcase: showcase ? showcase[1] : null,
        match: match ? { matched: Number(match[1]), total: Number(match[2]) } : null,
    };
}

const squash = (text) => text.replace(/\s+/g, ' ').trim();

/** The text of an owner message in one transcript line, or null for any other line. */
function ownerText(line) {
    let entry;

    try {
        entry = JSON.parse(line);
    } catch {
        return null;
    }

    if (entry?.type !== 'user' || entry.message?.role !== 'user' || entry.isMeta) {
        return null;
    }

    // An answer in the question window comes as a tool result, and only the harness fills its
    // `answers`: the executor writes neither the field nor the choice in it.
    const answers = entry.toolUseResult?.answers;

    if (answers !== null && typeof answers === 'object') {
        return Object.values(answers).join('\n');
    }

    const content = entry.message.content;

    if (typeof content === 'string') {
        return content;
    }

    if (!Array.isArray(content) || content.some((block) => block.type === 'tool_result')) {
        return null;
    }

    return content.map((block) => (block.type === 'text' ? block.text : '')).join('\n');
}

/** Whether the owner wrote the quote in any session of this machine. */
export function ownerSaid(quote, root = join(homedir(), '.claude', 'projects')) {
    const wanted = squash(quote);

    if (wanted === '' || !existsSync(root)) {
        return false;
    }

    let lines = '';

    try {
        // The grep narrows the transcripts to lines holding the longest word: the spacing between
        // words is the owner's and may differ from the quote's. The JSON decides.
        const longest = wanted.split(' ').reduce((best, word) => (word.length > best.length ? word : best), '');

        lines = execFileSync('grep', ['-rhF', '--include=*.jsonl', '--', longest, root], {
            encoding: 'utf8',
            maxBuffer: 256 * 1024 * 1024,
        });
    } catch {
        return false;
    }

    return lines.split('\n').some((line) => {
        const text = ownerText(line);

        return text !== null && squash(text).includes(wanted);
    });
}

/** The record of a branch: the task folder first, the archive after it. */
function recordOf(branch) {
    const live = join('docs', 'tasks', branch, 'approvals.md');

    if (existsSync(live)) {
        return { path: live, text: readFileSync(live, 'utf8') };
    }

    const archived = join('docs', 'archive', `${branch}.md`);

    return existsSync(archived) ? { path: archived, text: readFileSync(archived, 'utf8') } : null;
}

/** The faults of one record, each a line for the refusal; empty means approved. */
export function faultsOf(name, record, said = ownerSaid) {
    if (record === null) {
        return [`${name}: no approval record — the mockup and the showcase lines in the task folder's approvals.md`];
    }

    const found = parseApprovals(record.text);
    const faults = [];

    if (found.mockup === null) {
        faults.push(`${record.path}: no line «- **Макет:** «…» — <Figma link>»`);
    } else if (!said(found.mockup)) {
        faults.push(`${record.path}: the mockup quote «${found.mockup}» is in no message of the owner`);
    }

    if (found.match === null) {
        faults.push(`${record.path}: no line «- **Совпадение:** N из N чисел» — the output of tools/kit-match.mjs numbers`);
    } else if (found.match.total === 0 || found.match.matched !== found.match.total) {
        faults.push(`${record.path}: the match is ${found.match.matched} of ${found.match.total} numbers, not 100%`);
    }

    if (found.showcase === null) {
        faults.push(`${record.path}: no line «- **Витрина:** «…»»`);
    } else if (!said(found.showcase)) {
        faults.push(`${record.path}: the showcase quote «${found.showcase}» is in no message of the owner`);
    }

    return faults;
}

function branchFaults() {
    const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
    const base = git('merge-base', 'origin/main', 'HEAD');
    const visible = git('diff', '--name-only', `${base}..HEAD`).split('\n').filter(isVisibleKitFile);

    return visible.length === 0 ? [] : faultsOf(branch, recordOf(branch));
}

function publishFaults(kit) {
    const root = KITS[kit];

    if (root === undefined) {
        return [`unknown kit «${kit}»: ${Object.keys(KITS).join(', ')}`];
    }

    const bump = git('log', '-1', '--format=%H', 'origin/main', '--', `${root}package.json`);
    // Work merged before the rule reached main was never asked for approvals: it is counted from
    // the later of the two — the last version bump or the arrival of this check itself.
    const arrival = git('log', '-1', '--diff-filter=A', '--format=%H', 'origin/main', '--', 'tools/check-kit-approval.mjs');

    if (arrival === '') {
        return [];
    }

    const from = spawnOk('git', ['merge-base', '--is-ancestor', bump, arrival]) ? arrival : bump;
    const merges = git('log', '--first-parent', '--format=%H %s', `${from}..origin/main`).split('\n').filter(Boolean);
    const faults = [];

    for (const line of merges) {
        const [sha, ...words] = line.split(' ');
        const subject = words.join(' ');
        const visible = git('diff', '--name-only', `${sha}^1`, sha)
            .split('\n')
            .filter((path) => path.startsWith(`${root}src/`) && isVisibleKitFile(path));

        if (visible.length === 0) {
            continue;
        }

        const task = /\[(RT-\d+)\]/.exec(subject)?.[1];
        const archived = task ? readdirSync(join('docs', 'archive')).find((file) => file.startsWith(`${task}-`)) : undefined;
        const record = archived ? { path: join('docs', 'archive', archived), text: readFileSync(join('docs', 'archive', archived), 'utf8') } : null;

        faults.push(...faultsOf(`${sha.slice(0, 9)} ${subject}`, record));
    }

    return faults;
}

const calledDirectly = process.argv[1] !== undefined && import.meta.url.endsWith(process.argv[1].split('/').pop());

if (calledDirectly) {
    const at = process.argv.indexOf('--publish');
    const faults = at === -1 ? branchFaults() : publishFaults(process.argv[at + 1]);

    if (faults.length > 0) {
        console.error(`check-kit-approval: a visible kit edit without the owner's approvals (rule ${RULE})\n`);
        faults.forEach((fault) => console.error(`  ${fault}`));
        console.error('\nAsk the owner, write their answer word for word; a refusal is fixed and shown again.');
        process.exit(1);
    }

    console.log('check-kit-approval: no visible kit edit without approvals');
}
