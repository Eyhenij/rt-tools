#!/usr/bin/env node
/**
 * Builds the graph of concepts and rules of the rules package: every resource of the package and
 * every word of its glossary is a node, and a link is what one text says of another.
 *
 * graphify reads these texts as headings and joins each heading to its own file only: not one link
 * runs between two texts. The links live elsewhere — in the front matter (`law:`, `rule:`), in the
 * `Requires` line of a rule, in the bindings of the companions of this tree, in a resource name
 * written in backticks and in a glossary word met in the text. This command reads exactly those.
 *
 * The graph keeps the graphify shape, so `graphify explain`, `affected` and `path` read it with
 * `--graph`. The report next to it lists what the revision of a law family starts from.
 *
 * Usage: `npm run graph:rules`. The paths are named for the scenarios:
 * `--assets <dir> --companions <dir> --out <dir>`.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { writeReport } from './rules-graph-report.mjs';

const ROOT = process.cwd();
const options = Object.fromEntries(
    process.argv.slice(2).flatMap((arg, index, all) => (arg.startsWith('--') ? [[arg.slice(2), all[index + 1]]] : []))
);
const ASSETS = options.assets ?? 'projects/agent-kit/assets';
const COMPANIONS = options.companions ?? '.claude/skills';
const SPECS = options.specs ?? 'docs/specs/agent-kit';
const OUT = options.out ?? 'projects/agent-kit/rules-graph';

/** The kinds of resources, in the order the report lists them. */
const KINDS = [
    { dir: 'laws', kind: 'law', ext: '.md' },
    { dir: 'rules', kind: 'rule', ext: '.md' },
    { dir: 'patterns', kind: 'pattern', ext: '.md' },
    { dir: 'pitfalls', kind: 'pitfalls', ext: '.md' },
    { dir: 'skills', kind: 'skill', ext: '.md' },
    { dir: 'agents', kind: 'role', ext: '.md' },
    { dir: 'commands', kind: 'command', ext: '.md' },
    { dir: 'workflows', kind: 'pipeline', ext: '.js' },
    { dir: 'hooks', kind: 'hook', ext: '.sh' },
    { dir: 'checks', kind: 'check', ext: '.mjs' },
];

const slug = (text) =>
    text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, '_')
        .replace(/^_+|_+$/g, '');

/** The front matter between the first two `---` lines; the prose below is not read for keys. */
function frontMatter(text) {
    const match = /^---\n([\s\S]*?)\n---/.exec(text);
    if (!match) {
        return {};
    }
    return Object.fromEntries(
        match[1]
            .split('\n')
            .map((line) => /^([a-z]+):\s*(.*)$/.exec(line))
            .filter(Boolean)
            .map((found) => [found[1], found[2].trim()])
    );
}

/**
 * Every resource file. A variant of one resource — `git-workflow.github.md`, `mockups.needs-mockups.md`
 * — is the same node: the layout puts one of them into a tree under one name.
 */
function collectResources() {
    const nodes = new Map();
    const texts = [];
    KINDS.forEach(({ dir, kind, ext }, community) => {
        const path = join(ASSETS, dir);
        if (!existsSync(join(ROOT, path))) {
            return;
        }
        for (const file of readdirSync(join(ROOT, path)).sort()) {
            if (!file.endsWith(ext) || !statSync(join(ROOT, path, file)).isFile()) {
                continue;
            }
            const text = readFileSync(join(ROOT, path, file), 'utf8');
            // Only a host variant or a trait comes off: `rt-kit-checks.config.mjs` keeps its middle.
            const stem = file.slice(0, -ext.length).replace(/\.(github|gitlab|azure|needs-[a-z-]+)$/, '');
            const name = kind === 'hook' || kind === 'check' || kind === 'pipeline' ? `${stem}${ext}` : frontMatter(text).name || stem;
            const label = kind === 'pitfalls' ? `${name} pitfalls` : name;
            const id = `${kind}_${slug(name)}`;
            if (!nodes.has(id)) {
                nodes.set(id, {
                    label,
                    file_type: ext === '.md' ? 'document' : 'code',
                    source_file: join(path, file),
                    source_location: 'L1',
                    id,
                    community,
                    norm_label: label.toLowerCase(),
                    kind,
                    name,
                });
            }
            texts.push({ id, kind, name, file: join(path, file), text });
        }
    });
    return { nodes, texts };
}

/**
 * The specs of the package: a node for every directory that holds a `spec.md`, read with the files
 * next to it. A hook is wired by its own header, not by a text, so the spec is where it is described.
 */
function collectSpecs(nodes, texts, community) {
    const walk = (dir) => {
        const entries = readdirSync(join(ROOT, dir), { withFileTypes: true });
        if (entries.some((entry) => entry.name === 'spec.md')) {
            const name = relative(SPECS, dir) || '.';
            const id = `spec_${slug(name) || 'root'}`;
            nodes.set(id, {
                label: `${name} spec`,
                file_type: 'document',
                source_file: join(dir, 'spec.md'),
                source_location: 'L1',
                id,
                community,
                norm_label: `${name} spec`,
                kind: 'spec',
                name,
            });
            entries
                .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
                .forEach((entry) =>
                    texts.push({
                        id,
                        kind: 'spec',
                        name,
                        file: join(dir, entry.name),
                        text: readFileSync(join(ROOT, dir, entry.name), 'utf8'),
                    })
                );
        }
        entries.filter((entry) => entry.isDirectory()).forEach((entry) => walk(join(dir, entry.name)));
    };
    if (existsSync(join(ROOT, SPECS))) {
        walk(SPECS);
    }
}

/**
 * The glossary words: a line `- **Word** — meaning` of the package glossary. The section of words
 * not written here is a list of bans, not of meanings, and is not read.
 */
function collectTerms(community) {
    const path = join(ASSETS, 'docs', 'GLOSSARY.md');
    if (!existsSync(join(ROOT, path))) {
        return [];
    }
    return readFileSync(join(ROOT, path), 'utf8')
        .split(/^## Not written here$/m)[0]
        .split('\n')
        .map((line, index) => ({ found: /^- \*\*([^*]+)\*\* — /.exec(line), index }))
        .filter(({ found }) => found)
        .map(({ found, index }) => ({
            label: found[1],
            file_type: 'document',
            source_file: path,
            source_location: `L${index + 1}`,
            id: `term_${slug(found[1])}`,
            community,
            norm_label: found[1].toLowerCase(),
            kind: 'term',
            name: found[1],
        }));
}

/**
 * What a token in backticks may name. A hook and a check are named by their file in any of the
 * three places it lives: the package, the laid-out tree, a path with a symbol after a colon.
 */
function nameIndex(nodes) {
    const index = new Map();
    const add = (key, id) => index.set(key, [...(index.get(key) ?? []), id]);
    for (const node of nodes.values()) {
        add(node.name, node.id);
    }
    return (token) => {
        const bare = token.replace(/:[\w$.-]*$/, '').replace(/[.,;]+$/, '');
        const file = bare.slice(bare.lastIndexOf('/') + 1);
        return [...new Set([...(index.get(bare) ?? []), ...(bare.includes('/') ? (index.get(file) ?? []) : [])])];
    };
}

const backticked = (text) => [...text.matchAll(/`([^`\n]+)`/g)].map((found) => found[1].trim());

/** A word is looked for without its gloss in brackets: «issue (of a task)» is said as «issue». */
function termPattern(term) {
    const escaped = term
        .replace(/\s*\(.*\)\s*$/, '')
        .toLowerCase()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(e?s)?([^\\p{L}\\p{N}]|$)`, 'iu');
}

function collectLinks(nodes, texts, terms) {
    const links = new Map();
    const lookup = nameIndex(nodes);
    const link = (source, target, relation, file) => {
        if (source === target || !nodes.has(target)) {
            return;
        }
        const key = `${source} ${target} ${relation}`;
        if (!links.has(key)) {
            links.set(key, {
                relation,
                confidence: 'EXTRACTED',
                source_file: file,
                source_location: 'L1',
                weight: 1,
                source,
                target,
                confidence_score: 1,
            });
        }
    };
    const termPatterns = terms.map((term) => ({ id: term.id, pattern: termPattern(term.name) }));

    for (const { id, kind, name, file, text } of texts) {
        const head = frontMatter(text);
        if (head.law) {
            link(id, `law_${slug(head.law)}`, 'applies_law', file);
        }
        if (head.rule) {
            link(id, `rule_${slug(head.rule)}`, 'pattern_of', file);
        }
        if (kind === 'pitfalls') {
            link(id, `rule_${slug(name)}`, 'pitfalls_of', file);
        }
        const requires = /^\*\*Requires:\*\*([\s\S]*?)(\n\n|$)/m.exec(text);
        for (const token of requires ? backticked(requires[1]) : []) {
            lookup(token).forEach((target) => link(id, target, 'requires', file));
        }
        for (const token of backticked(text)) {
            lookup(token).forEach((target) => link(id, target, 'mentions', file));
        }
        for (const { id: term, pattern } of termPatterns) {
            if (pattern.test(text)) {
                link(id, term, 'uses_term', file);
            }
        }
    }

    // The executor of an article is named by the companion of the rule in this tree: the package
    // rule knows no paths, so this is the only place its hooks and checks are written down.
    for (const node of nodes.values()) {
        const companion = join(COMPANIONS, node.name, 'implementation.md');
        if (node.kind !== 'rule' || !existsSync(join(ROOT, companion))) {
            continue;
        }
        for (const token of backticked(readFileSync(join(ROOT, companion), 'utf8'))) {
            lookup(token)
                .filter((target) => /^(hook|check)_/.test(target))
                .forEach((target) => link(node.id, target, 'executed_by', companion));
        }
    }
    return [...links.values()];
}

/**
 * The bold lead of every list item of a package text: the statements the report compares. A spec
 * is left out — its bindings quote the articles of a rule word for word on purpose.
 */
function collectStatements(texts) {
    return texts.flatMap(({ id, kind, file, text }) =>
        kind !== 'spec' && file.endsWith('.md')
            ? [...text.matchAll(/^\s*- \*\*([^*\n]{20,}?)\*\*/gm)].map((found) => ({ id, file, statement: found[1] }))
            : []
    );
}

const { nodes, texts } = collectResources();
collectSpecs(nodes, texts, KINDS.length);
const terms = collectTerms(KINDS.length + 1);
terms.forEach((term) => nodes.set(term.id, term));
const links = collectLinks(nodes, texts, terms);
const head = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).stdout.trim();

const graph = {
    directed: true,
    multigraph: false,
    graph: {},
    nodes: [...nodes.values()].sort((a, b) => a.id.localeCompare(b.id)),
    links: links.sort((a, b) => `${a.source} ${a.target} ${a.relation}`.localeCompare(`${b.source} ${b.target} ${b.relation}`)),
    hyperedges: [],
    built_at_commit: head,
};

mkdirSync(join(ROOT, OUT), { recursive: true });
writeFileSync(join(ROOT, OUT, 'graph.json'), `${JSON.stringify(graph, null, 2)}\n`);
const counts = writeReport(graph, collectStatements(texts), join(ROOT, OUT, 'REPORT.md'), relative(ROOT, join(ROOT, OUT)));
console.log(`rules-graph: ${graph.nodes.length} nodes, ${graph.links.length} links; ${counts}`);
