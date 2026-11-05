#!/usr/bin/env bash
# Сценарии черновика на базе без прогона: `--draft` отказывает там, где конвейер не просыпается.
#
# Фикстура кладёт файл конвейера и настройку дерева, которая его называет. Набор судит только
# фразу о черновике: остальные условия поставки в фикстуре не сходятся, и это не его предмет.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "черновик на базе без прогона"

draft_refusal() {
    CLAUDE_PROJECT_DIR="$1" input_cmd "$2" Bash "$1" \
        | CLAUDE_PROJECT_DIR="$1" "$HOOKS/git-guard-delivery.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecisionReason // ""' 2>/dev/null \
        | grep -c 'a draft into'
}

# Дерево с конвейером: довод — текст файла конвейера. Пусто — настройка называет файл, которого нет.
pipeline_repo() {
    local dir
    dir="$(fixture_repo_branched main RT-90-draft)"
    mkdir -p "$dir/.claude/rt-kit" "$dir/.github/workflows"
    printf '{"pushGate":{"pipelineFile":".github/workflows/ci.yml"}}\n' > "$dir/.claude/rt-kit/checks.json"
    [ -n "$1" ] && printf '%s\n' "$1" > "$dir/.github/workflows/ci.yml"
    printf '%s' "$dir"
}

LISTED="$(pipeline_repo 'on:
    pull_request:
        branches:
            - main
            - "release/**" # выпуски
    push:
        branches:
            - never-a-pull')"

# SC-AK-1256. На базу, для которой конвейер не просыпается, черновик ждал бы прогон вечно.
report "SC-AK-1256 — черновик в ветку без прогона отказан" \
    "$(draft_refusal "$LISTED" 'gh pr create --title "[RT-90] Сделано" --draft --base RT-1-epic --body-file b.md')" 1
report "SC-AK-1256 — короткий флаг и форма через равно судятся так же" \
    "$(draft_refusal "$LISTED" 'gh pr create --title "[RT-90] Сделано" -d --base=RT-1-epic --body-file b.md')" 1
report "SC-AK-1256 — ветка из секции push базой конвейера не считается" \
    "$(draft_refusal "$LISTED" 'gh pr create --title "[RT-90] Сделано" --draft --base never-a-pull')" 1
said="$(CLAUDE_PROJECT_DIR="$LISTED" input_cmd 'gh pr create --title "[RT-90] Сделано" --draft --base RT-1-epic' Bash "$LISTED" \
    | CLAUDE_PROJECT_DIR="$LISTED" "$HOOKS/git-guard-delivery.sh" 2>/dev/null \
    | jq -r '.hookSpecificOutput.permissionDecisionReason // ""' 2>/dev/null)"
case "$said" in
    *'RT-1-epic'*'ci.yml'*'main release/**'*'without --draft'*) report "SC-AK-1256 — отказ называет базу, файл, его ветки и выход" да да ;;
    *) report "SC-AK-1256 — отказ называет базу, файл, его ветки и выход" нет да ;;
esac

# SC-AK-1257. Там, где прогон придёт, черновик законен; без `--draft` судить нечего.
report "SC-AK-1257 — черновик в ветку с прогоном проходит" \
    "$(draft_refusal "$LISTED" 'gh pr create --title "[RT-90] Сделано" --draft --base main')" 0
report "SC-AK-1257 — база без имени — главная ветка, и прогон придёт" \
    "$(draft_refusal "$LISTED" 'gh pr create --title "[RT-90] Сделано" --draft --body-file b.md')" 0
report "SC-AK-1257 — шаблон из файла конвейера покрывает ветку" \
    "$(draft_refusal "$LISTED" 'gh pr create --title "[RT-90] Сделано" --draft --base release/1.2')" 0
report "SC-AK-1257 — заявка без черновика не судится" \
    "$(draft_refusal "$LISTED" 'gh pr create --title "[RT-90] Сделано" --base RT-1-epic --body-file b.md')" 0
report "SC-AK-1257 — слово в заголовке черновиком не считается" \
    "$(draft_refusal "$LISTED" 'gh pr create --title "[RT-90] Флаг --draft в тексте" --base RT-1-epic')" 0
report "SC-AK-1257 — --draft=false черновиком не считается" \
    "$(draft_refusal "$LISTED" 'gh pr create --title "[RT-90] Сделано" --draft=false --base RT-1-epic')" 0

# SC-AK-1258. Настройка и файл читаются из дерева; что не прочитано, то не судится.
INLINE="$(pipeline_repo 'on:
    pull_request:
        branches: [main, "next"]')"
report "SC-AK-1258 — строчная форма списка читается: чужая база отказана" \
    "$(draft_refusal "$INLINE" 'gh pr create --title "[RT-90] Сделано" --draft --base RT-1-epic')" 1
report "SC-AK-1258 — строчная форма списка читается: своя база проходит" \
    "$(draft_refusal "$INLINE" 'gh pr create --title "[RT-90] Сделано" --draft --base next')" 0

ANY="$(pipeline_repo 'on:
    pull_request:
    push:
        branches:
            - main')"
report "SC-AK-1258 — без фильтра веток конвейер просыпается на всё" \
    "$(draft_refusal "$ANY" 'gh pr create --title "[RT-90] Сделано" --draft --base RT-1-epic')" 0

TARGET="$(pipeline_repo 'on:
    pull_request_target:
        branches:
            - main')"
report "SC-AK-1258 — чужой триггер базами не считается" \
    "$(draft_refusal "$TARGET" 'gh pr create --title "[RT-90] Сделано" --draft --base RT-1-epic')" 0

MISSING="$(pipeline_repo '')"
report "SC-AK-1258 — файла конвейера нет: не судится" \
    "$(draft_refusal "$MISSING" 'gh pr create --title "[RT-90] Сделано" --draft --base RT-1-epic')" 0

BARE="$(fixture_repo_branched main RT-90-draft)"
report "SC-AK-1258 — дерево без настройки не судится" \
    "$(draft_refusal "$BARE" 'gh pr create --title "[RT-90] Сделано" --draft --base RT-1-epic')" 0

rm -rf "$LISTED" "$INLINE" "$ANY" "$TARGET" "$MISSING" "$BARE"

suite_result "черновик на базе без прогона"
