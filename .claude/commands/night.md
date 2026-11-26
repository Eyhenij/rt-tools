---
description: The start of an autonomous session — the time boundary, the checks before the first work, the cycle until morning and the list the owner reads
argument-hint: '[until when: «до 8 утра» | «часов шесть» | empty — the boundary is asked]'
---
<!-- rt-kit v0.41.0 · commands/night.md · 71b808922712 · правится надстройкой, не здесь -->

Start an autonomous session: the owner is leaving, and the work goes on without them until the
boundary they named. The boundary from the owner: `$ARGUMENTS`

The order of the night itself is not written here. It lies in the rule `autonomous-work` and the
pattern `autonomous-work-run`, and rewriting it into the command would start a second source that
diverges from the first silently. The command does four things: it takes the boundary, raises the
rule, checks the tree before the first work and names where the morning list is written.

## 1. The boundary of time

The law says an autonomous session ends by the owner's word or at a named boundary. A session
without a boundary is work without an end — that is, work the owner did not ask for.

The boundary stands in the arguments — take it as it is written. There is none — ask the owner:
they are still here at the minute of the call, and by morning there will be nobody to ask. The
question is one, and the work does not start before the answer.

The boundary is written into the head of the morning list (section 6): the session will be long,
and the first message goes out of the window before the night ends. A boundary that is an event — a
merge, the end of an epic — is written as the latest moment the owner expects it, asked of them now.

The owner's word that the night is over, or their return before the boundary, ends it at once: the
line `Автономно до:` gets the current moment by a file edit, before any other step, and the day's
menu and windows are back with it.

A night declared by words, without this command, starts with the same steps: without the list and
its boundary line the guards take it for day.

## 2. Raise the rule and the pattern

```
Skill: autonomous-work
Skill: autonomous-work-run
```

The companion of the rule is read as a file next to it: the rule says what must be true, the
companion — what it is called in this tree and what here is held by nothing at all.

## 3. Read the tree profile

The main branch name, the task folders directory and the handover directory differ from tree to
tree:

```bash
for profile in .claude/rt-kit/defaults/project.sh .claude/rt-kit/project.sh; do
    [ -f "$profile" ] && . "$profile"
done
printf 'главная: %s · задачи: %s · передача: %s\n' \
    "${RT_MAIN_BRANCH:-main}" "${RT_TASKS_DIR:-docs/tasks}" "${RT_HANDOFF_DIR:-.claude/handoff}"
```

## 4. Checks before the first work

All of them are made before the first task is taken. Each of them by morning costs a whole night: a
session that runs into them at three o'clock has nobody to ask.

```bash
git status --short                  # uncommitted work
git fetch origin                    # the tip of the main branch
git log --oneline -1 "origin/${RT_MAIN_BRANCH:-main}"
```

- **The tree holds uncommitted changes.** Name them to the owner and ask what to do with them:
  they are still here. Work that goes on top of somebody else's edit carries it into a foreign
  branch.
- **Another session is working in this tree.** Ask the list of sessions: two nights in one working
  copy switch branches under each other.
- **The tip of the main branch has moved.** The first branch of the night is created from a fresh
  base, not from the local ref: the local one is yesterday's snapshot and is silent about it.
- **The epic branch does not carry the tip of the main branch.** Asked by
  `git merge-base --is-ancestor "origin/${RT_MAIN_BRANCH:-main}" origin/<ветка эпика>`. The owner
  is asked to have main merged into it now: at night that merge is sent only where they name it, and
  the first branch of the night is refused on it.
- **The source of the work is named.** An epic plan if there is one, the work queue otherwise. A
  night that takes tasks by their look at the list takes somebody else's first.

## 5. Name what will not be done

Say it to the owner before they leave, in one line: nothing goes outside past their word — a push,
a request, a merge, a publication, a cargo send happen only where they named it now. Everything
visible from outside is undone by a person, and there is none until morning. Their words about
what may go outside are taken verbatim for the line `Разрешено:`; no such words — the line says
`нет`.

The allowed calls are rehearsed now, while they are here. A kind with a form that changes nothing —
a read, a dry run — is run twice with different data. A merge, a publication or a send has no such
form and is never rehearsed by doing it: the owner's own allow rule covers it now. A call that stops
on a permission prompt and has no such rule leaves the allowance, and the line says so. The calls of
the cycle itself — the column move, the queue audit, a step measure — are rehearsed the same way,
in the form the night will make them: one call each, with no substitution and no chain unless a
guard demands that form.

There they also hear which tasks the night will not take: the ones that need their word. Read
from the source of the work, not guessed on the spot. A guard that asks the owner by its own window
is named as well: its call waits for the morning even where the allowance names the kind of call. A
PR behind such a window holds back every PR that stands on it, and that is said too.

## 6. The morning list is a file

The law demands a trace on disk at every step: a session breaks off without warning — on the
window, on a refusal, on the network — and what was not written vanishes with it. The last reply
does not survive such a break.

The list lies next to the handover of the session, is created by this command with the boundary in
its head, and is appended to after each closed piece of work. A newest list whose boundary still
lies ahead means a broken night resumed — after midnight too: it is read and continued, not written
over. Run with nothing filled in, the block leaves its head as it is; run with the owner's new words,
it rewrites the three lines of the head and keeps the rows. A list whose boundary has passed, or
carries a boundary the guards cannot read, belongs to a past night: its allowance is not carried
over, and a new list is created. The block reads the profile itself, from the root the guards read:
the shell keeps nothing between calls.

Two lines of the head are read by the guards and the morning. `Автономно до:` is the boundary as a
moment, `ГГГГ-ММ-ДДTЧЧ:ММ`, translated from the owner's words by the session: while it lies ahead,
the turn-exit guard names a default instead of the owner's menu; once it has passed, the day goes
as usual. `Разрешено:` carries the owner's words from section 5. The model hook on the turn's end reads
both lines for the send of an incident record. The session fills the three values
into the block before running it: the words of the boundary from section 1, the moment and the
allowance, each between its own marks. A value left unfilled, or a moment that is not ahead, starts
no list, and the block says so: the guards would take that night for day in silence.

```bash
root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
for profile in "$root/.claude/rt-kit/defaults/project.sh" "$root/.claude/rt-kit/project.sh"; do
    [ -f "$profile" ] && . "$profile"
done
dir="${RT_HANDOFF_DIR:-.claude/handoff}"
case "$dir" in /*) ;; *) dir="$root/$dir" ;; esac
words='' moment='' allowed=''
while IFS= read -r line; do words="${words:+$words }$line"; done <<'СЛОВА'
<the boundary in the owner words>
СЛОВА
while IFS= read -r line; do moment="${moment:+$moment }$line"; done <<'МОМЕНТ'
<ГГГГ-ММ-ДДTЧЧ:ММ>
МОМЕНТ
while IFS= read -r line; do allowed="${allowed:+$allowed }$line"; done <<'СЛОВА'
<the owner words, or нет>
СЛОВА
now="$(date +%Y-%m-%dT%H:%M)"
newest() { find "$dir" -maxdepth 1 -name '*-ночь.md' 2>/dev/null | sort | tail -1; }
ahead() {
    printf '%s\n' "$1" | grep -qE '^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]$' || return 1
    [ "$(printf '%s\n%s\n' "$now" "$1" | LC_ALL=C sort | tail -1)" != "$now" ]
}
list="$(newest)"
past=''
[ -z "$list" ] || past="$(sed -n '/^|/q; s/^Автономно до: *//p' "$list" 2>/dev/null | head -1 | sed 's/[[:space:]]*$//')"
empty=''
for value in "$words" "$moment" "$allowed"; do
    case "$value" in '' | '<'*'>') empty=1 ;; esac
done
[ "$allowed" = нет ] || allowed="«${allowed}»"
if [ -z "$empty" ] && ahead "$moment"; then
    if ahead "$past"; then
        W="$words" U="$moment" A="$allowed" awk '/^\|/ { table = 1 }
            !table && /^Граница:/ { print "Граница: " ENVIRON["W"]; next }
            !table && /^Автономно до:/ { print "Автономно до: " ENVIRON["U"]; next }
            !table && /^Разрешено:/ { print "Разрешено: " ENVIRON["A"]; next }
            { print }' "$list" > "$list.new" && mv "$list.new" "$list"
    else
        today="$dir/$(date +%Y-%m-%d)-ночь.md"
        while [ -n "$list" ] && [ "$(printf '%s\n%s\n' "$today" "$list" | sort | tail -1)" = "$list" ]; do
            mv "$list" "${list%.md}-до-$(date +%H%M%S).md" || break
            list="$(newest)"
        done
        list="$today"
        mkdir -p "$dir" && printf '# Список к утру · ночь с %s\n\nГраница: %s\nАвтономно до: %s\nРазрешено: %s\n\n' \
            "$(date +%d.%m.%Y)" "$words" "$moment" "$allowed" > "$list"
    fi
    if [ "$(newest)" = "$list" ] && grep -qxF "Автономно до: $moment" "$list" && grep -qxF "Разрешено: $allowed" "$list"; then
        echo "ночь до ${moment}: $list"
    else
        echo "список не записан: $list" >&2
    fi
elif ahead "$past"; then
    echo "продолжается до ${past}, голова не тронута: $list"
else
    echo "граница «${moment}» — не момент впереди вида ГГГГ-ММ-ДДTЧЧ:ММ, или слова не заполнены: список не создан" >&2
fi
```

A row per closed piece of work, and the row order is the merge order. The shape of the row and
the line of a postponed task are in the pattern `autonomous-work-run`.

## 7. The cycle

Then the work goes by the rule and the pattern, and the last reply gives the list — the same one
that lies in the file.

Where a turn-exit guard is laid out, it holds a working turn until the scenario is over or the
owner stops it by a stop word or Esc. Before the boundary it names a default instead of a menu, and
a question does not end the turn either. So the list is appended along the way and lies in the file
at any minute. The guards do not end the night: the boundary only gives the owner's menu back, and
the night ends with the end of the scenario, or with the owner's stop word, Esc or return.

## What this command does not do

- It opens no request and merges nothing on its own: those go only where `Разрешено:` names them.
- It does not decide what to work on: the source of the work is the epic plan or the queue.
- It does not stop the session at the boundary by itself: the session ends the night there.
