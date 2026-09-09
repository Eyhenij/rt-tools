#!/usr/bin/env bash
# Сценарии входа в спеки по имени ресурса: что команда отвечает на имя, на неизвестное имя и на
# вызов без имени.
#
# Набор судит механику, а не дерево, в котором запущен: спеки, привязки и уложенные файлы задаются
# фикстурой. Иначе проба краснела бы от любой правки настоящих спек.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: вход в спеки по имени ресурса"

SF_TREE="$(mktemp -d)"
mkdir -p "$SF_TREE/tools" "$SF_TREE/.claude/rt-kit"
mkdir -p "$SF_TREE/docs/specs/dom/one" "$SF_TREE/docs/specs/dom/two"
mkdir -p "$SF_TREE/pkg/assets/hooks" "$SF_TREE/pkg/assets/rules"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/spec-common.mjs" "$CHECKS/specs-for.mjs" "$SF_TREE/tools/"

printf '{\n    "portableDirs": ["pkg/assets"]\n}\n' > "$SF_TREE/.claude/rt-kit/checks.json"

# Уложенные файлы фикстуры: два названы привязками, третий не назван никем.
printf 'deny() { :; }\n' > "$SF_TREE/pkg/assets/hooks/a-guard.sh"
printf 'deny() { :; }\n' > "$SF_TREE/pkg/assets/hooks/rule-source-guard.sh"
printf 'shared() { :; }\n' > "$SF_TREE/pkg/assets/hooks/shared.sh"
printf '# правило\n' > "$SF_TREE/pkg/assets/rules/lonely.md"

cat > "$SF_TREE/docs/specs/dom/one/implementation.md" <<'MAP'
# Привязка — поддомен один

- **Утверждение о первом гарде.** — `pkg/assets/hooks/a-guard.sh:deny`
- **Утверждение о гарде источника.** — `pkg/assets/hooks/rule-source-guard.sh:deny`
- **Утверждение поддомена один об общем файле.** — `pkg/assets/hooks/shared.sh:shared`
MAP

cat > "$SF_TREE/docs/specs/dom/two/implementation.md" <<'MAP'
# Привязка — поддомен два

- **Утверждение поддомена два об общем файле.** — `pkg/assets/hooks/shared.sh:shared`
MAP

sf_says() {
    (cd "$SF_TREE" && node tools/specs-for.mjs "$@" 2>&1)
}

sf_code() {
    (cd "$SF_TREE" && node tools/specs-for.mjs "$@" >/dev/null 2>&1)
    printf '%s' $?
}

# --- SC-AK-940 — по имени ресурса называются спека и её утверждения ------------------------
report "SC-AK-940 — называется спека поддомена" "$(sf_says hooks/a-guard.sh | grep -cxF 'docs/specs/dom/one/spec.md')" 1
report "SC-AK-940 — называется адрес привязки" "$(sf_says hooks/a-guard.sh | grep -cF 'pkg/assets/hooks/a-guard.sh:deny')" 1
report "SC-AK-940 — называется текст утверждения" "$(sf_says hooks/a-guard.sh | grep -cF 'Утверждение о первом гарде.')" 1
report "SC-AK-940 — чужое утверждение в ответ не попадает" "$(sf_says hooks/a-guard.sh | grep -cF 'Утверждение о гарде источника.')" 0
report "SC-AK-940 — код нулевой" "$(sf_code hooks/a-guard.sh)" 0

# --- SC-AK-941 — короткое имя и полный путь дают один ответ --------------------------------
report "SC-AK-941 — полный путь даёт тот же ответ" "$(diff <(sf_says hooks/a-guard.sh) <(sf_says pkg/assets/hooks/a-guard.sh) >/dev/null && printf да || printf нет)" "да"
report "SC-AK-941 — одно имя файла тоже находит" "$(sf_says a-guard.sh | grep -cxF 'docs/specs/dom/one/spec.md')" 1

# --- SC-AK-942 — хвост совпадает целыми звеньями пути --------------------------------------
report "SC-AK-942 — кусок имени файла совпадением не считается" "$(sf_code source-guard.sh)" 1
report "SC-AK-942 — целое имя файла совпадением считается" "$(sf_code rule-source-guard.sh)" 0
report "SC-AK-942 — кусок звена пути совпадением не считается" "$(sf_code ooks/a-guard.sh)" 1

# --- SC-AK-943 — имя, которое ничем не совпало, кончается отказом --------------------------
report "SC-AK-943 — код не нулевой" "$(sf_code hooks/нет-такого.sh)" 1
report "SC-AK-943 — отказ называет, что искали" "$(sf_says hooks/нет-такого.sh | grep -cF 'hooks/нет-такого.sh')" 1
report "SC-AK-943 — отказ называет вызов без имени" "$(sf_says hooks/нет-такого.sh | grep -cF 'without a name')" 1

# --- SC-AK-989 — ресурс без спеки отличается от имени, которого пакет не везёт -------------
report "SC-AK-989 — непокрытый ресурс отвечает своим кодом" "$(sf_code rules/lonely.md)" 3
report "SC-AK-989 — ответ говорит, что спеки о нём нет" "$(sf_says rules/lonely.md | grep -cF 'not one spec speaks of it')" 1
report "SC-AK-989 — ответ называет полный путь ресурса" "$(sf_says rules/lonely.md | grep -cF 'pkg/assets/rules/lonely.md')" 1
report "SC-AK-989 — ответ называет, сколько таких всего" "$(sf_says rules/lonely.md | grep -cF 'Such resources: 1')" 1
report "SC-AK-989 — незаведённое имя отвечает другим кодом" "$(sf_code rules/нет-такого.md)" 1
report "SC-AK-989 — незаведённое имя говорит, что пакет его не везёт" "$(sf_says rules/нет-такого.md | grep -cF 'carries no')" 1
report "SC-AK-989 — покрытый ресурс отвечает нулём" "$(sf_code hooks/a-guard.sh)" 0

# --- SC-AK-944 — файл, о котором говорят два поддомена, возвращается с обоими --------------
report "SC-AK-944 — назван первый поддомен" "$(sf_says hooks/shared.sh | grep -cxF 'docs/specs/dom/one/spec.md')" 1
report "SC-AK-944 — назван второй поддомен" "$(sf_says hooks/shared.sh | grep -cxF 'docs/specs/dom/two/spec.md')" 1
report "SC-AK-944 — утверждения стоят порознь" "$(sf_says hooks/shared.sh | grep -cF 'Утверждение поддомена')" 2

# --- SC-AK-945 — вызов без имени называет непокрытые ---------------------------------------
report "SC-AK-945 — неназванный файл стоит в списке" "$(sf_says | grep -cxF 'pkg/assets/rules/lonely.md')" 1
report "SC-AK-945 — названный привязкой файл в список не идёт" "$(sf_says | grep -cF 'a-guard.sh')" 0
report "SC-AK-945 — код нулевой" "$(sf_code)" 0

# --- SC-AK-946 — дерево без источников пакета даёт пустой список ---------------------------
printf '{\n    "portableDirs": []\n}\n' > "$SF_TREE/.claude/rt-kit/checks.json"
report "SC-AK-946 — список пуст" "$(sf_says | grep -c .)" 0
report "SC-AK-946 — код нулевой" "$(sf_code)" 0
report "SC-AK-946 — вход по имени работает по-прежнему" "$(sf_says hooks/a-guard.sh | grep -cxF 'docs/specs/dom/one/spec.md')" 1

rm -rf "$SF_TREE"

suite_result "проверки: вход в спеки по имени ресурса"
