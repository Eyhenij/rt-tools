#!/usr/bin/env bash
# The scenarios of the heavy-step choice before a push: which subjects a branch's paths fall into
# and which heavy steps each subject pays for.
#
# Why they exist. The sign lives in `.claude/rt-kit/project.sh` and is run on this tree — that is,
# on the paths that lie here today. A subject it maps wrongly stays silent until a branch touches
# exactly those paths, and then the miss arrives as somebody else's red run a day later: the kit
# carried a font, the showcase frames were re-taken, the admin screens were never compared, and
# 23 of them diverged (task RT-2257).
#
# The admin draws with the second kit's styles — one line of `@use` in its root styling file — so
# an edit of that kit pays for the admin's end-to-end suite. This is exactly what the sign forgot.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the heavy steps a branch pays for"

ROOT="$(cd "$TOOLS/.." && pwd)"

# The set of heavy steps for a named subject. The sign itself asks git about the branch, so the
# question "which paths were touched" is answered here instead of it: the scenario is about the
# mapping of subjects onto steps, not about reading a diff.
steps_for() {
    (
        cd "$ROOT" || exit 1
        # shellcheck disable=SC1091
        . .claude/rt-kit/project.sh
        subjects="$1"
        rt_push_touched() { printf '%s' "$subjects"; }
        rt_push_checks origin/base 2>/dev/null
    )
}

# Whether a step stands in the set of that subject. The line is matched whole: a substring match
# answers 'yes' about any step whose command starts the same way.
has_step() {
    if steps_for "$1" | grep -qxF "$2"; then printf 'yes'; else printf 'no'; fi
}

# Covers SC-UKV-1873 of the spec `docs/specs/ui-kit-v2/snapshots`.
# With a base the step is asked about the stories the branch touched; without one it is the whole
# set, the very line the pipeline has and check-push-gate compares against.
SHOT='node tools/visual-gate.mjs ui-kit-v2'
for subject in kit2 show2 everything; do
    report "the subject $subject shoots the stories the branch touched" \
        "$(has_step "$subject" "$SHOT --affected origin/base")" 'yes'
    report "the subject $subject has no whole set beside it" "$(has_step "$subject" "$SHOT")" 'no'
done
report "a set whose subjects did not read shoots the touched stories" \
    "$(cd "$ROOT" && . .claude/rt-kit/project.sh && rt_push_touched() { return 1; } && rt_push_checks origin/base 2>/dev/null | grep -cxF "$SHOT --affected origin/base")" '1'
report "a set without a base shoots the whole set" \
    "$(cd "$ROOT" && . .claude/rt-kit/project.sh && rt_push_checks '' 2>/dev/null | grep -cxF "$SHOT")" '1'
report "the second kit pays for the admin screens: the admin draws with it" \
    "$(has_step kit2 'pnpm exec nx run message-bus-admin-e2e:e2e')" 'yes'
report "the second kit does not build the images: the suite builds its own stand" \
    "$(steps_for kit2 | grep -c 'docker build')" '0'
report "no subject runs a removed kit's frames" \
    "$(steps_for everything | grep -cxF 'node tools/visual-gate.mjs ui-kit')" '0'

report "the receiver pays for the admin screens" \
    "$(has_step receiver 'pnpm exec nx run message-bus-admin-e2e:e2e')" 'yes'
report "the receiver pays for the images" \
    "$(steps_for receiver | grep -c 'docker build')" '2'

# Both subjects call the same step, and they are touched together more often than apart. Printed
# twice, it would be run twice — four extra minutes on every such push.
report "the admin screens are asked once when both subjects are touched" \
    "$(steps_for 'receiver kit2' | grep -cF 'message-bus-admin-e2e:e2e')" '1'

# The subjects of a commit that touched the named paths, read from a real diff in a scratch repository.
touched_by() {
    (
        scratch="$(mktemp -d)"
        trap 'rm -rf "$scratch"' EXIT
        cd "$scratch" || exit 1
        git init -q && git -c user.name=t -c user.email=t@t commit -q --allow-empty -m base
        for path in "$@"; do mkdir -p "$(dirname "$path")" && printf '{}\n' > "$path"; done
        git add -A && git -c user.name=t -c user.email=t@t commit -q -m touched
        # shellcheck disable=SC1091
        . "$ROOT/.claude/rt-kit/project.sh"
        rt_push_touched HEAD~1 HEAD
    )
}

# A code graph is data the session reads. Before it had a case of its own, a rebuilt root graph fell
# into the general case and raised the whole heavy set, and a project graph raised its project's.
report "a rebuilt code graph raises no heavy step" \
    "$(touched_by graphify-out/graph.json projects/utils/graphify-out/graph.json \
        projects/ui-kit-v2/graphify-out/graph.json apps/message-bus/graphify-out/graph.json)" ''
# A package no application imports and the pipeline files have no heavy step of their own: the
# checks of the touched projects cover them. Before, they fell into the general case and a branch
# of one such file ran the end-to-end suite, both images, the frames and the entry stand.
report "a package nothing imports raises no heavy step" \
    "$(touched_by projects/ai-chat-protocol/src/lib/x.ts projects/cms-server/src/x.ts)" ''
report "a pipeline file raises no heavy step" \
    "$(touched_by .github/workflows/ci.yml)" ''
report "a script and a probe of the snapshot step raise the frames" \
    "$(touched_by tools/affected-stories.mjs):$(touched_by tools/story-graph.mjs):$(touched_by tools/snapshot-icon-probe.mjs)" 'show2:show2:show2'
report "the root settings still raise the whole set" \
    "$(touched_by package.json)" 'everything'
report "a package the applications take as sources still raises the whole set" \
    "$(touched_by projects/utils/src/x.ts)" 'everything'
report "the code next to a graph still raises its subject" \
    "$(touched_by projects/ui-kit-v2/graphify-out/graph.json projects/ui-kit-v2/src/x.ts)" 'kit2'

# The admin end-to-end step of a commit that touched the named paths, read from a real diff in a
# scratch repository.
e2e_step_for() {
    (
        scratch="$(mktemp -d)"
        trap 'rm -rf "$scratch"' EXIT
        cd "$scratch" || exit 1
        git init -q && git -c user.name=t -c user.email=t@t commit -q --allow-empty -m base
        for path in "$@"; do mkdir -p "$(dirname "$path")" && printf '{}\n' > "$path"; done
        git add -A && git -c user.name=t -c user.email=t@t commit -q -m touched
        # shellcheck disable=SC1091
        . "$ROOT/.claude/rt-kit/project.sh"
        rt_admin_e2e_step HEAD~1 HEAD
    )
}

E2E_FULL='pnpm exec nx run message-bus-admin-e2e:e2e'
E2E_USAGE="$E2E_FULL -- src/usage-section.spec.ts src/quality-section.spec.ts src/quality.narrow.spec.ts"

# RT-3287: an edit of the usage section ran all 168 tests and went over the step's time limit.
report "the usage code pays for the specs of usage and quality, not the whole suite" \
    "$(e2e_step_for libs/message-bus-api/observations/feature/src/lib/usage-read.controller.ts \
        libs/message-bus-admin/usage/feature/list/src/lib/admin-usage-list.component.html)" "$E2E_USAGE"
report "a changed end-to-end spec calls for itself" \
    "$(e2e_step_for apps/message-bus-admin-e2e/src/invites-list.spec.ts)" "$E2E_FULL -- src/invites-list.spec.ts"
report "a unit spec and a text add no spec of their own" \
    "$(e2e_step_for libs/message-bus-api/observations/feature/src/lib/usage-read.controller.spec.ts \
        docs/specs/message-bus/usage/spec.md libs/message-bus-admin/usage/data-access/src/lib/usage-digest.store.ts)" "$E2E_USAGE"
report "a section with no named specs runs the whole suite" \
    "$(e2e_step_for libs/message-bus-admin/usage/data-access/src/lib/usage-digest.store.ts \
        libs/message-bus-admin/invites/feature/src/lib/x.ts)" "$E2E_FULL"
report "the shared code of the receiver runs the whole suite" \
    "$(e2e_step_for libs/message-bus-api/persistence/src/lib/x.ts)" "$E2E_FULL"
report "the stand of the suite runs the whole suite" \
    "$(e2e_step_for apps/message-bus-admin-e2e/stand/seed-observations.mjs)" "$E2E_FULL"
report "the browser script of the step runs the whole suite" \
    "$(e2e_step_for tools/shot-browser.mjs libs/message-bus-admin/usage/x.ts)" "$E2E_FULL"
report "no base runs the whole suite" \
    "$(cd "$ROOT" && . .claude/rt-kit/project.sh && rt_admin_e2e_step '')" "$E2E_FULL"

# RT-3630: the mark of the scenarios of the tree's checks. The key of the step before and after a
# commit of one path, taken by the profile of this tree in a scratch repository.
key_after() {
    (
        scratch="$(mktemp -d)"
        trap 'rm -rf "$scratch"' EXIT
        cd "$scratch" || exit 1
        git init -q && printf 'a\n' > a.txt && git add -A && git -c user.name=t -c user.email=t@t commit -q -m base
        # shellcheck disable=SC1091
        . "$ROOT/.claude/rt-kit/project.sh"
        # shellcheck disable=SC1091
        . "$ROOT/.claude/hooks/git-guard-push-marks.sh"
        step='RT_SUITES_BASE=origin/base bash tools/tests/run.sh'
        before="$(rt_push_mark_key "$step" '')"
        mkdir -p "$(dirname "$1")" && printf 'b\n' > "$1" && git add -A
        git -c user.name=t -c user.email=t@t commit -q -m touched
        after="$(rt_push_mark_key "$step" '')"
        if [ -z "$before" ]; then printf 'no key'; elif [ "$before" = "$after" ]; then printf 'kept'; else printf 'lost'; fi
    )
}
for path in docs/plans/x.md docs/archive/RT-1-x.md docs/tasks/RT-1-x/progress.md docs/tasks/_draft-x/grill.md \
    .claude/rt-kit/assignments.md; do
    report "a commit of $path keeps the mark of the scenarios" "$(key_after "$path")" kept
done
for path in docs/specs/ui-kit-v2/spec.md tools/check-x.mjs tools/tests/x.test.sh docs/tasks/_template/plan.md README.md; do
    report "a commit of $path takes it away" "$(key_after "$path")" lost
done

suite_result "the heavy steps a branch pays for"
