#!/usr/bin/env bash
# Сценарии корней, под которыми сверка спеков ищет наборы: набор рядом с инструментами и корень,
# вложенный в другой названный корень.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: корни наборов"

# Фикстура повторяет раскладку дерева: проверки лежат в `tools/`, тексты — там, где их ищет
# настройка. Префикс сценария собирается из частей: написанный литералом, он читался бы сверкой
# этого дерева как ссылка на сценарий, которого здесь нет.
PREFIX="$(printf 'Z%s' T)"
ROOTS_TREE="$(mktemp -d)"
mkdir -p "$ROOTS_TREE/tools" "$ROOTS_TREE/docs/constitution" "$ROOTS_TREE/.claude/rt-kit" "$ROOTS_TREE/.claude/skills"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/check-specs.mjs" \
    "$CHECKS/spec-common.mjs" "$CHECKS/spec-anchors.mjs" "$CHECKS/spec-contract.mjs" "$CHECKS/spec-scenarios.mjs" "$CHECKS/spec-proposed.mjs" \
    "$ROOTS_TREE/tools/"

# Спек со всеми обязательными разделами: в выводе должно остаться только то, ради чего заведён
# сценарий.
mkdir -p "$ROOTS_TREE/docs/specs/zeta"
{
    printf '# Зета\n\n**Статус:** действует · **Префикс сценариев:** `SC-%s`\n**Законы:** нет\n**Процедуры:** нет\n\n' "$PREFIX"
    for heading in '## Зачем' '## Терминология' '### Как это называется в интерфейсе' '## Правила' \
        '## Что не входит' '## Контракт' '### Коды отказов' '## Данные' '## Экраны и состояния' \
        '## Сквозные требования' '### Локали' '### SEO' '### Мобильная раскладка' '### Мультиобъектность' \
        '## Решения' '## Открытые вопросы' '## История изменений'; do
        printf '%s\n\nНе применимо.\n\n' "$heading"
    done
} > "$ROOTS_TREE/docs/specs/zeta/spec.md"
printf '# Привязка\n\n| Правило | Где исполняется |\n| --- | --- |\n' > "$ROOTS_TREE/docs/specs/zeta/implementation.md"
printf '# Сценарии\n\n### SC-%s-01 — первый\n\nДано раз\nКогда два\nТогда три\n\nНе покрыто: набора ещё нет.\n' "$PREFIX" \
    > "$ROOTS_TREE/docs/specs/zeta/scenarios.md"

# Сверка судится по строкам, которые напечатала: она отвечает перечнем расхождений, а не кодом на
# каждое из них. Пометка «Не покрыто» при найденном наборе даёт свою строку — по ней и видно,
# дошёл ли обход до корня.
specs_says() {
    (cd "$ROOTS_TREE" && node tools/check-specs.mjs 2>&1) | grep -cE "$1"
}

# Число мест у сценария: сверка его не печатает, а удвоенный обход виден только по нему.
printf 'import { collectReferences } from "./spec-scenarios.mjs";\nconsole.log((collectReferences().get(process.argv[2]) ?? []).length);\n' \
    > "$ROOTS_TREE/tools/places.mjs"
places_of() {
    (cd "$ROOTS_TREE" && node tools/places.mjs "$1")
}

settings() {
    printf '%s\n' "$1" > "$ROOTS_TREE/.claude/rt-kit/checks.json"
}

# --- SC-AK-921 — набор рядом с инструментами виден по объявленному корню --------------------
#
# Наборы, которыми дерево проверяет свои проверки, лежат не под корнями исходников: инструменты —
# не код приложения. Пока корни читались из одной настройки, такой набор был невидим, и сценарий
# под ним стоял «Не покрыто» наравне с тем, под который набора не писали вовсе.

mkdir -p "$ROOTS_TREE/tools/tests"
printf '# набор: SC-%s-01\n' "$PREFIX" > "$ROOTS_TREE/tools/tests/probe.test.sh"

settings '{ "sourceRoots": ["apps", "libs"] }'
report "SC-AK-921 — без объявленного корня набор невидим" "$(specs_says 'is marked .*Not covered.*, and there is a test')" 0
report "SC-AK-921 — без объявленного корня мест нет" "$(places_of "SC-$PREFIX-01")" 0

settings '{ "sourceRoots": ["apps", "libs"], "testRoots": ["tools"] }'
report "SC-AK-921 — объявленный корень возвращает набор" "$(specs_says 'is marked .*Not covered.*, and there is a test')" 1
report "SC-AK-921 — набор назван одним местом" "$(places_of "SC-$PREFIX-01")" 1

# --- SC-AK-922 — вложенный корень обходится один раз ----------------------------------------
#
# Корни наборов дополняют корни исходников, и дерево вольно назвать папку внутри уже названного
# корня. Обойдённая дважды, она удваивает каждую ссылку: покрытие считается по числу мест, и
# отказ называет место, которого в дереве одно.

rm -rf "$ROOTS_TREE/tools/tests"
mkdir -p "$ROOTS_TREE/src/tests"
printf '# набор: SC-%s-01\n' "$PREFIX" > "$ROOTS_TREE/src/tests/probe.test.sh"

settings '{ "sourceRoots": ["src"], "testRoots": ["src/tests"] }'
report "SC-AK-922 — вложенный корень не удваивает место" "$(places_of "SC-$PREFIX-01")" 1

settings '{ "sourceRoots": ["src"], "testRoots": ["src"] }'
report "SC-AK-922 — повторённый корень не удваивает место" "$(places_of "SC-$PREFIX-01")" 1

rm -rf "$ROOTS_TREE"

suite_result "проверки: корни наборов"
