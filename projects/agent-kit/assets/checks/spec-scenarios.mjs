/**
 * The scenarios of a domain and the level of their binding: what a scenario promises, by which test
 * it is covered and whether the test is not switched off by an environment variable.
 */
import {
    ACTOR,
    E2E_ROOTS,
    PARTIAL,
    PERCEIVES,
    PROMISE,
    SCENARIO_HEADING,
    SCENARIO_REFERENCE,
    TEST_ROOTS,
    UNCOVERED,
    read,
    walk,
} from './spec-common.mjs';

// ── 4. Scenarios and the level of binding ──────────────────────────────────────

function parseScenarios(file) {
    const lines = read(file).split('\n');
    const scenarios = [];
    let current = null;
    let inPromise = false;

    lines.forEach((line, index) => {
        const heading = SCENARIO_HEADING.exec(line);
        if (heading) {
            current = {
                id: heading[1],
                prefix: heading[2],
                title: heading[4],
                file,
                line: index + 1,
                uncovered: false,
                partial: false,
                promise: '',
                body: '',
            };
            inPromise = false;
            scenarios.push(current);

            return;
        }
        if (/^#{1,6}\s/.test(line)) {
            current = null;

            return;
        }
        if (!current) {
            return;
        }
        // The body of the scenario whole: by it one sees whether a person is named in the scenario
        // at all. A pronoun in the promise has nothing else to check itself against.
        current.body += ` ${line.trim()}`;
        if (UNCOVERED.test(line)) {
            current.uncovered = true;
        }
        if (PARTIAL.test(line)) {
            current.partial = true;
        }
        // «Тогда» and its continuations with an indent — what the scenario promises
        if (PROMISE.test(line)) {
            inPromise = true;
            current.promise += ` ${line.trim()}`;

            return;
        }
        if (inPromise && /^\s+\S/.test(line)) {
            current.promise += ` ${line.trim()}`;

            return;
        }
        inPromise = false;
    });

    return scenarios;
}

/**
 * A person named by a pronoun is the same person: «он видит тост об отказе» promises a screen
 * exactly the same way as «гость видит тост об отказе». The pronoun is demanded as the subject at
 * the verb of perception itself: a free link catches «он» about a request, a session and a counter
 * as well, where the verb of perception stands in the other half of the line.
 */
const PRONOUN_PERCEIVES =
    /(^|[^а-яё])(он|она|они)\s+(?:не\s+)?(?:вид(?:ит|ят)|чита(?:ет|ют)|смотр(?:ит|ят))|\b(?:he|she|they)\s+(?:does not |do not |never )?(?:sees?|reads?)\b/i;

/**
 * Whether a screen is promised by the scenario. The sign is read only from «Тогда»: «Дано»
 * describes the setting, «Когда» the occasion, and the promise to the user stands exactly here.
 *
 * A person and a verb of perception are demanded together, because apart both of them err.
 * «Показывается» without a person stands where a record in the database is shown too, and a person
 * without perception stands in every second scenario of taking in a request. The sign is silent on
 * purpose: a scenario whose «Тогда» names no person does not fall under it at all.
 *
 * The second condition is a pronoun at the verb of perception, with a person named in the body of
 * the scenario at that. Both are needed: a free link adds promises where «он» is about a request
 * and a counter, and without the name of a person in the body the sign catches «домен решает, есть
 * ли тревога; тогда он смотрит на прошлый час».
 */
function promisesScreen(promise, body = '') {
    if (ACTOR.test(promise) && PERCEIVES.test(promise)) {
        return true;
    }

    return ACTOR.test(body) && PRONOUN_PERCEIVES.test(promise);
}

/**
 * The constants assembled from the environment, together with those assembled from them. By them
 * an end-to-end test is switched off whole: without `BASE_URL` or the sign-in pair it never runs.
 * The chain is unfolded while there is something to unfold: `HAS_ADMIN_SESSION` is assembled from
 * two other constants, not from `process.env` directly.
 */
function environmentSwitches(root) {
    // A top-level declaration: the local ones stand with an indent, and they put out a case, not
    // the test
    const declaration = /^const\s+([A-Za-z_]\w*)\s*(?::[^=]+)?=\s*([^;]+);/gm;
    const assignments = [];
    for (const file of walk(root, (name) => name.endsWith('.ts'))) {
        for (const [, name, value] of read(file).matchAll(declaration)) {
            assignments.push({ name, value });
        }
    }

    const switches = new Set();
    for (let pass = 0; pass <= assignments.length; pass += 1) {
        const before = switches.size;
        for (const { name, value } of assignments) {
            if (value.includes('process.env') || [...switches].some((known) => new RegExp(`\\b${known}\\b`).test(value))) {
                switches.add(name);
            }
        }
        if (switches.size === before) {
            break;
        }
    }

    return switches;
}

/**
 * Mentions of the scenario in tests: where it stands, whether the test goes the way of the user and
 * whether it is switched off by an environment variable.
 *
 * A switch by the state of the stand («the object has fewer than two rooms») is a skip of a case,
 * and it does not cancel the coverage. A switch by a variable does cancel it: a test with one in an
 * ordinary run counts as skipped, and without this the digest would read it as coverage.
 */
function collectReferences() {
    const references = new Map();
    const remember = (id, place) => {
        if (!references.has(id)) {
            references.set(id, []);
        }
        references.get(id).push(place);
    };
    const switchesByRoot = new Map();

    for (const root of TEST_ROOTS) {
        for (const file of walk(root, (name) => name.endsWith('.spec.ts'))) {
            const e2eRoot = E2E_ROOTS.find((dir) => file.startsWith(`${dir}/`));
            if (e2eRoot && !switchesByRoot.has(e2eRoot)) {
                switchesByRoot.set(e2eRoot, environmentSwitches(e2eRoot));
            }
            const switches = switchesByRoot.get(e2eRoot) ?? new Set();
            const switched = (line) =>
                [...line.matchAll(/test\.skip\(([^,]*)/g)].some(
                    ([, condition]) =>
                        condition.includes('process.env') || [...switches].some((name) => new RegExp(`\\b${name}\\b`).test(condition))
                );

            const found = [];
            let test = null;
            let describeSwitched = false;

            read(file)
                .split('\n')
                .forEach((line, index) => {
                    if (/^\s*test\.describe[.(]/.test(line)) {
                        describeSwitched = false;
                        test = null;
                    } else if (/^\s*test\s*\(/.test(line)) {
                        test = { off: describeSwitched };
                    } else if (/test\.skip\(/.test(line)) {
                        if (test) {
                            test.off = test.off || switched(line);
                        } else {
                            describeSwitched = describeSwitched || switched(line);
                        }
                    }

                    for (const [id] of line.matchAll(SCENARIO_REFERENCE)) {
                        found.push({ id, test, place: `${file}:${index + 1}` });
                    }
                });

            // The switch stands as the first line of the body, that is below the title of the test
            // with the identifier: the state of the test is read when the file is taken apart whole
            found.forEach(({ id, test: own, place }) => remember(id, { place, screen: Boolean(e2eRoot), off: Boolean(own?.off) }));
        }

        // Scenario suites in shell. That is how executable files are checked — guards, checks,
        // defaults: they are not in TypeScript, and a suite for them is written in the same
        // language as themselves. There are no switches here: there is nothing to skip a scenario
        // with in such a suite, so finding the identifier is enough.
        for (const file of walk(root, (name) => name.endsWith('.test.sh'))) {
            read(file)
                .split('\n')
                .forEach((line, index) => {
                    for (const [id] of line.matchAll(SCENARIO_REFERENCE)) {
                        remember(id, { place: `${file}:${index + 1}`, screen: false, off: false });
                    }
                });
        }
    }

    return references;
}

export { collectReferences, parseScenarios, promisesScreen };
