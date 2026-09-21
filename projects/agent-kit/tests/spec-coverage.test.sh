#!/usr/bin/env bash
# Сценарии проверки покрытия: когда она отбивает отправку и когда молчит по устройству.
#
# Дерево задаётся фикстурой: набор судит проверку, а не покрытие того дерева, в котором запущен.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: ресурс без спеки не уезжает молча"

SC_TREE="$(mktemp -d)"
mkdir -p "$SC_TREE/tools" "$SC_TREE/.claude/rt-kit"
mkdir -p "$SC_TREE/docs/specs/dom/one" "$SC_TREE/pkg/assets/hooks"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/spec-common.mjs" "$CHECKS/specs-for.mjs" \
    "$CHECKS/check-spec-coverage.mjs" "$SC_TREE/tools/"

sc_config() {
    printf '%s\n' "$1" > "$SC_TREE/.claude/rt-kit/checks.json"
}

sc_says() {
    (cd "$SC_TREE" && node tools/check-spec-coverage.mjs 2>&1)
}

sc_code() {
    (cd "$SC_TREE" && node tools/check-spec-coverage.mjs >/dev/null 2>&1)
    printf '%s' $?
}

printf 'deny() { :; }\n' > "$SC_TREE/pkg/assets/hooks/a-guard.sh"
cat > "$SC_TREE/docs/specs/dom/one/implementation.md" <<'MAP'
# Привязка — поддомен один

- **Утверждение о первом гарде.** — `pkg/assets/hooks/a-guard.sh:deny`
MAP

# --- SC-AK-1147 — непокрытых нет: проверка молчит и пропускает ---------------------------------
sc_config '{
    "portableDirs": ["pkg/assets"]
}'
report "SC-AK-1147 — при полном покрытии отправка идёт" "$(sc_code)" 0
report "SC-AK-1147 — сказано, что покрыто всё" "$(sc_says | grep -c 'spoken of by a spec')" 1

# --- SC-AK-1148 — непокрытый ресурс отбивает отправку -------------------------------------------
printf 'deny() { :; }\n' > "$SC_TREE/pkg/assets/hooks/b-guard.sh"
report "SC-AK-1148 — непокрытый ресурс отбит" "$(sc_code)" 1
report "SC-AK-1148 — названо число непокрытых" "$(sc_says | grep -c 'no spec speaks of 1')" 1
report "SC-AK-1148 — назван сам ресурс" "$(sc_says | grep -c 'b-guard.sh')" 1
rm -f "$SC_TREE/pkg/assets/hooks/b-guard.sh"

# --- SC-AK-1149 — дерево без объявленных папок пакета не судится --------------------------------
sc_config '{
    "portableDirs": []
}'
printf 'deny() { :; }\n' > "$SC_TREE/pkg/assets/hooks/c-guard.sh"
report "SC-AK-1149 — дерево без папок пакета пропущено" "$(sc_code)" 0
report "SC-AK-1149 — сказано, почему пропущено" "$(sc_says | grep -c 'nothing to judge')" 1

# --- SC-AK-1150 — входа в спеки нет: проверка говорит об этом вслух ------------------------------
sc_config '{
    "portableDirs": ["pkg/assets"]
}'
mv "$SC_TREE/tools/specs-for.mjs" "$SC_TREE/specs-for.away"
report "SC-AK-1150 — без входа в спеки отправка идёт" "$(sc_code)" 0
report "SC-AK-1150 — сказано, что спросить нечем" "$(sc_says | grep -c 'nothing to ask with')" 1
mv "$SC_TREE/specs-for.away" "$SC_TREE/tools/specs-for.mjs"

rm -rf "$SC_TREE"

suite_result "проверки: ресурс без спеки не уезжает молча"
