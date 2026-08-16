#!/usr/bin/env bash
# rt-hook: Stop
# Гард снятия черновика: ход не заканчивается, пока готовая работа стоит черновиком. Stop.
#
# Зачем именно так. Работа кончается не последним коммитом, а снятым черновиком: до него кнопка
# слияния у владельца заблокирована самим хостингом, и зелёная страница PR ему ничего не
# разрешает. Между «всё сделано» и «можно вливать» остаётся ровно один вызов, и держался он
# памятью исполнителя — до тех пор, пока память не проиграла: прогон стал зелёным, исполнитель
# это прочитал, ответил одним словом и остановился. Разбор — `docs/postmortems/handled/`,
# запись `2026-08-16-green-run-draft-left.md`.
#
# Ловится на завершении хода, а не на чтении прогона. Состояние прогона спрашивают десятком
# способов, и опознать этот вопрос среди прочих команд нечем; завершение хода — единственная
# точка, где видно, что исполнитель собрался остановиться.
#
# ТРИ УСЛОВИЯ, И ВСЕ ТРИ ОБЯЗАТЕЛЬНЫ:
#
#   PR текущей ветки открыт и он черновик   — иначе отбивать нечего;
#   прогон НА ВЕРШИНЕ PR завершён успехом   — не последний прогон ветки: прогон промежуточного
#                                             коммита к готовности отношения не имеет;
#   ветка НЕ везёт папку своей задачи       — папка на месте означает, что работа ещё идёт, и
#                                             черновик при ней законен. Разобранная папка —
#                                             признак того, что остался один вызов.
#
# Третье условие и есть то, что отделяет готовую работу от идущей. Без него гард пинал бы
# посреди работы на каждом зелёном прогоне, и его выключили бы в первый же день.
#
# Ответ хостинга кладётся в кэш на минуту: гард срабатывает на каждом завершении хода, и вызов
# сети на каждом из них платится временем владельца.
#
# ОТКАЗ В ПОЛЬЗУ РАБОТЫ: не репозиторий, главная ветка, нет `jq`, нет помощника хостинга, нет
# сети, нет PR, повторный заход — ход РАЗРЕШАЕТСЯ (exit 0). Сломанный гард не имеет права
# заклинить разговор.

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0

command -v jq >/dev/null 2>&1 || exit 0

# Повторный заход по тому же ходу не судится: гард сказал своё один раз и отпускает.
active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)"
[ "$active" = "true" ] && exit 0

root="${CLAUDE_PROJECT_DIR:-.}"
cd "$root" 2>/dev/null || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

branch="$(git branch --show-current 2>/dev/null)"
[ -z "$branch" ] && exit 0
[ "$branch" = "main" ] && exit 0

# Помощник хостинга. Имя `gh` на машине владельца перехвачено чужим псевдонимом, поэтому сперва
# ищется настоящий бинарь и только потом — то, что попалось в пути.
gh_bin="${RT_GH_BIN:-}"
if [ -z "$gh_bin" ]; then
    for candidate in /opt/homebrew/bin/gh /usr/local/bin/gh; do
        [ -x "$candidate" ] && gh_bin="$candidate" && break
    done
fi
[ -z "$gh_bin" ] && gh_bin="$(command -v gh 2>/dev/null)"
[ -z "$gh_bin" ] && exit 0

# Предел ожидания: висящий сетевой вызов на завершении хода читается как зависший агент.
run_gh() {
    if command -v timeout >/dev/null 2>&1; then
        timeout 12 "$gh_bin" "$@" 2>/dev/null
    elif command -v gtimeout >/dev/null 2>&1; then
        gtimeout 12 "$gh_bin" "$@" 2>/dev/null
    else
        "$gh_bin" "$@" 2>/dev/null
    fi
}

# Кэш ответа хостинга. Ключ — ветка: вершина её меняется вместе с ответом, и держать её в ключе
# значило бы спрашивать хостинг на каждом коммите заново.
cache_dir="${TMPDIR:-/tmp}"
cache_file="$cache_dir/rt-draft-ready-$(printf '%s' "$branch" | tr -c 'A-Za-z0-9_.-' '_')"
cache_ttl=60

cache_fresh() {
    [ -f "$cache_file" ] || return 1
    now="$(date +%s 2>/dev/null)" || return 1
    then_="$(cat "$cache_file.at" 2>/dev/null)" || return 1
    [ -n "$then_" ] || return 1
    [ "$((now - then_))" -lt "$cache_ttl" ]
}

if cache_fresh; then
    pr_json="$(cat "$cache_file" 2>/dev/null)"
else
    pr_json="$(run_gh pr view "$branch" --json number,isDraft,state,headRefOid,url)"
    printf '%s' "$pr_json" > "$cache_file" 2>/dev/null
    date +%s > "$cache_file.at" 2>/dev/null
fi

[ -z "$pr_json" ] && exit 0

state="$(printf '%s' "$pr_json" | jq -r '.state // empty' 2>/dev/null)"
draft="$(printf '%s' "$pr_json" | jq -r '.isDraft // false' 2>/dev/null)"
number="$(printf '%s' "$pr_json" | jq -r '.number // empty' 2>/dev/null)"
head_sha="$(printf '%s' "$pr_json" | jq -r '.headRefOid // empty' 2>/dev/null)"

[ "$state" = "OPEN" ] || exit 0
[ "$draft" = "true" ] || exit 0
[ -n "$number" ] || exit 0
[ -n "$head_sha" ] || exit 0

# Папка задачи на месте — работа ещё идёт, и черновик при ней законен. Судится содержимое ветки,
# а не рабочего дерева: снесённая, но не закоммиченная папка въехала бы вместе с веткой.
tasks_dir="${RT_TASKS_DIR-docs/tasks}"
if [ -n "$tasks_dir" ] && [ -n "$(git ls-tree -d --name-only HEAD "$tasks_dir/$branch" 2>/dev/null)" ]; then
    exit 0
fi

# Прогон именно на вершине PR. Последний прогон ветки может принадлежать промежуточному коммиту,
# и его зелёный цвет о готовности не говорит ничего.
verdict="$(run_gh run list --branch "$branch" --limit 20 \
    --json headSha,status,conclusion 2>/dev/null \
    | jq -r --arg sha "$head_sha" '
        [.[] | select(.headSha == $sha)] as $mine
        | if ($mine | length) == 0 then "none"
          elif ($mine | map(select(.status != "completed")) | length) > 0 then "running"
          elif ($mine | map(select(.conclusion != "success")) | length) > 0 then "failed"
          else "green" end
    ' 2>/dev/null)"

[ "$verdict" = "green" ] || exit 0

reason="BLOCKED by git-guard-draft-ready: работа готова, а PR #$number всё ещё черновик.

Прогон на вершине \`${head_sha:0:8}\` завершён успехом, папку задачи ветка больше не везёт — значит
сделано всё, кроме одного вызова. У черновика кнопка слияния заблокирована хостингом: пока он
стоит, зелёная страница PR владельцу ничего не разрешает, а молчание он читает как поломку.

    $gh_bin pr ready $number

После этого владельцу говорится одной репликой, что работа готова к слиянию, и называется номер.
Снятие черновика и просьба влить — один ход, а не два разных дня.

Черновик стоит намеренно — скажи владельцу, чего именно ждёшь, вслух: гард судит один ход и
следующий заход не отбивает."

jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
    || printf '{"decision":"block","reason":"git-guard-draft-ready: прогон зелёный, а PR всё ещё черновик — сними его."}\n'

exit 0
