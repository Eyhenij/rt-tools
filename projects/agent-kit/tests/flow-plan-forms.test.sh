#!/usr/bin/env bash
# Сценарии формы проверок плана: труба без pipefail и ноль, посчитанный `grep -c`, отказаны при
# записи плана. Статья об этом стояла, а план с такими проверками записывался.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "форма проверок плана при записи"

PF="$(fixture_repo_branched main RT-3-forms)"
trap 'rm -rf "$PF"' EXIT
PLAN="$PF/docs/tasks/RT-3-forms/plan.md"
mkdir -p "$(dirname "$PLAN")"

# Текст плана с одной проверкой; $1 — строка проверки целиком.
pf_plan() { printf '# Plan\n\n## Decision\n\nNo decision: probe fixture\n\n## Stages\n\n### 1. Первый\n\n- **Steps:**\n    1. Шаг\n       Check: %s\n' "$1"; }
# Ответ стража на запись плана: отказ — его довод, пусто — прошло.
pf_write() {
    jq -n --arg d "$PF" --arg f "${2:-$PLAN}" --arg c "$(pf_plan "$1")" \
        '{session_id:"tests",tool_name:"Write",cwd:$d,tool_input:{file_path:$f,content:$c}}' \
        | (cd "$PF" && CLAUDE_PROJECT_DIR="$PF" "$HOOKS/flow-step-guard.sh" 2>/dev/null) \
        | jq -r '.hookSpecificOutput.permissionDecisionReason // empty' 2>/dev/null | tr '\n' ' '
}
named() { printf '%s' "$1" | grep -qF "$2" && echo отказ || echo "${1:-прошло}"; }

got="$(pf_write '`cat a.txt | tail -1` → `готово`')"
report "SC-AK-1940 — труба без pipefail отказана и названа" "$(named "$got" 'a pipe without «set -o pipefail;»')" отказ
report "SC-AK-1940 — отказ называет шаг и команду" "$(named "$got" 'step 1.1 is a pipe')/$(named "$got" 'cat a.txt | tail -1')" 'отказ/отказ'
got="$(pf_write '`grep -c слово a.txt` → = 0')"
report "SC-AK-1940 — ноль, посчитанный grep -c, отказан с готовой формой" "$(named "$got" 'grep -q … → exit 1')" отказ
report "SC-AK-1940 — труба с pipefail проходит" "$(pf_write '`set -o pipefail; cat a.txt | tail -1` → `готово`')" ''
report "SC-AK-1940 — «||» и черта в кавычках трубой не считаются" \
    "$(pf_write '`test -f a.txt || grep -E "a|b" b.txt` → exit 0')" ''
report "SC-AK-1940 — счёт найденного проходит" "$(pf_write '`grep -c слово a.txt` → >= 1')" ''
for check in 'grep -cF "а" a.txt` → = 0' 'grep -cE "а|б" a.txt` → = 0' 'grep -ci а a.txt` → = 0' 'rg -c а a.txt` → == 0' 'set -o pipefail; grep а a.txt | wc -l` → = 0'; do
    report "SC-AK-1940 — ноль, посчитанный «${check%%\`*}», отказан" "$(named "$(pf_write "\`$check")" 'grep -q … → exit 1')" отказ
done
report "SC-AK-1940 — pipefail после трубы её не снимает" "$(named "$(pf_write '`cat a | tail -1; set -o pipefail` → `б`')" 'a pipe without')" отказ
report "SC-AK-1940 — ноль образцом отказан" "$(named "$(pf_write '`grep -c а a.txt` → /^0$/')" 'grep -q … → exit 1')" отказ
for check in 'set -eu -o pipefail; ls | wc -l` → = 3' 'test $(grep -c "(x)" f | tr -d " ") -eq 3` → exit 0' 'diff <(ls | sort) f` → exit 0' 'echo ${a:-b|c}` → exit 0' 'grep -c а a.txt || true` → = 0' 'test $(ls a | wc -l) -eq 3` → exit 0' 'test "$(ls a | wc -l)" -eq 3` → exit 0' 'case $x in a|b) true ;; esac` → exit 0' '[[ $x =~ a|b ]]` → exit 0' 'echo a >| f` → exit 0'; do
    report "SC-AK-1940 — «${check%%\`*}» проходит" "$(pf_write "\`$check")" ''
done
report "SC-AK-1940 — другой файл не судится" "$(pf_write '`cat a | tail -1` → `б`' "$PF/docs/plan.md")" ''

# Правка плана судится по тексту после неё.
pf_plan '`true` → exit 0' > "$PLAN"
got="$(jq -n --arg d "$PF" --arg f "$PLAN" '{session_id:"tests",tool_name:"Edit",cwd:$d,tool_input:{file_path:$f,old_string:"`true` → exit 0",new_string:"`ls | head -1` → exit 0"}}' \
    | (cd "$PF" && CLAUDE_PROJECT_DIR="$PF" "$HOOKS/flow-step-guard.sh" 2>/dev/null) | jq -r '.hookSpecificOutput.permissionDecisionReason // empty')"
report "SC-AK-1940 — правка судится по тексту после неё" "$(named "$got" 'a pipe without')" отказ

# Одобренный план: метка стоит — ни запись, ни plan-red формы не спрашивают.
ENGINE="$ASSETS/checks/task-flow-script.mjs"
pf_plan '`cat a.txt 2>/dev/null | tail -1` → `готово`' > "$PLAN"
git -C "$PF" update-ref refs/remotes/origin/main main
git -C "$PF" add -A && git -C "$PF" -c user.name=t -c user.email=t@e -c commit.gpgsign=false commit -qm plan
report "SC-AK-1940 — plan-check называет форму" "$(cd "$PF" && node "$ENGINE" plan-check "$PLAN" | grep -c 'a pipe without')" 1
report "SC-AK-1940 — plan-red одобренного плана формы не спрашивает" \
    "$(cd "$PF" && node "$ENGINE" plan-red 2>&1 | grep -cE '^1\.1 red|a pipe without')/$(cd "$PF" && node "$ENGINE" plan-red 2>&1 | grep -c 'a pipe without')" '1/0'
mkdir -p "$PF/.git/rt-kit/approval" && printf '{}\n' > "$PF/.git/rt-kit/approval/RT-3-forms.json"
report "SC-AK-1940 — план с меткой одобрения при записи не судится" "$(pf_write '`cat a.txt | tail -1` → `готово`')" ''

suite_result "форма проверок плана при записи"
