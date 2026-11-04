#!/usr/bin/env bash
# Сценарии гарда главной ветки: откуда он берёт её имя.
#
# Отдельный файл, потому что набор гардов поставки упёрся в предел длины. Здесь судится одно —
# имя главной ветки: из профиля дерева, где идёт коммит, а без него — угадыванием по указателю
# удалённого репозитория, как прежде.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард главной ветки"

# Дерево без удалённого репозитория, чей профиль называет главной `develop`.
DEVELOP="$(fixture_repo develop)"
mkdir -p "$DEVELOP/.claude/rt-kit"
printf 'RT_MAIN_BRANCH=develop\n' > "$DEVELOP/.claude/rt-kit/project.sh"
# То же дерево на ветке `main`: её профиль главной не считает.
DEVELOP_ON_MAIN="$(fixture_repo main)"
mkdir -p "$DEVELOP_ON_MAIN/.claude/rt-kit"
printf 'RT_MAIN_BRANCH=develop\n' > "$DEVELOP_ON_MAIN/.claude/rt-kit/project.sh"
# Дерево без настройки — прежнее угадывание.
PLAIN="$(fixture_repo main)"
cleanup() { rm -rf "$DEVELOP" "$DEVELOP_ON_MAIN" "$PLAIN"; }
trap cleanup EXIT

# Сессия стоит в другом дереве: профиль берётся из дерева, где идёт коммит.
export CLAUDE_PROJECT_DIR="$PLAIN"
unset RT_MAIN_BRANCH

m() { expect_decision "$1" git-guard-main.sh "$(input_cmd 'git commit -m "chore: x"' Bash "$2")" "$3"; }

m "SC-AK-1252 — коммит в главную по профилю отбивается" "$DEVELOP" deny
m "SC-AK-1252 — коммит в main, которую профиль главной не назвал, проходит" "$DEVELOP_ON_MAIN" PASS
m "SC-AK-1252 — без настройки в профиле main по-прежнему главная" "$PLAIN" deny
expect_reason "SC-AK-1252 — отказ называет ветку из профиля" git-guard-main.sh \
    "$(input_cmd 'git commit -m "chore: x"' Bash "$DEVELOP")" '«develop»'

suite_result "гард главной ветки"
