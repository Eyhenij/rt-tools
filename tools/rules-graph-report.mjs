/**
 * The report of the graph of concepts and rules: the four lists a revision of a law family starts
 * from. Each list is debt for the revision to sort out, not a refusal: an entry can be lawful, and
 * the revision says which.
 *
 * - What nothing links to: no other text names the resource, so a reader never reaches it.
 * - A rule nothing executes: no `Requires` line and no binding to a hook or a check — the rule is
 *   held by memory alone.
 * - A glossary word used nowhere: a meaning given to a word no text says.
 * - Two texts that state the same thing: their bold statements share most of their words. One of
 *   them goes stale the day the other is edited.
 */
import { writeFileSync } from 'node:fs';

/** Two statements count as one when this share of their words is common to both. */
const SAME_STATEMENT = 0.6;
/** A shorter statement shares its words by chance: «the guard refuses the edit». */
const MIN_WORDS = 6;

function words(statement) {
    return new Set(statement.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? []);
}

function overlap(a, b) {
    let common = 0;
    for (const word of a) {
        if (b.has(word)) {
            common += 1;
        }
    }
    return common / (a.size + b.size - common);
}

/** Pairs of resources whose statements repeat each other, the most repeated first. */
export function samePairs(statements) {
    const prepared = statements.map((item) => ({ ...item, words: words(item.statement) })).filter((item) => item.words.size >= MIN_WORDS);
    const pairs = new Map();
    for (let i = 0; i < prepared.length; i += 1) {
        for (let j = i + 1; j < prepared.length; j += 1) {
            const a = prepared[i];
            const b = prepared[j];
            if (a.id === b.id || overlap(a.words, b.words) < SAME_STATEMENT) {
                continue;
            }
            const [first, second] = a.file < b.file ? [a, b] : [b, a];
            const key = `${first.file} ${second.file}`;
            const pair = pairs.get(key) ?? {
                first: first.file,
                second: second.file,
                count: 0,
                sample: [first.statement, second.statement],
            };
            pair.count += 1;
            pairs.set(key, pair);
        }
    }
    return [...pairs.values()].sort((a, b) => b.count - a.count || a.first.localeCompare(b.first));
}

export function analyse(graph) {
    const incoming = new Set(graph.links.filter((link) => link.source !== link.target).map((link) => link.target));
    const executed = new Set(
        graph.links.filter((link) => link.relation === 'requires' || link.relation === 'executed_by').map((link) => link.source)
    );
    // A spec is where a reader enters, not where a link leads: it is not listed as unlinked.
    const resources = graph.nodes.filter((node) => node.kind !== 'term' && node.kind !== 'spec');
    return {
        orphans: resources.filter((node) => !incoming.has(node.id)),
        unexecuted: resources.filter((node) => node.kind === 'rule' && !executed.has(node.id)),
        unused: graph.nodes.filter((node) => node.kind === 'term' && !incoming.has(node.id)),
    };
}

const names = (nodes) => nodes.map((node) => node.name).join(', ');

function byKind(nodes) {
    const kinds = [...new Set(nodes.map((node) => node.kind))];
    return kinds.map((kind) => `- **${kind}:** ${names(nodes.filter((node) => node.kind === kind))}`);
}

export function writeReport(graph, statements, path, outDir) {
    const { orphans, unexecuted, unused } = analyse(graph);
    const pairs = samePairs(statements);
    const lines = [
        '# Report of the rules graph',
        '',
        `Built by \`npm run graph:rules\` from \`${graph.built_at_commit.slice(0, 9)}\`: ${graph.nodes.length} nodes, ${graph.links.length} links.`,
        `The graph is \`${outDir}/graph.json\`; graphify reads it with \`--graph\`. Every list below is`,
        'debt for the revision of a law family to sort out, not a refusal.',
        '',
        `## Resources nothing links to — ${orphans.length}`,
        '',
        'No other text names them in its header, its `Requires` line, a binding or in backticks.',
        '',
        ...byKind(orphans),
        '',
        `## Rules nothing executes — ${unexecuted.length}`,
        '',
        'No `Requires` line and no binding of the companion to a hook or a check.',
        '',
        `- ${names(unexecuted) || 'none'}`,
        '',
        `## Glossary words used nowhere — ${unused.length}`,
        '',
        `- ${names(unused) || 'none'}`,
        '',
        `## Texts that state the same thing — ${pairs.length}`,
        '',
        `Pairs of texts whose bold statements share at least ${SAME_STATEMENT * 100}% of their words, with the`,
        'number of such statements and the first of them.',
        '',
        ...pairs.map((pair) => `- \`${pair.first}\` and \`${pair.second}\` — ${pair.count}: «${pair.sample[0]}» / «${pair.sample[1]}»`),
        '',
    ];
    writeFileSync(path, lines.join('\n'));
    return `${orphans.length} unlinked, ${unexecuted.length} unexecuted rules, ${unused.length} unused words, ${pairs.length} pairs`;
}
