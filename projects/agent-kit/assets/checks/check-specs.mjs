#!/usr/bin/env node
/**
 * The check that a domain spec has not diverged from the code.
 *
 * The first edition audited only the scenario identifiers against test titles. A swarm review
 * found eleven divergences from the code in a spec one day old, and the check was green on all
 * of them: a matching identifier says neither that a rule is carried out somewhere nor that the
 * test checks what was promised. Hence the five mechanisms below — each audits a text against a
 * fact, not against another text.
 *
 * 1. THE BINDING OF A RULE TO CODE. Lives in `implementation.md` next to the spec: the table
 *    "rule → `file:symbol`". Audited both ways — a rule without a line and a line without a
 *    rule — and it requires the file to be there and the symbol to occur in it. A rule wider
 *    than its binding cannot be written this way: "the ceiling of the sum at the intake of a
 *    request" would not have passed, because the symbol lives in the procedure of the owner's
 *    decision, and four discount mechanics that were never started would have found no binding
 *    at all. The key of the link is the text of the rule itself, so it cannot be reworded while
 *    the binding is left unfixed. A rule without a binding is an intention, and it is written as
 *    an open question of a law — `Q-<law letter>-<number>`.
 *
 * 2. THE CONTRACT AGAINST THE DECORATORS. The table of procedures is audited against what is
 *    declared in the domain's `*.procedure.ts`: `@RequiresPermission` / `@PublicProcedure` and
 *    the method descriptor. Both ways — otherwise a procedure the domain serves but forgot to
 *    describe stays visible only in the decorator.
 *
 * 3. A REFUSAL CODE WITH A THROW SITE. A code is accepted only if `Code.X` is really thrown
 *    somewhere in the libs of the domain. The codes were written out by the plan, and on one
 *    path the promised `NotFound` was thrown by nobody.
 *
 * 4. THE LEVEL OF A BINDING. A scenario whose test goes a way other than the user's, or checks
 *    part of what was promised, is marked `Покрытие: частичное` and goes into the debts, not
 *    into the coverage. Otherwise a green digest means less than it seems.
 *
 * 5. A DEAD BINDING. The presence of a symbol is not enough: a symbol declared and called by
 *    nobody passed the check straight through. That is how five rules about editing a record
 *    turned out to be bound to a mechanism of the shared aside base that no screen calls. A
 *    symbol declared in a file and occurring nowhere else does not count as the place where a
 *    rule is carried out.
 *
 * Each mechanism lives in a module of its own alongside: bindings and laws — `spec-anchors.mjs`,
 * the contract and the refusal codes — `spec-contract.mjs`, scenarios and coverage —
 * `spec-scenarios.mjs`, the common reading of the tree — `spec-common.mjs`. What is left here is
 * the run: it walks the domains and puts what it found into one list.
 *
 * A non-zero return code and a list of divergences.
 */
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { ROOT } from './rt-kit-checks.config.mjs';
import { checkRuleImplementation, checkSpecLaws, checkTracedAnchors } from './spec-anchors.mjs';
import { CONSTITUTION_DIR, REQUIRED_HEADINGS, SPECS_DIR, collectDomains, exists, problems, read, report, walk } from './spec-common.mjs';
import { checkContract, checkRefusalCodes, procedureRootsOf } from './spec-contract.mjs';
import { proposedGroups, staleProposed } from './spec-proposed.mjs';
import { collectReferences, parseScenarios, promisesScreen } from './spec-scenarios.mjs';

// ── run ───────────────────────────────────────────────────────────────────────

function checkSpecHeadings(file, text) {
    const headings = new Set(
        text
            .split('\n')
            .filter((line) => /^#{1,6}\s/.test(line))
            .map((line) => line.trimEnd())
    );

    REQUIRED_HEADINGS.filter((required) => !headings.has(required)).forEach((required) =>
        report(file, `no mandatory section \`${required}\``)
    );
}

const domains = collectDomains();
const scenarios = [];
const byId = new Map();

/**
 * The names of the laws and the path to each. There are two layers: the common one lies at the
 * root of `docs/constitution/`, the application laws in `application/` under it. The name is taken
 * without the directory, because a law is named the same everywhere: neither `law:` in a rule's
 * front matter nor `**Законы:**` in a spec knows which layer it is in, and a move between layers
 * rewrites none of those lines.
 *
 * Hence the requirement: law names are unique across the whole constitution tree. Two files with
 * one name in different layers would be named by the same `law:` line, and the rule would go to
 * whichever of them was walked first.
 */
const laws = new Map();
for (const file of walk(CONSTITUTION_DIR, (name) => name.endsWith('.md'))) {
    const name = file.slice(file.lastIndexOf('/') + 1, -'.md'.length);
    if (laws.has(name)) {
        report(file, `a law of that name already exists — \`${laws.get(name)}\`; law names are unique across both layers`);
        continue;
    }
    laws.set(name, file);
}

/**
 * The directories that describe a subject: the domain itself and its subdomains. A subdomain is
 * started when a domain has grown so large that reading it whole for one detail costs more than
 * finding that detail; it is arranged the same way — three files and a scenario prefix of its own.
 *
 * `proposed/` is not a subject: it is a product agreement written before the code, and its
 * scenarios live in the numbering of the spec it will merge into.
 */
function collectSpecDirs(base) {
    const found = [base];
    let entries;
    try {
        entries = readdirSync(join(ROOT, base), { withFileTypes: true });
    } catch {
        return found;
    }

    for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== 'proposed') {
            found.push(...collectSpecDirs(`${base}/${entry.name}`));
        }
    }

    return found;
}

/** A scenario prefix belongs to one spec across the whole tree. */
const prefixOwners = new Map();

for (const domain of domains) {
    const base = `${SPECS_DIR}/${domain}`;
    for (const dir of collectSpecDirs(base)) {
        // A spec that has only `proposed/` does not exist yet: it itself is absent until the
        // feature is rolled out
        if (exists(`${dir}/proposed`) && !exists(`${dir}/spec.md`)) {
            continue;
        }
        const what = dir === base ? 'the domain' : 'the subdomain';
        ['spec.md', 'scenarios.md']
            .filter((name) => !exists(`${dir}/${name}`))
            .forEach((name) => report(dir, `no file \`${name}\` — ${what} is described by half`));
    }

    // Feature specs from `proposed/` are checked on a par with the domain spec: they are the
    // product agreement the code is written by, not a draft. The three audits against the code
    // do not apply to them — there is no code yet to audit against
    for (const specFile of walk(base, (name) => name === 'spec.md')) {
        const text = read(specFile);
        checkSpecHeadings(specFile, text);
        // A spec declares its laws in `proposed/` as well: the product agreement exists before the code
        checkSpecLaws(specFile, text, laws);
        if (specFile.includes('/proposed/')) {
            continue;
        }
        checkRuleImplementation(specFile, text, `${dirname(specFile)}/implementation.md`);
        const roots = procedureRootsOf(text);
        checkContract(specFile, text, roots);
        checkRefusalCodes(specFile, text, roots);
    }

    const found = walk(base, (name) => name === 'scenarios.md').flatMap(parseScenarios);

    // The prefix belongs to the domain together with its subdomains, not to a separate directory.
    // A domain is split when its spec has outgrown the length limit, and the scenarios move into
    // the subdomains unchanged: the number is the only thing binding a scenario to a test title,
    // and a numbering of its own for each subdomain would mean recounting every number at once.
    // Two prefixes in one spec still mean the subject is described twice.
    const prefixesOf = new Map();
    for (const scenario of found) {
        const dir = dirname(scenario.file);
        if (!prefixesOf.has(dir)) {
            prefixesOf.set(dir, new Set());
        }
        prefixesOf.get(dir).add(scenario.prefix);
    }

    for (const [dir, prefixes] of prefixesOf) {
        if (prefixes.size > 1) {
            report(dir, `the spec carries more than one scenario prefix: ${[...prefixes].sort().join(', ')}`);
        }
        // A product agreement is numbered together with the spec it will merge into: the
        // identifiers survive the move, and the prefix does not become taken because of it
        if (dir.includes('/proposed/')) {
            continue;
        }
        for (const prefix of prefixes) {
            const owner = prefixOwners.get(prefix);
            if (owner && owner !== base) {
                report(dir, `the prefix \`SC-${prefix}\` is already taken — \`${owner}\`; by the number there is no seeing whose scenario it is`);
                continue;
            }
            prefixOwners.set(prefix, base);
        }
    }

    scenarios.push(...found);
}

// A law knows nothing about the project: no paths, no file names, no bindings. It only declares
// articles, and everything else is the business of the rules that refer to it. So a law has no
// sidecar with bindings and cannot have one: a file with `libs/...` paths lying next to a law
// would bind the law to this project.
//
// "Open questions" is taken out from here: the check saw the heading and not the questions under
// it, and an empty section passed it just as a filled one did. A law with everything settled wrote
// that line for the sake of the line.
//
// The section has two names: an English one in a package law, a Russian one in a law the tree
// wrote before the layer was translated. Both mean one thing, and the check accepts either.
const LAW_HEADINGS = [['## Articles', '## Статьи']];

for (const file of walk(CONSTITUTION_DIR, (name) => name.endsWith('.md'))) {
    const text = read(file);
    const lines = text.split('\n').map((line) => line.trimEnd());
    LAW_HEADINGS.filter((names) => !names.some((heading) => lines.includes(heading))).forEach((names) =>
        report(file, `no section \`${names[0]}\` (or \`${names[1]}\`)`)
    );
    if (/`[\w./-]+\.(ts|mjs|js|sh|scss|html|json|proto|conf|yml|md)[:`]/.test(text)) {
        report(file, 'the law names a project file — paths and bindings belong in a rule, not here');
    }
}

// A rule is a skill with `kind: rule` in its front matter. It is the one that knows about the
// project: names, paths, links. The binding of its statements to the code lives in
// `implementation.md` next to the skill.
// The section has two names: an English one in a package rule, a Russian one in a rule the tree
// wrote before the layer was translated. The one that stands in the file is taken.
const RULE_HEADINGS = ['## How the law applies here', '## Как закон применяется здесь'];
const ruleHeadingOf = (text) => RULE_HEADINGS.find((heading) => text.split('\n').some((line) => line.trimEnd() === heading)) ?? RULE_HEADINGS[0];
/**
 * The companion section of a rule where the bindings lie; its other tables name the tree's names.
 * It has two names, like the rule heading above: the one that stands in the file is taken.
 */
const MAP_HEADINGS = ['## Where the articles are carried out', '## Где исполняются статьи'];
const mapHeadingOf = (text) =>
    MAP_HEADINGS.find((heading) => text.split('\n').some((line) => line.trimEnd() === heading)) ?? MAP_HEADINGS[0];

/**
 * The front matter of a skill — the first block between `---`. Only it is read: the pattern that
 * teaches how to start a rule shows a rule's front matter as an example in a fence, and a search
 * over the whole text would take that example for a real declaration.
 */
function frontMatterOf(text) {
    const found = text.match(/^---\n([\s\S]*?)\n---/);

    return found ? found[1] : '';
}

/** The rules and patterns found in the skills tree: both sides of the link are counted by them. */
const ruled = new Set();
const patterned = new Set();
const nameOf = (head) => (head.match(/^name:\s*(\S+)/m) || [])[1] || '';

for (const file of walk('.claude/skills', (name) => name === 'SKILL.md')) {
    const text = read(file);
    const head = frontMatterOf(text);
    const kind = (head.match(/^kind:\s*(\S+)/m) || [])[1];

    if (kind === 'pattern') {
        const rule = (head.match(/^rule:\s*(\S+)/m) || [])[1];
        if (!rule) {
            report(file, 'the pattern declared no rule — add `rule:` to the header');
        } else if (!exists(`.claude/skills/${rule}/SKILL.md`)) {
            report(file, `the pattern declared the rule \`${rule}\`, and there is no rule of that name`);
        } else {
            patterned.add(rule);
        }
        continue;
    }

    if (kind !== 'rule') {
        continue;
    }

    const law = (head.match(/^law:\s*(\S+)/m) || [])[1];
    if (!law) {
        report(file, 'the rule declared no law — add `law:` to the header');
    } else if (!laws.has(law)) {
        report(file, `the rule declared the law \`${law}\`, and there is no law of that name in any layer`);
    } else {
        ruled.add(law);
    }
    const mapFile = `${dirname(file)}/implementation.md`;

    checkRuleImplementation(file, text, mapFile, ruleHeadingOf(text), mapHeadingOf(read(mapFile)));

    const name = nameOf(head);
    if (name && name !== file.slice('.claude/skills/'.length, -'/SKILL.md'.length)) {
        report(file, `the name in the header (\`${name}\`) does not match the directory of the rule`);
    }
}

// A proposed law requires no rule: the agreement is written before the code, there is nothing to
// bind it to, and requiring a rule would force starting one with anchors into places that do not
// exist. The sign stands as a status line in the law itself, not as a list of exceptions next to
// the check.
const isProposedLaw = (file) => /^\*\*Статус:\*\*\s*предложен/m.test(read(file));

// The reverse sides of the link. A law without a rule reads as an agreement this project does not
// apply; a rule without a pattern leaves ready-made code where it does not belong — in the rule
// itself, which is read at every edit.
[...laws]
    .filter(([law, file]) => !ruled.has(law) && !isProposedLaw(file))
    .forEach(([, file]) => report(file, 'the law has no rule at all — create one with `law:` pointing at it'));

/**
 * The names of the patterns the tree skipped at layout: the `skip` key in the project settings.
 *
 * A skip is the tree's choice, not forgotten work: the rule about backend procedures is laid out
 * into a tree that has no backend at all. Requiring a pattern there means requiring a file with
 * nothing to say — and the only way to go green becomes lifting the skip.
 */
const skippedPatterns = () => {
    const path = '.claude/rt-kit.json';
    if (!exists(path)) {
        return new Set();
    }
    try {
        const skip = JSON.parse(read(path)).skip ?? [];

        return new Set(skip.map((resource) => resource.match(/^patterns\/(.+)\.md$/)?.[1]).filter(Boolean));
    } catch {
        return new Set();
    }
};

/**
 * The "Patterns" section of the rule itself is the only place where the link is visible without a
 * pattern file: a skipped file is not in the tree, and there is nobody to ask for the `rule:`
 * field in it.
 */
// The `m` flag is deliberately absent here: with it `$` means the end of a line, and the section
// ends at the very first newline — empty. So the start of the heading is found by a pair of its
// own, not by an anchor.
const PATTERNS_HEADING = /(?:^|\n)## (?:Patterns|Паттерны)\n([\s\S]*?)(?=\n## |$)/;
const patternsNamedBy = (text) => [...(text.match(PATTERNS_HEADING)?.[1] ?? '').matchAll(/^-\s+`([\w-]+)`/gm)].map(([, found]) => found);

const skipped = skippedPatterns();

for (const file of walk('.claude/skills', (name) => name === 'SKILL.md')) {
    const text = read(file);
    const head = frontMatterOf(text);
    const name = nameOf(head);
    if (!/^kind:\s*rule\s*$/m.test(head) || !name || patterned.has(name)) {
        continue;
    }

    const named = patternsNamedBy(text);
    if (named.length > 0 && named.every((pattern) => skipped.has(pattern))) {
        continue;
    }

    report(file, 'the rule has no pattern at all — create one with `rule:` pointing at it');
}

checkTracedAnchors();

for (const scenario of scenarios) {
    const seen = byId.get(scenario.id);
    if (seen) {
        report(`${scenario.file}:${scenario.line}`, `the identifier ${scenario.id} is already taken (${seen.file}:${seen.line})`);
        continue;
    }
    byId.set(scenario.id, scenario);
}

const references = collectReferences();
const uncovered = [];
const partial = [];
let covered = 0;

for (const scenario of byId.values()) {
    const places = references.get(scenario.id) ?? [];
    const hasTest = places.length > 0;
    if (scenario.uncovered && hasTest) {
        report(`${scenario.file}:${scenario.line}`, `${scenario.id} is marked «Не покрыто», and there is a test for it (${places[0].place})`);
        continue;
    }
    if (scenario.uncovered) {
        uncovered.push(scenario);
        continue;
    }
    if (!hasTest) {
        report(`${scenario.file}:${scenario.line}`, `${scenario.id} is mentioned in no test and is not marked «Не покрыто»`);
        continue;
    }
    if (scenario.partial) {
        partial.push(scenario);
        continue;
    }
    // A promise given to the user is closed by a test that goes the user's way. A unit test checks
    // the same computation past the screen: it is right and it is not coverage of the scenario
    if (promisesScreen(scenario.promise, scenario.body) && !places.some(({ screen, off }) => screen && !off)) {
        const off = places.some(({ screen }) => screen);
        report(
            `${scenario.file}:${scenario.line}`,
            `${scenario.id} promises what a person sees, and ${off ? 'the end-to-end test for it is switched off by an environment variable' : 'only a unit test checks it'} ` +
                `(${places[0].place}) — either the test goes the path of the user, or the scenario needs the mark «Покрытие: частичное»`
        );
        continue;
    }
    covered += 1;
}

for (const [id, places] of references) {
    if (!byId.has(id)) {
        report(places[0].place, `the test refers to ${id}, and \`${SPECS_DIR}\` carries no such scenario`);
    }
}

if (problems.length > 0) {
    console.error(`check-specs: divergences ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    console.error('\nThe rules of working with specs are `spec-driven`.');
    process.exit(1);
}

console.log(
    `check-specs: domains ${domains.length}, scenarios ${byId.size} — ` +
        `covered ${covered}, partial ${partial.length}, without tests ${uncovered.length}`
);

const debts = [...partial, ...uncovered];
if (debts.length > 0) {
    console.log('\nDebts — the coverage is not complete:');
    partial.forEach((scenario) => console.log(`  partial   ${scenario.id} — ${scenario.title} (${scenario.file}:${scenario.line})`));
    uncovered.forEach((scenario) => console.log(`  no test   ${scenario.id} — ${scenario.title} (${scenario.file}:${scenario.line})`));
}

const proposed = proposedGroups(byId.values(), references);

const ripe = [...proposed].filter(([, group]) => group.total > 0 && group.total === group.ready);
if (ripe.length > 0) {
    console.log('\nTime to merge — the scenarios are closed by tests, the agreement awaits the move into the domain spec:');
    ripe.forEach(([dir, group]) => console.log(`  ${dir} — scenarios ${group.total}`));
}

const stale = staleProposed([...proposed.keys()]);
if (stale.length > 0) {
    console.log('\nWaiting longer than a month — the binding in the agreement ages together with the code it points at:');
    stale.forEach((record) => console.log(`  ${record.dir} — ${Math.floor(record.ageDays)} days without edits`));
}
