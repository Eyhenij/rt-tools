#!/usr/bin/env node
/**
 * The check that the styling in the second kit's styles is taken as a token rather than as a value
 * on the spot.
 *
 * The rule `rt-tools/no-hardcoded-design-tokens` and the ban on a colour code were written long ago,
 * but were hung only on the first kit. The second grew without them, and by the time this check was
 * created its styles had piled up more than two hundred pixel literals and four dozen colour codes.
 * The leak went on leaking at that: every new component added to the count, and there was nothing to
 * notice it by.
 *
 * The order is the reverse of the usual: the gate first, the clean-up after. Otherwise the leak
 * closes at the same time as the clean-up ends, that is, at an unknown time. What has piled up lies
 * in the accepted list, does not count as a refusal and is visible as a number in the summary; the
 * check falls on a NEW place.
 *
 * stylelint has no accepted list of its own, and `lint:styles` goes with `--max-warnings 0` — so the
 * rules are hung by a config of its own (`tools/stylelint-tokens.config.mjs`) rather than by the
 * shared one, and stylelint is called from here by code.
 *
 * By the same order a direct use of the rounding step, the shadow, the border width and the duration
 * is judged: between a step and the place of use stands the component's own property. The rule is
 * created in the same config, the findings land in the same accepted list — no second list of what
 * has piled up is created.
 *
 * A record's key is the file, the property and the value, without the line number: the line drifts
 * with any reformatting, and the list would turn red on edits that never happened.
 *
 * A non-zero exit code and a list of the divergences.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import stylelint from 'stylelint';

import { allowlistOf, baselineOf, parseAllowlist } from './rt-kit-checks.config.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** The set the check judges. Named by the agreement and repeated in the config next to it. */
/** Component styles of both entries of the package. */
const FILES = 'projects/ui-kit-v2/src/{lib,rich-editor/lib}/**/*.scss';
const CONFIG_FILE = join(ROOT, 'tools/stylelint-tokens.config.mjs');
const ALLOWLIST = allowlistOf('tokens-styles');

/**
 * A finding's key: the file, the property and the value. The line number is deliberately not in it
 * — see the header. The property and the value are taken from the rule's message text: it begins
 * with a quote holding the value and names the property after the word `in`. A message without
 * that shape (the hex ban from `color-no-hex`) is keyed by its own text.
 */
function keyOf(file, warning) {
    const relative = file.startsWith(ROOT) ? file.slice(ROOT.length + 1) : file;
    const value = warning.text.match(/"([^"]+)"/)?.[1];
    const property = warning.text.match(/ in ([a-z-]+) /)?.[1];

    if (value && property) {
        return `${relative} · ${property} · ${value}`;
    }
    if (value) {
        return `${relative} · ${value}`;
    }

    return `${relative} · ${warning.rule}`;
}

/**
 * `cwd` and `configBasedir` are set to the tree root on purpose: stylelint counts the paths in
 * `overrides.files` from the config's base directory, and the config lies in `tools/`. Without this
 * the set matches not one file, the check finds zero places and looks green — that is, lies silently.
 */
const { results } = await stylelint.lint({
    files: join(ROOT, FILES),
    configFile: CONFIG_FILE,
    configBasedir: ROOT,
    cwd: ROOT,
});

const findings = [];
const broken = [];

for (const result of results) {
    if (result.errored && result.parseErrors?.length) {
        broken.push(`${result.source}: the file did not parse — ${result.parseErrors.map((error) => error.text).join('; ')}`);
    }
    for (const warning of result.warnings) {
        findings.push({ key: keyOf(result.source, warning), text: `${keyOf(result.source, warning)} — ${warning.text}` });
    }
}

if (process.argv.includes('--baseline')) {
    console.log(baselineOf([...new Set(findings.map((finding) => finding.key))].sort(), parseAllowlist('tokens-styles')));
    process.exit(0);
}

const known = parseAllowlist('tokens-styles').keys;
const seen = new Set(findings.map((finding) => finding.key));

const fresh = findings.filter((finding) => !known.has(finding.key));
const stale = [...known].filter((key) => !seen.has(key));

const problems = [
    ...broken,
    ...fresh.map((finding) => finding.text),
    ...stale.map((key) => `${key}: it stands in ${ALLOWLIST}, but the styles no longer hold it — remove the line`),
];

if (problems.length > 0) {
    console.error(`check-tokens-styles: divergences ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    process.exit(1);
}

console.log(`check-tokens-styles: literals and direct steps in the set ${seen.size}, all accepted by the list — there are no new ones`);
