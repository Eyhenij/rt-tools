#!/usr/bin/env bash
# Сценарии отправки в ветку влитой заявки.
#
# Хост здесь не спрашивается: ответ о влитой заявке подставляет надстройка профиля в дереве
# фикстуры, как и в соседних наборах гарда поставки.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "отправка во влитую ветку"

# Решение гарда при своём корне дерева фикстуры: профиль он ищет от корня.
dlv() {
    local label="$1" dir="$2" cmd="$3" want="$4" out
    out="$(CLAUDE_PROJECT_DIR="$dir" input_cmd "$cmd" Bash "$dir" \
        | CLAUDE_PROJECT_DIR="$dir" "$HOOKS/git-guard-delivery.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecision // "PASS"' 2>/dev/null)"
    report "$label" "${out:-PASS}" "$want"
}

# Дерево фикстуры, где хост отвечает номером влитой заявки — или молчит.
merged_repo() {
    local dir
    dir="$(fixture_repo_branched main RT-130-merged)"
    mkdir -p "$dir/.claude/rt-kit"
    printf 'rt_pull_merged() { printf "%%s" "%s"; }\n' "$1" > "$dir/.claude/rt-kit/project.sh"
    printf '%s' "$dir"
}

# --- SC-AK-1233 — отправка в ветку влитой заявки отбита --------------------------------------
# Владелец влил заявку, хост удалил ветку, а исполнитель закоммитил в неё разбор и отправил: ветка
# вернулась с коммитом, который никто не вольёт.
MERGED="$(merged_repo 2902)"
dlv "SC-AK-1233 — отправка текущей ветки влитой заявки отбита" "$MERGED" \
    'git push origin RT-130-merged' deny
dlv "SC-AK-1233 — отправка без имени ветки судит текущую" "$MERGED" 'git push' deny
dlv "SC-AK-1233 — отправка с подставленным ключом и хвостом команды отбита" "$MERGED" \
    "git -c credential.helper= -c credential.helper='!f() { echo username=x; }; f' push -u origin HEAD:RT-130-merged 2>&1 | tail -5" deny
dlv "SC-AK-1233 — пробная отправка не судится" "$MERGED" 'git push --dry-run origin RT-130-merged' PASS

OPEN="$(merged_repo '')"
dlv "SC-AK-1233 — ветка без влитой заявки отправляется" "$OPEN" 'git push origin RT-130-merged' PASS

# Профиль без функции — умолчание спрашивает помощника очереди, а его в дереве фикстуры нет: ярус
# не судится.
SILENT="$(fixture_repo_branched main RT-131-silent)"
mkdir -p "$SILENT/.claude/rt-kit"
: > "$SILENT/.claude/rt-kit/project.sh"
dlv "SC-AK-1233 — без функции профиля отправка проходит" "$SILENT" 'git push origin RT-131-silent' PASS

rm -rf "$MERGED" "$OPEN" "$SILENT"

# Итог стоит последней строкой.
suite_result "отправка во влитую ветку"
