#!/usr/bin/env node
/**
 * The metric of a package release, written under the heading of the new version in the journal.
 *
 * The journal is assembled from commits, so there is no template file to fill in: the field of the
 * release run is that template, and this command is what makes it binding. The release calls it right
 * after the journal is appended to, before anything is built or published, so a refusal stops the
 * release while nothing has left yet.
 *
 * Two forms are accepted. `<metric>: вверх` or `<metric>: вниз` names the number the release should
 * move and the direction. The metric is a name the reports show, with the name of a resource after it
 * at most: a word of one's own cannot be judged by the next report. `нет: <reason>` names why the
 * release moves none: a repair owes no movement, but silence cannot be told from a forgotten field.
 *
 * A non-zero code is a refusal, and it names the form.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = process.argv[2];
const VALUE = (process.argv[3] ?? '').trim();

/** What the reports show, word for word: the three result numbers, the columns of the causes, the entry cost. */
const METRICS = [
    'принято с первого раза',
    'правки владельца',
    'повторные ошибки',
    'потери',
    'пустые отказы',
    'отказов проверок',
    'правило не загружено',
    'отказов после загрузки',
    'отказы после загрузки правила',
    'пустые запуски',
    'минут впустую',
    'вес входа',
];

/** A resource name is the only thing that may follow the name of a metric. */
const METRIC_NAME = new RegExp(`^(${METRICS.join('|')})( [a-z0-9-]+)?$`, 'iu');

const MOVED = /^(.+?):\s*(вверх|вниз)$/;
/** A reason holds at least one word: a dot is the same silence. */
const NOT_MOVED = /^нет:\s*(.*\p{L}{3}.*)$/u;
const HEADING = /^#{1,2} \[?\d/;

/** The line of the journal, or `null` for a value in neither form. */
function lineOf(value) {
    const none = NOT_MOVED.exec(value);

    if (none) {
        return `**Метрика выпуска:** нет. ${none[1]}`;
    }

    const moved = MOVED.exec(value);

    return moved !== null && METRIC_NAME.test(moved[1]) ? `**Метрика выпуска:** ${moved[1]}, ${moved[2]}` : null;
}

function main() {
    const line = lineOf(VALUE);

    if (line === null) {
        console.error(
            'release-metric: the release names its metric. ' +
                `Write «<метрика>: вверх», «<метрика>: вниз» or «нет: <причина>», got «${VALUE}». ` +
                `A metric is one of these, with a resource name after it at most: ${METRICS.join(', ')}`
        );

        return 1;
    }

    const lines = readFileSync(FILE, 'utf8').split('\n');
    const at = lines.findIndex((one) => HEADING.test(one));

    if (at === -1) {
        console.error(`release-metric: ${FILE} has no heading of a version — there is nothing to write under`);

        return 1;
    }

    lines.splice(at + 1, 0, '', line);
    writeFileSync(FILE, lines.join('\n'));
    console.log(`release-metric: ${FILE} — ${line}`);

    return 0;
}

process.exitCode = main();
