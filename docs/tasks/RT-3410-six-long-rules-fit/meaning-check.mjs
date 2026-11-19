#!/usr/bin/env node
/**
 * The machine half of the meaning check of RT-3410, two parts:
 *
 * - every paragraph, table row and code block of the hot part of a rule as it stood before the work
 *   stands word for word in the rule directory after it — in the hot part, or in a cold part;
 * - the statement of every old article — the bold words that open a list item of «How the law
 *   applies here» — stands in the hot part itself, not only somewhere in the directory.
 *
 *   node meaning-check.mjs <commit before the work> <rule>...
 *
 * Prints one line per loss and, last, the number of losses.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const [base, ...rules] = process.argv.slice(2);
const flat = (text) => text.replace(/\s+/g, ' ').trim();

/** The paragraphs of a text that carry words: no headings, fences, frontmatter, comments or tables. */
const paragraphs = (text) => {
    const body = text.replace(/^---\n[\s\S]*?\n---\n/, '').replace(/```[\s\S]*?```/g, '');
    return body
        .split(/\n\s*\n/)
        .map(flat)
        .filter((p) => p !== '' && !p.startsWith('#') && !p.startsWith('<!--') && !p.startsWith('|'));
};

/**
 * The statements of the articles: the bold words that open a list item of the section «How the law
 * applies here». The pitfalls are no articles: they go to the cold part whole.
 */
const statements = (text) => {
    const section = text.match(/^## How the law applies here\n([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1] ?? '';
    return [...section.matchAll(/^- \*\*([\s\S]+?)\*\*/gm)].map((m) => flat(m[1]));
};

/** The rows of the tables and the code blocks, a sample or a diagram, each kept whole. */
const blocks = (text) => {
    const body = text.replace(/^---\n[\s\S]*?\n---\n/, '');
    const rows = body.split('\n').filter((l) => l.startsWith('|')).map(flat);
    const fences = [...body.matchAll(/```[\s\S]*?```/g)].map((m) => flat(m[0]));
    return [...rows, ...fences];
};

let lost = 0;
for (const rule of rules) {
    const dir = `.claude/skills/${rule}`;
    let before = '';
    try {
        before = execFileSync('git', ['show', `${base}:${dir}/SKILL.md`], { encoding: 'utf8' });
    } catch {
        console.log(`${rule}: no hot part at ${base}`);
        lost += 1;
        continue;
    }
    const hot = existsSync(`${dir}/SKILL.md`) ? flat(readFileSync(`${dir}/SKILL.md`, 'utf8')) : '';
    const all = existsSync(dir)
        ? flat(readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => readFileSync(`${dir}/${f}`, 'utf8')).join('\n\n'))
        : '';
    for (const p of paragraphs(before)) {
        // A list item is judged by itself: a list split between the hot and the cold part keeps it.
        const items = p.startsWith('- ') ? p.split(/ (?=- \*\*)/) : [p];
        for (const item of items) {
            if (!all.includes(flat(item))) {
                lost += 1;
                console.log(`${rule}: paragraph ${flat(item).slice(0, 100)}`);
            }
        }
    }
    for (const b of blocks(before)) {
        if (!all.includes(b)) {
            lost += 1;
            console.log(`${rule}: table row or block ${b.slice(0, 100)}`);
        }
    }
    for (const s of statements(before)) {
        if (!hot.includes(`**${s}**`)) {
            lost += 1;
            console.log(`${rule}: statement out of the hot part ${s.slice(0, 100)}`);
        }
    }
}
console.log(lost);
