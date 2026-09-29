#!/usr/bin/env bash
# The scenarios of opening a story in the showcase probes: what a probe says when the showcase it
# was pointed at serves no stories, and what it does not swallow.
#
# Covers SC-UKV-132, SC-UKV-142 and SC-UKV-144 of the spec `docs/specs/ui-kit-v2/snapshots`.
#
# There is no browser here on purpose. The module is judged by what it says and by the code it
# leaves with, and a real browser would add half a minute of waiting to every scenario.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "opening a story in the showcase probes"

WORK="$(mktemp -d)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

mkdir -p "$WORK/tools"
cp "$TOOLS/showcase-probe.mjs" "$WORK/tools/"

# The fake page. The scenario is set by three values: what the wait for the root ends with, what the
# page holds afterwards and which requests it refused.
cat > "$WORK/tools/drive.mjs" <<'JS'
import { openStory } from './showcase-probe.mjs';

const [ending, body, refused, keepGoing] = process.argv.slice(2);

const timeout = () => {
    const failure = new Error('Timeout 30000ms exceeded.');
    failure.name = 'TimeoutError';
    return failure;
};

const page = {
    handlers: [],
    on(event, handler) {
        this.handlers.push([event, handler]);
    },
    off(event, handler) {
        this.handlers = this.handlers.filter(([kind, fn]) => kind !== event || fn !== handler);
    },
    async goto() {
        if (ending === 'goto-fails') {
            throw new Error('net::ERR_CONNECTION_REFUSED');
        }
        for (const [, handler] of this.handlers) {
            handler({ status: () => Number(refused.split(' ')[0]), url: () => refused.split(' ')[1] });
        }
    },
    async waitForSelector() {
        if (ending !== 'root-appears') {
            throw timeout();
        }
    },
    locator: () => ({ count: async () => (ending === 'root-appears' ? 1 : 0) }),
    evaluate: async (fn, mark) => fn(mark),
};

globalThis.document = { body: { innerHTML: body } };

const opening = await openStory(page, {
    url: 'http://localhost:6099',
    story: 'atoms-icon--social',
    selector: '[data-story-root]',
    timeoutMs: 30_000,
    fatal: keepGoing !== 'fatal-false',
});

console.log(`opened ${opening.opened}, roots ${opening.state?.roots ?? '—'}, listeners left ${page.handlers.length}`);
JS

run() {
    (cd "$WORK/tools" && node drive.mjs "$@" 2>&1)
}

verdict() {
    local label="$1" want="$2" got
    shift 2
    if (cd "$WORK/tools" && node drive.mjs "$@" >/dev/null 2>&1); then got="green"; else got="red"; fi
    report "$label" "$got" "$want"
}

says() {
    local label="$1" pattern="$2" got
    shift 2
    if run "$@" | grep -qF -- "$pattern"; then got="yes"; else got="no"; fi
    report "$label" "$got" "yes"
}

# --- the root appeared ------------------------------------------------------------------------
verdict "the root appeared — the probe goes on" green root-appears '' '200 http://localhost:6099/main.js'
says "the listener of the requests is taken off" "listeners left 0" root-appears '' '200 http://localhost:6099/main.js'

# --- the showcase serves no story -------------------------------------------------------------
STUCK='<div class="sb-preparing-story"></div>'
verdict "the root did not appear — the probe refuses" red timed-out "$STUCK" '404 http://localhost:6099/hot-update.json'
says "the refusal names the address" "http://localhost:6099/iframe.html?id=atoms-icon--social" timed-out "$STUCK" '404 http://localhost:6099/hot-update.json'
says "the refusal names the count of the roots" "Roots on the page: 0" timed-out "$STUCK" '404 http://localhost:6099/hot-update.json'
says "the refusal names the story stuck at preparing" "still at preparing" timed-out "$STUCK" '404 http://localhost:6099/hot-update.json'
says "the refusal names the request that did not arrive" "404 http://localhost:6099/hot-update.json" timed-out "$STUCK" '404 http://localhost:6099/hot-update.json'
says "the refusal says it is not about the harness" "says nothing about the snapshot harness" timed-out "$STUCK" '404 http://localhost:6099/hot-update.json'

# A page that is not stuck at preparing must not be described as one: the two states send whoever
# reads the refusal down different roads.
says "a page not at preparing is not called stuck" "Roots on the page: 0." timed-out '<div></div>' '404 http://localhost:6099/hot-update.json'

# --- what is not swallowed --------------------------------------------------------------------
# Only a wait that ran out speaks of the showcase. Everything else is someone else's failure, and
# turned into a complaint about a stale showcase it would send the reader looking in the wrong place.
says "a failure that is not a timeout goes on untouched" "ERR_CONNECTION_REFUSED" goto-fails '' '200 http://localhost:6099/main.js'

# --- the sweep asks for the state instead of the exit ---------------------------------------------
# The sweep over all the stories cannot die on one of them: five hundred others stay unasked. So the
# wait gives it the state back, and the refusal text is the sweep's own to write.
verdict "a wait that ran out with «keep going» does not fell the call" green timed-out "$STUCK" '404 http://localhost:6099/hot-update.json' fatal-false
says "the state comes back instead of the exit" "opened false, roots 0" timed-out "$STUCK" '404 http://localhost:6099/hot-update.json' fatal-false
says "a page that opened answers that it opened" "opened true" root-appears '' '200 http://localhost:6099/main.js' fatal-false
says "the listener of the requests is taken off there too" "listeners left 0" timed-out "$STUCK" '404 http://localhost:6099/hot-update.json' fatal-false

# --- the showcase serves no index ---------------------------------------------------------------
# The second half of the module: a showcase that lost its story index. There is no showcase here
# either — what is judged is the poke of the files the refusal names and what is said afterwards.
cat > "$WORK/tools/drive-index.mjs" <<'JS'
import { ensureIndex } from './showcase-probe.mjs';

const [script] = process.argv.slice(2);

const REFUSAL = [
    'Unable to index ./projects/ui-kit-v2/src/a.stories.ts:',
    '  Error: Could not parse expression with acorn',
    'Unable to index ./projects/ui-kit-v2/src/b.stories.ts:',
    '  Error: Could not parse import/exports with acorn',
].join('\n');

const poked = [];
let reads = 0;

const read = async () => {
    reads += 1;
    if (script === 'served') return { ok: true, body: '' };
    if (script === 'unnamed') return { ok: false, body: 'the indexer fell over and named nothing' };
    if (script === 'broken-forever') return { ok: false, body: REFUSAL };
    return { ok: reads > 1, body: reads > 1 ? '' : REFUSAL };
};

const result = await ensureIndex('http://localhost:6099', {
    read,
    poke: (path) => poked.push(path),
    wait: async () => {},
    timeoutMs: 3_000,
});

console.log(`healed ${result.healed}, poked ${poked.join(' ') || 'nothing'}`);
JS

run_index() {
    (cd "$WORK/tools" && node drive-index.mjs "$@" 2>&1)
}

verdict_index() {
    local label="$1" want="$2" got
    shift 2
    if (cd "$WORK/tools" && node drive-index.mjs "$@" >/dev/null 2>&1); then got="green"; else got="red"; fi
    report "$label" "$got" "$want"
}

says_index() {
    local label="$1" pattern="$2" got
    shift 2
    if run_index "$@" | grep -qF -- "$pattern"; then got="yes"; else got="no"; fi
    report "$label" "$got" "yes"
}

verdict_index "the index is served — the run goes on" green served
says_index "a served index is poked by nobody" "healed false, poked nothing" served

verdict_index "the index came back after the poke — the run goes on" green broken-then-ok
says_index "the poke goes over every file the refusal names" "poked ./projects/ui-kit-v2/src/a.stories.ts ./projects/ui-kit-v2/src/b.stories.ts" broken-then-ok
says_index "the coming back is said aloud" "served no index" broken-then-ok

verdict_index "the index did not come back — the run refuses" red broken-forever
says_index "the refusal names the files the indexer choked on" "./projects/ui-kit-v2/src/a.stories.ts" broken-forever
says_index "the refusal says it is not about the harness" "says nothing about the snapshot harness" broken-forever
says_index "the refusal sends to raise the showcase anew" "raise the showcase anew" broken-forever

# A refusal naming no file is not poked by guesswork: there is nothing to poke, and a wait for an
# index nobody asked to be rebuilt would only put half a minute between the run and its verdict.
verdict_index "a refusal naming no file refuses at once" red unnamed
says_index "such a refusal says the indexer named none" "it named none" unnamed


suite_result "opening a story in the showcase probes"
