#!/usr/bin/env bash
# The choice of the sets over the tree's checks a change reaches: a change of texts and the agent's
# harness runs only the sets that name a changed file, anything else runs every set.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the sets a change reaches"

pick() { printf '%s\n' "$@" | bash "$TOOLS/tests/select.sh" | tr '\n' ' ' | sed 's/ $//'; }
has() { case " $1 " in *" $2 "*) printf yes ;; *) printf no ;; esac; }

profile="$(pick .claude/rt-kit/project.sh)"
report "the tree profile runs the set that copies it" "$(has "$profile" push-heavy-subjects.test.sh)" yes
report "the tree profile skips a set that never reads it" "$(has "$profile" check-tokens-graph.test.sh)" no
report "a guard runs the set that calls it" "$(has "$(pick .claude/hooks/bound-guard.sh)" rules-graph.test.sh)" yes
# The name is built at run time: written here whole, it would be named by this very set.
report "a text alone runs no set" "[$(pick "docs/$(printf 'probe-%s' text).md")]" '[]'

# A check, its data or anything a check reads from the live tree: every set runs.
report "a check of the tree runs every set" "$(pick tools/visual-gate.mjs)" all
report "a kit file runs every set" "$(pick projects/ui-kit-v2/src/a.ts)" all
report "the harness of the sets runs every set" "$(pick tools/tests/lib.sh)" all
report "the selection itself runs every set" "$(pick .claude/rt-kit/project.sh tools/tests/select.sh)" all

suite_result "select"
