// rt-kit v0.29.0 · checks/spec-anchors.mjs · 5d7242ff9205 · правится надстройкой, не здесь
/**
 * The binding of a rule to code and the laws a spec applies.
 *
 * The rule lives in the spec, the binding in the companion next to it; the key of the link is the
 * text of the rule itself. Dead bindings are handled here too: a symbol declared in its own file
 * and met nowhere else is not counted as the place where the rule is carried out.
 */
import {
    ANCHOR,
    BACKTICKED,
    CONSTITUTION_DIR,
    SOURCE_ROOTS,
    VERDICT,
    VERDICT_MIN,
    bulletsOf,
    codeOf,
    exists,
    isTestFile,
    read,
    report,
    sectionOf,
    walk,
} from './spec-common.mjs';

// ── 1. Rule anchors ────────────────────────────────────────────────────────────

const escapeForRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');

/**
 * The symbol is searched as a word: a substring would give a false match on a prefix.
 *
 * Word boundaries are letters of any alphabet, not `\b`: in JavaScript that one knows only Latin
 * letters, and `\bСемья\b` never matches — a binding on a Russian word read as leading into a file
 * where the word is absent, while the word stands there on the very first line.
 */
function fileHasSymbol(path, symbol) {
    // A line number is not searched as a word: it is a place, not a name. It matches when the file
    // has that many lines — otherwise a binding on markup would read as leading into nothing.
    if (/^\d+$/.test(symbol)) {
        const line = Number(symbol);

        return line > 0 && line <= read(path).split('\n').length;
    }

    // The hyphen is not escaped here: outside a character class it means nothing, and under the `u`
    // flag a needless escape is a parse failure. The shared escaper protects it because it is meant
    // for a class too, and `task-flow` brought the whole audit down.
    const word = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?<![\\p{L}\\p{N}_])${word}(?![\\p{L}\\p{N}_])`, 'u').test(read(path));
}

/**
 * Bindings for which it remains to find out whether anyone calls the symbol. They pile up
 * into one list and are handled by one pass over the sources: walking `apps` and `libs`
 * for each of five hundred bindings would be five hundred walks.
 */
const traced = [];

/** The bold start of a bullet is the key by which the rule finds its binding line. */
function ruleHeadOf(bulletText) {
    const bold = bulletText.match(/\*\*(.+?)\*\*/s);

    return bold ? bold[1].replace(/\s+/g, ' ').trim() : null;
}

/**
 * Rules live in `spec.md`, the binding to code in `implementation.md` next to it. They are
 * separated because the spec describes the product and is read without knowing the internals,
 * while the binding goes stale on every rename.
 *
 * The key of the link is the text of the rule itself, not a separate identifier: then a wording
 * edit cannot be made while forgetting the binding — the line stops being found.
 *
 * The section heading arrives as an argument: for a spec it is `## Rules`, for a law
 * `## Articles`. One word in two meanings was split apart exactly here: "rule" is the layer between
 * a law and a pattern, and inside a law live articles.
 */
/**
 * The rows of the companion's binding table.
 *
 * A rule's companion holds three tables: what the rule's things are called in this tree, where
 * the mechanisms lie and where each article is carried out. Bindings are only the third one, and
 * it is taken by section name, not by position in the file. While the whole file was read, rows
 * of the first two landed in the list alongside the real ones and were at once declared a
 * discrepancy: there is no article with such text in the rule and cannot be. Two thirds of the
 * listing in the tree were these, and a correctly added "Where it lies" row was answered with
 * a refusal.
 *
 * A domain spec's companion has no such section: the table there is the only one, and there is
 * nothing to narrow — such a caller comes without a section name. For a rule the section stands
 * in the companion template, so its absence is a refusal: silently reading the whole file instead
 * would bring the same defect back.
 */
function rowsOfMap(specFile, mapFile, mapHeading) {
    const text = read(mapFile);
    if (!mapHeading || (Array.isArray(mapHeading) && !mapHeading.length)) {
        return text.split('\n');
    }
    const section = sectionOf(text, mapHeading);
    if (!section.length) {
        // The section is read under either of its names, and the refusal names the first — the one
        // a new companion is written by.
        const named = Array.isArray(mapHeading) ? mapHeading[0] : mapHeading;
        report(mapFile, `there is no section \`${named}\` — the bindings of the rule have nowhere to lie`);
    }

    return section;
}

function checkRuleImplementation(specFile, text, mapFile, heading = ['## Rules', '## Правила'], mapHeading = '') {
    const lines = sectionOf(text, heading);
    const bullets = bulletsOf(lines);
    if (!bullets.length) {
        // The refusal names what stands in the section instead of bullets: without that the author
        // shuffles markup at random — a table before the list and subheadings gave one and the
        // same refusal.
        const first = lines.find((line) => line.trim());
        const instead = bullets.stoppedAt
            ? `, the list ended at the line \`${bullets.stoppedAt.trim().slice(0, 60)}\``
            : first
              ? `, the first one is \`${first.trim().slice(0, 60)}\``
              : '';
        report(specFile, `the section \`${Array.isArray(heading) ? heading[0] : heading}\` carries no item at all${instead}`);

        return;
    }

    if (!exists(mapFile)) {
        report(specFile, `there is no file \`${mapFile.split('/').pop()}\` next to it — the statements have nothing to bind to`);

        return;
    }

    const rows = new Map();
    for (const line of rowsOfMap(specFile, mapFile, mapHeading)) {
        // A binding is written in two forms, and both are read. The table is the old one; the list
        // is the one for whose sake alignment spaces leave the companions: the formatter pads the
        // columns to a common width, and in the tree's companions that is 120 017 characters out
        // of 328 738, that is 37%. The link does not change with it: it goes by the text of the
        // statement, not by the shape of the line.
        const cells = line.match(/^\|([^|]+)\|([^|]*)\|\s*$/) ?? line.match(/^-\s+\*\*(.+?)\*\*\s+—\s+(.*)$/);
        if (!cells) {
            continue;
        }
        const head = cells[1].replace(/\s+/g, ' ').trim();
        // The table header: for a spec the column is called «Rule», for a law «Article»; a
        // companion written before the layer was translated names them in the owner's language.
        if (!head || ['Rule', 'Article', 'Правило', 'Статья'].includes(head) || /^-+$/.test(head)) {
            continue;
        }
        const cell = cells[2].trim();
        rows.set(head, {
            anchors: [...cells[2].matchAll(ANCHOR)],
            verdict: VERDICT.test(cell) && cell.length >= VERDICT_MIN,
            used: false,
        });
    }

    for (const bullet of bullets) {
        const head = ruleHeadOf(bullet.text);
        if (!head) {
            report(specFile, `a statement without a bold opening: «${bullet.text.replace(/^-\s+/, '').slice(0, 60)}…»`);
            continue;
        }
        const row = rows.get(head);
        if (!row) {
            report(
                mapFile,
                `a statement without a binding: «${head.slice(0, 60)}…» — add a line with \`file:symbol\`, ` +
                    'a verdict «Not carried out» with a reason, or move the statement into «Open questions» of the law as Q-<letter>-<number>'
            );
            continue;
        }
        row.used = true;
        if (!row.anchors.length && !row.verdict) {
            report(
                mapFile,
                `the statement «${head.slice(0, 60)}…» has an empty binding — put \`file:symbol\` ` +
                    'or the verdict «Not carried out», «Not applicable», «Not checked» with a reason'
            );
        }
        for (const [, path, symbol] of row.anchors) {
            if (!exists(path)) {
                report(mapFile, `the binding leads nowhere: there is no file \`${path}\``);
            } else if (!fileHasSymbol(path, symbol)) {
                report(mapFile, `the binding does not match: \`${path}\` carries no \`${symbol}\``);
            } else {
                traced.push({ mapFile, path, symbol });
            }
        }
    }

    // The reverse side: a row under which there is no rule any more is the trace of a rename.
    // Without this the binding piles up and starts describing promises that do not exist
    for (const [head, row] of rows) {
        if (!row.used) {
            report(mapFile, `a binding without an item: «${head.slice(0, 60)}…» — \`${specFile}\` carries no such item`);
        }
    }
}

// ── 5. Dead bindings ──────────────────────────────────────────────────────────

/**
 * Code without comments. A symbol named in an explanation is called by nobody, and dead code
 * usually has more explanations than live code does.
 */

const DECLARATION_MODIFIERS = '(?:export|declare|abstract|public|private|protected|static|readonly|override|async|accessor)';

/**
 * Whether the symbol is declared here. The check goes by declarations only: a binding to
 * someone else's field (`HttpStatus.SERVICE_UNAVAILABLE`), a dictionary key or the contents
 * of a string is lawful and by its nature is met exactly once.
 */
function fileDeclaresSymbol(code, symbol) {
    const escaped = escapeForRegExp(symbol);

    return (
        new RegExp(`\\b(?:const|let|var|function|class|interface|type|enum)\\s+${escaped}\\b`).test(code) ||
        new RegExp(`^\\s*(?:${DECLARATION_MODIFIERS}\\s+)*#?${escaped}\\s*[(<:=]`, 'm').test(code)
    );
}

/**
 * The files in which each symbol is met. A hyphen is taken into the token whole for the sake
 * of markup attributes, and the parts of such a token are added separately: otherwise
 * `resolving` inside `data-resolving` would stop being found.
 */
function symbolOwners() {
    const owners = new Map();
    const remember = (token, file) => {
        let files = owners.get(token);
        if (!files) {
            files = new Set();
            owners.set(token, files);
        }
        files.add(file);
    };

    for (const file of SOURCE_ROOTS.flatMap((root) => walk(root, (name) => name.endsWith('.ts') || name.endsWith('.html')))) {
        const text = file.endsWith('.ts') ? codeOf(read(file)) : read(file);
        // The hash is part of the token: a private class field is declared with it, and an anchor
        // on it would otherwise never land in the owners listing. The name without the hash is
        // remembered alongside the name itself — bindings of the old form stay green, and there is
        // no need to switch all at once.
        for (const [token] of text.matchAll(/#?[A-Za-z_][\w-]*/g)) {
            remember(token, file);
            if (token.startsWith('#')) {
                remember(token.slice(1), file);
            }
            if (token.includes('-')) {
                token.split('-').forEach((part) => part && remember(part, file));
            }
        }
    }

    return owners;
}

/**
 * The files a package publishes outward: everything a `public-api.ts` or an `index.ts` re-exports,
 * and everything those files re-export in turn. A symbol of a published file is called by whoever
 * installed the package, and that caller is not in this tree at all: judged by the calls visible
 * here, the whole public API of a kit reads as dead code.
 */
function publishedFiles() {
    const published = new Set();
    const entries = SOURCE_ROOTS.flatMap((root) => walk(root, (name) => name === 'public-api.ts' || name === 'index.ts'));
    const queue = [...entries];
    while (queue.length) {
        const file = queue.pop();
        const dir = file.slice(0, file.lastIndexOf('/'));
        for (const [, relative] of read(file).matchAll(/(?:export|import)[^'"]*from\s+['"](\.[^'"]*)['"]/g)) {
            for (const suffix of ['.ts', '/index.ts', '']) {
                const path = `${dir}/${relative.replace(/^\.\//, '')}${suffix}`.replace(/\/\.\//g, '/');
                if (exists(path) && !published.has(path)) {
                    published.add(path);
                    if (path.endsWith('/index.ts')) {
                        queue.push(path);
                    }
                    break;
                }
            }
        }
    }

    return published;
}

/**
 * A symbol declared in its own file and met nowhere else carries nothing out: a rule bound
 * to it describes an intention.
 */
function checkTracedAnchors() {
    const code = new Map();
    const codeAt = (path) => {
        if (!code.has(path)) {
            code.set(path, codeOf(read(path)));
        }

        return code.get(path);
    };

    const declared = traced.filter(({ path, symbol }) => path.endsWith('.ts') && fileDeclaresSymbol(codeAt(path), symbol));
    if (!declared.length) {
        return;
    }

    const owners = symbolOwners();
    const published = publishedFiles();
    for (const { mapFile, path, symbol } of declared) {
        // A word boundary is placed only where one exists: there is none before a hash, and a
        // pattern with it would give zero occurrences for every private name.
        const bound = symbol.startsWith('#')
            ? `${escapeForRegExp(symbol)}\\b`
            : `\\b${escapeForRegExp(symbol)}\\b`;
        const here = (codeAt(path).match(new RegExp(bound, 'g')) || []).length;
        // A test is not a call. A function written test-first and never called from the
        // application is an intention: the test calls it itself, and by that call a live symbol
        // cannot be told from a forgotten one. Counted together, the declaration and the test file
        // next to it made two — the threshold — and the audit went green exactly when the binding
        // lied hardest.
        // The exclusion works only for a symbol declared in the code of the application. A helper
        // declared in the suite harness itself is called by tests by its very purpose: judged by
        // the same measure, the articles of the testing rule would all turn red at once.
        const others = [...(owners.get(symbol) || [])].filter((file) => file !== path);
        const elsewhere = isTestFile(path) || published.has(path) ? others.length : others.filter((file) => !isTestFile(file)).length;
        if (here + elsewhere < 2) {
            report(
                mapFile,
                others.length > elsewhere
                    ? `the binding leads into code called by a test alone: \`${symbol}\` is declared in \`${path}\` and outside tests is met nowhere — ` +
                          'a test is not a call from the application; either the statement is carried out elsewhere, or its place is in «Open questions» of the law as Q-<letter>-<number>'
                    : `the binding leads into dead code: \`${symbol}\` is declared in \`${path}\` and met nowhere else — ` +
                          'either the statement is carried out elsewhere, or its place is in «Open questions» of the law as Q-<letter>-<number>'
            );
        }
    }
}

// ── 1a. The laws a spec applies ───────────────────────────────────────────────

/**
 * The link "law — rule" and "rule — pattern" is audited both ways, while a spec so far spoke
 * only of its domain. Yet it applied a law: links to `docs/constitution/…` lay inside the
 * dependencies line and in the middle of the text, and from a law there was no way to learn
 * which domains stand on it — only by grep.
 *
 * Hence the `**Законы:**` line in the header and an audit of both sides: a law named in the
 * text but not declared, and a declared law that does not exist.
 */
const SPEC_LAWS = /^\*\*(?:Laws|Законы):\*\*\s*(.+)$/;
/**
 * A link to a law anywhere in the spec text — by it the second side of the link is counted.
 * The layer in the path is optional: application laws lie in `application/` and are named
 * the same way.
 */
const LAW_REFERENCE = new RegExp(`\`${CONSTITUTION_DIR}/(?:application/)?([a-z-]+)\\.md\``, 'g');

function checkSpecLaws(file, text, laws) {
    const line = text.split('\n').find((candidate) => SPEC_LAWS.test(candidate));
    if (!line) {
        report(file, 'the header carries no line `**Laws:**` — there is no seeing which laws the domain applies');

        return;
    }

    const declared = new Set([...line.match(SPEC_LAWS)[1].matchAll(BACKTICKED)].map(([, name]) => name));
    for (const name of declared) {
        if (!laws.has(name)) {
            report(file, `the line \`**Laws:**\` names \`${name}\`, and there is no law of that name in any layer`);
        }
    }

    for (const [, name] of text.matchAll(LAW_REFERENCE)) {
        if (!declared.has(name)) {
            report(file, `the law \`${name}\` is named in the text and is not declared in the line \`**Laws:**\``);
        }
    }
}

export { checkRuleImplementation, checkSpecLaws, checkTracedAnchors };
