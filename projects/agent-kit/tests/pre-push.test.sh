#!/usr/bin/env bash
# Сценарии git-хука перед пушем: тот же набор проверок, что у гарда сессии, но на любом пуше.
#
# Хук ставится в каталог хуков настоящего репозитория фикстуры, и пуш идёт настоящим `git push` в
# голый репозиторий рядом. Иначе сценарий проверял бы скрипт, а не то, что git его зовёт, отдаёт ему
# ссылки на вход и отменяет пуш по его коду возврата.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

TREE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

echo "git-хук перед пушем"

# Репозиторий с коммитом на ветке, голым удалённым и поставленным хуком. Довод — что печатает
# `rt_push_checks`: `true` даёт зелёный набор, `false` — красный, пусто — профиля нет вовсе.
hooked_repo() {
    local checks="$1" dir remote
    dir="$(fixture_repo_branched main RT-90-hook)"
    remote="$(mktemp -d)"
    git -C "$remote" init -q --bare 2>/dev/null
    git -C "$dir" remote add origin "$remote" 2>/dev/null
    if [ -n "$checks" ]; then
        mkdir -p "$dir/.claude/rt-kit"
        printf 'rt_push_checks() { printf "%%s\\n" %s; }\n' "$checks" > "$dir/.claude/rt-kit/project.sh"
    fi
    wire_hook "$dir"
    printf '%s' "$dir"
}

# Хук лежит там, куда его кладёт раскладка, рядом с общим кодом набора, и git зовёт его строкой,
# как зовёт менеджер хуков дерева.
wire_hook() {
    local dir="$1"
    mkdir -p "$dir/.claude/hooks"
    cp "$HOOKS/pre-push.sh" "$HOOKS/push-set.sh" "$HOOKS/utf8.sh" "$dir/.claude/hooks/"
    printf '#!/bin/sh\nexec bash .claude/hooks/pre-push.sh "$@"\n' > "$dir/.git/hooks/pre-push"
    chmod +x "$dir/.git/hooks/pre-push"
}

# То же, но профиль дерева пишется целиком: доводом идёт текст `project.sh`.
profiled_repo() {
    local dir
    dir="$(hooked_repo true)"
    printf '%s\n' "$1" > "$dir/.claude/rt-kit/project.sh"
    printf '%s' "$dir"
}

# Что хук сказал на пуш: поток ошибок вместе с выводом.
push_says() {
    local dir="$1"; shift
    (cd "$dir" && env -u CI git push "$@" 2>&1)
}

mark_of() {
    cat "$(git -C "$1" rev-parse --path-format=absolute --git-common-dir)/rt-kit-push-green" 2>/dev/null
}

# Код возврата пуша и то, дошла ли ветка до удалённого: 0 — ушла, 1 — пуш отменён.
push_code() {
    local dir="$1"; shift
    (cd "$dir" && env -u CI git push -q "$@" >/dev/null 2>&1)
    [ $? -eq 0 ] && printf '0' || printf '1'
}

remote_has() {
    git -C "$1" ls-remote --exit-code origin "refs/heads/$2" >/dev/null 2>&1 && printf 'да' || printf 'нет'
}

# --- набор -------------------------------------------------------------------------------
# SC-AK-1243. Пуш из терминала вне сессии раньше уходил без единой проверки: гард стоит только на
# инструментах агента. Хук гонит набор сам, и красный набор отменяет пуш.
RED="$(hooked_repo false)"
report "SC-AK-1243 — красный набор отменяет пуш" "$(push_code "$RED" origin RT-90-hook)" 1
report "SC-AK-1243 — ветка до удалённого не дошла" "$(remote_has "$RED" RT-90-hook)" нет
said="$(cd "$RED" && env -u CI git push origin RT-90-hook 2>&1)"
case "$said" in
    *'red checks: 1'*false*) report "SC-AK-1243 — отказ называет красную проверку" да да ;;
    *) report "SC-AK-1243 — отказ называет красную проверку" нет да ;;
esac

GREEN="$(hooked_repo true)"
report "SC-AK-1243 — зелёный набор пуш пропускает" "$(push_code "$GREEN" origin RT-90-hook)" 0
report "SC-AK-1243 — ветка дошла до удалённого" "$(remote_has "$GREEN" RT-90-hook)" да

# --- отметка гарда ----------------------------------------------------------------------
# SC-AK-1244. Пуш из сессии гард уже судил: второй прогон набора внутри того же вызова обрывал бы
# сессию. Отметка держит один коммит — тот, что гард нашёл зелёным.
MARKED="$(hooked_repo false)"
git -C "$MARKED" rev-parse HEAD > "$(git -C "$MARKED" rev-parse --absolute-git-dir)/rt-kit-push-green"
report "SC-AK-1244 — коммит с отметкой проходит без набора" "$(push_code "$MARKED" origin RT-90-hook)" 0
fixture_commit "$MARKED" next.txt 'дальше' 'chore: следующий коммит'
report "SC-AK-1244 — следующий коммит отметкой не покрыт" "$(push_code "$MARKED" origin RT-90-hook)" 1

# Гард сессии пишет отметку сам — на зелёном наборе и только на нём.
guard_mark() {
    local dir="$1"
    CLAUDE_PROJECT_DIR="$dir" input_cmd 'git push origin RT-90-hook' Bash "$dir" \
        | CLAUDE_PROJECT_DIR="$dir" "$HOOKS/git-guard-push-tests.sh" >/dev/null 2>&1
    cat "$(git -C "$dir" rev-parse --absolute-git-dir)/rt-kit-push-green" 2>/dev/null
}
GUARD_GREEN="$(hooked_repo true)"
report "SC-AK-1244 — гард на зелёном наборе пишет вершину" \
    "$(guard_mark "$GUARD_GREEN")" "$(git -C "$GUARD_GREEN" rev-parse HEAD)"
GUARD_RED="$(hooked_repo false)"
report "SC-AK-1244 — гард на красном наборе отметки не пишет" "$(guard_mark "$GUARD_RED")" ""

# --- чужой коммит --------------------------------------------------------------------------
# SC-AK-1245. Набор судит дерево, на котором стоит копия. Пуш другой ветки прошёл бы по зелёному
# набору чужого дерева, и зелёное читалось бы проверкой того, что ушло.
OTHER="$(hooked_repo true)"
fixture_commit "$OTHER" work.txt 'работа' 'chore: работа ветки'
report "SC-AK-1245 — пуш ветки, на которой копия не стоит, отменён" "$(push_code "$OTHER" origin main)" 1
said="$(cd "$OTHER" && env -u CI git push origin main 2>&1)"
case "$said" in
    *'does not stand on'*refs/heads/main*) report "SC-AK-1245 — отказ называет ветку" да да ;;
    *) report "SC-AK-1245 — отказ называет ветку" нет да ;;
esac
git -C "$OTHER" -c user.name=probe -c user.email=probe@example.com tag -a -m 'метка' v1 main 2>/dev/null
report "SC-AK-1245 — метка на чужом коммите отменена" "$(push_code "$OTHER" origin v1)" 1
git -C "$OTHER" -c user.name=probe -c user.email=probe@example.com tag -a -m 'метка' v2 HEAD 2>/dev/null
report "SC-AK-1245 — метка на вершине копии проходит" "$(push_code "$OTHER" origin v2)" 0

# SC-AK-1249. Несколько ссылок в одном пуше судятся по одной: каждая чужая названа, и одной
# хватает, чтобы отменить весь пуш.
MANY="$(hooked_repo true)"
fixture_commit "$MANY" work.txt 'работа' 'chore: работа ветки'
git -C "$MANY" -c user.name=probe -c user.email=probe@example.com tag -a -m 'метка' v1 main 2>/dev/null
report "SC-AK-1249 — пуш вершины вместе с чужой ссылкой отменён" "$(push_code "$MANY" origin RT-90-hook main v1)" 1
report "SC-AK-1249 — вершина с отменённым пушем не ушла" "$(remote_has "$MANY" RT-90-hook)" нет
said="$(push_says "$MANY" origin RT-90-hook main v1)"
case "$said" in
    *refs/heads/main*refs/tags/v1*) report "SC-AK-1249 — отказ называет каждую чужую ссылку" да да ;;
    *) report "SC-AK-1249 — отказ называет каждую чужую ссылку" нет да ;;
esac

# --- где хук не судит ----------------------------------------------------------------------
# SC-AK-1247. Удаление не отправляет дерева: судить нечего, и красный набор его не держит.
DELETE="$(hooked_repo false)"
git -C "$DELETE" -c core.hooksPath=/dev/null push -q origin RT-90-hook main 2>/dev/null
report "SC-AK-1247 — удаление ветки набора не гоняет" "$(push_code "$DELETE" origin --delete main)" 0

# SC-AK-1248. Конвейер — свой гейт: под `CI` хук пропускает и красный набор.
PIPE="$(hooked_repo false)"
report "SC-AK-1248 — в конвейере хук пропускает" \
    "$(cd "$PIPE" && CI=true git push -q origin RT-90-hook >/dev/null 2>&1 && printf 0 || printf 1)" 0

BARE_TREE="$(hooked_repo '')"
report "без профиля хук пропускает" "$(push_code "$BARE_TREE" origin RT-90-hook)" 0

# --- профиль ------------------------------------------------------------------------------
# SC-AK-1250. Набор собирается из умолчания пакета и надстройки дерева, и корень берётся у
# репозитория, из которого идёт пуш. Корень, унаследованный от сессии другой копии, читал файлы
# той копии: набор сужался молча, а хук уходил зелёным.
LAYERED="$(profiled_repo 'rt_push_checks() { rt_push_checks_default; printf "%s\n" "test override = x"; }')"
mkdir -p "$LAYERED/.claude/rt-kit/defaults"
printf '%s\n' 'rt_push_checks_default() { printf "%s\n" "test default = x"; }' \
    > "$LAYERED/.claude/rt-kit/defaults/project.sh"
said="$(push_says "$LAYERED" origin RT-90-hook)"
case "$said" in
    *'red checks: 2'*'test default = x'*'test override = x'*) report "SC-AK-1250 — красные из умолчания и из надстройки названы обе" да да ;;
    *) report "SC-AK-1250 — красные из умолчания и из надстройки названы обе" нет да ;;
esac

ROOTED="$(profiled_repo 'rt_push_checks() { [ -f "$CLAUDE_PROJECT_DIR/probe-root" ] && printf "%s\n" false; }')"
: > "$ROOTED/probe-root"
ELSEWHERE="$(mktemp -d)"
report "SC-AK-1250 — чужой корень сессии набор не сужает" \
    "$(cd "$ROOTED" && env -u CI CLAUDE_PROJECT_DIR="$ELSEWHERE" git push -q origin RT-90-hook >/dev/null 2>&1 && printf 0 || printf 1)" 1

# SC-AK-1251. После красной тяжёлая проверка не стартует: пуш отменён всё равно, и её минуты
# ничего не покупают. Не начатая названа.
HEAVY="$(profiled_repo 'rt_push_checks() { printf "%s\n" false "touch heavy-ran"; }
rt_push_check_heavy() { case "$1" in touch*) return 0 ;; esac; return 1; }')"
said="$(push_says "$HEAVY" origin RT-90-hook)"
[ -f "$HEAVY/heavy-ran" ] && heavy=да || heavy=нет
report "SC-AK-1251 — тяжёлая после красной не стартовала" "$heavy" нет
case "$said" in
    *'Not started after the red ones'*'touch heavy-ran'*) report "SC-AK-1251 — не начатая тяжёлая названа" да да ;;
    *) report "SC-AK-1251 — не начатая тяжёлая названа" нет да ;;
esac

# SC-AK-1252. Проверка, которой не на что было смотреть, называется вслух. Набор из одних таких
# не судил ничего, и отметки он не пишет. Код пропуска 1 — не код пропуска: им выходит любой отказ.
SKIPPED="$(profiled_repo 'rt_push_checks() { printf "%s\n" "exit 7"; }')"
said="$(push_says "$SKIPPED" origin RT-90-hook)"
case "$said" in
    *'nothing to look at'*'exit 7'*) report "SC-AK-1252 — пропущенная проверка названа" да да ;;
    *) report "SC-AK-1252 — пропущенная проверка названа" нет да ;;
esac
report "SC-AK-1252 — набор из одних пропусков отметки не пишет" "$(mark_of "$SKIPPED")" ""
KNIFE="$(hooked_repo false)"
report "SC-AK-1252 — код пропуска 1 красную проверку не пропускает" \
    "$(cd "$KNIFE" && env -u CI RT_SKIP_CODE=1 git push -q origin RT-90-hook >/dev/null 2>&1 && printf 0 || printf 1)" 1

# --- отметка и рабочая копия --------------------------------------------------------------
# SC-AK-1253. Набор судит копию как она лежит. С правкой в отслеживаемом файле он судил не коммит,
# и отметка коммиту не пишется; файлы вне истории не в счёт.
DIRTY="$(hooked_repo true)"
printf '%s\n' '{"name":"edited"}' > "$DIRTY/package.json"
report "SC-AK-1253 — пуш с правкой в копии проходит" "$(push_code "$DIRTY" origin RT-90-hook)" 0
report "SC-AK-1253 — копия с правкой отметки не пишет" "$(mark_of "$DIRTY")" ""
CLEAN="$(hooked_repo true)"
: > "$CLEAN/outside-history.txt"
push_code "$CLEAN" origin RT-90-hook >/dev/null
report "SC-AK-1253 — чистая копия пишет вершину" "$(mark_of "$CLEAN")" "$(git -C "$CLEAN" rev-parse HEAD)"

# SC-AK-1254. Отметка лежит в общем каталоге git: пуш из второй рабочей копии видит отметку, которую
# гард написал в первой, и второго прогона нет.
SHARED="$(hooked_repo false)"
git -C "$SHARED" add .claude 2>/dev/null
git -C "$SHARED" -c user.name=probe -c user.email=probe@example.com -c commit.gpgsign=false \
    commit -q -m 'chore: профиль' 2>/dev/null
SECOND="$(mktemp -d)/second"
git -C "$SHARED" worktree add -q -b RT-91-second "$SECOND" HEAD 2>/dev/null
report "SC-AK-1254 — без отметки вторая копия гонит красный набор" "$(push_code "$SECOND" origin RT-91-second)" 1
git -C "$SHARED" rev-parse HEAD > "$(git -C "$SHARED" rev-parse --path-format=absolute --git-common-dir)/rt-kit-push-green"
report "SC-AK-1254 — отметка первой копии покрывает пуш из второй" "$(push_code "$SECOND" origin RT-91-second)" 0

# --- подключение ---------------------------------------------------------------------------
# SC-AK-1255. Менеджер хуков дерева зовёт хук строкой из своего каталога, и красный набор отменяет
# пуш так же. Хук без общего кода набора рядом говорит, что проверок не было, а не молчит.
MANAGED="$(hooked_repo false)"
rm -f "$MANAGED/.git/hooks/pre-push"
mkdir -p "$MANAGED/.manager"
printf '%s\n' 'bash .claude/hooks/pre-push.sh "$@"' > "$MANAGED/.manager/pre-push"
chmod +x "$MANAGED/.manager/pre-push"
git -C "$MANAGED" config core.hooksPath .manager
report "SC-AK-1255 — через каталог менеджера хуков красный набор отменяет пуш" "$(push_code "$MANAGED" origin RT-90-hook)" 1
ALONE="$(hooked_repo false)"
rm -f "$ALONE/.claude/hooks/push-set.sh"
said="$(push_says "$ALONE" origin RT-90-hook)"
case "$said" in
    *'no file push-set.sh'*'no check ran'*) report "SC-AK-1255 — хук без общего кода говорит, что проверок не было" да да ;;
    *) report "SC-AK-1255 — хук без общего кода говорит, что проверок не было" нет да ;;
esac

# --- раскладка -----------------------------------------------------------------------------
# SC-AK-1246. Хук — ресурс пакета: раскладка кладёт его в каталог хуков дерева исполняемым и с
# шапкой, как всякий хук, и рядом с ним — общий код набора. Без собранного пакета сценарий красный,
# как и набор отметок приёма: пропуск читался бы покрытием.
#
# Раскладка идёт копией собранного пакета вне дерева, как у потребителя. Собранный пакет рядом с
# исходниками сверяет время их правки и отказывает, если они моложе сборки: время сдвигается и без
# правки, и сценарий краснел на наборе перед пушем, не дойдя до хука.
LAID="$(mktemp -d)"
PACKAGE="$(mktemp -d)"
git -C "$LAID" init -q 2>/dev/null
mkdir -p "$LAID/.claude"
printf '{"layout":{"hooks":".claude/hooks"},"variants":{"host":"github"},"only":["hooks/pre-push.sh","hooks/push-set.sh"]}\n' \
    > "$LAID/.claude/rt-kit.json"
if [ -f "$TREE_ROOT/dist/agent-kit/bin/agent-kit.js" ]; then
    cp -R "$TREE_ROOT/dist/agent-kit" "$PACKAGE/agent-kit"
    (cd "$LAID" && node "$PACKAGE/agent-kit/bin/agent-kit.js" sync >/dev/null 2>&1)
    [ -x "$LAID/.claude/hooks/pre-push.sh" ] && laid=да || laid=нет
    report "SC-AK-1246 — раскладка кладёт хук исполняемым" "$laid" да
    report "SC-AK-1246 — у разложенного хука шапка раскладки" \
        "$(sed -n 2p "$LAID/.claude/hooks/pre-push.sh" | grep -c 'hooks/pre-push.sh')" 1
    [ -f "$LAID/.claude/hooks/push-set.sh" ] && laid=да || laid=нет
    report "SC-AK-1246 — общий код набора лежит рядом с хуком" "$laid" да
else
    report "SC-AK-1246 — пакет собран: pnpm exec nx build @rt-tools/agent-kit" нет да
fi

git -C "$SHARED" worktree remove --force "$SECOND" 2>/dev/null
rm -rf "$RED" "$GREEN" "$MARKED" "$GUARD_GREEN" "$GUARD_RED" "$OTHER" "$MANY" "$DELETE" "$PIPE" "$BARE_TREE" \
    "$LAYERED" "$ROOTED" "$ELSEWHERE" "$HEAVY" "$SKIPPED" "$KNIFE" "$DIRTY" "$CLEAN" "$SHARED" "${SECOND%/second}" \
    "$MANAGED" "$ALONE" "$LAID" "$PACKAGE"

suite_result "git-хук перед пушем"
