#!/usr/bin/env node
/**
 * The machine half of the meaning check of RT-3392: every paragraph of the hot part of a rule as it
 * stood before the work stands word for word in the rule directory after it — in the hot part, or in
 * a cold part next to it. A compression may shorten an article in the hot part; the paragraph it took
 * the words from moves whole, so nothing is lost.
 *
 *   node meaning-check.mjs <commit before the work> <rule>...
 *
 * Prints one line per lost paragraph and, last, the number of lost paragraphs.
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
    const now = existsSync(dir)
        ? flat(readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => readFileSync(`${dir}/${f}`, 'utf8')).join('\n\n'))
        : '';
    for (const p of paragraphs(before)) {
        // A list item is judged by itself: a list split between the hot and the cold part keeps it.
        const items = p.startsWith('- ') ? p.split(/ (?=- \*\*)/) : [p];
        for (const item of items) {
            if (!now.includes(flat(item))) {
                lost += 1;
                console.log(`${rule}: ${flat(item).slice(0, 100)}`);
            }
        }
    }
}
console.log(lost);
