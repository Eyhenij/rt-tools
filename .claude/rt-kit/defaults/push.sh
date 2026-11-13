#!/usr/bin/env bash
# rt-kit v0.37.0 · defaults/push.sh · 6c9aa8a871f4 · правится надстройкой, не здесь
# The push set: what runs before a push, which of it is heavy, and whether the branch touched only
# texts.
#
# The package default, part of the tree profile — loaded from `project.sh`, next to which it lies. A
# separate file because together they outgrow the length limit.

# The commands that must pass before a push. One per line; the first one that fails refuses the
# push. The style linter on a separate line: the code linter does not read style files at all.
#
# The first parameter is the base: the branch against which the contribution is counted. Empty means
# there is no remote, and then everything runs: a set stricter than needed is safe, a set narrower
# than needed is not.
#
# The build runs alongside the lint and the specs. The linter does not read types, and the specs
# read only what someone brought into them by an import: a type error in uncovered code lives until
# the image build, that is, until the merge. It costs little — beyond that the runner cache works.
#
# A newly created check goes here, not only into the general run that nobody calls by themselves. A
# new line in its list of known cases leaves for the main branch silently, while the list is read as
# a working guard.
#
# The layout audit goes as the first line, for two reasons. It costs seconds, so it refuses before
# the long run begins. And before it, a drift of the laid-out copy from the package refused nothing.
# An edit put into the laid-out copy past the source breaks nothing on the day it is made, and
# surfaces on someone else's work: the layout refuses on the whole edited file and lays down not one
# other. The sign is the layout settings themselves: a tree without them does not install the
# package, and there is nothing to call in it.
#
# Whether the branch touched only texts. Zero code — only texts, otherwise — code.
#
# The sign is needed by the tree that added a heavy step to the gate set: a stand, showcase
# snapshots, image builds. Without it such a step runs every time, whatever the branch is, and the
# push of a commit that changed one line in a markdown table takes minutes. In those minutes the
# owner manages to read it as hung and refuse it. The delivery rule demands the same from the
# pipeline: a branch that touched not one line of code raises no stand, takes no frames and builds
# no images.
#
# A branch counts as textual when every touched file is either `.md` or lies under the texts
# directory. Everything else, including the harness and settings, counts as code: the sign must err
# towards an extra run, not a missed one. An empty base means there is nothing to compare with —
# then the sign stays silent and everything runs.
rt_push_docs_only_default() {
    [ -z "$1" ] && return 1
    changed="$(git diff --name-only "$1"...HEAD 2>/dev/null)"
    [ -z "$changed" ] && return 1
    printf '%s\n' "$changed" | grep -qvE "(^${RT_DOCS_DIR:-docs}/|\.md\$)" && return 1

    return 0
}

# A push that edits the guards in a tree without a run file names the missing file. Without the
# file the line of the guard scenarios dropped out of the set in silence, and a push editing the
# guards ran not one scenario. The line passes rather than refuses: a tree that installs the package
# gets its guards by the layout, and every upgrade edits them. Scenario SC-AK-1248.
rt_push_hooks_gap() {
    [ -n "$2" ] || return 0
    [ -x "$1/$RT_HOOKS_TESTS" ] && return 0
    git -C "$1" diff --name-only "$2...HEAD" 2>/dev/null | grep -q '^\.claude/hooks/' || return 0
    printf '%s\n' "echo 'guard scenarios: $RT_HOOKS_TESTS is missing, the edited guards run no scenario'"
}

rt_push_checks_default() {
    runner="$(rt_runner)"
    root="${CLAUDE_PROJECT_DIR:-.}"
    [ -f "$root/.claude/rt-kit.json" ] && printf '%s\n' "$runner agent-kit sync --check"
    if [ -n "$1" ]; then
        printf '%s\n' "$runner nx affected -t lint test build --base=$1"
    else
        printf '%s\n' "$runner nx run-many -t lint test build --all"
    fi
    [ -f "$root/stylelint.config.js" ] && printf '%s\n' "$runner stylelint \"**/*.scss\" --max-warnings 0"

    # The guard scenarios are the same code as everything else: both the branch review and the
    # confidence that the harness still works rest on them. The run takes seconds: it builds
    # nothing.
    [ -x "$root/$RT_HOOKS_TESTS" ] && printf '%s\n' "bash $RT_HOOKS_TESTS"
    rt_push_hooks_gap "$root" "$1"

    for check in check-doc-paths check-specs check-file-size check-dupes check-styles \
        check-glossary check-lib-layers check-reuse check-schema-drift check-states check-state-next \
        check-turn-map check-work-steps check-spec-coverage check-archive-age check-profile-drift \
        check-hook-scope check-push-gate; do
        [ -f "$root/$RT_CHECKS_DIR/$check.mjs" ] && printf '%s\n' "node $RT_CHECKS_DIR/$check.mjs"
    done

    return 0
}

# Is a check of the gate set heavy: success — it builds, raises or shoots, and costs minutes. After
# the first red check the gate still runs the light ones, so that one refusal names every red among
# them; a heavy one is not started then — its minutes buy nothing while the push is refused anyway.
# Before, the gate left on the first red, and every fix opened the next reason by a push of its own.
rt_push_check_heavy_default() {
    case "$1" in
        *' nx '* | *'nx affected'* | *'nx run'* | *'docker '* | *playwright* | *e2e*) return 0 ;;
    esac

    return 1
}

# How many seconds a check of the set may take, by the tree's own measurements. Silence — no limit.
# A check that went over its limit is red even when it passed: a set that grew silently costs every
# push, and nobody notices the minutes until the owner does. The package measures nothing itself.
rt_push_check_budget_default() {
    return 0
}

# What the refusal of an over-limit check says after the numbers. Silence — the numbers alone.
rt_push_over_budget_words_default() {
    return 0
}
