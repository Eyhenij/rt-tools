#!/usr/bin/env node
// rt-kit v0.27.0 · checks/rt-kit-checks.config.mjs · 1fe0312f4c05 · правится надстройкой, не здесь
/**
 * Check settings: what counts as sources, where not to go and where the debt lists lie.
 *
 * The package ships the checks, and the roots and names belong to each tree: `apps` and `libs`
 * in one, `projects` in another. Keeping them apart in every script would mean editing nine
 * files for one rename, and the ninth would be forgotten silently.
 *
 * The defaults are here, the override is `.claude/rt-kit/checks.json` in the project tree. No
 * file — the defaults hold; a file — its keys lie over them one by one, not as a whole: a
 * project that named only the roots does not lose the list of skipped directories.
 *
 * The merge goes by nested keys: a tree that named one board key keeps the rest. While the merge
 * was one level deep, a nested object was replaced whole, and such a tree saw the refusal "no bot
 * token" — that is, it read an incomplete config as a broken machine.
 *
 * Deeper than nested objects the merge does not go: a list named by the tree replaces the default
 * whole. A list cannot be appended to — otherwise `skippedDirs`, from which the tree removed
 * something, would come back, and removing from it would become impossible at all.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The tree root: the checks lie in its `tools/`, hence one level up. */
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const CONFIG_PATH = '.claude/rt-kit/checks.json';

const DEFAULTS = {
    /** Where the code the checks read lies. */
    sourceRoots: ['apps', 'libs'],
    /**
     * Where suites lie beyond the source roots. A tree checks its own checks by suites that lie
     * next to the tooling, and the tooling is not application code: named among the source roots,
     * it would fall under every check that reads them. So the roots of suites are declared apart
     * and are added to the source roots, not put in place of them — a tree that named one root
     * would otherwise lose all the rest silently.
     *
     * Empty — the suites are searched for under the source roots alone, as before.
     */
    testRoots: [],
    /** Where never to go: the build, the dependencies, the generated. */
    skippedDirs: ['node_modules', 'dist', '.git', '.nx', 'tmp', 'coverage', 'worktrees', 'gen', 'generated'],
    /** Where the project texts lie. */
    docsDir: 'docs',
    /** What is set aside: the checks stay silent about it — it describes the past, not the tree. */
    archiveDir: 'docs/archive/',
    /**
     * How many days a record of the archive lives. `null` — no term is set, and then both sides
     * stay silent: the audit does not redden, the cleanup does not remove. The term has no default
     * on purpose — a package that set it for the tree would start tearing down someone else's
     * archive on the day of installation, and what is removed there is the grill of a request,
     * which exists nowhere else.
     */
    archiveRetentionDays: null,
    /**
     * Directories whose index is audited against the content: the overview document in them lists
     * the records in a table, and the reader searches by it, not by walking. Empty — there is no
     * index audit.
     */
    indexedDirs: ['docs/archive/'],
    /**
     * Directories where the sources of portable texts lie. Such a text names the addresses of the
     * tree it is laid out into, not of the one where it is written — and auditing it against this
     * tree means reddening at every example. The check recognises a laid-out copy by its header
     * itself; only the source is entered here. Empty — the tree keeps no portable texts.
     */
    portableDirs: [],
    /**
     * The signs of reuse: which bundles the tree takes and where its own lie.
     *
     * Bundles are cut by the packages whose ready-made code they name, and the tree declares only
     * those it installs: a sign about ready-made code from a package the tree does not have
     * answers falsely. Empty — there are no signs at all, and the guard and the check say so
     * rather than stay silent.
     */
    reuse: { bundles: [], signals: '' },
    /** Where the domain specs lie; empty — the tree has none, and the spec audit is not run. */
    specsDir: 'docs/specs',
    tasksDir: 'docs/tasks',
    /**
     * Where the plans of work wider than one task live: the plan of an epic and the plan of work
     * that does not fit into one session lie side by side there.
     *
     * The creating command needs it, the audit does not: the audit takes the path to a plan from
     * the body of the epic card, and that stays the only truth about an epic already created. This
     * key says only where a new plan is put — a directory that has not been named refuses the
     * creation of an epic instead of scattering plans across the tree.
     *
     * Empty — the tree has no such directory, and an epic is not created by the command.
     */
    plansDir: '',
    /** Where the lists of accepted debts are put. */
    allowlistDir: 'tools',
    /**
     * Directories a generator rewrites whole: the contract, the storage client, what is laid out
     * from the package. There is nobody to argue with a generator about file length and repeats.
     */
    generatedDirs: [],
    /**
     * The file length limit for code and its harness. It still has not two dozen kinds but two:
     * code and the text of the rules layer. There is nothing to argue the number over at every
     * edit — both numbers stand here and change by a piece of work, not along the way.
     */
    fileSizeLimit: 500,
    /**
     * The length limit for the text of the rules layer — a law, a rule, a pattern, a cold part and
     * their sources. It is half the code limit, and this is not strictness for its own sake: a text
     * that does not fit on one screen gets appended to at the end without rereading the beginning —
     * that is how one file comes to hold two answers to one question. Code is saved from this by
     * the linter, text — only by this number. Recounted against the English text of the layer: the
     * same article in English takes a tenth more lines and characters at a lower price in tokens,
     * and the former 300 lines refused a rule that passed in Russian.
     */
    proseSizeLimit: 330,
    /**
     * The weight limit for the text of the rules layer — in characters. Lines measure how much
     * text fits on a screen; weight they do not measure at all: the rule about PRs takes 282 lines
     * at 13,595 characters, and the delivery rule 272 lines at 21,508. Compressing the layer cuts
     * characters and leaves the number of wraps as it was, so the line limit does not fix what has
     * been reached, and the text grows back silently.
     *
     * The number is set by the compressed layer: the heaviest rule weighed 21,508 characters in
     * Russian, and the limit stood a little above it; in English the same text is a tenth longer in
     * characters, and the limit is recounted with the same margin. It cannot be set lower — that
     * would require cutting anew what has already been compressed; higher makes no sense — then it
     * fixes nothing. Zero turns the weight check off entirely: a tree that named no number is
     * judged by lines alone, as before.
     */
    proseCharLimit: 24000,
    /**
     * The roots under which the text of the rules layer and its sources lie. A file from here is
     * judged by the text limit, everything else by the code limit. Empty — one limit for the whole
     * tree.
     */
    proseRoots: [],
    /**
     * The words of the left column of the tree's glossary: those it added beyond the package's
     * eight. The package ones stay the default, what the tree named lies over them — otherwise the
     * tree starts a second check alongside, and two sets of patterns for one requirement diverge
     * silently.
     *
     * An entry: `{ "pattern": "<pattern>", "fix": "<what to replace it with>" }`. The pattern is
     * read as a regular expression and matched without regard to case.
     */
    prose: { glossaryBans: [] },
    /**
     * External packages whose enums count on a par with libs: an enum of one's own for a set
     * already declared there is the same copy as one between two libs. Each entry is a package name
     * and the directory of declarations inside it; the directory is found by module resolution, not
     * by a path into `node_modules`: a package declared as a dependency of a subproject does not lie
     * at the tree root at all, and a hard-coded path is never right on such a layout. Empty —
     * external sets do not count.
     */
    externalEnums: [],
    /** The roots of the end-to-end tests; empty — the tree has none. */
    e2eRoots: ['apps/site-e2e', 'apps/admin-e2e'],
    /** The backend roots: it has neither components nor templates, and some signs do not apply to it. */
    backendRoots: ['libs/api/', 'apps/api/'],
    /** The storage schema and its migrations; empty — the tree has no storage. */
    schemaFile: 'prisma/schema.prisma',
    migrationsDir: 'prisma/migrations',
    /** The directory under which the lib families lie: `<root>/<family>/<domain>/<layer>`. */
    libsRoot: 'libs',
    /** The families of front-end libs: `<libs root>/<family>/<domain>/<layer>`. */
    families: ['site', 'admin'],
    /** The backend family under the same root: its domains have a layer ladder of their own. */
    apiFamily: 'api',
    /** The scope of import aliases: `@scope/<family>/<domain>/<layer>` in `tsconfig.base.json`. */
    importScope: '@app',
    /**
     * The selector prefix required of front-end libs. The word belongs to the tree: named as a
     * default, it would redden at every lib of the first tree whose prefix is its own. Empty — the
     * prefix is not judged at all.
     */
    libPrefix: '',
    /**
     * The tags of libs whose dependency list must stay empty: their barrel goes into the backend
     * bundle, and the build runs without tree-shaking. Tag names are the tree's own words, so the
     * default is empty: naming one here would require a boundary description for a lib the tree
     * does not have.
     */
    noDependencyTags: [],
    /**
     * What a barrel is called in this tree. A file of its own is lawful inside it, outside it a
     * re-export. A tree that publishes packages names their public entry here as well.
     */
    barrelFiles: ['index.ts'],
    /**
     * The signs of the production storage: a port, an address, a domain name. The checks go there
     * neither to read nor to write — the schema in production changes by a rollout. Empty — there
     * are no signs, and an address is never counted as production.
     */
    productionMarks: [],
    /**
     * The push gate against the pipeline. `pipelineFile` — the file the step names are taken from;
     * empty or missing — there is no audit at all. `stepPattern` — how a step name is pulled out of
     * it; the default is written for GitHub Actions. `steps` — what covers each name: a command
     * line of the set or `{ "skip": "<reason>" }`. An undeclared step refuses the push.
     */
    pushGate: {
        pipelineFile: '',
        stepPattern: '^\\s*-\\s*name:\\s*(.+?)\\s*$',
        steps: {},
    },
    /**
     * The rollout. `workflow` — the workflow file production is rolled out by; empty — the
     * production audit says out loud that it stays silent. `mainBranch` — the branch production is
     * compared with.
     *
     * What is asked for is the last successful rollout, not the last run of the main branch: where
     * a rollout is started by hand, a run of main says nothing about production, and production
     * that has fallen hundreds of commits behind is visible to nothing.
     */
    deploy: {
        workflow: '',
        mainBranch: 'main',
    },
    /**
     * Work that cannot be closed in one session. `label` — the label of such a card; `plansDir` —
     * the directory where the plans of such work live. The label and the entry in the plan are
     * audited both ways: one without the other lies silently, because the executor opens the card
     * before the plan and plans by the plan.
     *
     * Either of the two not named — the link is not judged at all: there will be nothing to tell a
     * many-session card from an ordinary one, and the plans directory is each tree's own.
     */
    longWork: {
        label: '',
        /** Empty — the tree's `plansDir` is taken: one directory is not named twice. */
        plansDir: '',
    },
    /** The work queue: the owner, the repository, the board and the machine account. */
    board: {
        owner: '',
        repo: '',
        projectId: '',
        /** The task key: gives the branch `<key>-<number>-<slug>` and the title `[<key>-<number>]`. */
        taskKey: '',
        bot: '',
        tokenPath: '',
        reviewer: '',
        /**
         * The label of an epic card. By it the audit finds epics and audits their link with tasks
         * both ways. The word is each tree's own, there is no common default: not named — the link
         * is not judged at all, because there will be nothing to tell an epic card from an ordinary
         * task.
         */
        epicLabel: '',
        /**
         * The labels marking cargo in the work queue — the incident analyses and proposals sent by
         * trees. They are not judged as tasks at all: they have no title with a number, no executor
         * and no place on the board, and never will. The word is each tree's own, there is no
         * common default: empty — the audit judges as before.
         */
        cargoLabels: [],
    },
};

function readOverrides() {
    const path = join(ROOT, CONFIG_PATH);
    if (!existsSync(path)) {
        return {};
    }
    try {
        return JSON.parse(readFileSync(path, 'utf8'));
    } catch (error) {
        console.error(`${CONFIG_PATH} — does not parse as JSON: ${error.message}`);
        process.exit(1);
    }
}

/**
 * Merging the override with the default by nested keys.
 *
 * An object is merged key by key, everything else is replaced: a list named by the tree comes
 * whole, because "append to the list" and "remove from the list" are different actions, and there
 * is nothing in JSON to tell them apart.
 */
const mergeDeep = (base, over) => {
    const isPlain = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
    if (!isPlain(base) || !isPlain(over)) {
        return over === undefined ? base : over;
    }
    const merged = { ...base };
    for (const [key, value] of Object.entries(over)) {
        merged[key] = mergeDeep(base[key], value);
    }

    return merged;
};

/** The settings of this tree: the package defaults, and over them what the project named. */
export const CONFIG = mergeDeep(DEFAULTS, readOverrides());

/** The path to the list of accepted debts by check name: `dupes` → `tools/dupes-allowlist.json`. */
export const allowlistOf = (name) => join(CONFIG.allowlistDir, `${name}-allowlist.json`);

/**
 * The debt list; no file — an empty one. It need not be created by hand: a check met for the first
 * time will show everything it found as new, and that is more honest than staying silent because a
 * file is missing.
 */
export const readAllowlist = (name) => {
    const path = join(ROOT, allowlistOf(name));
    if (!existsSync(path)) {
        return {};
    }
    try {
        return JSON.parse(readFileSync(path, 'utf8'));
    } catch (error) {
        // An unreadable setting is not an empty list, and it cannot be passed over in silence: a
        // check that read emptiness instead of a list will call the whole tree a debt at once.
        console.error(`${allowlistOf(name)}: the known list was not read — it does not parse as JSON: ${error.message}`);
        process.exit(1);
    }
};

/**
 * Parsing the list of what is accepted: an entry answers for itself.
 *
 * A reason written in prose for the whole list does not answer for a single line: the list empties
 * and fills, and the reason stays as it was — a line entered later looks covered by it. That is
 * what happened to four lists of the tree: the header spoke of a debt already taken apart, and
 * under it lay what had been accepted, which did not exist on that day yet.
 *
 * So the form is one for all lists: a side is an object where the key says what is accepted, and
 * the value carries the reason and the number of the task the entry was made by. The sides are
 * named by the caller: for most lists these are `accepted` and `debt`, others have names of their
 * own, and the parsing is the same for all. The number is the road to the conversation where the
 * silencing was allowed: without it the entry explains itself, and there is nobody to ask about it.
 *
 * The refusal names the file and the entry itself: a list is read not whole but line by line, and
 * "somewhere here is a wrong entry" is worth the same as silence.
 */
export const parseAllowlist = (name, sides = ['accepted', 'debt']) => {
    const file = allowlistOf(name);
    const raw = readAllowlist(name);
    const key = CONFIG.board.taskKey;
    const taskForm = key ? new RegExp(`^${key}-\\d+$`) : /^[A-Za-z]+-\d+$/;
    const refuse = (message) => {
        console.error(`${file}: ${message}`);
        process.exit(1);
    };
    const parseSide = (side) => {
        const entries = raw[side];
        if (entries === undefined) {
            return new Map();
        }
        if (Array.isArray(entries) || typeof entries !== 'object' || entries === null) {
            refuse(
                `«${side}» is written not as an object — the entry has room for neither a reason nor a task number. ` +
                    `The form: {"${side}": {"<key>": {"reason": "<why>", "task": "${key || 'KEY'}-<number>"}}}`,
            );
        }
        const parsed = new Map();
        for (const [entry, value] of Object.entries(entries)) {
            if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                refuse(`«${entry}» is written without a reason — «reason» and «task» stand next to an entry`);
            }
            if (typeof value.reason !== 'string' || value.reason.trim() === '') {
                refuse(`«${entry}» has an empty reason — what is silenced without a reason is indistinguishable from an oversight a month later`);
            }
            if (typeof value.task !== 'string' || !taskForm.test(value.task)) {
                refuse(`«${entry}» has no task number of the form «${key || 'KEY'}-<number>» — there will be nobody to ask about the entry`);
            }
            parsed.set(entry, { reason: value.reason, task: value.task });
        }

        return parsed;
    };
    const parsed = Object.fromEntries(sides.map((side) => [side, parseSide(side)]));

    return { ...parsed, keys: new Set(sides.flatMap((side) => [...parsed[side].keys()])) };
};

/**
 * A draft of the accepted list for the re-record mode: the former entries are kept whole, and the
 * new ones come with an empty reason and an empty task number.
 *
 * The empty fields here are deliberate. Re-recording is a helper, not a permission: a check can be
 * silenced only by the owner's word, and a person must write it down. The parsing refuses such an
 * entry, so a list taken by re-recording and left unfilled does not get past the gate.
 */
export const baselineOf = (keys, parsed, side = 'debt') => {
    const entryOf = (key) => parsed.debt?.get(key) ?? parsed.accepted?.get(key) ?? { reason: '', task: '' };
    const fresh = keys.filter((key) => !parsed.keys.has(key));
    if (fresh.length > 0) {
        console.error(`new entries ${fresh.length} — «reason» and «task» are filled in for each, otherwise the parsing of the list refuses the run`);
    }
    const filled = Object.fromEntries(keys.map((key) => [key, entryOf(key)]));
    const rest = Object.fromEntries([...(parsed.accepted ?? new Map())].filter(([key]) => !keys.includes(key)));

    return JSON.stringify(side === 'accepted' ? { accepted: filled } : { accepted: rest, debt: filled }, null, 4);
};

/** Whether the tree has what a check has nothing to do without. No — it exits with zero and says so. */
export const skipUnless = (present, what) => {
    if (present) {
        return false;
    }
    console.log(`skipped: the tree has no ${what}`);
    process.exit(0);
};
