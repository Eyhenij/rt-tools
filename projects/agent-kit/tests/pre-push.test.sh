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
    cp "$HOOKS/pre-push.sh" "$dir/.git/hooks/pre-push"
    chmod +x "$dir/.git/hooks/pre-push"
    printf '%s' "$dir"
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

# --- где хук не судит ----------------------------------------------------------------------
DELETE="$(hooked_repo false)"
git -C "$DELETE" -c core.hooksPath=/dev/null push -q origin RT-90-hook main 2>/dev/null
report "удаление ветки набора не гоняет" "$(push_code "$DELETE" origin --delete main)" 0

PIPE="$(hooked_repo false)"
report "в конвейере хук пропускает" \
    "$(cd "$PIPE" && CI=true git push -q origin RT-90-hook >/dev/null 2>&1 && printf 0 || printf 1)" 0

BARE_TREE="$(hooked_repo '')"
report "без профиля хук пропускает" "$(push_code "$BARE_TREE" origin RT-90-hook)" 0

# --- раскладка -----------------------------------------------------------------------------
# SC-AK-1246. Хук — ресурс пакета: раскладка кладёт его в каталог хуков дерева исполняемым и с
# шапкой, как всякий хук. Без собранного пакета сценарий не идёт, и это сказано вслух.
LAID="$(mktemp -d)"
git -C "$LAID" init -q 2>/dev/null
mkdir -p "$LAID/.claude"
printf '{"layout":{"hooks":".claude/hooks"},"variants":{"host":"github"},"only":["hooks/pre-push.sh"]}\n' \
    > "$LAID/.claude/rt-kit.json"
if [ -f "$TREE_ROOT/dist/agent-kit/bin/agent-kit.js" ]; then
    (cd "$LAID" && node "$TREE_ROOT/dist/agent-kit/bin/agent-kit.js" sync >/dev/null 2>&1)
    [ -x "$LAID/.claude/hooks/pre-push.sh" ] && laid=да || laid=нет
    report "SC-AK-1246 — раскладка кладёт хук исполняемым" "$laid" да
    report "SC-AK-1246 — у разложенного хука шапка раскладки" \
        "$(sed -n 2p "$LAID/.claude/hooks/pre-push.sh" | grep -c 'hooks/pre-push.sh')" 1
else
    echo "  SC-AK-1246 не шёл: пакет не собран — pnpm run build:agent-kit"
fi

rm -rf "$RED" "$GREEN" "$MARKED" "$GUARD_GREEN" "$GUARD_RED" "$OTHER" "$DELETE" "$PIPE" "$BARE_TREE" "$LAID"

suite_result "git-хук перед пушем"
