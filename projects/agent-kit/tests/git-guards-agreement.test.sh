#!/usr/bin/env bash
# Сценарии невлитой договорённости при открытии заявки: что требует заявка в главную ветку и что
# проходит в ветку эпика. Договорённость находится по строке `**Draft:**` из плана в истории ветки.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "договорённость при открытии заявки"

REPO_WORK="$(fixture_repo RT-7-probe)"
export CLAUDE_PROJECT_DIR="$REPO_WORK"
cleanup() { rm -rf "$REPO_WORK"; }
trap cleanup EXIT

mg() { expect_decision "$1" git-guard-delivery.sh "$(input_cmd "$3" Bash "$2")" "$4"; }

# SC-AK-1249. Папка разобрана, а договорённость из шапки плана осталась в proposed/: прежде
# заявка открывалась, и договорённость уезжала в главную невлитой.
DRAFT="$(fixture_repo_branched main RT-45-probe)"
fixture_commit "$DRAFT" docs/tasks/RT-45-probe/plan.md '**Draft:** `docs/specs/d/proposed/f/`' 'docs: замысел'
fixture_commit "$DRAFT" docs/specs/d/proposed/f/spec.md 'договорённость' 'docs: договорённость'
fixture_commit "$DRAFT" docs/archive/razbor.md 'что решали' 'docs: разбор в архив'
fixture_remove "$DRAFT" docs/tasks/RT-45-probe 'docs: папка разобрана'
mg "SC-AK-1249 — невлитая договорённость отбивает открытие" "$DRAFT" 'gh pr create --title "[RT-45] Сделано" --body x' deny
expect_reason "SC-AK-1249 — отказ называет каталог договорённости" git-guard-delivery.sh \
    "$(input_cmd 'gh pr create --title "[RT-45] Сделано" --body x' Bash "$DRAFT")" 'docs/specs/d/proposed/f'
mg "SC-AK-1249 — обход папки снимает и договорённость" "$DRAFT" \
    'gh pr create --title "[RT-45] Сделано" --body x # Task-folder-skip: работа вливается частями' PASS
fixture_remove "$DRAFT" docs/specs/d/proposed/f 'docs: договорённость влита'
mg "SC-AK-1249 — влитая договорённость не мешает" "$DRAFT" 'gh pr create --title "[RT-45] Сделано" --body x' PASS
rm -rf "$DRAFT"

# SC-AK-1296. Договорённость эпика живёт до его последней задачи: заявка задачи идёт в ветку эпика
# и в главную её не несёт, а заявка эпика в главную судится по замыслам всех его задач.
EPIC_DRAFT="$(fixture_repo_branched main RT-46-probe)"
fixture_commit "$EPIC_DRAFT" docs/tasks/RT-46-probe/plan.md '**Draft:** `docs/specs/d/proposed/f/`' 'docs: замысел'
fixture_commit "$EPIC_DRAFT" docs/specs/d/proposed/f/spec.md 'договорённость' 'docs: договорённость'
fixture_commit "$EPIC_DRAFT" docs/archive/razbor.md 'что решали' 'docs: разбор в архив'
fixture_remove "$EPIC_DRAFT" docs/tasks/RT-46-probe 'docs: папка разобрана'
mg "SC-AK-1296 — заявка в ветку эпика с договорённостью открывается" "$EPIC_DRAFT" \
    'gh pr create --title "[RT-46] Сделано" --base RT-40-epic --body x' PASS
mg "SC-AK-1296 — заявка в главную по имени отбивается" "$EPIC_DRAFT" \
    'gh pr create --title "[RT-46] Сделано" --base main --body x' deny
git -C "$EPIC_DRAFT" checkout -q -b RT-40-epic
mg "SC-AK-1296 — заявка эпика в главную судится по замыслу его задачи" "$EPIC_DRAFT" \
    'gh pr create --title "[RT-40] Эпик" --base main --body x' deny
expect_reason "SC-AK-1296 — отказ заявке эпика называет каталог договорённости" git-guard-delivery.sh \
    "$(input_cmd 'gh pr create --title "[RT-40] Эпик" --base main --body x' Bash "$EPIC_DRAFT")" 'docs/specs/d/proposed/f'
fixture_remove "$EPIC_DRAFT" docs/specs/d/proposed/f 'docs: договорённость влита'
mg "SC-AK-1296 — влитая договорённость эпика не мешает" "$EPIC_DRAFT" \
    'gh pr create --title "[RT-40] Эпик" --base main --body x' PASS
rm -rf "$EPIC_DRAFT"

suite_result "договорённость при открытии заявки"
