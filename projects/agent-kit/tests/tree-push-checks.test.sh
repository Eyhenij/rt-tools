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

# Адрес хранилища снимается с окружения: набор бывает запущен из-под крючка отправки, а тот
# выставляет `GIT_DIR` на настоящее дерево. Одноразовый репозиторий тогда не заводится вовсе —
# вызовы уходят в дерево, где идёт работа, и правят его ветки.
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES

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
        | tr '\n' ' ' | sed 's/ $//'
}

# Сошлись ли два набора слов. Порядок не судится: он зависит от локали машины, а на разных
# машинах она разная — сравнение строкой зеленело у автора и краснело в конвейере, не сказав
# ничего о самом наборе. Судится присутствие каждого слова и отсутствие лишних.
same_set() {
    for _w in $1; do
        case " $2 " in *" $_w "*) ;; *) return 1 ;; esac
    done
    for _w in $2; do
        case " $1 " in *" $_w "*) ;; *) return 1 ;; esac
    done

    return 0
}

# Случай: название, состав правки, ожидаемые тяжёлые шаги через пробел. Порядок безразличен.
probe() {
    label="$1"
    dir="$(probe_repo "$2")"
    got="$(heavy_for "$dir")"
    rm -rf "$dir"

    if same_set "$got" "$3"; then
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
probe 'проверки дерева' 'tools/probe.mjs' ''
probe 'проверка рядом с китом' 'tools/probe.mjs projects/ui-kit/src/a.ts' 'кит1'
probe 'первый кит' 'projects/ui-kit/src/lib/probe.ts' 'кит1'
# Второй кит рисует не только свою витрину: админка подключает его набор стилей, и её экраны
# обязаны сличиться на правке кита. Дерево называет эту связь в своей надстройке.
probe 'второй кит' 'projects/ui-kit-v2/src/lib/probe.ts' 'кит2 сквозной'
probe 'оба кита' 'projects/ui-kit/src/a.ts projects/ui-kit-v2/src/b.ts' 'кит1 кит2 сквозной'
probe 'кит и обвязка агента' 'projects/ui-kit-v2/src/a.ts .claude/hooks/probe.sh' 'кит2 сквозной'
probe 'приёмник' 'apps/message-bus/src/probe.ts' 'образ-админки образ-приёмника сквозной'
probe 'админка' 'apps/message-bus-admin/src/probe.ts' 'образ-админки образ-приёмника сквозной'
probe 'выкатка' 'deploy/probe.yml' 'образ-админки образ-приёмника сквозной'
probe 'схема базы' 'prisma/schema.prisma' 'образ-админки образ-приёмника сквозной'
probe 'приёмник и кит' 'apps/message-bus/src/a.ts projects/ui-kit/src/b.ts' 'кит1 образ-админки образ-приёмника сквозной'
# Сквозной набор зовут оба предмета сразу, и выйти он обязан один раз: напечатанный дважды,
# он и прогонялся бы дважды.
probe 'приёмник и второй кит' 'apps/message-bus/src/a.ts projects/ui-kit-v2/src/b.ts' 'кит2 образ-админки образ-приёмника сквозной'

# Незнакомое и общее поднимают весь набор: делить их между предметами нельзя.
ALL='кит1 кит2 образ-админки образ-приёмника сквозной'
probe 'снимок зависимостей' 'pnpm-lock.yaml' "$ALL"
probe 'корневая настройка' 'nx.json' "$ALL"
probe 'общая библиотека' 'projects/core/src/probe.ts' "$ALL"
probe 'конвейер' '.github/workflows/probe.yml' "$ALL"
probe 'путь, которого признак не знает' 'внезапно/новое.ts' "$ALL"
probe 'незнакомое рядом с китом' 'projects/ui-kit/src/a.ts внезапно/новое.ts' "$ALL"

# SC-AK-673 — проверки слоя оформления зовутся набором гейта при любом составе правки.
#
# Пять проверок слоя оформления второго кита не звал никто: ни гейт пуша, ни конвейер. Видно это
# было по тому, как они себя ведут — сверка графа токенов стояла красной несколько дней подряд, и
# ни один пуш об этом не сказал. Тяжёлыми они не считаются: вместе идут три секунды, поэтому
# зовутся при любом составе правки, а не по предмету.
checks_for() {
    dir="$1"
    (
        cd "$dir" || exit 1
        . "$root/.claude/rt-kit/defaults/project.sh" 2>/dev/null || true
        . "$root/.claude/rt-kit/project.sh" 2>/dev/null || true
        rt_push_checks main 2>/dev/null
    )
}

style_probe() {
    dir="$(probe_repo "$2")"
    got="$(checks_for "$dir")"
    rm -rf "$dir"
    missing=''
    for cmd in 'build-tokens-v2.mjs --check' 'check-tokens-graph.mjs' 'check-tokens-theme.mjs' \
        'check-tokens-styles.mjs' 'check-cascade-layer.mjs'; do
        case "$got" in *"$cmd"*) ;; *) missing="$missing $cmd" ;; esac
    done
    if [ -z "$missing" ]; then
        ok=$((ok + 1))
    else
        bad=$((bad + 1))
        printf '  РАЗОШЛОСЬ %s\n    не зовутся:%s\n' "$1" "$missing"
    fi
}

style_probe 'SC-AK-673 — только тексты: проверки оформления всё равно зовутся' 'docs/x.md'
style_probe 'SC-AK-673 — снимок зависимостей поднимает их наравне с остальным' 'pnpm-lock.yaml'

printf 'набор гейта по предмету правки: %s ok, %s расхождений\n' "$ok" "$bad"
[ "$bad" -eq 0 ]
