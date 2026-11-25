#!/usr/bin/env bash
# The record of the closed work built from the task folder and the body of the PR. Every scenario
# builds its own repository with a task folder in a commit and reads what the command left there.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the record of the closed work"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
B=RT-7-fewer-words
F="docs/tasks/$B"
REC="docs/archive/$B.md"
G=(git -c user.name=t -c user.email=t@example.test -c commit.gpgsign=false)
export RT_FLOW_RECORDS_HOME="$WORK/records"

GRILL='# Разбор

## Просьба владельца

> сделай короче,
> но не теряй слов

## Что уже есть в дереве

- То, что в запись не идёт.

## Вопросы и ответы

**Как быть?** — «Делай оба (Recommended)».

## Решения

- **Первое решение разбора.** С доводом.

## Что осталось неясным

Ничего.'

PROGRESS='# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Done:** владелец сказал «слово из места работы»

## Steps

- [x] 1.1 Первый шаг

## Decisions along the way

- **Решение хода работы.** Затронут этап 1.
- **Цена:** заплачено сутками.

## Sessions

### 25.11.2026

- Прогнан набор, «ёлочки» без заказчика.
- Владелец: «слово из хода»
  и продолжение той же строки.
    - вложенный пункт под ней
- Снова владелец: «Делай оба (Recommended)».
- Владелец сказал оба слова: «Делай оба (Recommended)» и «слово рядом с прежним».

  Продолжение через пустую строку.
- Меню: «Бери первый (Recommended)».
- Ответ: «Одобряю как есть».
- Строка без кавычек, хотя владелец назван.

Абзац, где the owner сказал
«слово из абзаца» и дальше.

| Кто | Что |
| --- | --- |
| владелец | «слово из таблицы» |

```
- владелец в блоке кода: «слово из кода»
```

## Handover of the session

- владелец в передаче: «слово из передачи»'

BODY='Closes #7

## Что сделано

Это в запись не идёт.

## Точки

| A | B |

## Чем подтверждено

- Сценарии 12, провалов 0.

```bash
## не заголовок
```

E2E-skip: правка текстов
Closes #7

## Оставшийся шаг

Слить PR; вне задачи осталось одно.

🤖 Generated with [Claude Code](https://claude.com/claude-code)'

# A repository with the folder in a commit; the progress is the first argument, the grill the second.
repo() {
    R="$(mktemp -d "$WORK/r.XXXXXX")"
    git -C "$R" -c init.defaultBranch=main init -q
    (cd "$R" && "${G[@]}" commit -q --allow-empty -m start && git update-ref refs/remotes/origin/main HEAD && git checkout -q -b "${BRANCH:-$B}")
    mkdir -p "$R/$F" "$R/docs/plans"
    printf '%s\n' "${2:-$GRILL}" > "$R/$F/grill.md"
    printf '%s\n' '# План' '' '## Этапы' '' '### 1. Этап' '' '- **Steps:**' '    1. Первый шаг' '       Check: `grep -c "решение" docs/tasks/'"$B"'/grill.md` → `1`' > "$R/$F/plan.md"
    printf '%s\n' "${1:-$PROGRESS}" > "$R/$F/progress.md"
    printf '%s\n' '# План эпика' '' '**Эпик:** RT-3 · **Ветка эпика:** `RT-3-epic`' '' '| №   | Задача | Состояние |' '| --- | --- | --- |' '| 1   | RT-7 — короче | в работе |' '| 2   | RT-70 — другое | в работе |' > "$R/docs/plans/epic.md"
    printf '%s\n' "$BODY" > "$R/../body.md"
    commit plan
}
commit() { (cd "$R" && git add -A && "${G[@]}" commit -q -m "$1"); }
run() {
    local code
    OUT="$(cd "$R" && node "$TOOLS/archive-record.mjs" "${@:-$WORK/body.md}" --title "${TITLE-[RT-7] Записей меньше}" 2>&1)"
    code=$?
    printf '%s\n' "$OUT" > "$WORK/out"
    return "$code"
}
code_of() { run "$@"; printf '%s' "$?"; }
said() { cat "$WORK/out"; }
has() { grep -cF -- "$1" "$R/$REC"; }
# The section of the record by its name.
part() { awk -v n="## $1" '$0 == n {on = 1; next} /^## / {on = 0} on' "$R/$REC" | sed '/^$/d'; }
# A refusal: code 1, its words, and the copy as it was.
refused() {
    local label="$1" words="$2" before after code
    shift 2
    before="$(cd "$R" && git status --porcelain --ignored && ls -R docs)"
    code="$(code_of "$@")"
    after="$(cd "$R" && git status --porcelain --ignored && ls -R docs)"
    report "$label: refused" "$code $(said | grep -cF -- "$words")" '1 1'
    report "a refusal writes nothing: $label" "$([ "$before" = "$after" ] && echo same)" same
}

# --- the record -----------------------------------------------------------------------------
repo
mkdir -p "$R/.git/rt-kit/approval"
printf '{"answer":"Одобряю план RT-7 (Recommended)"}\n' > "$R/.git/rt-kit/approval/$B.json"
report "the record is written with code 0" "$(code_of)" 0
report "the title, and the third line names the epic by its plan and the folder" "$(sed -n '1p;3p' "$R/$REC")" \
    "# RT-7 — Записей меньше
Задача RT-7 эпика RT-3, запись от $(date +%F). Прежний адрес: \`$F/\`."
report "the request word for word" "$(part 'Просьба владельца')" '> сделай короче,
> но не теряй слов'
report "the answers of the grill" "$(part 'Вопросы и ответы')" '**Как быть?** — «Делай оба (Recommended)».'
report "the decisions of the grill and of the progress: the grill" "$(part 'Решения разбора')" '- **Первое решение разбора.** С доводом.'
report "the decisions of the grill and of the progress: the progress" "$(part 'Решения по ходу')" '- **Решение хода работы.** Затронут этап 1.
- **Цена:** заплачено сутками.'
report "the owner word of the progress: an item whole, a paragraph, a row of a table" "$(part 'Слова владельца в ходе работы')" '- Владелец: «слово из хода»
  и продолжение той же строки.
    - вложенный пункт под ней
- Владелец сказал оба слова: «Делай оба (Recommended)» и «слово рядом с прежним».
  Продолжение через пустую строку.
- Меню: «Бери первый (Recommended)».
- Ответ: «Одобряю как есть».
Абзац, где the owner сказал
«слово из абзаца» и дальше.
| владелец | «слово из таблицы» |'
report "a word the grill holds is not repeated" "$(has 'Снова владелец')" 0
report "the owner word of the progress: not from the place of work, a handover, a code block" "$(has 'слово из места') $(has 'слово из передачи') $(has 'слово из кода')" '0 0 0'
report "the answer of the approval" "$(part 'Одобрение плана')" '«Одобряю план RT-7 (Recommended)»'
report "the sections of the body: what confirms it" "$(part 'Чем подтверждено' | head -1)" '- Сценарии 12, провалов 0.'
report "the sections of the body: a heading in a code block ends none" "$(has '## не заголовок')" 1
report "the sections of the body: the step left" "$(part 'Оставшийся шаг')" 'Слить PR; вне задачи осталось одно.'
report "the sections of the body: the others are not taken" "$(has 'Это в запись не идёт') $(has 'То, что в запись не идёт')" '0 0'
report "the footer is dropped, and the lines of the checks with it" "$(has '🤖') $(has 'E2E-skip') $(has 'Closes')" '0 0 0'
report "the sections stand in one order" "$(grep '^## ' "$R/$REC" | grep -v 'не заголовок' | tr '\n' '|')" \
    '## Просьба владельца|## Вопросы и ответы|## Решения разбора|## Решения по ходу|## Слова владельца в ходе работы|## Одобрение плана|## Чем подтверждено|## Оставшийся шаг|'
report "the folder leaves the disk and the index" "$(test -e "$R/$F" && echo stands) $(git -C "$R" ls-files "$F" | wc -l | tr -d ' ')" ' 0'
report "the folder leaves the disk and the index: the record is in the index" "$(git -C "$R" diff --cached --name-status | grep -c "^A.*$REC")" 1
report "the command says how long the record is" "$(said | grep -c "written $REC: $(node -p "[...require('fs').readFileSync('$R/$REC','utf8')].length") characters")" 1
commit apart
report "the rerun after the commit: the folder is measured from the history" \
    "$(cd "$R" && node "$TOOLS/task-flow-script.mjs" step --done --pr 2>&1 | grep -c 'совпало\|steps re-measured 1, matched 1')" 2
refused "the record already stands" 'the record already stands'

repo
code_of >/dev/null
report "no approval mark: the record says so" "$(part 'Одобрение плана')" 'Метки одобрения плана у ветки нет.'

repo
printf '# Согласия\n\n- макет: «да, так»\n' > "$R/$F/approvals.md"
commit approvals
code_of >/dev/null
report "the approvals of the kit" "$(part 'Согласия владельца по киту')" '### Согласия
- макет: «да, так»'

# The headings of a progress written in the owner's language.
repo "$(printf '%s\n' "$PROGRESS" | sed 's/^## Where we stand/## Где мы/; s/^## Decisions along the way/## Решения по ходу/')"
report "the owner word of the progress: the Russian headings" "$(code_of) $(has 'слово из места') $(has 'слово из хода') $(has '- **Цена:** заплачено сутками.')" '0 0 1 1'

# The price on the line below its mark is still a price.
repo "$(printf '%s\n' "$PROGRESS" | sed 's/^- \*\*Цена:\*\* .*/- **Цена:**\n    - заплачено сутками/')"
report "a price given below its mark is taken" "$(code_of) $(part 'Решения по ходу' | tail -1)" '0     - заплачено сутками'

# --- the epic -------------------------------------------------------------------------------
repo
git -C "$R" rm -q docs/plans/epic.md && commit plans
code_of >/dev/null
report "outside an epic: no plan names the task" "$(sed -n 3p "$R/$REC" | grep -c '^Задача RT-7, запись от')" 1
repo
sed 's/RT-3 /RT-4 /' "$R/docs/plans/epic.md" > "$R/docs/plans/second.md" && commit plans
code_of >/dev/null
report "outside an epic: two plans name the task" "$(sed -n 3p "$R/$REC" | grep -c '^Задача RT-7, запись от')" 1
repo
sed -i.bak 's/| RT-7 —/| RT-71 —/' "$R/docs/plans/epic.md" && rm "$R/docs/plans/epic.md.bak" && commit plans
code_of >/dev/null
report "the epic by its plan: the row of another task is not the row of this one" "$(sed -n 3p "$R/$REC" | grep -c 'эпика')" 0

# --- refusals -------------------------------------------------------------------------------
without() { printf '%s\n' "$1" | awk -v n="$2" '$0 == n {off = 1; next} /^## / {off = 0} !off'; }
FULL="$BODY"
BODY="$(without "$FULL" '## Чем подтверждено')"
repo
refused "no section in the body: what confirms it" '«Чем подтверждено»'
BODY="$(without "$FULL" '## Оставшийся шаг')"
repo
refused "no section in the body: the step left" '«Оставшийся шаг»'
BODY="$(printf '%s\n' "$FULL" | grep -v '^Слить PR')"
repo
refused "no section in the body: only the footer in it" '«Оставшийся шаг»'
BODY="$FULL"
repo
refused "no section in the body: no body on disk" 'the body of the PR is not on disk' "$WORK/none.md"
TITLE='[RT-7] ' refused "the title is empty" 'the title of the PR is empty'
repo '' "$(without "$GRILL" '## Просьба владельца')"
refused "no request in the grill" 'no request of the owner'
repo '' "$(printf '%s\n' "$GRILL" | grep -v '^>' | sed 's/^## Что уже/<!-- слова владельца -->\n\n&/')"
refused "no request in the grill: a comment of the sample alone" 'no request of the owner'
repo "$(without "$PROGRESS" '## Decisions along the way')"
refused "no decisions in the progress" 'no decisions along the way'
repo "$(printf '%s\n' "$PROGRESS" | grep -v 'Цена:')"
refused "no price among the decisions" 'name no price'
repo "$(printf '%s\n' "$PROGRESS" | sed 's/^- \*\*Цена:.*/- **Цена:**/')"
refused "no price among the decisions: the item is empty" 'name no price'
repo "$(printf '%s\n' "$PROGRESS" | sed 's/^- \*\*Цена:\*\* .*/- **Цена:**\n- Другое решение./')"
refused "no price among the decisions: an empty item before another" 'name no price'
repo "$(printf '%s\n- **Цена:** не там.\n' "$(printf '%s\n' "$PROGRESS" | grep -v 'Цена:')")"
refused "no price among the decisions: it stands in another section" 'name no price'
repo
printf 'ещё\n' >> "$R/$F/progress.md"
refused "an edit in the folder" "edits past the commit: $F/progress.md"
repo
printf 'ещё\n' >> "$R/$F/progress.md"
git -C "$R" add -A
refused "an edit in the folder: staged" "edits past the commit: $F/progress.md"
repo
printf 'черновик\n' > "$R/$F/draft.md"
refused "an untracked file in the folder" "untracked files: $F/draft.md"
repo
printf '*.log\n' > "$R/.gitignore" && commit ignore
printf 'лог\n' > "$R/$F/run.log"
refused "an untracked file in the folder: an ignored one" "untracked files: $F/run.log"
repo
printf 'заметки\n' > "$R/$F/notes.md" && commit notes
refused "a foreign file in the folder" "the record does not take: $F/notes.md"
repo
printf 'echo 1\n' > "$R/$F/probe.sh" && commit probe
refused "a foreign file in the folder: a script the commit of the plan lacks" "the record does not take: $F/probe.sh"
repo
git -C "$R" rm -q -r "$F" && commit apart
refused "the folder is not in the commit" "the commit holds no $F/grill.md"
repo
git -C "$R" checkout -q --detach
refused "no branch is checked out" 'the branch carries no task number'
repo
mkdir -p "$R/docs/archive" && printf 'есть\n' > "$R/$REC"
refused "the record already stands: on disk" 'the record already stands'
# A record removed from the disk and standing in the commit is not written over either.
repo
mkdir -p "$R/docs/archive" && printf 'есть\n' > "$R/$REC" && commit record && rm "$R/$REC"
refused "the record already stands: in the commit" 'the record already stands'

# A text the plan came with is not frozen: it is carried over or removed first.
repo
(cd "$R" && git reset -q --soft HEAD~1 && printf 'заметки\n' > "$F/notes.md" && git add -A && "${G[@]}" commit -q -m plan)
refused "a foreign file in the folder: a text of the commit of the plan" "the record does not take: $F/notes.md"

# A script the plan came with is frozen by the engine: it leaves with the folder and is named.
repo
(cd "$R" && git reset -q --soft HEAD~1 && printf 'echo 1\n' > "$F/probe.sh" && git add -A && "${G[@]}" commit -q -m plan)
report "a foreign file in the folder: a script of the commit of the plan leaves with it" "$(code_of) $(said | grep -c "the commit of the plan holds it: $F/probe.sh") $(test -e "$R/$F" && echo stands)" '0 1 '

suite_result "the record of the closed work"
