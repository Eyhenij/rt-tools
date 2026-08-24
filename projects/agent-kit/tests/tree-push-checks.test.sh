#!/usr/bin/env bash
# Какой набор гейта поднимает тот или иной состав правки.
#
# Набор зовётся по предмету: ветка, не задевшая путей предмета, за его тяжёлый шаг не платит.
# Проверить это на живой ветке нельзя — состав правки у неё один, а случаев больше десятка.
# Поэтому пробник заводит одноразовый репозиторий на каждый случай, кладёт в него названные
# файлы одним коммитом и спрашивает у профиля дерева готовый набор.
#
# Печатает строку на случай: ожидание против полученного. Ненулевой код — хоть один разошёлся.
set -u

root="$(cd "$(dirname "$0")/../../.." && pwd)"
ok=0
bad=0

# Одноразовый репозиторий с главной веткой и одним коммитом поверх неё.
probe_repo() {
    dir="$(mktemp -d)"
    git -C "$dir" init -q -b main
    git -C "$dir" config user.email probe@example.invalid
    git -C "$dir" config user.name probe
    git -C "$dir" config commit.gpgsign false
    mkdir -p "$dir/seed"
    printf 'x\n' > "$dir/seed/base.txt"
    git -C "$dir" add -A >/dev/null 2>&1
    git -C "$dir" commit -qm 'основание' >/dev/null 2>&1
    git -C "$dir" checkout -qb probe

    for path in $1; do
        mkdir -p "$dir/$(dirname "$path")"
        printf 'правка\n' > "$dir/$path"
    done
    git -C "$dir" add -A >/dev/null 2>&1
    git -C "$dir" commit -qm 'правка' >/dev/null 2>&1

    printf '%s' "$dir"
}

# Что профиль дерева отдаёт для такого состава правки: только тяжёлые шаги, по одному слову.
heavy_for() {
    dir="$1"
    (
        cd "$dir" || exit 1
        # Умолчания пакета нужны: набор собирается из них и надстройки дерева.
        . "$root/.claude/rt-kit/defaults/project.sh" 2>/dev/null || true
        . "$root/.claude/rt-kit/project.sh" 2>/dev/null || true
        rt_push_checks main 2>/dev/null
    ) | sed -n \
        -e 's|.*message-bus-admin-e2e:e2e.*|сквозной|p' \
        -e 's|.*visual-gate.mjs ui-kit-v2.*|кит2|p' \
        -e 's|.*visual-gate.mjs ui-kit$|кит1|p' \
        -e 's|.*message-bus.Dockerfile.*|образ-приёмника|p' \
        -e 's|.*message-bus-web.Dockerfile.*|образ-админки|p' \
        | sort | tr '\n' ' ' | sed 's/ $//'
}

# Случай: название, состав правки, ожидаемые тяжёлые шаги (по алфавиту, через пробел).
probe() {
    label="$1"
    dir="$(probe_repo "$2")"
    got="$(heavy_for "$dir")"
    rm -rf "$dir"

    if [ "$got" = "$3" ]; then
        ok=$((ok + 1))
    else
        bad=$((bad + 1))
        printf '  РАЗОШЛОСЬ %s\n    ждали:   «%s»\n    вышло:   «%s»\n' "$label" "$3" "$got"
    fi
}

echo "набор гейта по предмету правки (SC-AK-569)"

probe 'только тексты' 'docs/x.md README.md' ''
probe 'только обвязка агента' '.claude/hooks/probe.sh projects/agent-kit/assets/hooks/probe.sh' ''
probe 'тексты и обвязка вместе' 'docs/x.md .claude/rt-kit/project.sh' ''
probe 'первый кит' 'projects/ui-kit/src/lib/probe.ts' 'кит1'
probe 'второй кит' 'projects/ui-kit-v2/src/lib/probe.ts' 'кит2'
probe 'оба кита' 'projects/ui-kit/src/a.ts projects/ui-kit-v2/src/b.ts' 'кит1 кит2'
probe 'кит и обвязка агента' 'projects/ui-kit-v2/src/a.ts .claude/hooks/probe.sh' 'кит2'
probe 'приёмник' 'apps/message-bus/src/probe.ts' 'образ-админки образ-приёмника сквозной'
probe 'админка' 'apps/message-bus-admin/src/probe.ts' 'образ-админки образ-приёмника сквозной'
probe 'выкатка' 'deploy/probe.yml' 'образ-админки образ-приёмника сквозной'
probe 'схема базы' 'prisma/schema.prisma' 'образ-админки образ-приёмника сквозной'
probe 'приёмник и кит' 'apps/message-bus/src/a.ts projects/ui-kit/src/b.ts' 'кит1 образ-админки образ-приёмника сквозной'

# Незнакомое и общее поднимают весь набор: делить их между предметами нельзя.
ALL='кит1 кит2 образ-админки образ-приёмника сквозной'
probe 'снимок зависимостей' 'pnpm-lock.yaml' "$ALL"
probe 'корневая настройка' 'nx.json' "$ALL"
probe 'общая библиотека' 'projects/core/src/probe.ts' "$ALL"
probe 'обвязка проверок' 'tools/probe.mjs' "$ALL"
probe 'конвейер' '.github/workflows/probe.yml' "$ALL"
probe 'путь, которого признак не знает' 'внезапно/новое.ts' "$ALL"
probe 'незнакомое рядом с китом' 'projects/ui-kit/src/a.ts внезапно/новое.ts' "$ALL"

printf 'набор гейта по предмету правки: %s ok, %s расхождений\n' "$ok" "$bad"
[ "$bad" -eq 0 ]
