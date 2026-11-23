#!/usr/bin/env bash
# Сценарии базы набора перед пушем по веткам, которые держит хостинг. Не самостоятельный набор:
# его подключает `git-guard-push-tests.test.sh`, и он пишет в общий счёт этого набора. Помощники
# `report`, `fixture_*`, `push_base` и `$HOOKS` — оттуда и из `lib.sh`.
#
# 21.11 набор взял базой ссылку ветки, которую хостинг снял после слияния, и шёл 1 895 с. Через
# шесть минут соседняя сессия почистила ссылки копии, проверка отправки выбрала главную ветку и
# отказала: «No green mark for this tree and base». Набор и отправка считали базу каждый сам.

# Цепочка как в эпике: главная, ветка эпика, нижняя задача и верхняя, все на сервере.
live_git() {
    git -C "$LIVE" -c user.name=probe -c user.email=probe@example.invalid -c commit.gpgsign=false "$@"
}
LIVE_REMOTE="$(mktemp -d)"
git init -q --bare "$LIVE_REMOTE" 2>/dev/null
LIVE="$(fixture_repo_branched main RT-90-epic)"
git -C "$LIVE" remote add origin "$LIVE_REMOTE"
fixture_commit "$LIVE" epic.txt эпик 'feat: ветка эпика'
live_git push -q origin main RT-90-epic 2>/dev/null
live_git checkout -q -b RT-91-low RT-90-epic 2>/dev/null
fixture_commit "$LIVE" low.txt низ 'feat: нижняя ветка'
live_git push -q origin RT-91-low 2>/dev/null
live_git checkout -q -b RT-92-top RT-91-low 2>/dev/null
fixture_commit "$LIVE" top.txt верх 'feat: верхняя ветка'
report "SC-AK-1850 — пока хостинг держит нижнюю ветку, база — она" "$(push_base "$LIVE")" origin/RT-91-low

# --- SC-AK-1850. Ссылка ветки, снятой на хостинге, базой не бывает ------------------------------
# Хостинг снял нижнюю ветку, ссылка на неё в копии осталась: выборка идёт без чистки ссылок.
git -C "$LIVE_REMOTE" update-ref -d refs/heads/RT-91-low 2>/dev/null
report "SC-AK-1850 — ссылка снятой ветки не база: база — ветка эпика" "$(push_base "$LIVE")" origin/RT-90-epic
# Соседняя сессия почистила ссылки между набором и отправкой: база та же.
live_git branch -q -D -r origin/RT-91-low 2>/dev/null
report "SC-AK-1850 — чистка ссылок между набором и отправкой базу не меняет" "$(push_base "$LIVE")" origin/RT-90-epic
# Имя сверяется целиком: живая ветка с тем же началом не держит снятую. Она стоит вне истории
# головы и сама базой быть не может.
live_git update-ref refs/remotes/origin/RT-91-low RT-91-low 2>/dev/null
live_git checkout -q -b RT-91-low-next main 2>/dev/null
fixture_commit "$LIVE" next.txt рядом 'feat: соседняя ветка'
live_git push -q origin RT-91-low-next 2>/dev/null
live_git checkout -q RT-92-top 2>/dev/null
report "SC-AK-1850 — живая ветка с тем же началом имени снятую не держит" "$(push_base "$LIVE")" origin/RT-90-epic

# --- SC-AK-1851. Хостинг не ответил: база по ссылкам копии, и об этом сказано --------------------
# Без ответа хостинга фильтр живых веток ничего не знает: решают ссылки копии, как до этой правки,
# а выбор пишет строку, что хостинг молчал.
live_git remote set-url origin "$LIVE_REMOTE.gone"
report "SC-AK-1851 — хостинг не ответил: база по ссылкам копии" "$(push_base "$LIVE" 2>/dev/null)" origin/RT-91-low
fixture_commit "$LIVE" .claude/rt-kit/project.sh "rt_push_checks() { printf '%s\\n' 'true'; }" 'chore: профиль'
live_ahead_says="$(cd "$LIVE" && bash "$HOOKS/git-guard-push-ahead.sh" 2>&1)"
case "$live_ahead_says" in
    *'the host did not answer'*) report "SC-AK-1851 — прогон вперёд говорит, что хостинг не ответил" да да ;;
    *) report "SC-AK-1851 — прогон вперёд говорит, что хостинг не ответил" нет да ;;
esac
rm -rf "$LIVE" "$LIVE_REMOTE"

# --- SC-AK-1852. Отправка берёт базу прогона вперёд, пока дерево то же ----------------------------
# Строка тяжёлого шага называет базу, как в профиле дерева: отправка с другой базой ищет отметку
# другой строки и не находит её.
pin_git() {
    git -C "$PIN" -c user.name=probe -c user.email=probe@example.invalid -c commit.gpgsign=false "$@"
}
PIN_REMOTE="$(mktemp -d)"
PIN_RUNS="$(mktemp)"
git init -q --bare "$PIN_REMOTE" 2>/dev/null
PIN="$(fixture_repo_branched main RT-95-epic)"
git -C "$PIN" remote add origin "$PIN_REMOTE"
fixture_commit "$PIN" epic.txt эпик 'feat: ветка эпика'
pin_git push -q origin main RT-95-epic 2>/dev/null
pin_git checkout -q -b RT-96-low RT-95-epic 2>/dev/null
fixture_commit "$PIN" low.txt низ 'feat: нижняя ветка'
pin_git push -q origin RT-96-low 2>/dev/null
pin_git checkout -q -b RT-97-top RT-96-low 2>/dev/null
fixture_commit "$PIN" .claude/rt-kit/project.sh "RT_PUSH_HEAVY_AHEAD=1
rt_push_check_heavy() { case \"\$1\" in *heavy*) return 0 ;; esac; return 1; }
rt_push_checks() { printf '%s\\n' 'true' \"echo heavy \$1 >> $PIN_RUNS\"; }" 'chore: профиль'
(cd "$PIN" && bash "$HOOKS/git-guard-push-ahead.sh" >/dev/null 2>&1)
report "SC-AK-1852 — прогон вперёд от нижней ветки зелёный" "$?" 0

# Хостинг влил нижнюю ветку в ветку эпика и снял её, пока шёл набор.
git -C "$PIN_REMOTE" update-ref refs/heads/RT-95-epic "$(pin_git rev-parse RT-96-low)" 2>/dev/null
git -C "$PIN_REMOTE" update-ref -d refs/heads/RT-96-low 2>/dev/null
report "SC-AK-1852 — заново выбранная база была бы веткой эпика" "$(push_base "$PIN")" origin/RT-95-epic
gate "SC-AK-1852 — нижняя ветка влита и снята во время набора: отправка проходит по отметкам" \
    "$PIN" 'git push origin RT-97-top' PASS
# Соседняя копия почистила ссылки: ссылка базы встаёт обратно на записанный коммит.
pin_git branch -q -D -r origin/RT-96-low 2>/dev/null
gate "SC-AK-1852 — ссылка базы снята чисткой: отправка проходит по отметкам" \
    "$PIN" 'git push origin RT-97-top' PASS
report "SC-AK-1852 — тяжёлый шаг прогнан один раз" "$(grep -c heavy "$PIN_RUNS")" 1

# Новое дерево — новый прогон, база — ветка эпика. Во время набора на хостинге встаёт ветка ближе.
fixture_commit "$PIN" more.txt ещё 'feat: ещё правка'
(cd "$PIN" && bash "$HOOKS/git-guard-push-ahead.sh" >/dev/null 2>&1)
report "SC-AK-1852 — прогон вперёд от ветки эпика зелёный" "$?" 0
pin_git push -q origin 'HEAD~1:refs/heads/RT-98-mid' 2>/dev/null
report "SC-AK-1852 — заново выбранная база была бы ближней веткой" "$(push_base "$PIN")" origin/RT-98-mid
gate "SC-AK-1852 — ближняя ветка встала во время набора: отправка проходит по отметкам" \
    "$PIN" 'git push origin RT-97-top' PASS

# --- SC-AK-1853. Отказ называет обе базы -----------------------------------------------------------
# Дерево сменилось после прогона: база выбрана заново, отметок нет, и отказ называет базу отправки
# и базу последнего прогона в этой копии.
fixture_commit "$PIN" late.txt поздно 'feat: правка после прогона'
pin_says="$(CLAUDE_PROJECT_DIR="$PIN" input_cmd 'git push origin RT-97-top' Bash "$PIN" \
    | CLAUDE_PROJECT_DIR="$PIN" "$HOOKS/git-guard-push-tests.sh" 2>/dev/null \
    | jq -r '.hookSpecificOutput.permissionDecisionReason // ""' 2>/dev/null)"
case "$pin_says" in
    *'The base of this push: origin/RT-98-mid.'*'The base of the last run ahead in this copy: origin/RT-95-epic (another tree).'*)
        report "SC-AK-1853 — отказ «No green mark» называет базу отправки и базу прогона" да да ;;
    *) report "SC-AK-1853 — отказ «No green mark» называет базу отправки и базу прогона" нет да ;;
esac
rm -rf "$PIN" "$PIN_REMOTE" "$PIN_RUNS"
