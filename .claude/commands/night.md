---
description: The start of an autonomous session — the time boundary, the checks before the first work, the cycle until morning and the list the owner reads
argument-hint: '[until when: «до 8 утра» | «часов шесть» | empty — the boundary is asked]'
---
<!-- rt-kit v0.29.0 · commands/night.md · 37dfd93b1198 · правится надстройкой, не здесь -->

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

Write the boundary down at once: the session will be long, and the first message goes out of the
window before the night ends.

```bash
printf 'граница ночи: %s\n' "$ARGUMENTS"
```

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

All four are made before the first task is taken. Each of them by morning costs a whole night: a
session that runs into them at three o'clock has nobody to ask.

```bash
git status --short                  # uncommitted work
git fetch origin                    # the tip of the main branch
git log --oneline -1 origin/main
```

- **The tree holds uncommitted changes.** Name them to the owner and ask what to do with them:
  they are still here. Work that goes on top of somebody else's edit carries it into a foreign
  branch.
- **Another session is working in this tree.** Ask the list of sessions: two nights in one working
  copy switch branches under each other.
- **The tip of the main branch has moved.** The first branch of the night is created from a fresh
  base, not from the local ref: the local one is yesterday's snapshot and is silent about it.
- **The source of the work is named.** An epic plan if there is one, the work queue otherwise. A
  night that takes tasks by their look at the list takes somebody else's first.

## 5. Name what will not be done

Say it to the owner before they leave, in one line: nothing goes outside during the night — no
push, no request, no publishing, no cargo mark. Everything visible from outside is undone by a
person, and there is none until morning.

There they also hear which tasks the night will not take: the ones that need their word. Read
from the source of the work, not guessed on the spot.

## 6. The morning list is a file

The law demands a trace on disk at every step: a session breaks off without warning — on the
window, on a refusal, on the network — and what was not written vanishes with it. The last reply
does not survive such a break.

The list lies next to the handover of the session, is created by this command and is appended to
after each closed piece of work — not assembled at the end:

```bash
printf '# Список к утру · ночь с %s\n\n' "$(date +%d.%m.%Y)" \
    > "${RT_HANDOFF_DIR:-.claude/handoff}/$(date +%Y-%m-%d)-ночь.md"
```

A row per closed piece of work, and the row order is the merge order. The shape of the row and
the line of a postponed task are in the pattern `autonomous-work-run`.

## 7. The cycle

Then the work goes by the rule and the pattern: a task from the source of the work, the branch
from the previous one, the task folder, the plan, the stages, the folder taken apart into the
description of the past. A default is written where the owner's answer would have been written. A
guard's refusal is a step of the work, not the end of the night.

The night ends at the named boundary, and the last reply gives the list — the same one that lies
in the file.

## What this command does not do

- It does not merge and does not open requests: they are visible from outside.
- It does not decide what to work on: the source of the work is the epic plan or the queue.
- It does not tell night from day. There is no such sign in the tree, and the command adds none:
  it is called by the owner's word and by nothing else.
