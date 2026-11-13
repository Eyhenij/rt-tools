#!/usr/bin/env bash
# Scenarios of choosing the scenario files a package change reaches. The selection is asked about
# the live package: the hooks and the scenario files themselves are what it reads.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the push set: scenario files a package change reaches"

pick() { printf '%s\n' "$@" | bash "$(dirname "${BASH_SOURCE[0]}")/select-suites.sh"; }
has() { printf '%s\n' "$1" | grep -qx -- "$2" && printf yes || printf no; }
count() { printf '%s\n' "$1" | grep -c .; }

total="$(ls "$(dirname "${BASH_SOURCE[0]}")"/*.test.sh | grep -c .)"

one_hook="$(pick projects/agent-kit/assets/hooks/push-set.sh)"
report "SC-AK-1352 — a hook change runs its own scenario file" "$(has "$one_hook" pre-push.test.sh)" yes
report "SC-AK-1352 — a hook change runs the file of a hook that sources it" "$(has "$one_hook" git-guard-push-tests.test.sh)" yes
report "SC-AK-1352 — a hook change skips a file that never reaches it" "$(has "$one_hook" grill-gate.test.sh)" no
report "SC-AK-1352 — a hook change runs fewer files than all" "$([ "$(count "$one_hook")" -lt "$total" ] && echo yes)" yes

with_defaults="$(pick projects/agent-kit/assets/defaults/push.sh)"
report "SC-AK-1352 — a defaults change runs the scenarios of the defaults" "$(has "$with_defaults" defaults.test.sh)" yes
report "SC-AK-1352 — a defaults change runs a file of a hook that loads them" "$(has "$with_defaults" pre-push.test.sh)" yes

report "SC-AK-1352 — a changed scenario file runs itself" "$(has "$(pick projects/agent-kit/tests/push-over-budget.test.sh)" push-over-budget.test.sh)" yes

# The harness, the runner, a check or a rule of the package: every file runs, the answer is empty.
report "SC-AK-1352 — a change of the harness runs every file" "[$(pick projects/agent-kit/tests/lib.sh)]" '[]'
report "SC-AK-1352 — a change of the runner runs every file" "[$(pick projects/agent-kit/tests/run.sh)]" '[]'
report "SC-AK-1352 — a change of the selection runs every file" "[$(pick projects/agent-kit/tests/select-suites.sh)]" '[]'
report "SC-AK-1352 — a hook next to a check runs every file" \
    "[$(pick projects/agent-kit/assets/hooks/push-set.sh projects/agent-kit/assets/checks/x.mjs)]" '[]'
report "SC-AK-1352 — a change outside the package runs every file" "[$(pick docs/x.md)]" '[]'

suite_result "select-suites"
