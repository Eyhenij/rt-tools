// rt-kit v0.25.0 · checks/spec-common.mjs · 028a7b0f66df · правится надстройкой, не здесь
/**
 * What is shared by every subject of the spec audit: what counts as a domain, how the tree is
 * read and how a document is cut into sections and bullets.
 *
 * The module is not named `check-*`, and that is not decoration: the package default assembles the
 * push gate set by walking the names `check-<what>.mjs` in the checks directory, and a helper with
 * such a name the gate would run as a check of its own.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const SPECS_DIR = CONFIG.specsDir;
const CONSTITUTION_DIR = 'docs/constitution';
/**
 * Directories under `docs/specs` that are not domains: the template holds samples with
 * placeholders, and it has no mandatory sections.
 */
const NOT_DOMAINS = ['_template'];
/**
 * Where tests are searched for. Taken from the setting of the tree, not from the code: roots
 * hardwired here silently found no test at all in a tree that keeps its code differently — and
 * every scenario looked uncovered while the test for it stood right there.
 */
const TEST_ROOTS = CONFIG.sourceRoots;
/** Where the call of a symbol from a binding is searched for. */
const SOURCE_ROOTS = [...CONFIG.sourceRoots, ...(CONFIG.schemaFile ? [CONFIG.schemaFile.split('/')[0]] : [])];
const SKIPPED_DIRS = CONFIG.skippedDirs;

/**
 * `### SC-BK-03 — a request for dates already taken`
 *
 * The number is accepted from one digit to three. A heading that did not match the template starts
 * no scenario and gives no refusal: a tree that numbered its scenarios from one would lose the
 * first nine of them silently — neither in coverage nor in debts, with a green audit.
 */
const SCENARIO_HEADING = /^###\s+(SC-([A-Z]{2,4})-(\d{1,3}))\s+—\s+(.+?)\s*$/;
/**
 * The keys of a spec are read under two names, English and the owner's. A tree translates its
 * specs one domain at a time, and a key that moved instead of learning the second name takes the
 * untranslated domains out of the audit silently: the heading is not found, the statements and the
 * scenarios are not read, and the audit stays green about a domain it no longer sees.
 */
/** The mark of a knowingly uncovered scenario; the reason is mandatory */
const UNCOVERED = /^(?:Not covered|Не покрыто):\s*\S/;
/** The test exists, but checks not everything promised or goes another way */
const PARTIAL = /^(?:Coverage:\s*partial|Покрытие:\s*частичное)\s*—\s*\S/;
/** A mention of the scenario in the title of a test; the number is as long as in the heading */
const SCENARIO_REFERENCE = /\bSC-[A-Z]{2,4}-\d{1,3}\b/g;
/** The promise line of a scenario; its continuations go with an indent */
const PROMISE = /^(?:Then|Тогда)\s+\S/;
/**
 * A person in front of the screen and their perception. Word boundaries are not set: `\b` in
 * JavaScript counts only Latin letters as letters, and `\bгость\b` would not match once.
 */
const ACTOR = /(гост[ьяию]|владел(?:ец|ьца|ьцу|ьцем)|сотрудник\w*|оператор\w*|пользовател\w+|\bguests?\b|\bowner\b|\bemployees?\b|\boperators?\b|\busers?\b)/i;
const PERCEIVES = /(вид(?:ит|ят|но)|чита(?:ет|ют)|смотр(?:ит|ят)|\bsees?\b|\breads?\b|\bis shown\b|\bare shown\b)/i;
/** End-to-end tests: only they go the same way the user does */
const E2E_ROOTS = CONFIG.e2eRoots;

/**
 * The anchor of a rule: `path/to/file.ts:symbol` in backticks. The extension goes up to eight
 * letters — otherwise `schema.prisma` does not count as a path, and the rule about the default of
 * a column looks like a rule without an anchor. Capitals and ten letters are needed for
 * `api.Dockerfile`: without them the rule about the run mode of the image counted as a rule with
 * an empty binding, and there is nothing else left to bind it to — the mode is declared exactly
 * there.
 *
 * The symbol is any letter, not only a Latin one: the texts a model executes are written in their
 * own language, and Latin in them names exactly what holds no statement — the name of a header
 * field, the name of a tool. A statement bound to the name of a field stays green when the text is
 * rewritten whole. The alphabet is not listed by ranges: the listed ones silently do not cover the
 * neighbouring one, and the miss looks like an absent binding. The path stays Latin all the same —
 * it is an address in the tree, not a word of the text.
 *
 * A hash before the name is lawful: a private field of a class is declared with it, and the name
 * written without it calls the method by a name it was not declared with. The check stays green
 * meanwhile — there is a word boundary before the hash — so the miss never turns red and is seen
 * only by reading.
 */
// The symbol of a binding is also a line number or a class name with a dot in front: in markup
// there is nothing else to bind to — an element has neither a method nor a field. Before, such a
// binding did not match the template, and the audit said there was no binding at all; a session
// went on rewriting a table of bindings that was right.
const ANCHOR = /`([\w./-]+\.[A-Za-z]{2,10}):(#?\p{L}[\p{L}\p{N}_-]*|#?_[\w-]*|\d+|\.[\p{L}\p{N}_-]+)`/gu;
/**
 * An explicit verdict instead of an anchor: an article that has nowhere to be carried out in the
 * tree. That happens lawfully — the rule speaks of a service the tree does not keep, or of a human
 * movement the check cannot reach: the merge button is pressed in the browser, where there are no
 * hooks at all. An anchor for such an article can only be put into a file that does not carry it
 * out — the check would accept it, and the reader would be lied to.
 *
 * A verdict with a reason is accepted, not a single word: an empty one becomes a way to close any
 * line, and in a month the table turns into a list of excuses. The length threshold is the same
 * measure as the bypass of the document guard: a reason shorter than that does not count as a
 * reason.
 *
 * The end of the word is found by a negative lookahead, not by `\b`: JavaScript knows only Latin
 * as a word boundary, and after a Cyrillic letter there is none at all — the verdict was not
 * recognised once.
 *
 * The verdict has two names: an English one in a companion written after the layer was translated,
 * a Russian one in a companion written before it. Either is enough.
 */
const VERDICT =
    /^\s*(?:\*\*)?(?:Not (?:carried out|applicable|checked)|Не (?:исполняется|применимо|проверяется))(?![\p{L}\p{N}_])/u;
const VERDICT_MIN = 40;
/** The header line declaring the libs whose procedures the domain serves */
const PROCEDURE_ROOTS = /^\*\*(?:Procedures|Процедуры):\*\*\s*(.+)$/;
const BACKTICKED = /`([^`]+)`/g;

/**
 * The mandatory sections of a spec, each under two names: the English one first, the owner's
 * second. A spec carries one of the two, and a tree translating its specs domain by domain keeps a
 * green audit all the while. The refusal names the first of the pair — the one a new spec is
 * written by.
 */
const REQUIRED_HEADINGS = [
    ['## Why', '## Зачем'],
    ['## Terminology', '## Терминология'],
    ['### What it is called in the interface', '### Как это называется в интерфейсе'],
    ['## Rules', '## Правила'],
    ['## What is out of scope', '## Что не входит'],
    ['## Contract', '## Контракт'],
    ['### Refusal codes', '### Коды отказов'],
    ['## Data', '## Данные'],
    ['## Screens and states', '## Экраны и состояния'],
    ['## Cross-cutting requirements', '## Сквозные требования'],
    ['### Locales', '### Локали'],
    ['### SEO'],
    ['### Mobile layout', '### Мобильная раскладка'],
    ['### Several objects', '### Мультиобъектность'],
    ['## Decisions', '## Решения'],
    ['## Open questions', '## Открытые вопросы'],
    ['## History of changes', '## История изменений'],
];

const problems = [];
const report = (where, message) => problems.push(`${where}: ${message}`);

function walk(dir, accept) {
    const found = [];
    let entries;
    try {
        entries = readdirSync(join(ROOT, dir), { withFileTypes: true });
    } catch {
        return found;
    }

    for (const entry of entries) {
        const path = `${dir}/${entry.name}`;
        if (entry.isDirectory()) {
            if (!SKIPPED_DIRS.includes(entry.name)) {
                found.push(...walk(path, accept));
            }
        } else if (accept(entry.name)) {
            found.push(path);
        }
    }

    return found;
}

const read = (path) => readFileSync(join(ROOT, path), 'utf8');
const exists = (path) => existsSync(join(ROOT, path));

/** The directories of domains: `docs/specs/<domain>`, except the template. */
function collectDomains() {
    try {
        return readdirSync(join(ROOT, SPECS_DIR), { withFileTypes: true })
            .filter((entry) => entry.isDirectory() && !NOT_DOMAINS.includes(entry.name))
            .map((entry) => entry.name);
    } catch {
        return [];
    }
}

/**
 * The lines of a section: from its heading to the next heading of the same or a higher level.
 * Subsections belong to the section — the refusal codes are taken apart separately, but stay part
 * of the contract.
 */
function sectionOf(text, heading) {
    // The heading arrives as one name or as a list of names: a spec carries the English heading or
    // the owner's one, and the section is the same section under either.
    const names = Array.isArray(heading) ? heading : [heading];
    const level = names[0].match(/^#+/)[0].length;
    const lines = text.split('\n');
    const start = lines.findIndex((line) => names.includes(line.trimEnd()));
    if (start < 0) {
        return [];
    }
    const rest = lines.slice(start + 1);
    const end = rest.findIndex((line) => {
        const marks = line.match(/^(#+)\s/);

        return marks && marks[1].length <= level;
    });

    return end < 0 ? rest : rest.slice(0, end);
}

/**
 * The bullets of a top-level list together with their continuations.
 *
 * A heading inside the section does not end the list: the section is already cut by the level of
 * its heading, and a `#` line in it is always deeper — a subheading by which the spec of a large
 * domain groups its rules. A table ends the list as before; the line it ended on is handed over in
 * the `stoppedAt` property, so that the refusal about an empty section names what stands in it
 * instead of bullets.
 */
function bulletsOf(lines) {
    const bullets = [];
    for (const [index, line] of lines.entries()) {
        if (/^-\s+\S/.test(line)) {
            bullets.push({ line: index, text: line });
        } else if (bullets.length && /^\s+\S/.test(line)) {
            bullets[bullets.length - 1].text += ` ${line.trim()}`;
        } else if (!line.trim() || /^#/.test(line)) {
            continue;
        } else if (/^\|/.test(line)) {
            bullets.stoppedAt = line;
            break;
        }
    }

    return bullets;
}

export {
    SPECS_DIR,
    CONSTITUTION_DIR,
    NOT_DOMAINS,
    TEST_ROOTS,
    SOURCE_ROOTS,
    SKIPPED_DIRS,
    SCENARIO_HEADING,
    UNCOVERED,
    PARTIAL,
    SCENARIO_REFERENCE,
    PROMISE,
    ACTOR,
    PERCEIVES,
    E2E_ROOTS,
    ANCHOR,
    VERDICT,
    VERDICT_MIN,
    PROCEDURE_ROOTS,
    BACKTICKED,
    REQUIRED_HEADINGS,
    problems,
    report,
    walk,
    read,
    exists,
    collectDomains,
    sectionOf,
    bulletsOf,
};
