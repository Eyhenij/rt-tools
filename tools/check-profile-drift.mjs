#!/usr/bin/env node
// rt-kit v0.25.0 · checks/check-profile-drift.mjs · 7d0890deef26 · правится надстройкой, не здесь
/**
 * Comparing the overrides of the profile with the tables of the companions.
 *
 * The rule says one thing and the tree works another way — and both places are lawful. The
 * divergence is declared by a variable of the profile, while the reader looks for it in the
 * companion of the rule, where it is listed what the words of the rule are called here. While
 * nobody compares these two places, the companion promises the package default where the tree has
 * long worked its own way: the rule demanded one form of the title of a PR, the tree replaced it
 * with a variable, and the guard that read the form did not pull the number out at all — the check
 * of the number silently did not run and looked as if it had come out right.
 *
 * What is compared: the name of every variable of the profile whose value has diverged from the
 * package default, against the texts of the companions of the rules. The value is compared with
 * nothing: a machine has nothing to tell whether it is right with, while naming what is replaced
 * in the companion — that can be done.
 *
 * FAIL-OPEN: no profile, no defaults, no directory of rules — there is nothing to compare, a zero
 * code. The tree is entitled to keep neither of them.
 *
 * A non-zero exit code and the list of discrepancies.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';

const ROOT = process.cwd();
const PROFILE = join(ROOT, '.claude/rt-kit/project.sh');
const DEFAULTS = join(ROOT, '.claude/rt-kit/defaults/project.sh');
const RULES = join(ROOT, '.claude/skills');

/** A top-level assignment: `RT_NAME='value'` or `RT_NAME="value"`. */
const ASSIGN = /^(RT_[A-Z0-9_]+)=(.*)$/;

/** The package default: `RT_NAME="${RT_NAME:-value}"` — the value is taken from the substitution. */
const FALLBACK = /^RT_[A-Z0-9_]+="\$\{RT_[A-Z0-9_]+:-(.*)\}"$/;

/** The value without the surrounding quotes: strings are compared, not the way they are written. */
function unquote(text) {
    const trimmed = text.trim();
    const paired = trimmed.length > 1 && (trimmed.startsWith("'") || trimmed.startsWith('"')) && trimmed.endsWith(trimmed[0]);

    return paired ? trimmed.slice(1, -1) : trimmed;
}

/** The map «name of the variable → value» by top-level assignments. */
function valuesOf(path) {
    const values = new Map();

    for (const line of readFileSync(path, 'utf8').split('\n')) {
        const assign = line.match(ASSIGN);
        if (!assign) {
            continue;
        }

        const fallback = line.match(FALLBACK);
        values.set(assign[1], fallback ? unquote(fallback[1]) : unquote(assign[2]));
    }

    return values;
}

/** The texts of all the companions of the tree, glued into one: a name is searched in them, not a place. */
function companionsText() {
    if (!existsSync(RULES)) {
        return null;
    }

    const texts = [];

    for (const rule of readdirSync(RULES, { withFileTypes: true })) {
        if (!rule.isDirectory()) {
            continue;
        }

        const companion = join(RULES, rule.name, 'implementation.md');
        if (existsSync(companion)) {
            texts.push(readFileSync(companion, 'utf8'));
        }
    }

    return texts.length > 0 ? texts.join('\n') : null;
}

/**
 * The set of the push gate assembled by the shell: with the override of the tree and without it.
 *
 * It is assembled by a call, not by reading the text: the set is a function, and it looks at the
 * tree — is there a setting of the layout, does a styling config lie there, is the scenario suite
 * runnable. Read as text, it would name as commands what is not in this tree at all.
 *
 * Empty — there is nothing to assemble it with: no shell, no function, a refused call. Then there
 * is nothing to compare.
 */
function gateSet(withProfile) {
    const source = withProfile ? `. '${DEFAULTS}'; . '${PROFILE}';` : `. '${DEFAULTS}';`;
    const run = spawnSync('bash', ['-c', `${source} command -v rt_push_checks >/dev/null 2>&1 || exit 9; rt_push_checks ''`], {
        cwd: ROOT,
        encoding: 'utf8',
    });

    return run.status === 0 && typeof run.stdout === 'string' ? run.stdout.split('\n').filter(Boolean) : null;
}

/**
 * The checks named in the set — by the name of the file, not by the whole line of the command.
 *
 * The whole line is no good for the comparison: the tree is entitled to call the same check by
 * another launcher or with another argument, and that is not a divergence. The loss of the check
 * itself is one.
 */
function checksIn(lines) {
    const names = new Set();

    for (const line of lines) {
        for (const [word] of line.matchAll(/[\w./-]+\.(?:mjs|sh)/g)) {
            names.add(basename(word));
        }
    }

    return names;
}

/**
 * The checks that the package default calls and the set of the tree does not.
 *
 * The set of the gate is assembled by the default and the override, and the override is entitled to
 * declare the function anew. A check bitten out that way is indistinguishable from a check that is
 * not in the tree at all: the gate is green because nobody called it, and the digest of the layout
 * knows nothing about the set — it matches variables, and here a function is replaced.
 *
 * A refusal in favour of the work: there is nothing to assemble the set with — there are no lines,
 * and the comparison goes on with its own business.
 */
function cutFromGate() {
    const packaged = gateSet(false);
    const here = gateSet(true);
    if (packaged === null || here === null) {
        return [];
    }

    const mine = checksIn(here);

    return [...checksIn(packaged)].filter((name) => !mine.has(name)).sort((first, second) => first.localeCompare(second, 'ru'));
}

function main() {
    if (!existsSync(PROFILE) || !existsSync(DEFAULTS)) {
        console.log('check-profile-drift: there is no tree profile or package defaults — there is nothing to check');

        return 0;
    }

    const companions = companionsText();
    if (companions === null) {
        console.log('check-profile-drift: the tree has no companions of rules — there is nothing to check against');

        return 0;
    }

    const cut = cutFromGate();
    if (cut.length > 0) {
        console.log(`check-profile-drift: the push gate set does not call checks of the default: ${cut.length}\n`);

        for (const name of cut) {
            console.log(`  ${name}`);
        }

        console.log('\nThe gate set is assembled from the package default and the tree override. A check sifted');
        console.log('out by the override is indistinguishable from a check the tree does not have: the gate is');
        console.log('green because nobody called it. Return it to the set or explain the refusal in the companion of the delivery rule.');

        return 1;
    }

    const defaults = valuesOf(DEFAULTS);
    const profile = valuesOf(PROFILE);
    const overridden = [...profile].filter(([name, value]) => !defaults.has(name) || defaults.get(name) !== value);
    const unnamed = overridden.filter(([name]) => !companions.includes(name));

    if (unnamed.length > 0) {
        console.log(`check-profile-drift: overridden ${overridden.length}, not named by a companion ${unnamed.length}\n`);

        for (const [name, value] of unnamed) {
            console.log(`  ${name} = ${value.length > 60 ? `${value.slice(0, 57)}…` : value}`);
        }

        console.log('\nWhat is overridden is read in the companion of the rule: it lists what the rule says');
        console.log('is called here. Left unnamed there, it leaves the reader the package default instead of');
        console.log('what the tree actually works by.');

        return 1;
    }

    console.log(`check-profile-drift: overridden ${overridden.length}, all named by companions — it matches`);

    return 0;
}

process.exit(main());
