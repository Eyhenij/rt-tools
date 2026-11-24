#!/usr/bin/env bash
# Сценарии отказа на составной команде: защита места правки и страж хода называют кусок, который
# судили, и говорят, что остальные куски не исполнились.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "отказ на составной команде"

CC="$(fixture_repo_branched main RT-1946-parts)"
trap 'rm -rf "$CC"' EXIT
mkdir -p "$CC/tools" "$CC/.claude/rt-kit" "$CC/docs/tasks/RT-1946-parts"
printf '#!/usr/bin/env node\n// rt-kit v1.0.0 · checks/laid.mjs · abc123\n' > "$CC/tools/laid.mjs"
printf '# Ход\n' > "$CC/docs/tasks/RT-1946-parts/progress.md"
git -C "$CC" add -A && git -C "$CC" -c user.name=t -c user.email=t@e -c commit.gpgsign=false commit -qm tree

# Слова отказа защиты на команде.
said() {
    input_cmd "$2" Bash "$CC" | (cd "$CC" && CLAUDE_PROJECT_DIR="$CC" "$HOOKS/$1" 2>/dev/null) \
        | jq -r '.hookSpecificOutput.permissionDecisionReason // empty' 2>/dev/null
}
has() { printf '%s' "$1" | grep -qF "$2" && echo да || echo нет; }
PLACE=rule-source-guard.sh
STEPS=flow-step-guard.sh
PROGRESS=docs/tasks/RT-1946-parts/progress.md

place="$(said $PLACE 'git status; sed -i "" s/a/b/ tools/laid.mjs && pnpm test')"
report "SC-AK-1946 — место правки: назван судимый кусок" "$(has "$place" 'judged here: `sed -i "" s/a/b/ tools/laid.mjs`')" да
report "SC-AK-1946 — место правки: сказано, что остальное не исполнилось" "$(has "$place" 'none of the 3 parts of the command ran')" да
steps="$(said $STEPS "pnpm test && echo 'шаг; сделан' >> $PROGRESS && git add -A")"
report "SC-AK-1946 — шаги: назван судимый кусок" "$(has "$steps" "judged here: \`echo 'шаг; сделан' >> $PROGRESS\`")" да
report "SC-AK-1946 — шаги: сказано, что остальное не исполнилось" "$(has "$steps" 'none of the 3 parts of the command ran')" да
report "SC-AK-1946 — чтение того же файла рядом куском записи не названо" \
    "$(has "$(said $STEPS "cat $PROGRESS | head -1; printf x > $PROGRESS")" "judged here: \`printf x > $PROGRESS\`")" да
report "SC-AK-1946 — место правки: простая команда — отказ без лишних слов" "$(has "$(said $PLACE 'sed -i "" s/a/b/ tools/laid.mjs')" 'judged here')" нет
report "SC-AK-1946 — шаги: простая команда — отказ без лишних слов" "$(has "$(said $STEPS "echo x >> $PROGRESS")" 'judged here')" нет
report "SC-AK-1946 — место правки: простая команда всё же отказана" "$([ -n "$(said $PLACE 'sed -i "" s/a/b/ tools/laid.mjs')" ] && echo да || echo нет)" да
report "SC-AK-1946 — команда в несколько строк через черту — один кусок" "$(has "$(said $PLACE 'sed -i "" \
    s/a/b/ \
    tools/laid.mjs')" 'judged here')" нет
report "SC-AK-1946 — чтение рядом с правкой через тело записи не названо" "$(has "$(said $STEPS "grep -n x $PROGRESS; python3 - <<'PY'
open('$PROGRESS', 'w').write('x')
PY")" 'judged here')" нет
report "SC-AK-1946 — стрелка в кавычках чтения — не запись" \
    "$(has "$(said $PLACE 'grep -n "a > b" tools/laid.mjs; cp x tools/laid.mjs')" 'judged here: `cp x tools/laid.mjs`')" да
report "SC-AK-1946 — апостроф комментария слов не снимает" "$(has "$(said $PLACE "# don't
ls; cp x tools/laid.mjs")" 'judged here: `cp x tools/laid.mjs`')" да
report "SC-AK-1946 — шаги: простая команда всё же отказана" "$([ -n "$(said $STEPS "echo x >> $PROGRESS")" ] && echo да || echo нет)" да

suite_result "отказ на составной команде"
