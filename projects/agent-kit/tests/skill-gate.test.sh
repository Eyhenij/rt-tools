#!/usr/bin/env bash
# Сценарии гейта правил: по чему он выбирает правило, что пропускает и когда замолкает.
#
# Проверяется механика, а не карта: имена правил здесь те, что называет умолчание пакета, и
# ровно поэтому набор не зависит от дерева, в котором его запустили.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гейт правил"

TREE="$(fixture_tree)"
export CLAUDE_PROJECT_DIR="$TREE"
# Правила, которые в этом дереве есть. Всё, что карта назовёт сверх них, гейт требовать не
# вправе: дерево отказалось от предметного слоя списком, и загружать такое имя нечем.
for rule in testing component-structure styling-bem typescript-conventions angular-patterns \
    doc-style spec-driven task-flow dependencies platform-access git-workflow shared-code; do
    mkdir -p "$TREE/.claude/skills/$rule"
    printf -- '---\nname: %s\nkind: rule\n---\n' "$rule" > "$TREE/.claude/skills/$rule/SKILL.md"
done
gate_session_reset
cleanup() {
    gate_session_cleanup
    rm -rf "$TREE"
}
trap cleanup EXIT

# Правку с телом принимает та же ветка гейта, поэтому вход собирается одним помощником.
g() { expect_skill "$1" "$(input_edit "$2" "${4:-}")" "$3"; }

# --- выбор правила по роду файла -------------------------------------------------------
g "спека" "$TREE/libs/site/x/util/src/lib/a.spec.ts" testing
g "класс компонента" "$TREE/libs/site/x/ui/src/lib/a.component.ts" component-structure
g "шаблон компонента" "$TREE/libs/site/x/ui/src/lib/a.component.html" component-structure
g "стили" "$TREE/libs/site/x/ui/src/lib/a.component.scss" styling-bem
g "обычный модуль" "$TREE/libs/site/x/util/src/lib/a.ts" typescript-conventions
g "сервис" "$TREE/libs/site/x/data-access/src/lib/a.service.ts" angular-patterns
g "документ" "$TREE/docs/adr/0001-x.md" doc-style
g "спек домена" "$TREE/docs/specs/bookings/spec.md" spec-driven
g "папка задачи" "$TREE/docs/tasks/RT-1-x/plan.md" task-flow

# SC-AK-43 — текст правила и текст паттерна устроены как спек, а не как файл агента.
g "SC-AK-43 — правило" "$TREE/.claude/skills/testing/SKILL.md" spec-driven
g "SC-AK-43 — компаньон правила" "$TREE/.claude/skills/testing/implementation.md" spec-driven
# SC-AK-44 — остальное хозяйство агента правится без правила: правило на него — оно само.
g "SC-AK-44 — роль" "$TREE/.claude/agents/qa-engineer.md" PASS
g "SC-AK-44 — команда" "$TREE/.claude/commands/plan.md" PASS
g "SC-AK-44 — конвейер" "$TREE/.claude/workflows/plan.js" PASS
# SC-AK-45 — запреты линтера и есть исполнение правил про типы и про оформление.
g "SC-AK-45 — линтер кода" "$TREE/eslint.config.mjs" typescript-conventions
g "SC-AK-45 — линтер стилей" "$TREE/stylelint.config.js" styling-bem
# SC-AK-46 — проверка повторов требует одно правило, а не два подряд.
g "SC-AK-46 — проверка повторов" "$TREE/tools/check-dupes.mjs" shared-code
g "SC-AK-46 — её список исключений" "$TREE/tools/dupes-allowlist.json" shared-code

g "манифест зависимостей" "$TREE/package.json" dependencies '"prettier": "3.9.6"'
# Правка скриптов зависимостью не является: правило про точные версии, снимок дерева и подмены
# на неё не вступает. Снимок правится тем же коммитом и правило потребует уже он.
g "скрипт в манифесте" "$TREE/package.json" PASS '"test:visual": "test-storybook --url http://localhost:6006"'

# --- правило вступает от того, ЧТО пишут ----------------------------------------------
# Обращение к среде исполнения приходит в обычный сервис, и по имени файла его не видно. Карта
# называет тогда два правила — по роду файла и по тексту правки, — а требуется первое
# незагруженное: отказ, перечисляющий оба, читается как «загрузи оба», и однократность теряется.
SRV="$TREE/libs/site/x/data-access/src/lib/env.service.ts"
ENVCODE='const w = globalThis.innerWidth;'
g "два правила сразу: первым идёт правило рода файла" "$SRV" angular-patterns "$ENVCODE"
gate_session_load angular-patterns
g "второе правило требуется следом" "$SRV" platform-access "$ENVCODE"
gate_session_load platform-access
g "оба загружены — правка проходит" "$SRV" PASS "$ENVCODE"
# Текст правки, разобранный до конца, не поднимает правило там, где оно не действует: тексты
# проекта и спеки читают ту же строку, и правило среды исполнения к ним не относится.
g "то же обращение в документе" "$TREE/docs/adr/0002-x.md" doc-style "$ENVCODE"

# --- границы --------------------------------------------------------------------------
# Файл соседнего репозитория на той же машине правилам этого дерева не подчиняется.
g "файл вне корня дерева" "/tmp/чужое/a.component.ts" PASS
g "неопознанное расширение" "$TREE/libs/site/x/util/src/lib/a.bin" PASS

# --- командная строка ------------------------------------------------------------------
c() { expect_skill "$1" "$(input_cmd "$2" "${3:-Bash}")" "${4:-git-workflow}"; }

c "коммит" 'git commit -m "chore: x"'
c "коммит из терминала среды" 'git commit -m "chore: x"' mcp__webstorm__execute_terminal_command
c "команда без правила" 'ls -la' Bash PASS

# Универсальный исполнитель прячет настоящую команду во вложенной строке: без её разбора
# коммит проходил бы мимо гейта, притом что тот же коммит из оболочки он отбивает.
c "вложенный вызов в кавычках" 'execute_terminal_command --command "git commit -m x"' mcp__webstorm__execute_tool
c "вложенный вызов через знак равенства" 'execute_terminal_command --command=git commit -m x' mcp__webstorm__execute_tool

# --- однократность за сессию ------------------------------------------------------------
# Отбитие повторяется до загрузки правила и замолкает после неё: гейт, отбивающий каждую
# правку, стоит дороже, чем правило, которое он охраняет.
g "до загрузки правила" "$TREE/libs/site/x/ui/src/lib/b.component.ts" component-structure
gate_session_load component-structure
g "после загрузки правила" "$TREE/libs/site/x/ui/src/lib/b.component.ts" PASS
# Имя с областью каталога принимается наравне с голым.
gate_session_load 'projects/ui:styling-bem'
g "правило загружено с областью каталога" "$TREE/libs/site/x/ui/src/lib/b.component.scss" PASS

# --- отказ в пользу работы --------------------------------------------------------------
# Сломанный гейт не имеет права остановить работу совсем: любой неразобранный вход пропускается.
exit_code_of() {
    printf '%s' "$2" | "$HOOKS/skill-gate.sh" >/dev/null 2>&1
    report "$1" "код:$?" "код:0"
}
# Правило, от которого дерево отказалось, гейт не требует: карта умолчания называет и предметный
# слой, а отказ «загрузи правило X» на отсутствующее имя — отказ без действия, и работа встаёт
# совсем. Правило `reuse-first` в этой фикстуре не заведено намеренно.
g "правила нет в дереве — гейт молчит" "$TREE/libs/site/x/ui/src/lib/c.reuse-only.ts" typescript-conventions
rm -rf "$TREE/.claude/skills/typescript-conventions"
g "и не требует ни одного, когда нет всех названных" "$TREE/libs/site/x/util/src/lib/d.ts" PASS

exit_code_of "пустой вход пропускается" ''
exit_code_of "неразбираемый вход пропускается" 'не json'
exit_code_of "незнакомый инструмент пропускается" "$(jq -n '{session_id:"tests",tool_name:"WebFetch",tool_input:{url:"http://x"}}')"
exit_code_of "правка без пути пропускается" "$(jq -n '{session_id:"tests",tool_name:"Edit",tool_input:{}}')"

suite_result "гейт правил"
