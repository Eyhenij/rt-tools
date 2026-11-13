#!/usr/bin/env bash
# Which scenario files a package change reaches. Reads the changed paths, one per line, from the
# repository root; prints the scenario files to run, or nothing when every file must run.
#
# Only a change of scenario files, hooks and defaults is narrowed. A file reaches a hook by naming
# it, or by naming a hook that sources it, to any depth; it reaches the defaults by naming them, or
# by running a hook that loads them. The edited guard keeps all its scenarios, so a moved boundary is
# still caught. Any other path of the package — the harness, a check, a rule, this file — runs all.
# On 13.11.2026 a change of three hooks ran all 130 files for 261 s, while 45 reached the change.
cd "$(dirname "${BASH_SOURCE[0]}")" || exit 0

rt_select_suites() {
local changed names defaults prev n h b
changed="$(grep '^projects/agent-kit/')"
[ -n "$changed" ] || return 0
printf '%s\n' "$changed" |
    grep -qvE '^projects/agent-kit/(tests/[^/]*\.test\.sh|assets/hooks/[^/]*\.sh|assets/defaults/[^/]*\.sh)$' && return 0

names="$(printf '%s\n' "$changed" | sed -n 's#^projects/agent-kit/assets/hooks/\(.*\)\.sh$#\1#p')"
defaults=""
printf '%s\n' "$changed" | grep -q '^projects/agent-kit/assets/defaults/' && defaults=1
[ -n "$defaults" ] && names="$names $(grep -l 'defaults/' ../assets/hooks/*.sh | sed 's#.*/##; s#\.sh$##')"

prev=""
while [ "$names" != "$prev" ]; do
    prev="$names"
    for n in $names; do
        for h in $(grep -l -- "$n\.sh" ../assets/hooks/*.sh 2>/dev/null); do
            b="$(basename "$h" .sh)"
            case " $names " in *" $b "*) ;; *) names="$names $b" ;; esac
        done
    done
done

{
    printf '%s\n' "$changed" | sed -n 's#^projects/agent-kit/tests/##p' | while read -r f; do [ -f "$f" ] && printf '%s\n' "$f"; done
    for n in $names; do grep -l -- "$n" ./*.test.sh | sed 's#^\./##'; done
    [ -n "$defaults" ] && grep -l 'DEFAULTS\|defaults/' ./*.test.sh | sed 's#^\./##'
} 2>/dev/null | sort -u
}

rt_select_suites
