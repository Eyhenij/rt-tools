#!/usr/bin/env bash
# Сценарии SC-AK-1340 о своей копии ветки: когда ветка сервера, которая несёт копию этой, стоит на
# ней, а когда остаётся базой. Файл не набор: бегун берёт только `*.test.sh`, а этот подключает
# `git-guard-push-base-live.test.sh` после своих помощников `push_base`, `fixture` и `bare_remote`.
#
# 19.11 копия ветки задачи на сервере попала в ветку эпика слиянием хоста чужой заявки, и выбор
# отбросил ветку эпика как стоящую на этой: набор считался от главной и шёл полностью. Ветка
# отбрасывается за свою копию, когда копия лежит на её линии первых родителей или ни одно слияние
# хоста не принесло копию, и ветка не под вершиной.

fx_git() {
    local dir="$1"
    shift
    [ -n "$dir" ] || exit 1
    git -C "$dir" -c user.name=probe -c user.email=probe@example.invalid -c commit.gpgsign=false "$@"
}
# Слияние, каким его пишет хост: подписано им самим. Доводы: каталог, заголовок, ветка.
fx_host_merge() {
    GIT_COMMITTER_NAME=GitHub GIT_COMMITTER_EMAIL=noreply@github.com \
        fx_git "$1" merge -q --no-ff -m "$2" "$3" 2>/dev/null
}

# --- Ветка эпика несёт копию: впереди, под вершиной, на вершине ------------------------------------
COPY_REMOTE="$(bare_remote)" || exit 1
COPY="$(fixture RT-60-epic)"
fx_git "$COPY" remote add origin "$COPY_REMOTE"
fixture_commit "$COPY" epic.txt эпик 'feat: ветка эпика'
fx_git "$COPY" push -q origin main RT-60-epic 2>/dev/null
fx_git "$COPY" checkout -q -b RT-61-task RT-60-epic 2>/dev/null
fixture_commit "$COPY" task61.txt задача 'feat: задача'
fx_git "$COPY" push -q origin RT-61-task 2>/dev/null
fx_git "$COPY" checkout -q RT-60-epic 2>/dev/null
fx_host_merge "$COPY" 'feat: заявка 61 влита' RT-61-task
fx_git "$COPY" push -q origin RT-60-epic 2>/dev/null
fx_git "$COPY" checkout -q RT-61-task 2>/dev/null
fixture_commit "$COPY" task61b.txt правка 'feat: правка после заявки'
report "SC-AK-1340 — эпик впереди несёт копию слиянием хоста: задача эпик не принимала" \
    "$(push_base "$COPY")" origin/RT-60-epic
# Копию принесла в эпик чужая заявка, взятая от копии этой ветки, — как 19.11.
fx_git "$COPY" checkout -q -b RT-63-task origin/RT-60-epic 2>/dev/null
fixture_commit "$COPY" task63.txt задача 'feat: вторая задача'
fx_git "$COPY" push -q origin RT-63-task 2>/dev/null
fx_git "$COPY" checkout -q -b RT-64-other origin/RT-63-task 2>/dev/null
fixture_commit "$COPY" other.txt чужая 'feat: чужая заявка от копии задачи'
fx_git "$COPY" push -q origin RT-64-other 2>/dev/null
fx_git "$COPY" checkout -q RT-60-epic 2>/dev/null
fx_git "$COPY" merge -q --ff-only origin/RT-60-epic 2>/dev/null
fx_host_merge "$COPY" 'feat: заявка 64 влита' RT-64-other
fx_git "$COPY" push -q origin RT-60-epic 2>/dev/null
fx_git "$COPY" checkout -q RT-63-task 2>/dev/null
fixture_commit "$COPY" task63b.txt правка 'feat: правка второй задачи'
report "SC-AK-1340 — эпик впереди несёт копию слиянием хоста чужой заявки: база — ветка эпика" \
    "$(push_base "$COPY")" origin/RT-60-epic
fx_git "$COPY" merge -q -m 'feat: задача приняла ветку эпика' origin/RT-60-epic 2>/dev/null
fixture_commit "$COPY" task63c.txt правка 'feat: правка после приёма эпика'
report "SC-AK-1340 — эпик под вершиной несёт копию: база — ветка эпика" "$(push_base "$COPY")" origin/RT-60-epic
fx_git "$COPY" checkout -q -b RT-65-side origin/RT-60-epic 2>/dev/null
fixture_commit "$COPY" side.txt сосед 'feat: соседняя задача'
fx_git "$COPY" push -q origin RT-65-side 2>/dev/null
fx_git "$COPY" checkout -q RT-60-epic 2>/dev/null
fx_git "$COPY" merge -q --ff-only origin/RT-60-epic 2>/dev/null
fx_host_merge "$COPY" 'feat: заявка 65 влита' RT-65-side
fx_git "$COPY" push -q origin RT-60-epic 2>/dev/null
fx_git "$COPY" checkout -q RT-63-task 2>/dev/null
fixture_commit "$COPY" task63d.txt правка 'feat: правка после ухода эпика'
report "SC-AK-1340 — эпик впереди несёт копию слиянием хоста: задача эпик принимала" \
    "$(push_base "$COPY")" origin/RT-60-epic
# Хостинг снял копию после слияния, ссылка в копии осталась: решает история ветки, не жизнь ссылки.
git -C "$COPY_REMOTE" update-ref -d refs/heads/RT-63-task 2>/dev/null
report "SC-AK-1340 — копия снята на хостинге, ссылка осталась: база — ветка эпика" \
    "$(push_base "$COPY")" origin/RT-60-epic
# Вершина стоит на коммите ветки эпика, которая несёт копию: база — ветка эпика, набор пуст.
fx_git "$COPY" checkout -q -b RT-66-flat origin/RT-60-epic 2>/dev/null
fixture_commit "$COPY" flat.txt ровно 'feat: задача, влитая целиком'
fx_git "$COPY" push -q origin RT-66-flat 2>/dev/null
fx_git "$COPY" checkout -q RT-60-epic 2>/dev/null
fx_git "$COPY" merge -q --ff-only origin/RT-60-epic 2>/dev/null
fx_host_merge "$COPY" 'feat: заявка 66 влита' RT-66-flat
fx_git "$COPY" push -q origin RT-60-epic 2>/dev/null
fx_git "$COPY" checkout -q RT-66-flat 2>/dev/null
fx_git "$COPY" reset -q --hard origin/RT-60-epic 2>/dev/null
report "SC-AK-1340 — вершина на эпике: база — ветка эпика" "$(push_base "$COPY")" origin/RT-60-epic
rm -rf "$COPY" "$COPY_REMOTE"

# --- Слияние хоста с копией за слиянием сессии ---------------------------------------------------
# Сессия эпика свела свою ветку с серверной: слияние хоста, принёсшее копию, вошло в эпик через
# слияние сессии, потом хост влил ещё заявку. Эпик по-прежнему база. Без второй заявки эпик ушёл
# вперёд только слиянием сессии и кандидатом не бывает — это ограничение описания.
SYNC_REMOTE="$(bare_remote)" || exit 1
SYNC="$(fixture RT-30-epic)"
fx_git "$SYNC" remote add origin "$SYNC_REMOTE"
fixture_commit "$SYNC" epic.txt эпик 'feat: ветка эпика'
fx_git "$SYNC" push -q origin main RT-30-epic 2>/dev/null
fx_git "$SYNC" checkout -q -b RT-31-task RT-30-epic 2>/dev/null
fixture_commit "$SYNC" task.txt задача 'feat: задача'
fx_git "$SYNC" push -q origin RT-31-task 2>/dev/null
fx_git "$SYNC" checkout -q -b RT-32-other origin/RT-31-task 2>/dev/null
fixture_commit "$SYNC" other.txt чужая 'feat: чужая заявка от копии задачи'
fx_git "$SYNC" push -q origin RT-32-other 2>/dev/null
fx_git "$SYNC" checkout -q -b host-side origin/RT-30-epic 2>/dev/null
fx_host_merge "$SYNC" 'feat: заявка 32 влита' origin/RT-32-other
fx_git "$SYNC" push -q origin host-side:RT-30-epic 2>/dev/null
fx_git "$SYNC" checkout -q RT-30-epic 2>/dev/null
fixture_commit "$SYNC" plan.txt план 'docs: отметка плана эпика'
fx_git "$SYNC" merge -q -m "Merge remote-tracking branch 'origin/RT-30-epic' into RT-30-epic" origin/RT-30-epic 2>/dev/null
fx_git "$SYNC" push -q origin RT-30-epic 2>/dev/null
fx_git "$SYNC" checkout -q -b RT-33-side origin/RT-30-epic 2>/dev/null
fixture_commit "$SYNC" side.txt сосед 'feat: соседняя задача'
fx_git "$SYNC" push -q origin RT-33-side 2>/dev/null
fx_git "$SYNC" checkout -q RT-30-epic 2>/dev/null
fx_host_merge "$SYNC" 'feat: заявка 33 влита' RT-33-side
fx_git "$SYNC" push -q origin RT-30-epic 2>/dev/null
fx_git "$SYNC" checkout -q RT-31-task 2>/dev/null
fixture_commit "$SYNC" task2.txt правка 'feat: правка задачи'
report "SC-AK-1340 — эпик принял копию синхронизацией сессии: база — ветка эпика" \
    "$(push_base "$SYNC")" origin/RT-30-epic
# Эпик без копии этой ветки, ушедший вперёд слиянием хоста, судится как прежде: он база.
fx_git "$SYNC" checkout -q -b RT-34-fresh origin/RT-30-epic 2>/dev/null
fixture_commit "$SYNC" fresh.txt свежая 'feat: задача с вершины эпика'
fx_git "$SYNC" push -q origin RT-34-fresh 2>/dev/null
fx_git "$SYNC" checkout -q RT-30-epic 2>/dev/null
fx_host_merge "$SYNC" 'feat: заявка 31 влита' RT-31-task
fx_git "$SYNC" push -q origin RT-30-epic 2>/dev/null
fx_git "$SYNC" checkout -q RT-34-fresh 2>/dev/null
fixture_commit "$SYNC" fresh2.txt правка 'feat: правка свежей задачи'
report "SC-AK-1340 — эпик без копии ушёл вперёд слиянием хоста: база — ветка эпика" \
    "$(push_base "$SYNC")" origin/RT-30-epic
# Сосед принял эту ветку слиянием сессии, потом хост влил в соседа ветку, взятую от него: слияние
# хоста, чья первая сторона уже несла копию, копию не приносило, и сосед не база.
fx_git "$SYNC" push -q origin RT-34-fresh 2>/dev/null
fx_git "$SYNC" checkout -q -b RT-35-near origin/RT-30-epic 2>/dev/null
fixture_commit "$SYNC" near.txt рядом 'feat: сосед'
fx_git "$SYNC" merge -q -m 'feat: сосед принял задачу' origin/RT-34-fresh 2>/dev/null
fx_git "$SYNC" push -q origin RT-35-near 2>/dev/null
fx_git "$SYNC" checkout -q -b RT-36-up origin/RT-35-near 2>/dev/null
fixture_commit "$SYNC" up.txt выше 'feat: ветка над соседом'
fx_git "$SYNC" push -q origin RT-36-up 2>/dev/null
fx_git "$SYNC" checkout -q RT-35-near 2>/dev/null
fx_host_merge "$SYNC" 'feat: заявка 36 влита' RT-36-up
fx_git "$SYNC" push -q origin RT-35-near 2>/dev/null
fx_git "$SYNC" checkout -q -b RT-37-later origin/RT-30-epic 2>/dev/null
fixture_commit "$SYNC" later.txt позже 'feat: задача позже'
fx_git "$SYNC" push -q origin RT-37-later 2>/dev/null
fx_git "$SYNC" checkout -q RT-30-epic 2>/dev/null
fx_git "$SYNC" merge -q --ff-only origin/RT-30-epic 2>/dev/null
fx_host_merge "$SYNC" 'feat: заявка 37 влита' RT-37-later
fx_git "$SYNC" push -q origin RT-30-epic 2>/dev/null
git -C "$SYNC_REMOTE" update-ref -d refs/heads/RT-37-later 2>/dev/null
fx_git "$SYNC" checkout -q RT-34-fresh 2>/dev/null
fixture_commit "$SYNC" fresh3.txt правка 'feat: правка после соседа'
report "SC-AK-1340 — сосед принял эту, хост влил в него ветку над ним: не база" \
    "$(push_base "$SYNC")" origin/RT-30-epic
rm -rf "$SYNC" "$SYNC_REMOTE"

# --- Ветка выше и сосед ---------------------------------------------------------------------------
# Ветка, взятая от этой обычными коммитами, несёт копию на своей линии первых родителей: она не
# база, и после того, как хост влил в неё ветку выше по стопке, — тоже.
ABOVE_REMOTE="$(bare_remote)" || exit 1
ABOVE="$(fixture RT-80-epic)"
fx_git "$ABOVE" remote add origin "$ABOVE_REMOTE"
fixture_commit "$ABOVE" epic.txt эпик 'feat: ветка эпика'
fx_git "$ABOVE" push -q origin main RT-80-epic 2>/dev/null
fx_git "$ABOVE" checkout -q -b RT-81-task RT-80-epic 2>/dev/null
fixture_commit "$ABOVE" task.txt задача 'feat: задача'
fx_git "$ABOVE" push -q origin RT-81-task 2>/dev/null
fx_git "$ABOVE" checkout -q -b RT-82-above RT-81-task 2>/dev/null
fixture_commit "$ABOVE" above.txt выше 'feat: ветка над задачей'
fx_git "$ABOVE" push -q origin RT-82-above 2>/dev/null
fx_git "$ABOVE" checkout -q RT-81-task 2>/dev/null
fixture_commit "$ABOVE" task2.txt правка 'feat: правка задачи'
report "SC-AK-1340 — ветка, взятая от этой, не база: база — ветка эпика" "$(push_base "$ABOVE")" origin/RT-80-epic
fx_git "$ABOVE" checkout -q -b RT-83-higher RT-82-above 2>/dev/null
fixture_commit "$ABOVE" higher.txt ещё 'feat: ветка выше по стопке'
fx_git "$ABOVE" push -q origin RT-83-higher 2>/dev/null
fx_git "$ABOVE" checkout -q RT-82-above 2>/dev/null
fx_host_merge "$ABOVE" 'feat: заявка 83 влита' RT-83-higher
fx_git "$ABOVE" push -q origin RT-82-above 2>/dev/null
fx_git "$ABOVE" checkout -q RT-81-task 2>/dev/null
fixture_commit "$ABOVE" task3.txt правка 'feat: правка ревью задачи'
report "SC-AK-1340 — ветка, взятая от этой, не база и после слияния хоста сверху" \
    "$(push_base "$ABOVE")" origin/RT-80-epic
# Ветка выше приняла новую копию этой слиянием сессии: копию принесло не слияние хоста.
fx_git "$ABOVE" push -q origin RT-81-task 2>/dev/null
fx_git "$ABOVE" checkout -q RT-82-above 2>/dev/null
fx_git "$ABOVE" merge -q -m 'feat: ветка выше приняла задачу' origin/RT-81-task 2>/dev/null
fx_git "$ABOVE" push -q origin RT-82-above 2>/dev/null
fx_git "$ABOVE" checkout -q RT-81-task 2>/dev/null
fixture_commit "$ABOVE" task4.txt правка 'feat: правка после приёма сверху'
report "SC-AK-1340 — ветка выше приняла эту слиянием сессии: не база" "$(push_base "$ABOVE")" origin/RT-80-epic
# Сосед взят с новой вершины эпика и принял эту ветку сам: он ближе эпика, но базой не бывает.
fx_git "$ABOVE" checkout -q -b RT-84-side origin/RT-80-epic 2>/dev/null
fixture_commit "$ABOVE" side.txt сбоку 'feat: соседняя задача'
fx_git "$ABOVE" push -q origin RT-84-side 2>/dev/null
fx_git "$ABOVE" checkout -q RT-80-epic 2>/dev/null
fx_host_merge "$ABOVE" 'feat: заявка 84 влита' RT-84-side
fx_git "$ABOVE" push -q origin RT-80-epic 2>/dev/null
fx_git "$ABOVE" checkout -q -b RT-85-near origin/RT-80-epic 2>/dev/null
fixture_commit "$ABOVE" near.txt рядом 'feat: сосед с новой вершины эпика'
fx_git "$ABOVE" merge -q -m 'feat: сосед принял задачу' origin/RT-81-task 2>/dev/null
fx_git "$ABOVE" push -q origin RT-85-near 2>/dev/null
fx_git "$ABOVE" checkout -q RT-81-task 2>/dev/null
fixture_commit "$ABOVE" task5.txt правка 'feat: правка после приёма соседом'
report "SC-AK-1340 — сосед принял эту слиянием сессии: не база" "$(push_base "$ABOVE")" origin/RT-80-epic
# Задача приняла ветку выше: та лежит под вершиной, её содержимое прошло набор, и она база.
fx_git "$ABOVE" merge -q -m 'feat: задача приняла ветку выше' origin/RT-82-above 2>/dev/null
fixture_commit "$ABOVE" task6.txt правка 'feat: правка после приёма ветки выше'
report "SC-AK-1340 — задача приняла ветку выше: та под вершиной и база" "$(push_base "$ABOVE")" origin/RT-82-above
rm -rf "$ABOVE" "$ABOVE_REMOTE"
