#!/usr/bin/env bash
# The record of the closed work built from the task folder and the body of the PR. Every scenario
# builds its own repository with a task folder in a commit and reads what the command left there.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the record of the closed work"

WORK="$(mktemp -d)"
trap 'chmod -R u+w "$WORK"; rm -rf "$WORK"' EXIT
B=RT-7-fewer-words
F="docs/tasks/$B"
REC="docs/archive/$B.md"
G=(git -c user.name=t -c user.email=t@example.test -c commit.gpgsign=false)
export RT_FLOW_RECORDS_HOME="$WORK/records"
KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

GRILL="# Разбор

Запись груза: $KEY

<Work begun from cargo names its records here>

## Просьба владельца

> сделай короче,
> но не теряй слов

## Что уже есть в дереве

- То, что в запись не идёт.
- Владелец о дереве: «слово из разбора дерева».

## Что говорят правила

- Владелец в правиле: «слово из правил».

## Вопросы и ответы

**Как быть?** — «Делай оба (Recommended)».

**Вливать?** — «Да».

## Решения

- **Первое решение разбора.** С доводом.

## Решения второго захода

- **Решение второго захода.**

## Вопросы и ответы

**Ещё раз?** — «Второй раздел ответов».

## Что осталось неясным

"

PROGRESS='# Progress

## Where we stand

- **State:** `этапы-кончились`, владелец сказал «строка состояния»
- **Done:** владелец сказал «слово из места работы»

## Steps

- [x] 1.1 Первый шаг

## Decisions along the way

- **Решение хода работы.** Затронут этап 1.
- **Цена:** заплачено сутками.
- **Отменено из разбора:** нет.
- Владелец о решении: «Нет».

## Sessions

### 25.11.2026

- Прогнан набор, «ёлочки» без заказчика.
- Владелец: «слово из хода»
  и продолжение той же строки.
    - вложенный пункт под ней
- Снова владелец: «Делай оба (Recommended)».
- Владелец сказал оба слова: «Делай оба (Recommended)» и «слово рядом с прежним».

  Продолжение через пустую строку.
- Владелец о выпуске: «Да».
- Бери первый, «первый (Recommended)».
- Ответ: «Одобряю как есть».
- Меню о пределе — «Поднять до 40».
- Владелец прямыми: "слово в прямых".
- Владелец назван, а `"строка кода"` не слово.
- Строка без кавычек, хотя владелец назван.
- Владелец просил: «сделай короче, но не теряй слов».
- Владелец с кодом: «слово с кодом».
  ```
  команда
  ```
  Конец пункта.

Исправлено:

- Чужой пункт.
- Владелец: «слово из исправлений»

Владелец вот: «слово перед заголовком»
### Посторонний заголовок

### Ответ владельца: «слово в заголовке»
Посторонняя строка.

Абзац, где the owner сказал
«слово из абзаца» и дальше.

Владелец сказал подряд:
- «первое подряд»
- «второе подряд»

Он ответил:

> слово блоком
> в две строки

| Кто | Что |
| --- | --- |
| владелец | «слово из таблицы» |

```
- владелец в блоке кода: «слово из кода»
```

## Решения по ходу

- **Решение второго раздела хода.**

## Handover of the session

- **Next step:** владелец сказал «шаг из передачи»

### 26.11.2026

- Владелец после передачи: «слово после передачи»'

BODY='Closes #7

## Что сделано

Это в запись не идёт.

## Точки

| A | B |

## Чем подтверждено

- Сценарии 12, провалов 0.

````bash
```
## не заголовок
```
````

```
~~~
## и не заголовок
```

Closes the hole of the guard.
E2E-skip: правка текстов
Closes #7

## Оставшийся шаг

Слить PR; вне задачи осталось одно.

🤖 Generated with [Claude Code](https://claude.com/claude-code)'

# A repository with the folder in a commit; the progress is the first argument, the grill the second.
repo() {
    R="$(mktemp -d "$WORK/r.XXXXXX")"
    git -C "$R" -c init.defaultBranch=main init -q
    (cd "$R" && "${G[@]}" commit -q --allow-empty -m start && git update-ref refs/remotes/origin/main HEAD && git checkout -q -b "$B")
    mkdir -p "$R/$F" "$R/docs/plans"
    printf '%s\n' "${2:-$GRILL}" > "$R/$F/grill.md"
    printf '%s\n' '# План' '' '## Этапы' '' '### 1. Этап' '' '- **Steps:**' '    1. Первый шаг' '       Check: `grep -c "Первое решение" docs/tasks/'"$B"'/grill.md` → `1`' > "$R/$F/plan.md"
    printf '%s\n' "${1:-$PROGRESS}" > "$R/$F/progress.md"
    printf '%s\n' '# План эпика' '' '**Эпик:** RT-3 · **Ветка эпика:** `RT-3-epic`' '' '| №   | Задача | Состояние |' '| --- | --- | --- |' '| 1   | RT-7 — короче | в работе |' '| 2   | RT-70 — другое | в работе |' > "$R/docs/plans/epic.md"
    # A file beside the plans is no plan of an epic, and a row quoted in a text is no row of a table.
    printf '%s\n' '**Эпик:** RT-5' '| 1 | RT-7 — короче | в работе |' > "$R/docs/plans/draft.txt"
    printf '%s\n' '**Эпик:** RT-6' 'строка `| 1 | RT-7 — короче |` названа в тексте' > "$R/docs/plans/findings.md"
    printf '%s\n' "$BODY" > "$WORK/body.md"
    commit plan
}
commit() { (cd "$R" && git add -A && "${G[@]}" commit -q -m "$1"); }
# The mark of the approval in the copy `$1`, the answer and the commit of the plan it names.
approve() { mkdir -p "$1/.git/rt-kit/approval" && printf '{"answer":"%s","plan":"%s"}\n' "$2" "${3:-$(git -C "$R" log --diff-filter=A --format=%H -- "$F/plan.md" | tail -1)}" > "$1/.git/rt-kit/approval/$B.json"; }
run() {
    local code
    OUT="$(cd "${AT:-$R}" && node "$TOOLS/archive-record.mjs" "${@:-$WORK/body.md}" --title "${TITLE-[RT-7] Записей меньше}" 2>&1)"
    code=$?
    printf '%s\n' "$OUT" > "$WORK/out"
    return "$code"
}
code_of() { run "$@"; printf '%s' "$?"; }
said() { cat "$WORK/out"; }
has() { grep -cF -- "$1" "$R/$REC"; }
# The section of the record by its name.
part() { awk -v n="## $1" '$0 == n {on = 1; next} /^## / {on = 0} on' "$R/$REC" | sed '/^$/d'; }
state() { (cd "$R" && git status --porcelain --ignored && ls -R docs && git diff --cached --name-only); }
# A refusal: code 1, its words and no stack, and the copy as it was.
refused() {
    local label="$1" words="$2" before after code
    shift 2
    before="$(state)"
    code="$(code_of "$@")"
    after="$(state)"
    report "$label: refused" "$code $(said | grep -cF -- "$words") $(said | grep -c '    at ')" '1 1 0'
    report "a refusal writes nothing: $label" "$([ "$before" = "$after" ] && echo same)" same
}

# --- the record -----------------------------------------------------------------------------
repo
approve "$R" 'Одобряю план RT-7 (Recommended)'
report "the record is written with code 0" "$(code_of)" 0
report "the title, and the third line names the epic by its plan and the folder" "$(sed -n '1p;3p' "$R/$REC")" \
    "# RT-7 — Записей меньше
Задача RT-7 эпика RT-3, запись от $(date +%F). Прежний адрес: \`$F/\`."
report "the request word for word" "$(part 'Просьба владельца')" '> сделай короче,
> но не теряй слов'
report "the answers of the grill, each section of the name" "$(part 'Вопросы и ответы' | tr '\n' '|')" '**Как быть?** — «Делай оба (Recommended)».|**Вливать?** — «Да».|**Ещё раз?** — «Второй раздел ответов».|'
report "the decisions of the grill and of the progress: the grill" "$(part 'Решения разбора')" '- **Первое решение разбора.** С доводом.'
report "the decisions of the grill and of the progress: a section of another name" "$(part 'Решения второго захода')" '- **Решение второго захода.**'
report "the decisions of the grill and of the progress: both sections of the progress" "$(part 'Решения по ходу' | tr '\n' '|')" \
    '- **Решение хода работы.** Затронут этап 1.|- **Цена:** заплачено сутками.|- **Отменено из разбора:** нет.|- Владелец о решении: «Нет».|- **Решение второго раздела хода.**|'
report "the head of the grill keeps the keys of the cargo, the hint of the sample is dropped" "$(part 'Шапка разбора')" "Запись груза: $KEY"
report "a section of the grill that says nothing is not taken" "$(has 'Что осталось неясным')" 0
report "the owner word of the progress: each item whole" "$(part 'Цитаты из разбора и хода работы')" '- Владелец о дереве: «слово из разбора дерева».
- **Done:** владелец сказал «слово из места работы»
- Владелец: «слово из хода»
  и продолжение той же строки.
    - вложенный пункт под ней
- Владелец сказал оба слова: «Делай оба (Recommended)» и «слово рядом с прежним».
  Продолжение через пустую строку.
- Владелец о выпуске: «Да».
- Бери первый, «первый (Recommended)».
- Ответ: «Одобряю как есть».
- Меню о пределе — «Поднять до 40».
- Владелец прямыми: "слово в прямых".
- Владелец с кодом: «слово с кодом».
  Конец пункта.
- Владелец: «слово из исправлений»
Владелец вот: «слово перед заголовком»
### Ответ владельца: «слово в заголовке»
Абзац, где the owner сказал
«слово из абзаца» и дальше.
Владелец сказал подряд:
- «первое подряд»
- «второе подряд»
Он ответил:
> слово блоком
> в две строки
| владелец | «слово из таблицы» |
- Владелец после передачи: «слово после передачи»'
report "a word the grill holds is not repeated" "$(has 'Снова владелец') $(has 'Владелец просил')" '0 0'
report "a word of the decisions is not repeated, however short" "$(has 'Владелец о решении: «Нет»')" 1
report "the owner word of the progress: not the place of work, a code block, the rules" "$(has 'строка состояния') $(has 'шаг из передачи') $(has 'слово из кода') $(has 'слово из правил')" '0 0 0 0'
report "the answer of the approval" "$(part 'Одобрение плана')" '«Одобряю план RT-7 (Recommended)»'
report "the sections of the body: what confirms it" "$(part 'Чем подтверждено' | head -1)" '- Сценарии 12, провалов 0.'
report "the sections of the body: a heading in a code block ends none" "$(has '## не заголовок')" 1
report "the sections of the body: the step left" "$(part 'Оставшийся шаг')" 'Слить PR; вне задачи осталось одно.'
report "the sections of the body: the others are not taken" "$(has 'Это в запись не идёт') $(has 'То, что в запись не идёт')" '0 0'
report "the footer is dropped, and the lines of the checks with it" "$(has '🤖') $(has 'E2E-skip') $(has 'Closes #7')" '0 0 0'
report "the footer is dropped, a sentence of the same word is not" "$(has 'Closes the hole of the guard.')" 1
report "the sections stand in one order" "$(grep '^## ' "$R/$REC" | grep -v 'не заголовок' | tr '\n' '|')" \
    '## Шапка разбора|## Просьба владельца|## Вопросы и ответы|## Решения разбора|## Решения второго захода|## Вопросы и ответы|## Решения по ходу|## Цитаты из разбора и хода работы|## Одобрение плана|## Чем подтверждено|## Оставшийся шаг|'
report "the folder leaves the disk and the index" "$(test -e "$R/$F" && echo stands) $(git -C "$R" ls-files "$F" | wc -l | tr -d ' ')" ' 0'
report "the folder leaves the disk and the index: the record is in the index" "$(git -C "$R" diff --cached --no-renames --name-status | grep -c "^A.*$REC")" 1
report "the command says how long the record is" "$(said | grep -c "written $REC: $(node -p "[...require('fs').readFileSync('$R/$REC','utf8')].length") characters")" 1
commit apart
report "the rerun after the commit: the folder is measured from the history" \
    "$(cd "$R" && node "$TOOLS/task-flow-script.mjs" step --done --pr 2>&1 | grep -c 'совпало\|steps re-measured 1, matched 1')" 2
refused "the record already stands" 'the record already stands'

# An answer that stands only in the mark and in an item of the progress is written once.
repo "$PROGRESS
- Владелец: «Одобряю план RT-7 (Recommended)»."
approve "$R" 'Одобряю план RT-7 (Recommended)'
code_of >/dev/null
report "the answer of the approval is not repeated by an item of the progress" "$(has 'Одобряю план RT-7 (Recommended)')" 1

repo
code_of >/dev/null
report "no approval mark: the record says so" "$(part 'Одобрение плана')" 'Метки одобрения плана у ветки нет.'
repo
approve "$R" 'Одобряю прежний план' 0000000000000000000000000000000000000000
code_of >/dev/null
report "no approval mark: a mark of another commit of the plan approves nothing" "$(part 'Одобрение плана') $(has 'Одобряю прежний')" 'Метка одобрения стоит на другом коммите плана и одобрением не считается. 0'
repo
approve "$R" x && printf '{' > "$R/.git/rt-kit/approval/$B.json"
report "no approval mark: one that does not parse" "$(code_of) $(part 'Одобрение плана')" '0 Метки одобрения плана у ветки нет.'

# A linked working copy reads the mark of the repository, and a call below the root writes at the root.
repo
approve "$R" 'Одобряю план RT-7 (Recommended)'
git -C "$R" checkout -q main 2>/dev/null || git -C "$R" checkout -q -b main
git -C "$R" worktree add -q "$WORK/linked" "$B"
AT="$WORK/linked/docs/plans" code_of >/dev/null
report "the answer of the approval in a linked copy, the call below its root" "$(grep -c '^«Одобряю план RT-7 (Recommended)»$' "$WORK/linked/$REC")" 1

repo
printf '# Согласия\n\n- **Совпадение:** 14 из 14 чисел, «да, так»\n\n```\n# строка кода\n```\n' > "$R/$F/approvals.md"
commit approvals
code_of >/dev/null
report "the approvals of the kit" "$(part 'Согласия владельца по киту')" '### Согласия
- **Совпадение:** 14 из 14 чисел, «да, так»
```
# строка кода
```'
report "the approvals of the kit stand before any text the check could read instead" "$(grep '^## ' "$R/$REC" | head -1)" '## Согласия владельца по киту'

# The headings of a progress written in the owner's language.
repo "$(printf '%s\n' "$PROGRESS" | sed 's/^## Where we stand/## Где мы/; s/^## Decisions along the way/## Решения по ходу/; s/\*\*State:/**Состояние:/')"
report "the owner word of the progress: the Russian headings" "$(code_of) $(has 'строка состояния') $(has 'слово из хода') $(has '- **Цена:** заплачено сутками.')" '0 0 1 1'

# The price on the line below its mark is still a price.
repo "$(printf '%s\n' "$PROGRESS" | sed 's/^- \*\*Цена:\*\* .*/- **Цена:**\n    - заплачено сутками/')"
report "a price given below its mark is taken" "$(code_of) $(has '    - заплачено сутками')" '0 1'

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
price() { printf '%s\n' "$PROGRESS" | sed "s/^- \*\*Цена:\*\* .*/$1/"; }
FULL="$BODY"
BODY="$(printf '%s\n' "$FULL" | sed '/^## Чем подтверждено/,/^Closes #7$/d')"
repo
refused "no section in the body: what confirms it" '«Чем подтверждено»'
BODY="$(without "$FULL" '## Оставшийся шаг')"
repo
refused "no section in the body: the step left" '«Оставшийся шаг»'
BODY="$(printf '%s\n' "$FULL" | grep -v '^Слить PR')"
repo
refused "no section in the body: only the footer in it" '«Оставшийся шаг»'
BODY="$(printf '%s\n' "$FULL" | sed 's/^Closes #7/Closes #99/')"
repo
refused "the body of another task" 'the body closes RT-99, RT-99, the branch is of RT-7'
BODY="$(printf '%s\n' "$FULL" | sed 's/^Closes #7/Часть #7/')"
repo
report "the body of a part of the task closes none" "$(code_of)" 0
BODY="$FULL"
repo
refused "no section in the body: no body on disk" 'the body of the PR is not on disk' "$WORK/none.md"
refused "no section in the body: a directory for the body" 'the body of the PR is not on disk' "$WORK"
TITLE='[RT-7] ' refused "the title is empty" 'the title of the PR is empty'
TITLE='--dry' refused "the title is empty: a flag in its place" 'the title of the PR is empty'
TITLE='[RT-99] Чужая' refused "the title of another task" 'the title names RT-99, the branch is of RT-7'
repo '' "$(without "$GRILL" '## Просьба владельца')"
refused "no request in the grill" 'no request of the owner'
repo '' "$(printf '%s\n' "$GRILL" | grep -v '^>' | sed 's/^## Что уже/<!-- слова владельца -->\n\n> <verbatim>\n\n&/')"
refused "no request in the grill: a comment and the hint of the sample alone" 'no request of the owner'
repo '' "$(printf '%s\n' "$GRILL" | sed 's/^> но не теряй слов/&\n\n```\n/')"
refused "a code block of the grill does not end" 'the grill holds a code block that does not end'
repo "$(printf '%s\n' "$PROGRESS" | sed 's/^## Handover/```\n&/')"
refused "a code block of the progress does not end" 'the progress holds a code block that does not end'
repo "$(without "$(without "$PROGRESS" '## Decisions along the way')" '## Решения по ходу')"
refused "no decisions in the progress" 'no decisions along the way'
repo "$(printf '%s\n' "$PROGRESS" | grep -v 'Цена:')"
refused "no price among the decisions" 'do not say «Цена»'
repo "$(price '- **Цена:**')"
refused "no price among the decisions: the item is empty" 'do not say «Цена»'
repo "$(price '- **Цена:**\n- Другое решение.')"
refused "no price among the decisions: an empty item before another" 'do not say «Цена»'
repo "$(price '- **Цена:** …')"
refused "no price among the decisions: an ellipsis" 'do not say «Цена»'
repo "$(price '- **Цена:** TODO')"
refused "no price among the decisions: a stub" 'do not say «Цена»'
repo "$(price '- **Цена:** <сколько>')"
refused "no price among the decisions: the hint of the sample" 'do not say «Цена»'
repo "$(price '<!--\n- **Цена:** в комментарии\n-->')"
refused "no price among the decisions: in a comment" 'do not say «Цена»'
repo "$(price '```\n- **Цена:** в коде\n```')"
refused "no price among the decisions: in a code block" 'do not say «Цена»'
repo "$(printf '%s\n- **Цена:** не там.\n' "$(printf '%s\n' "$PROGRESS" | grep -v 'Цена:')")"
refused "no price among the decisions: it stands in another section" 'do not say «Цена»'
repo "$(printf '%s\n' "$PROGRESS" | grep -v 'Отменено из разбора')"
refused "the decisions of the grill that were cancelled are not named" 'do not say «Отменено из разбора»'
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
for name in grill plan progress; do
    repo
    git -C "$R" rm -q "$F/$name.md" && commit apart
    refused "the folder is not in the commit: $name" "the commit holds no $F/$name.md"
done
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
# A folder git cannot remove and a record git does not take leave the copy as it was.
repo
mkdir -p "$R/docs/archive" && printf 'a\n' > "$R/docs/archive/a.md" && commit archive && chmod 555 "$R/$F"
refused "the folder cannot be removed" 'git did not take the folder out, nothing is written'
chmod 755 "$R/$F"
repo
mkdir -p "$R/docs/archive" && printf 'a\n' > "$R/docs/archive/a.md" && commit archive && printf 'docs/archive/\n' > "$R/.gitignore" && commit ignore
refused "the record is ignored by the tree" 'git did not take the folder out, nothing is written'

# A text the plan came with is not frozen: it is carried over or removed first.
repo
(cd "$R" && git reset -q --soft HEAD~1 && printf 'заметки\n' > "$F/notes.md" && git add -A && "${G[@]}" commit -q -m plan)
refused "a foreign file in the folder: a text of the commit of the plan" "the record does not take: $F/notes.md"

# A script the plan came with is frozen by the engine: it leaves with the folder and is named. An empty
# directory leaves too: the rerun of the steps would take it for a file left behind.
repo
(cd "$R" && git reset -q --soft HEAD~1 && printf 'echo 1\n' > "$F/probe.sh" && git add -A && "${G[@]}" commit -q -m plan)
mkdir "$R/$F/roles"
report "a foreign file in the folder: a script of the commit of the plan leaves with it" "$(code_of) $(said | grep -c "the commit of the plan holds it: $F/probe.sh") $(test -e "$R/$F" && echo stands)" '0 1 '

suite_result "the record of the closed work"
