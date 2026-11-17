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

const KITS = { 'ui-kit-v2': 'projects/ui-kit-v2/' };
const RULE = 'kit-approval';

/** Files that only keep settings in the browser: the key registry and the storage services. */
const STORAGE_FILES = [
    'projects/ui-kit-v2/src/lib/platform/storage-keys.enum.ts',
    'projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-config.service.ts',
    'projects/ui-kit-v2/src/lib/components/table/rt-table-settings.persistence.ts',
    'projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-settings.service.ts',
];

/**
 * A file the person sees in a kit: the components' code, templates, styles, tokens, icons. Pure
 * logic — `*.logic.ts` and `*.core.ts` — draws nothing, and its behaviour is held by its specs; a
 * barrel `index.ts` only gives out what its neighbours declare. The storage files only read and
 * write settings in the browser — the owner's word on RT-2867 «Хранение не видимо (Recommended)».
 */
export function isVisibleKitFile(path) {
    const kit = Object.values(KITS).find((root) => path.startsWith(`${root}src/`));

    if (kit === undefined || STORAGE_FILES.includes(path)) {
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

/**
 * The search over the transcripts: ripgrep where the machine has it, the system grep otherwise. The
 * transcripts of one machine grow to gigabytes, and the system grep of macOS walks them for half a
 * minute on a short common quote while ripgrep takes under a second — the push set's time limit for
 * this step does not hold with the first.
 *
 * The search names the files, not the lines. A common quote matches hundreds of megabytes of tool
 * output in the transcripts, and a buffer of the matched lines overflowed: the call threw, and an
 * approval the owner did write read as absent. The files are read one at a time instead.
 */
function transcriptSearch(word, root) {
    return spawnOk('rg', ['--version'])
        ? ['rg', ['-F', '-l', '--no-messages', '-g', '*.jsonl', '--', word, root]]
        : ['grep', ['-rlF', '--include=*.jsonl', '--', word, root]];
}

/** Whether the owner wrote the quote in any session of this machine. */
export function ownerSaid(quote, root = join(homedir(), '.claude', 'projects')) {
    const wanted = squash(quote);

    if (wanted === '' || !existsSync(root)) {
        return false;
    }

    // The grep narrows the transcripts to files holding the longest word: the spacing between words
    // is the owner's and may differ from the quote's. The JSON decides.
    const longest = wanted.split(' ').reduce((best, word) => (word.length > best.length ? word : best), '');
    let files = [];

    try {
        files = execFileSync(...transcriptSearch(longest, root), { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
            .split('\n')
            .filter(Boolean);
    } catch {
        return false;
    }

    return files.some((file) => {
        let text = '';

        try {
            text = readFileSync(file, 'utf8');
        } catch {
            return false;
        }

        return text.split('\n').some((line) => {
            if (!line.includes(longest)) {
                return false;
            }

            const said = ownerText(line);

            return said !== null && squash(said).includes(wanted);
        });
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

/** The subject git writes when main is merged in: `Merge (remote-tracking )branch '(origin/)main'`. */
const MAIN_MERGE = /^Merge (?:remote-tracking )?branch '(?:origin\/)?main'/;

/** The archive record of a closed task, found by its number: `docs/archive/<task>-<slug>.md`. */
function taskRecordOf(task) {
    const archived = readdirSync(join('docs', 'archive')).find((file) => file.startsWith(`${task}-`));

    return archived ? { path: join('docs', 'archive', archived), text: readFileSync(join('docs', 'archive', archived), 'utf8') } : null;
}

/**
 * Who answers for the visible kit files of a branch that has no record of its own — an epic branch,
 * whose kit edits arrived by merging its tasks. A commit of the branch itself leaves its files to the
 * branch. A merge whose subject names a task gives its files to that task's record. Main brought in
 * answers for nothing: its edits are main's and were judged there. Any other merge leaves its files
 * to the branch, the same as its own commit.
 *
 * `commits` are the first parents from the base, each `{ sha, subject, merge, files }`.
 */
export function answerersOf(commits, visible) {
    const left = new Set(visible);
    const own = [];

    for (const commit of commits.filter((entry) => !entry.merge)) {
        for (const file of commit.files.filter((path) => left.has(path))) {
            left.delete(file);
            own.push(file);
        }
    }

    const tasks = [];

    for (const commit of commits.filter((entry) => entry.merge)) {
        const task = /\[(RT-\d+)\]/.exec(commit.subject)?.[1];
        const files = commit.files.filter((path) => left.has(path));

        if (task === undefined || files.length === 0) {
            continue;
        }

        files.forEach((file) => left.delete(file));
        tasks.push({ task, sha: commit.sha, subject: commit.subject });
    }

    for (const commit of commits.filter((entry) => entry.merge && !MAIN_MERGE.test(entry.subject))) {
        for (const file of commit.files.filter((path) => left.has(path))) {
            left.delete(file);
            own.push(file);
        }
    }

    return { own, tasks };
}

function firstParents(base) {
    return git('log', '--first-parent', '--format=%H %P', `${base}..HEAD`)
        .split('\n')
        .filter(Boolean)
        .map((line) => {
            const [sha, ...parents] = line.split(' ');

            return {
                sha,
                subject: git('log', '-1', '--format=%s', sha),
                merge: parents.length > 1,
                files: git('diff', '--name-only', `${sha}^1`, sha).split('\n').filter(Boolean),
            };
        });
}

function branchFaults() {
    const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
    const base = git('merge-base', 'origin/main', 'HEAD');
    const visible = git('diff', '--name-only', `${base}..HEAD`).split('\n').filter(isVisibleKitFile);

    if (visible.length === 0) {
        return [];
    }

    const own = recordOf(branch);

    if (own !== null) {
        return faultsOf(branch, own);
    }

    const { own: direct, tasks } = answerersOf(firstParents(base), visible);
    const faults = direct.length === 0 ? [] : faultsOf(branch, null);

    for (const { task, sha, subject } of tasks) {
        faults.push(...faultsOf(`${sha.slice(0, 9)} ${subject}`, taskRecordOf(task)));
    }

    return faults;
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

        faults.push(...faultsOf(`${sha.slice(0, 9)} ${subject}`, task ? taskRecordOf(task) : null));
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
