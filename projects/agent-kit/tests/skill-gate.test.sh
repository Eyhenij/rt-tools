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

# Собранное дерево кодом не бывает: путь к артефакту приходит из команды, которая его запускает.
g "SC-AK-741 — собранный артефакт правила не требует" "$TREE/dist/site/a.component.ts" PASS
g "SC-AK-741 — зависимость правила не требует" "$TREE/node_modules/pkg/lib/a.ts" PASS
g "SC-AK-741 — тот же путь под исходниками правило требует" "$TREE/libs/site/x/ui/src/lib/a.component.ts" component-structure
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
# SC-AK-800 — своя редакция зависимостью не является: строка `"version"` в собственном манифесте
# говорит о выпуске этого пакета, а не о чужой версии, которую он тянет.
g "SC-AK-800 — своя версия в манифесте" "$TREE/package.json" PASS '"version": "0.19.0"'
g "SC-AK-800 — чужая версия рядом со своей" "$TREE/package.json" dependencies '"version": "0.19.0",
    "dependencies": { "prettier": "3.9.6" }'

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

# --- слои поверх доменного правила -------------------------------------------------------
#
# Доменное правило выбирается по пути, слой приходит сверх него. Проверяется это на дереве, где
# доменное правило уже загружено: гейт требует первое незагруженное, и без этого слой был бы не
# виден за доменным.

# Состояние загруженного набралось выше: слои проверяются с чистого листа, иначе доменное
# правило уже загружено и слой за ним не виден.
gate_session_reset

# SC-AK-99 — слой требует правило ПОВЕРХ доменного, а не вместо него.
mkdir -p "$TREE/.claude/skills/observability"
printf -- '---\nname: observability\nkind: rule\n---\n' > "$TREE/.claude/skills/observability/SKILL.md"
g "SC-AK-99 — доменное правило остаётся первым" "$TREE/libs/site/x/ui/src/lib/b.component.ts" \
    component-structure 'const w = globalThis.innerWidth;'
gate_session_load component-structure angular-patterns
g "SC-AK-99 — слой приходит вторым, а не вместо" "$TREE/libs/site/x/ui/src/lib/b.component.ts" \
    platform-access 'const w = globalThis.innerWidth;'

# SC-AK-100 — признак, невидимый по пути, судится по тексту правки.
gate_session_load typescript-conventions
g "SC-AK-100 — обращение к среде видно только в тексте" "$TREE/libs/site/x/util/src/lib/e.ts" \
    platform-access 'const view = document.defaultView;'
g "SC-AK-100 — чтение окружения зовёт наблюдаемость" "$TREE/libs/site/x/util/src/lib/f.ts" \
    observability 'const url = process.env["API_URL"];'

# SC-AK-101 — место, где признак разрешён, слоя не получает. Какое место разрешено, говорит
# само дерево: слои адресов не знают.
printf 'skill_layer_skip() { [ "$1" = "platform-access" ] && case "$2" in */lib/g.ts) return 0 ;; esac; return 1; }\n' \
    >> "$TREE/.claude/rt-kit/defaults/gate-map.sh"
g "SC-AK-101 — снятый деревом слой не требуется" "$TREE/libs/site/x/util/src/lib/g.ts" \
    PASS 'const view = document.defaultView;'
g "SC-AK-101 — соседний файл слой получает" "$TREE/libs/site/x/util/src/lib/h.ts" \
    platform-access 'const view = document.defaultView;'

# SC-AK-102 — слой без разборщика входа отпускает правку: разбор здесь побочная работа.
no_jq_dir="$(mktemp -d)"
printf '#!/bin/sh\nexit 1\n' > "$no_jq_dir/jq"
chmod +x "$no_jq_dir/jq"
layers_code="$(PATH="$no_jq_dir:$PATH" sh -c "printf '%s' '$(input_edit "$TREE/libs/site/x/util/src/lib/i.ts" 'const view = document.defaultView;')' | '$HOOKS/skill-gate.sh' >/dev/null 2>&1"; printf '%s' "$?")"
report "SC-AK-102 — без разборщика входа правка проходит" "код:$layers_code" "код:0"
rm -rf "$no_jq_dir"

# Дальше идут сценарии, которым нужен незагруженный набор: состояние возвращается чистым.
gate_session_reset

# --- правило под инструмент и второй слой команды ------------------------------------------
#
# Проверка через браузер — единственная область, где правило требуется не под правку файла, а под
# инструмент: врут там не файлы, а стенд и координаты.
mkdir -p "$TREE/.claude/skills/browser-verification"
printf -- '---\nname: browser-verification\nkind: rule\n---\n' \
    > "$TREE/.claude/skills/browser-verification/SKILL.md"
expect_skill "SC-AK-111 — инструмент браузера требует своё правило" \
    "$(jq -n '{session_id:"tests",tool_name:"mcp__claude-in-chrome__navigate",tool_input:{url:"http://localhost:4200"}}')" \
    browser-verification

# Слияние PR требует два правила подряд: поставку и разбор папки задачи. Требуется первое
# незагруженное — отказ, перечисляющий оба, читается как «загрузи оба», и однократность теряется.
c "SC-AK-110 — слияние PR: первым правило поставки" 'gh pr merge 12 --merge'
gate_session_load git-workflow
c "SC-AK-110 — слияние PR: следом ведение работы" 'gh pr merge 12 --merge' Bash task-flow
# Упоминание команды в тексте вызовом не является: пока карта судила по подстроке, гейт отбивал
# строку о коммите в теле самого коммита.
c "SC-AK-109 — упоминание команды вызовом не считается" 'echo "потом git commit -m x" >> notes.md' Bash PASS

# Запасной ход назван прямо в отказе: правило, заведённое в этой же ветке, реестру правил
# неизвестно — он собирается на запуске сессии, а гейт читает диск.
gate_session_reset
expect_reason "отказ называет запасной ход" skill-gate.sh \
    "$(input_edit "$TREE/libs/site/x/ui/src/lib/z.component.ts")" \
    'SKILL\.md'

# --- отказ называет статью, а не правило целиком ---------------------------------------------
#
# Правило весит от двадцати до шестидесяти килобайт, а под конкретную правку подпадает одна его
# статья. Признак стоит при самой статье; правило без размеченных статей отбивает прежним
# текстом — это отказ в пользу работы, а не пропуск.
gate_session_reset
cat > "$TREE/.claude/skills/styling-bem/SKILL.md" <<'MD'
---
name: styling-bem
kind: rule
---

# Оформление

## Как закон применяется здесь

- **Оформление берётся ступенью, а не числом.** Написанное на месте число живёт мимо шкалы.
  <!-- rt-when: *.scss *.css -->
- **Имя блока даёт директива.** Строка в атрибуте расходится с разбором шаблона.
MD

expect_reason "SC-AK-498 — отказ на правке стилей несёт текст статьи" skill-gate.sh     "$(input_edit "$TREE/libs/site/x/ui/src/lib/a.component.scss")"     'Оформление берётся ступенью'

gate_session_reset
expect_reason "SC-AK-499 — правило целиком остаётся вторым ходом" skill-gate.sh     "$(input_edit "$TREE/libs/site/x/ui/src/lib/a.component.scss")"     'load the rule «styling-bem»'

# SC-AK-706 — спутник правила назван в отказе безусловно
#
# Правило говорит, что должно быть верно, а спутник — чем это верно здесь и что здесь названо
# невозможным. Прежде спутник стоял только в запасном ходе, и читатель, у которого имя правила
# известно, до него не доходил.
printf '%s\n' '# styling-bem — что здесь своё' > "$TREE/.claude/skills/styling-bem/implementation.md"
gate_session_reset
expect_reason "SC-AK-706 — отказ называет спутник правила" skill-gate.sh     "$(input_edit "$TREE/libs/site/x/ui/src/lib/a.component.scss")"     'styling-bem/implementation\.md'

# Отказ называет статьи, а не пересказывает их: текст придёт в контекст вместе с правилом,
# которое заход грузит следом. У правила текстов отказ печатал 4 134 знака одиннадцатью
# статьями — их заголовки весят 718.
gate_session_reset
expect_reason "SC-AK-656 — отказ называет статью заголовком" skill-gate.sh \
    "$(input_edit "$TREE/libs/site/x/ui/src/lib/a.component.scss")" \
    'Оформление берётся ступенью'
gate_session_reset
expect_no_reason "SC-AK-657 — тела статьи в отказе нет" skill-gate.sh \
    "$(input_edit "$TREE/libs/site/x/ui/src/lib/a.component.scss")" \
    'живёт мимо шкалы'

# Правило без размеченных статей отбивает прежним текстом: под правку кода в этом правиле-пробе
# признака нет ни у одной статьи.
gate_session_reset
expect_reason "SC-AK-500 — неразмеченное правило отбивает прежним текстом" skill-gate.sh     "$(input_edit "$TREE/libs/site/x/util/src/lib/a.ts")"     'Refused by the rules gate: load the rule'

# --- вторая дверь: тот же файл, записанный командой -----------------------------------------
#
# Гейт, подписанный на инструмент правки, обходится сменой способа записи: правило остаётся
# незагруженным, а файл — записанным. Отбитая правка дважды за один заход легла командой —
# разбор `2026-08-15-guard-denied-shell-wrote-anyway.md`. Требуется то же правило, что и под
# правку того же файла инструментом.
c "SC-AK-253 — перенаправление в класс компонента" \
    'echo x > libs/site/x/ui/src/lib/a.component.ts' Bash component-structure
c "SC-AK-253 — дописывание в шаблон" \
    'echo x >> libs/site/x/ui/src/lib/a.component.html' Bash component-structure
c "SC-AK-253 — правка стилей на месте" \
    "sed -i '' 's/a/b/' libs/site/x/ui/src/lib/a.component.scss" Bash styling-bem
c "SC-AK-253 — запись спеки через tee" \
    'cat f | tee libs/site/x/util/src/lib/a.spec.ts' Bash testing
c "SC-AK-253 — копирование поверх модуля" \
    'cp /tmp/a libs/site/x/util/src/lib/a.ts' Bash typescript-conventions
c "SC-AK-253 — возврат версии из истории" \
    'git checkout HEAD -- libs/site/x/util/src/lib/b.ts' Bash typescript-conventions

# Чтение и поиск правила не требуют: гейт судит запись, а не всякое упоминание пути.
c "SC-AK-250 — чтение файла пропускается" \
    'cat libs/site/x/ui/src/lib/a.component.ts' Bash PASS
c "SC-AK-250 — поиск по каталогу пропускается" \
    'grep -rn xyz libs/site/x/ui/src/lib/' Bash PASS

# Пути берутся у пишущего куска команды, а не у строки целиком. Прежде команда чтения,
# сцепленная с записью, отдавала свои пути как цели записи, и правило требовалось за чтение
# соседнего файла — отбитий, пришедшихся не на правку, набиралось большинство.
c "SC-AK-533 — чтение кода рядом с записью документа правила кода не требует" \
    'printf x > docs/adr/x.md; grep -n foo libs/site/x/ui/src/lib/a.component.ts' Bash doc-style
c "SC-AK-533 — запись кода рядом с чтением документа правило требует" \
    'grep -n foo docs/adr/x.md; printf x > libs/site/x/ui/src/lib/a.component.ts' Bash component-structure
c "SC-AK-533 — упоминание кода в теле документа правила кода не требует" \
    "cat > docs/adr/x.md <<'EOF'
речь о libs/site/x/ui/src/lib/a.component.ts
EOF" Bash doc-style

# Правила этого дерева действуют на файлы этого дерева: соседний репозиторий на той же машине
# им не подчиняется ни одной из дверей.
c "SC-AK-255 — запись за пределы дерева пропускается" \
    'echo x > /tmp/чужое/a.component.ts' Bash PASS

# Терминал среды исполняет ту же командную строку и кладёт её в то же поле.
c "SC-AK-251 — та же запись из терминала среды" \
    'echo x > libs/site/x/ui/src/lib/a.component.ts' \
    mcp__webstorm__execute_terminal_command component-structure

# Универсальный исполнитель прячет настоящую команду во вложенной строке.
c "SC-AK-252 — вложенная запись универсального исполнителя" \
    'execute_terminal_command --command "echo x > libs/site/x/ui/src/lib/a.component.ts"' \
    mcp__webstorm__execute_tool component-structure

gate_session_reset

# SC-AK-734 — отказ называет, что потребуется дальше по этой же команде
# Требуется по-прежнему одно правило за раз: перечень читается как «загрузи три», и однократность
# теряется. Названное вперёд — не требование, а длина пути: тринадцать отказов подряд за одну
# задачу читались как тринадцать разных требований.
gate_session_reset
expect_reason "SC-AK-734 — отказ называет следующее правило" skill-gate.sh \
    "$(input_cmd 'printf x > libs/site/x/ui/src/lib/a.component.scss; printf y > docs/adr/0002-x.md' Bash)" \
    'Further along this same command these will be needed'
gate_session_reset

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

# --- SC-AK-850. Тело задачи и заявки уходит наружу командой, а не правкой файла ----------------
# Гейт проверял расширение правимого файла и на такой команде молчал; читает этот текст человек:
# владелец прочитал семь своих задач и две заявки, прежде чем сказать о языке в них.
gate_session_reset
c "SC-AK-850 — заявка с телом требует правило слога" \
    'gh pr create --title "[RT-1] Сделано" --body "что меняется"' Bash git-workflow
c "SC-AK-850 — то же правило требуется и на заведении задачи" \
    'gh issue create --title "[RT-1] Дефект" --body-file /tmp/body.md' Bash git-workflow
gate_session_reset

# Вызов клиента без тела правила слога не требует: проверяются оба признака сразу.
c "SC-AK-850 — заявка без тела слога не требует" 'gh pr view 12' Bash PASS
# Упоминание тела в чужой команде вызовом не считается.
c "SC-AK-850 — упоминание в поиске вызовом не считается" \
    'grep -rn "gh pr create --body" docs/' Bash PASS
gate_session_reset


suite_result "гейт правил"
