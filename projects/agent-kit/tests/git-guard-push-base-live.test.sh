#!/usr/bin/env bash
# Сценарии базы набора перед пушем: ветки, которые держит хостинг, и запись базы прогона вперёд,
# которую берут проверка отправки и хук git. Помощник выбора базы — `git-guard-push-marks.sh`,
# проверка отправки — `git-guard-push-tests.sh`, прогон вперёд — `git-guard-push-ahead.sh`.
#
# 21.11 набор взял базой ссылку ветки, которую хостинг снял после слияния, и шёл 1 895 с. Через
# шесть минут соседняя сессия почистила ссылки копии, проверка отправки выбрала главную ветку и
# отказала: «No green mark for this tree and base». Набор и отправка считали базу каждый сам.
#
# Набор самостоятельный: бегун пакета зовёт каждый `*.test.sh` сам по себе. Каждая фикстура живёт
# во временном каталоге, и пустой путь к ней останавливает набор: `git -C ""` работает в текущей
# копии.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "база набора перед пушем"

push_base() {
    [ -n "$1" ] || return 1
    (cd "$1" && . "$HOOKS/git-guard-push-marks.sh" && rt_push_base main)
}
gate() {
    local label="$1" dir="$2" cmd="$3" want="$4" out
    out="$(CLAUDE_PROJECT_DIR="$dir" input_cmd "$cmd" Bash "$dir" \
        | CLAUDE_PROJECT_DIR="$dir" "$HOOKS/git-guard-push-tests.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecision // "PASS"' 2>/dev/null)"
    report "$label" "${out:-PASS}" "$want"
}
gate_says() {
    CLAUDE_PROJECT_DIR="$1" input_cmd "$2" Bash "$1" \
        | CLAUDE_PROJECT_DIR="$1" "$HOOKS/git-guard-push-tests.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecisionReason // ""' 2>/dev/null
}
ahead() { (cd "$1" && bash "$HOOKS/git-guard-push-ahead.sh" >/dev/null 2>&1); }
fixture() {
    local dir
    dir="$(fixture_repo_branched main "$1")"
    case "$dir" in /*) [ -d "$dir/.git" ] && printf '%s' "$dir" && return 0 ;; esac
    echo "фикстура не создана — набор остановлен" >&2
    exit 1
}
# Каталог сервера и файл счёта: пустой путь останавливает набор так же, как у фикстуры.
tmp_path() {
    local path
    path="$(mktemp "$@")"
    case "$path" in /?*) [ -e "$path" ] && printf '%s' "$path" && return 0 ;; esac
    echo "временный путь не создан — набор остановлен" >&2
    exit 1
}
bare_remote() {
    local dir
    dir="$(tmp_path -d)" || exit 1
    git init -q --bare "$dir" 2>/dev/null
    printf '%s' "$dir"
}
# Закреплённая ссылка ветки — тем же числом, что и в помощнике.
pinned_ref() { (. "$HOOKS/git-guard-push-marks.sh" && rt_push_base_ref "$1"); }
# Имя закреплённой ссылки не несёт слов ветки: профиль читает строки набора по словам.
case "$(pinned_ref RT-1-visual-gate-e2e-fix)" in
    *visual* | *e2e* | *RT-1*) report "SC-AK-1852 — имя закреплённой ссылки без слов ветки" нет да ;;
    refs/rt-kit/push-base/[0-9]*) report "SC-AK-1852 — имя закреплённой ссылки без слов ветки" да да ;;
    *) report "SC-AK-1852 — имя закреплённой ссылки без слов ветки" нет да ;;
esac
# Строка записи прогона вперёд для ветки копии: 2 — имя базы, 3 — её коммит.
record_line() {
    sed -n "${3}p" "$(git -C "$1" rev-parse --path-format=absolute --git-dir)/rt-kit/push-base.d/$2" 2>/dev/null
}
# Профиль с тяжёлым шагом, который называет базу, как профиль дерева: отправка с другой базой ищет
# отметку другой строки и не находит её. Тяжёлый шаг не читает каталог `notes`.
profile() {
    fixture_commit "$1" .claude/rt-kit/project.sh "RT_PUSH_HEAVY_AHEAD=1
rt_push_check_heavy() { case \"\$1\" in *heavy*) return 0 ;; esac; return 1; }
rt_push_check_unread() { case \"\$1\" in *heavy*) printf '%s\\n' ':(top,exclude)notes' ;; esac; }
rt_push_checks() { printf '%s\\n' 'true' \"echo heavy \$1 >> $2\"; }" 'chore: профиль'
}

# Цепочка как в эпике: главная, ветка эпика, нижняя задача и верхняя, все на сервере.
live_git() {
    git -C "$LIVE" -c user.name=probe -c user.email=probe@example.invalid -c commit.gpgsign=false "$@"
}
LIVE_REMOTE="$(bare_remote)" || exit 1
LIVE="$(fixture RT-90-epic)"
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

# --- SC-AK-1850. Случай карточки: голова — ветка эпика, влитая задача снята -----------------------
# Хостинг влил задачу в ветку эпика и снял её; ветка эпика в копии взяла слияние вторым родителем,
# ссылка задачи в копии осталась. Набор и проверка отправки берут главную ветку.
card_git() {
    git -C "$CARD" -c user.name=probe -c user.email=probe@example.invalid -c commit.gpgsign=false "$@"
}
CARD_REMOTE="$(bare_remote)" || exit 1
CARD_RUNS="$(tmp_path)" || exit 1
CARD="$(fixture RT-70-epic)"
card_git remote add origin "$CARD_REMOTE"
card_git checkout -q main 2>/dev/null
profile "$CARD" "$CARD_RUNS"
card_git push -q origin main 2>/dev/null
card_git checkout -q RT-70-epic 2>/dev/null
card_git merge -q --ff-only main 2>/dev/null
fixture_commit "$CARD" epic.txt эпик 'feat: ветка эпика'
card_git push -q origin RT-70-epic 2>/dev/null
card_git checkout -q -b RT-71-task RT-70-epic 2>/dev/null
fixture_commit "$CARD" task.txt задача 'feat: задача'
card_git push -q origin RT-71-task 2>/dev/null
card_git checkout -q -b host-side origin/RT-70-epic 2>/dev/null
GIT_COMMITTER_NAME=GitHub GIT_COMMITTER_EMAIL=noreply@github.com \
    card_git merge -q --no-ff -m 'Merge pull request: задача' RT-71-task 2>/dev/null
card_git push -q origin host-side:RT-70-epic 2>/dev/null
git -C "$CARD_REMOTE" update-ref -d refs/heads/RT-71-task 2>/dev/null
card_git checkout -q RT-70-epic 2>/dev/null
card_git branch -q -D RT-71-task host-side 2>/dev/null
fixture_commit "$CARD" local.txt своё 'feat: своя правка ветки эпика'
card_git fetch -q --no-prune origin 2>/dev/null
card_git merge -q --no-ff -m 'merge origin epic' origin/RT-70-epic 2>/dev/null
report "SC-AK-1850 — карточка: ссылка снятой задачи в копии, база — главная" "$(push_base "$CARD")" origin/main
ahead "$CARD"
report "SC-AK-1850 — карточка: набор шёл от главной" "$(record_line "$CARD" RT-70-epic 2)" origin/main
report "SC-AK-1850 — карточка: закреплённая база стоит на главной" \
    "$(card_git rev-parse --verify --quiet "$(pinned_ref RT-70-epic)")" "$(card_git rev-parse origin/main)"
gate "SC-AK-1850 — карточка: отправка проходит по отметкам" "$CARD" 'git push origin RT-70-epic' PASS
card_git branch -q -D -r origin/RT-71-task 2>/dev/null
gate "SC-AK-1850 — карточка: после чистки ссылок отправка проходит" "$CARD" 'git push origin RT-70-epic' PASS
rm -rf "$CARD" "$CARD_REMOTE" "$CARD_RUNS"

# --- SC-AK-1852. Отправка берёт базу прогона вперёд, пока запись подходит голове ------------------
pin_git() {
    git -C "$PIN" -c user.name=probe -c user.email=probe@example.invalid -c commit.gpgsign=false "$@"
}
PIN_REMOTE="$(bare_remote)" || exit 1
PIN_RUNS="$(tmp_path)" || exit 1
PIN="$(fixture RT-95-epic)"
git -C "$PIN" remote add origin "$PIN_REMOTE"
fixture_commit "$PIN" epic.txt эпик 'feat: ветка эпика'
pin_git push -q origin main RT-95-epic 2>/dev/null
pin_git checkout -q -b RT-96-low RT-95-epic 2>/dev/null
fixture_commit "$PIN" low.txt низ 'feat: нижняя ветка'
pin_git push -q origin RT-96-low 2>/dev/null
pin_git checkout -q -b RT-97-top RT-96-low 2>/dev/null
profile "$PIN" "$PIN_RUNS"
ahead "$PIN"
report "SC-AK-1852 — прогон вперёд от нижней ветки зелёный" "$?" 0
low_sha="$(pin_git rev-parse RT-96-low)"

# Хостинг влил нижнюю ветку в ветку эпика и снял её, пока шёл набор.
git -C "$PIN_REMOTE" update-ref refs/heads/RT-95-epic "$low_sha" 2>/dev/null
git -C "$PIN_REMOTE" update-ref -d refs/heads/RT-96-low 2>/dev/null
report "SC-AK-1852 — заново выбранная база была бы веткой эпика" "$(push_base "$PIN")" origin/RT-95-epic
gate "SC-AK-1852 — нижняя ветка влита и снята во время набора: отправка проходит по отметкам" \
    "$PIN" 'git push origin RT-97-top' PASS
# Соседняя копия почистила ссылки: ссылка базы встаёт обратно на записанный коммит.
pin_git branch -q -D -r origin/RT-96-low 2>/dev/null
gate "SC-AK-1852 — ссылка базы снята чисткой: отправка проходит по отметкам" \
    "$PIN" 'git push origin RT-97-top' PASS
report "SC-AK-1852 — закреплённая база стоит на записанном коммите" \
    "$(pin_git rev-parse --verify --quiet "$(pinned_ref RT-97-top)")" "$low_sha"
report "SC-AK-1852 — ссылка снятой ветки в общие ссылки не вернулась" \
    "$(pin_git rev-parse --verify --quiet refs/remotes/origin/RT-96-low)" ""
# Коммит пути, который тяжёлый шаг не читает: запись подходит голове над записанной, отметка в силе.
fixture_commit "$PIN" notes/n.md заметка 'docs: заметка после набора'
gate "SC-AK-1852 — коммит непрочитанного пути после набора: отправка проходит по отметкам" \
    "$PIN" 'git push origin RT-97-top' PASS
report "SC-AK-1852 — тяжёлый шаг прогнан один раз" "$(grep -c heavy "$PIN_RUNS")" 1

# Новое дерево — новый прогон, база — ветка эпика. Во время набора на хостинге встаёт ветка ближе.
fixture_commit "$PIN" more.txt ещё 'feat: ещё правка'
ahead "$PIN"
report "SC-AK-1852 — прогон вперёд от ветки эпика зелёный" "$?" 0
pin_git push -q origin 'HEAD~1:refs/heads/RT-98-mid' 2>/dev/null
report "SC-AK-1852 — заново выбранная база была бы ближней веткой" "$(push_base "$PIN")" origin/RT-98-mid
gate "SC-AK-1852 — ближняя ветка встала во время набора: отправка проходит по отметкам" \
    "$PIN" 'git push origin RT-97-top' PASS

# --- SC-AK-1853. Отказ называет обе базы -----------------------------------------------------------
# Последний коммит переписан: запись голове не подходит, база выбрана заново, отметок нет, и отказ
# называет базу отправки и базу последнего прогона этой ветки.
printf 'иначе\n' > "$PIN/more.txt"
pin_git commit -q -a --amend -m 'feat: ещё правка, переписана' 2>/dev/null
pin_says="$(gate_says "$PIN" 'git push origin RT-97-top')"
case "$pin_says" in
    *'The base of this push: origin/RT-98-mid.'*'The base of the last run ahead of this branch: origin/RT-95-epic (another history).'*)
        report "SC-AK-1853 — отказ «No green mark» называет базу отправки и базу прогона" да да ;;
    *) report "SC-AK-1853 — отказ «No green mark» называет базу отправки и базу прогона" нет да ;;
esac
rm -rf "$PIN" "$PIN_REMOTE" "$PIN_RUNS"

# --- SC-AK-1852. Две ветки цепочки по очереди в одной копии ---------------------------------------
# Запись у каждой ветки своя: прогон верхней ветки не затирает запись нижней.
two_git() {
    git -C "$TWO" -c user.name=probe -c user.email=probe@example.invalid -c commit.gpgsign=false "$@"
}
TWO_REMOTE="$(bare_remote)" || exit 1
TWO_RUNS="$(tmp_path)" || exit 1
TWO="$(fixture RT-60-epic)"
two_git remote add origin "$TWO_REMOTE"
profile "$TWO" "$TWO_RUNS"
two_git push -q origin main RT-60-epic 2>/dev/null
two_git checkout -q -b RT-61-low RT-60-epic 2>/dev/null
fixture_commit "$TWO" low.txt низ 'feat: нижняя ветка'
two_git push -q origin RT-61-low 2>/dev/null
two_git checkout -q -b RT-62-a RT-61-low 2>/dev/null
fixture_commit "$TWO" a.txt а 'feat: ветка а'
ahead "$TWO"
two_git checkout -q -b RT-63-b RT-62-a 2>/dev/null
fixture_commit "$TWO" b.txt б 'feat: ветка б'
ahead "$TWO"
git -C "$TWO_REMOTE" update-ref refs/heads/RT-60-epic "$(two_git rev-parse RT-61-low)" 2>/dev/null
git -C "$TWO_REMOTE" update-ref -d refs/heads/RT-61-low 2>/dev/null
two_git checkout -q RT-62-a 2>/dev/null
gate "SC-AK-1852 — две ветки по очереди: нижняя проходит по отметкам своего прогона" \
    "$TWO" 'git push origin RT-62-a' PASS
# В ветку эпика пришла чужая правка, и ветка её влила: запись не подходит, база выбрана заново.
two_git fetch -q --no-prune origin 2>/dev/null
two_git checkout -q -b host-side origin/RT-60-epic 2>/dev/null
fixture_commit "$TWO" other.txt чужое 'feat: чужая задача'
two_git push -q origin host-side:RT-60-epic 2>/dev/null
two_git checkout -q RT-62-a 2>/dev/null
two_git fetch -q --no-prune origin 2>/dev/null
two_git merge -q --no-edit origin/RT-60-epic 2>/dev/null
report "SC-AK-1852 — после слияния ветки эпика база выбрана заново" \
    "$(cd "$TWO" && . "$HOOKS/push-set.sh" && . "$HOOKS/git-guard-push-marks.sh" && rt_push_set_base)" origin/RT-60-epic
rm -rf "$TWO" "$TWO_REMOTE" "$TWO_RUNS"

# --- SC-AK-1852. Записанный коммит переписан непрочитанным путём ----------------------------------
# Запись голове не подходит, база выбрана заново, но это та же ветка на том же коммите: отправка
# берёт закреплённую ссылку, и отметка тяжёлого шага в силе.
amend_git() {
    git -C "$AMEND" -c user.name=probe -c user.email=probe@example.invalid -c commit.gpgsign=false "$@"
}
AMEND_REMOTE="$(bare_remote)" || exit 1
AMEND_RUNS="$(tmp_path)" || exit 1
AMEND="$(fixture RT-40-epic)"
amend_git remote add origin "$AMEND_REMOTE"
amend_git push -q origin main RT-40-epic 2>/dev/null
amend_git checkout -q -b RT-41-low RT-40-epic 2>/dev/null
fixture_commit "$AMEND" low.txt низ 'feat: нижняя ветка'
amend_git push -q origin RT-41-low 2>/dev/null
amend_git checkout -q -b RT-42-top RT-41-low 2>/dev/null
profile "$AMEND" "$AMEND_RUNS"
ahead "$AMEND"
mkdir -p "$AMEND/notes" && printf 'заметка\n' > "$AMEND/notes/n.md"
amend_git add notes/n.md 2>/dev/null
amend_git commit -q --amend --no-edit 2>/dev/null
gate "SC-AK-1852 — переписанный записанный коммит непрочитанным путём: отправка проходит по отметкам" \
    "$AMEND" 'git push origin RT-42-top' PASS
report "SC-AK-1852 — после переписанного коммита тяжёлый шаг прогнан один раз" "$(grep -c heavy "$AMEND_RUNS")" 1
rm -rf "$AMEND" "$AMEND_REMOTE" "$AMEND_RUNS"

# --- SC-AK-1852. Ссылка базы сдвинулась во время шага ---------------------------------------------
# Тяжёлый шаг сам двигает ссылку базы, как выборка соседа во время набора: шаг шёл от закреплённой
# ссылки, отметка записана, отправка проходит.
move_git() {
    git -C "$MOVE" -c user.name=probe -c user.email=probe@example.invalid -c commit.gpgsign=false "$@"
}
MOVE_REMOTE="$(bare_remote)" || exit 1
MOVE_RUNS="$(tmp_path)" || exit 1
MOVE="$(fixture RT-50-epic)"
move_git remote add origin "$MOVE_REMOTE"
move_git push -q origin main RT-50-epic 2>/dev/null
move_git checkout -q -b RT-51-low RT-50-epic 2>/dev/null
fixture_commit "$MOVE" low.txt низ 'feat: нижняя ветка'
move_git push -q origin RT-51-low 2>/dev/null
move_git checkout -q -b RT-52-top RT-51-low 2>/dev/null
fixture_commit "$MOVE" .claude/rt-kit/project.sh "RT_PUSH_HEAVY_AHEAD=1
rt_push_check_heavy() { case \"\$1\" in *heavy*) return 0 ;; esac; return 1; }
rt_push_checks() { printf '%s\\n' 'true' \"echo heavy \$1 >> $MOVE_RUNS; git update-ref refs/remotes/origin/RT-51-low HEAD\"; }" 'chore: профиль'
ahead "$MOVE"
report "SC-AK-1852 — ссылка базы сдвинута во время шага" \
    "$(move_git rev-parse origin/RT-51-low)" "$(move_git rev-parse HEAD)"
gate "SC-AK-1852 — база сдвинулась во время шага: отправка проходит по отметкам" \
    "$MOVE" 'git push origin RT-52-top' PASS
report "SC-AK-1852 — тяжёлый шаг при сдвиге базы прогнан один раз" "$(grep -c heavy "$MOVE_RUNS")" 1
rm -rf "$MOVE" "$MOVE_REMOTE" "$MOVE_RUNS"

# --- SC-AK-1340. Ветка сервера несёт свою копию этой ветки ----------------------------------------
. "$(dirname "${BASH_SOURCE[0]}")/git-guard-push-base-copy-lib.sh"

suite_result "база набора перед пушем"
