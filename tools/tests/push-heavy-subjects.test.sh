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
        rt_push_touched() { printf '%s' "$1"; }
        rt_push_checks "$1" 2>/dev/null
    )
}

# Whether a step stands in the set of that subject. The line is matched whole: the first kit's
# frame command is a prefix of the second kit's, and a substring match answers 'yes' about both.
has_step() {
    if steps_for "$1" | grep -qxF "$2"; then printf 'yes'; else printf 'no'; fi
}

report "the second kit pays for its showcase frames" \
    "$(has_step kit2 'node tools/visual-gate.mjs ui-kit-v2')" 'yes'
report "the second kit pays for the admin screens: the admin draws with it" \
    "$(has_step kit2 'pnpm exec nx run message-bus-admin-e2e:e2e')" 'yes'
report "the second kit does not pay for the first one's frames" \
    "$(has_step kit2 'node tools/visual-gate.mjs ui-kit')" 'no'
report "the second kit does not build the images: the suite builds its own stand" \
    "$(steps_for kit2 | grep -c 'docker build')" '0'

report "the first kit pays for its frames" \
    "$(has_step kit1 'node tools/visual-gate.mjs ui-kit')" 'yes'
report "the first kit does not pay for the admin screens: the admin does not use it" \
    "$(has_step kit1 'pnpm exec nx run message-bus-admin-e2e:e2e')" 'no'

report "the receiver pays for the admin screens" \
    "$(has_step receiver 'pnpm exec nx run message-bus-admin-e2e:e2e')" 'yes'
report "the receiver pays for the images" \
    "$(steps_for receiver | grep -c 'docker build')" '2'

# Both subjects call the same step, and they are touched together more often than apart. Printed
# twice, it would be run twice — four extra minutes on every such push.
report "the admin screens are asked once when both subjects are touched" \
    "$(steps_for 'receiver kit2' | grep -cF 'message-bus-admin-e2e:e2e')" '1'

suite_result "the heavy steps a branch pays for"
