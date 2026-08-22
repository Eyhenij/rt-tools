#!/usr/bin/env bash
# Сценарии проверки границы пакета: два вопроса к ресурсу, отправляющая сторона, перечень
# отменяемого и место проверки в гейте пуша.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: граница пакета"

# --- граница пакета ---------------------------------------------------------------------------
#
# Фикстура — дерево с ресурсами пакета: проверка обходит то, что везёт раскладка, и ничего,
# кроме файлов, не спрашивает.

TREE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
BOUND_TREE="$(mktemp -d)"
mkdir -p "$BOUND_TREE/tools" "$BOUND_TREE/kit/assets/rules" "$BOUND_TREE/kit/assets/patterns" "$BOUND_TREE/kit/assets/commands" "$BOUND_TREE/kit/src/lib"
cp "$TREE_ROOT/tools/check-boundary.mjs" "$BOUND_TREE/tools/"

# Что напечатала проверка границы. Она отвечает перечнем, а не кодом на каждый ресурс.
bound_says() {
    (cd "$BOUND_TREE" && node tools/check-boundary.mjs kit 2>&1) | grep -cE "$1"
}

# Код возврата: ненулевой, пока в пакете лежит ресурс не для везения.
bound_code() {
    (cd "$BOUND_TREE" && node tools/check-boundary.mjs kit >/dev/null 2>&1)
    echo $?
}

# SC-AK-503 — отправляющая сторона проверку проходит
printf '/** Форма груза: то, что уезжает с дерева в приём. */\nexport const V = "1";\n' > "$BOUND_TREE/kit/src/lib/cargo.ts"
printf -- '---\nname: feedback\n---\n\nСлово о слое правил ложится блоком в файл предложений.\n' > "$BOUND_TREE/kit/assets/commands/feedback.md"
report "SC-AK-503 — отправляющая сторона молчит" "$(bound_says 'cargo\.ts|feedback\.md')" 0
report "SC-AK-503 — код возврата нулевой" "$(bound_code)" 0

# SC-AK-501 — ресурс, заговоривший о приёме, отбивается
printf -- '---\nname: cargo-triage\nkind: rule\n---\n\nГруз читается: админка приёма показывает столбец состояния.\n' > "$BOUND_TREE/kit/assets/rules/cargo-triage.md"
report "SC-AK-501 — ресурс о приёме назван" "$(bound_says 'cargo-triage\.md .* предмета нет')" 1
report "SC-AK-501 — код возврата ненулевой" "$(bound_code)" 1

# SC-AK-502 — ресурс, объявивший себя работой дерева пакета, отбивается
printf -- '---\nname: digest\n---\n\nЗовётся **в репозитории самого пакета**, а не в дереве, где он стоит.\n' > "$BOUND_TREE/kit/assets/commands/digest.md"
report "SC-AK-502 — ресурс дерева пакета назван" "$(bound_says 'digest\.md .* звать некому')" 1

# SC-AK-501 — паттерн наследует судьбу своего правила: своих оговорок у него не бывает
printf -- '---\nname: cargo-triage-mark\nkind: pattern\nrule: cargo-triage\n---\n\nГотовые вызовы.\n' > "$BOUND_TREE/kit/assets/patterns/cargo-triage-mark.md"
report "SC-AK-501 — паттерн правила не для везения назван" "$(bound_says 'cargo-triage-mark\.md .* паттерн правила')" 1

# SC-AK-504 — перечень отменяемого границу не закрывает
printf '{\n    "skip": [\n        "rules/cargo-triage.md"\n    ]\n}\n' > "$BOUND_TREE/rt-kit.json"
report "SC-AK-504 — ресурс в перечне всё равно назван" "$(bound_says 'cargo-triage\.md .* предмета нет')" 1
report "SC-AK-504 — код возврата остался ненулевым" "$(bound_code)" 1

# SC-AK-507 — известный долг держится перечнем, а не молчанием проверки
mkdir -p "$BOUND_TREE/tools"
printf '{\n    "accepted": {\n        "kit/assets/rules/cargo-triage.md": "переезжает своей задачей"\n    }\n}\n' > "$BOUND_TREE/tools/boundary-debt.json"
report "SC-AK-507 — долг назван строкой долга" "$(bound_says 'известного долга')" 1
report "SC-AK-507 — ресурс не из перечня всё равно краснеет" "$(bound_code)" 1
rm "$BOUND_TREE/tools/boundary-debt.json"

# SC-AK-506 — проверка входит в гейт пуша: шаг конвейера и его местная команда сходятся
gate_step() { grep -c 'name: Package boundary' "$TREE_ROOT/.github/workflows/ci.yml"; }
gate_local() { grep -c '"Package boundary": "node tools/check-boundary.mjs"' "$TREE_ROOT/.claude/rt-kit/checks.json"; }
report "SC-AK-506 — шаг стоит в конвейере" "$(gate_step)" 1
report "SC-AK-506 — у шага есть местная команда" "$(gate_local)" 1

rm -rf "$BOUND_TREE"
