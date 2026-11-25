#!/usr/bin/env bash
# The refusals of the record command: the second half of `archive-record.test.sh`, which sources it with
# its fixtures — one file does not fit the length limit.

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
BODY="$(printf '%s\n' "$FULL" | sed 's/^Closes #7/- fixes #99/')"
repo
refused "the body of another task by another word of the hosting" 'the body closes RT-99, RT-99, the branch is of RT-7'
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
TITLE='rt-7: своя' code_of >/dev/null
report "the title names the task in small letters" "$(head -1 "$R/$REC")" '# RT-7 — своя'
repo
TITLE='rt-99: Чужая' refused "the title of another task with no brackets" 'the title names rt-99, the branch is of RT-7'
repo '' "$(without "$GRILL" '## Просьба владельца')"
refused "no request in the grill" 'no request of the owner'
repo '' "$(printf '%s\n' "$GRILL" | grep -v '^>' | sed 's/^## Что уже/<!-- слова владельца -->\n\n> <verbatim>\n\n&/')"
refused "no request in the grill: a comment and the hint of the sample alone" 'no request of the owner'
repo '' "$(printf '%s\n' "$GRILL" | sed 's/^> но не теряй слов/&\n\n```\n/')"
refused "a code block of the grill does not end" 'the grill holds a code block that does not end'
repo '' "$(printf '%s\n' "$GRILL" | sed 's/^> но не теряй слов/&\n\n```git status``` одной строкой/')"
report "a code span of three backticks opens no block" "$(code_of) $(has 'одной строкой')" '0 1'
repo '' "$(printf '%s\n' "$GRILL" | sed "s/^Запись груза: .*/<https:\/\/x.y\/$KEY>/")"
report "the head of the grill keeps an address in angle brackets" "$(code_of) $(has "<https://x.y/$KEY>")" '0 1'
repo
TITLE="[RT-7] Записей
меньше"
report "a title of two lines is one" "$(code_of) $(head -1 "$R/$REC")" '0 # RT-7 — Записей меньше'
unset TITLE
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
repo "$(price '- **Цена:** 15 %')"
report "a price given by a number is taken" "$(code_of)" 0
repo "$(price '- **Цена:** <сколько>\n- **Цена:** сутки')"
report "a price beside the hint of the sample is taken" "$(code_of)" 0
repo "$(price '- **Цена:**\n    - **Отменено:** нет')"
refused "no price among the decisions: another item under it" 'do not say «Цена»'
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
repo "$(printf '%s\n' "$PROGRESS" | grep -v 'Отменено')"
refused "the decisions of the grill that were cancelled are not named" 'do not say «Отменено»'
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
refused "the folder cannot be removed" 'the folder could not be taken out, everything is put back'
chmod 755 "$R/$F"
# git removes what it can and answers with success: the script in a closed directory stays.
repo
(cd "$R" && git reset -q --soft HEAD~1 && mkdir "$F/roles" && printf 'echo 1\n' > "$F/roles/probe.sh" && git add -A && "${G[@]}" commit -q -m plan)
chmod 555 "$R/$F/roles"
refused "a script of the folder cannot be removed" 'the folder could not be taken out, everything is put back'
chmod 755 "$R/$F/roles"
repo
mkdir -p "$R/docs/archive" && printf 'a\n' > "$R/docs/archive/a.md" && commit archive && printf 'docs/archive/\n' > "$R/.gitignore" && commit ignore
refused "the record is ignored by the tree" 'the folder could not be taken out, everything is put back'

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
