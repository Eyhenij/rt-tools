#!/usr/bin/env node
// The machine check of the meaning of a shortened rule: nothing of the former text is lost.
//
//   node docs/tasks/RT-3326-rule-gate-gives-rule/meaning.mjs <rule>
//
// The former text is the laid-out SKILL.md of the rule on the epic branch. Every statement of
// «How the law applies here» stands in the new hot part, or in the progress of this task (the pair
// «было → стало»). Every other piece of the former text — a paragraph, a code block, a table, and
// the argument of an article after its statement — stands in the new hot part or in the cold part,
// whitespace aside. A split rule is read as all of its parts: every `<rule>*/SKILL.md` that
// declares `kind: rule`, and the `pitfalls.md` and `pitfalls-2.md` next to each.
//
// Prints the number of the missing pieces, and each of them on the error stream. Exit 0 when
// nothing is missing, 1 when something is, 2 when the check cannot run.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '../../..');
const SKILLS = join(ROOT, '.claude/skills');
const EPIC = process.env.RT_MEANING_BASE ?? 'origin/RT-3302-checks-rework-3';

const rule = process.argv[2];
if (!rule) {
    console.error('meaning: name a rule');
    process.exit(2);
}

let former;
try {
    former = execFileSync('git', ['show', `${EPIC}:.claude/skills/${rule}/SKILL.md`], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
} catch {
    console.error(`meaning: no former text of «${rule}» on ${EPIC}`);
    process.exit(2);
}

const flat = (text) => text.replace(/\s+/g, ' ').trim();
const read = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : '');

const parts = readdirSync(SKILLS).filter(
    // The skill itself is always a part, a rule or a skill without a law alike; a neighbour by prefix
    // only when it is a rule, else `agent-kit-extend` would be read as a part of `agent-kit`.
    (dir) => dir === rule || (dir.startsWith(`${rule}-`) && /^kind:\s*rule\s*$/m.test(read(join(SKILLS, dir, 'SKILL.md')))),
);
const hot = flat(parts.map((dir) => read(join(SKILLS, dir, 'SKILL.md'))).join('\n'));
const cold = flat(parts.map((dir) => read(join(SKILLS, dir, 'pitfalls.md')) + '\n' + read(join(SKILLS, dir, 'pitfalls-2.md'))).join('\n'));
const progress = flat(read(join(HERE, 'progress.md')));

// The body without the frontmatter, the layout header and the applicability signs: they carry no
// meaning of their own, and the sign travels with its article.
const body = former
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/^<!-- rt-kit [^\n]*-->\n/m, '')
    .replace(/^\s*<!-- rt-when:[^\n]*-->\s*$/gm, '');

// Pieces: blank-line separated blocks, a fenced block whole, a list item each on its own.
const pieces = [];
let section = '';
for (const block of body.split(/\n(?=```)|(?<=```)\n/)) {
    if (block.startsWith('```')) {
        pieces.push({ section, text: block });
        continue;
    }
    for (const para of block.split(/\n\s*\n/)) {
        const lines = para.split('\n');
        const heading = lines.find((line) => /^#{1,6} /.test(line));
        if (heading) section = heading.replace(/^#+ /, '');
        const rest = lines.filter((line) => !/^#{1,6} /.test(line)).join('\n');
        // A list splits into its items: an item is an article of its own.
        for (const item of rest.split(/\n(?=- )/)) if (flat(item)) pieces.push({ section, text: item });
    }
}

const missing = [];
const present = (text) => {
    const t = flat(text.replace(/^\s*- /, ''));
    return !t || hot.includes(t) || cold.includes(t);
};
for (const { section: where, text } of pieces) {
    const article = /^\s*- \*\*(.+?)\*\*(.*)$/s.exec(text);
    if (article && where === 'How the law applies here') {
        const statement = `**${article[1]}**`;
        if (!hot.includes(flat(statement)) && !progress.includes(flat(article[1]))) missing.push(`statement: ${article[1]}`);
        if (!present(article[2])) missing.push(`argument of: ${article[1]}`);
        continue;
    }
    if (!present(text)) missing.push(`${where || 'top'}: ${flat(text).slice(0, 100)}`);
}

missing.forEach((line) => console.error(line));
console.log(missing.length);
process.exit(missing.length === 0 ? 0 : 1);
