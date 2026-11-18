#!/usr/bin/env bash
# Сценарии текста отказа гейта правил: что называет отказ, который остался правилу длиннее предела.
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
    doc-style spec-driven task-flow dependencies platform-access git-workflow shared-code deploy-flow \
    epic-flow; do
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

c() { expect_skill "$1" "$(input_cmd "$2" "${3:-Bash}")" "${4:-git-workflow}"; }

# Запасной ход назван прямо в отказе: правило, заведённое в этой же ветке, реестру правил
# неизвестно — он собирается на запуске сессии, а гейт читает диск.
#
# Отказ остался только правилу длиннее предела хозяина: правило, которое влезает, гейт кладёт в
# заход сам. Тексты отказа ниже проверяются на пределе в один знак — под ним не влезает ничего.
export RT_GATE_CONTEXT_LIMIT=1
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
expect_no_reason "SC-AK-734 — правило двух записей одной команды названо однажды" skill-gate.sh \
    "$(input_cmd 'printf x > libs/site/x/ui/src/lib/a.component.scss; printf y > docs/adr/0002-x.md; printf z > docs/adr/0003-x.md' Bash)" \
    'doc-style, doc-style'
gate_session_reset
unset RT_GATE_CONTEXT_LIMIT

suite_result "текст отказа гейта правил"
