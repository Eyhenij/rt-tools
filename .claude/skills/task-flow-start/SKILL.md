---
name: task-flow-start
kind: pattern
rule: task-flow
description: Pattern of rule task-flow. Load at the start of work from the owner — exploration before the first question, the six mandatory questions, the product agreement, creating the task, the branch and the folder. Returning to work — pattern task-flow-resume.
---
<!-- rt-kit v0.26.0 · patterns/task-flow-start.md · 90055ae949d2 · правится надстройкой, не здесь -->

# Starting the work

Pattern of the rule `task-flow`. What must be true meanwhile — the law
`docs/constitution/work-conduct.md`.

## When to use

- The owner asks for something to be done; the size of the request does not matter — a folder is
  created for any work.
- A defect noticed along the way becomes a task.

## Order

The steps below open one continuous count: a step number is one for the whole course of the work and
does not start over in the next pattern. The whole list is in the rule `task-flow`; it is also shown
to the owner at the start of work, so that after six questions what lies ahead is visible.

### State `просьба-не-разобрана`: exploration — before the first question

A question whose answer lies in the code is not put to the owner: it devalues the rest.

```
Agent(subagent_type: "Explore", prompt: "<тема просьбы>: что по ней уже есть в дереве —
  какие спеки описывают, какие законы и правила задевает, какие либы затронуты,
  есть ли готовый образец рядом. Верни находки, а не пересказ файлов.")
```

The findings go into the grill section "What is already in the tree".

The tree is not the only place where the answer lies. A decision of a past session, written nowhere,
lives only in that session's record: a search over them by the theme's word costs one command. What
is found is written into the tree in the same turn — into the epic plan if it links tasks, into the
progress if it concerns one.

Exploration that found nothing is no permission to ask. First, where the search went is named; then
the places missing from the list are reached — the epic plan, the archive, the records of past
sessions. "Not found in such a place" speaks of the place, not of the tree, and the question names
both ways in which the search went.

Exploration ends with command output, not with a feeling. Before the first question to the owner the
executor knows three things. How the repository is arranged (the root memo), what lies in the
directory at hand (`ls`), and whether something is already written on the theme (a search over the
documentation and the rules). Without a list of what counts as done, exploration runs as a mood: a
read handover passes for it, and not one command runs over the tree.

Exploration over a created task ends with a reproduced symptom, not a found file. The task body
describes the tree on the day of creation, and exploration by the names from the body confirms only
that the files are in place: a task that has lapsed cannot be told from a live one. Before the first
edit the exploration repeats what the task complains about — calls the procedure, reads the reply,
runs the check that stayed silent. The symptom did not reproduce — the task is closed as lapsed, and
that is a lawful outcome.

A tree named as a sample is read as a layout whole — by walking the directories two levels deep —
and only then come the questions about techniques. The answer to "how is this done here" gives one
folder, and generalised into a map of the tree it lies: the neighbouring family of directories is
left out, and the owner finds the loss.

What was inferred is marked right in the list, together with what confirms it. A guess by a
neighbouring case stands in one list with what was checked, and the owner reads the whole list as
checked.

The six questions are asked minus those the exploration answered: instead of a question with a ready
answer, the grill gets the line "taking such-and-such answer, here is where from". The sign is one —
whether the answer is in the tree; "the task seems clear" is no sign in either direction.

**Next move:** the findings land in the grill, and in the same turn the first of the six questions
goes to the owner. The exploration ended — the state stayed the same, so did the turn.

### State `просьба-не-разобрана`: the grill with the owner

Led by the main agent: a subagent cannot reach the owner. The command is `/grill-me`, one question
at a time, each with its recommended answer and the reason.

All six questions are closed, and those the exploration did not answer are asked:

| Question | Why |
| --- | --- |
| Does the task change the application's behaviour | the product agreement depends on it |
| Does it need an edit of a law or a rule | a law is not edited without the owner's knowledge |
| One task or several | what rolls back apart is split, and split BEFORE the branch |
| What is not part of the task | a boundary not named aloud does not exist |
| What will show that the task is closed | "it works" is no sign |
| Is there a sample the approach is taken from | exploration finds something similar, not the thing itself |

The list of six is the set of what is closed by the start of work, not a set of lines to be said. A
question the owner has already answered is marked closed together with what closed it: the answer is
sought in the documentation and in what was said in this same session, the original request
included. It can be closed by an assumption too, when the answer is obvious — by the line "question
closed by assumption: <what is taken>": a wrong assumption costs an edit, a question about the
obvious costs a session.

The size of the work is never a ground for a question about boundaries: "this is big work" is the
executor's judgement, "whether to do it whole" is the owner's, and they decided before the work
began.

The form of a question is set by the owner's settings: where a menu is required, a menu is asked,
and a free option is added to every question — a closed set has no line "wrong question".

**The framing of a handed-over text is not carried onto the current tree.** A session handover, a
proposals file and a spec describe the tree they were written in. Only the current tree knows about
the current one, and a statement about the layout is checked by a command here. Confirmation finds
itself — the signs of a tree that only installs the package stand on the one that writes and
installs it too.

The message with which the executor stops begins with what they wait for:

```
Стою на выборе <что решается>. Без ответа <что будет: пойду допущением таким-то / работа стоит>.
<Вопрос>
```

Under the question goes the table of the epic's position — the same as in the handover. Under, not
above: the stop is named by the first line, and the epic's position is what the owner decides from.
Work outside an epic carries no table.

Measurements, role findings and the list of decisions are by then written in the progress, and in
the message to the owner they are superfluous. A report with a question at its end looks diligent
exactly as reliably as the question drowns in it.

The answers are written into `docs/tasks/_draft-<slug>/grill.md` — the folder is still a draft,
there is no number.

```bash
mkdir -p docs/tasks/_draft-<slug>
cp docs/tasks/_template/grill.md docs/tasks/_draft-<slug>/grill.md
```

**Next move:** the owner's answer is appended to the grill, and the next question follows. The
answers are over — in the same turn the work goes into the roles pipeline.

### State `разбор-закрыт`: the pipeline after the grill

There will be no more questions — from here on, the roles:

```
Workflow(name: "plan", args: "docs/tasks/_draft-<slug>")
```

Need → the product agreement (`spec-writer`) → its adversarial review (`spec-critic`) → the plan and
the breakdown (`project-manager`). Gaps the roles could not close return to the owner — the main
agent carries them.

The agreement that came out of the pipeline is checked against `grill.md` line by line before work
by it. The role writes the text without seeing the owner and can turn their answer into its
opposite: the order of stages came out reversed, and included items moved to "not included". A
critic's finding that diverges from the owner's answer is carried to the owner, not carried out in
silence.

The turn does not end on this boundary. A closed grill looks like a finished piece — the answers are
on disk, the file is committed, there is something to report — and the report takes the place of the
agreement. It is written in the same turn, by the roles pipeline or by the executor's hand.

**Next move:** the agreement checked against the grill is committed, and in the same turn the task,
the branch and the folder are created — and if the grill produced a series, the epic is declared
first.

### State `договорённость-записана`: a series of tasks is declared an epic

The grill ended with one task — the step is skipped. Several came out, and the order between them
matters — the epic is declared here, before the first of them, and twice. As a card in the work
queue with the epic label, and as a plan next to it.

The epic plan names three things, and none is derived from the others:

```markdown
# <Возможность, которая разрабатывается>

Одной фразой: что у владельца появится, когда эпик кончится.

| №   | Задача       | Почему здесь             |
| --- | ------------ | ------------------------ |
| 1   | <что делает> | <на чём стоят следующие> |
| 2   | <что делает> | <что из первой ей нужно> |
```

A set without an order is no order: two tasks whose order rested on understanding went into work the
other way round, and the second was redone under the first. The assigned order holds to the end of
the epic; a revision is the owner's decision, and it is written into the progress of the task that
caused it.

The plan lies outside the task folder: that one dies with the very first merge. The directory for it
is named by the rule's companion — the package has no path of its own.

The cards are created for all the tasks at once, right here: by the task creation call for every row
of the table, with the epic label. The issued numbers return to the same table — as a column or a
prefix to the name — and from this minute "take the next" answers with a number, not a name.

A task under an epic names it in its body — the card number and the path to the plan in one line —
and the plan names the task from its side. A one-sided binding looks as whole as a two-sided one:
the reader comes now from the epic, now from the card, and the second side exists for only one of
them.

**Next move:** the declared epic is committed together with the task numbers, and in the same turn
its first task is taken — by creating the branch and the folder.

### State `договорённость-записана`: the task, the branch, the folder

```bash
npm run task:new -- --title '<Что не так>' --slug <slug> --label documentation --label area:tooling < тело.md
git checkout -b <КЛЮЧ>-<номер>-<slug>
npm run task:move -- <номер> in-progress
```

The body comes as a file and is never empty: an empty task tells nothing to the executor or the
owner, and it can be filled in later only on the owner's word.

`task:new` renames `_draft-<slug>` to `<КЛЮЧ>-<номер>-<slug>` and fills in the plan header. The
branch is created by a second call: a compound "create and commit at once" is refused by the
main-branch guard whole.

The number is already issued — there is no draft and none is created: the folder opens straight
under the branch name. Half of all work starts this way: the number comes from a past session, a
noticed defect or a neighbouring task, and there is nothing to rename. The pitfall "the number never
comes first" does not apply here — it is about not creating the task before the grill.

The other two files are written, not laid down as templates for later: an empty `plan.md` cannot be
told from a plan without stages, and the next session trusts the task folder. The template is opened
by the same move that fills it, and the layout header is stripped from the copy right there —
otherwise the guard refuses the edit, and the pitfall next to the rule explains why:

```bash
cp docs/tasks/_template/plan.md docs/tasks/<КЛЮЧ>-<номер>-<slug>/plan.md      # and written at once
cp docs/tasks/_template/progress.md docs/tasks/<КЛЮЧ>-<номер>-<slug>/progress.md
```

In the progress the first line declares the state — from this minute the guard reads it:

```markdown
- **State:** `задача-взята`
```

Until a state in which code is edited is declared, the guard refuses the edit and names the
mandatory action of the state that stands in the line.

**Next move:** having declared the state, the same turn takes up the plan starting with its header.
A created folder does not end the turn: not one written file is in it yet.

### State `задача-взята`: the plan header

The guard reads it:

```markdown
**Task:** <КЛЮЧ>-282 · **Branch:** <КЛЮЧ>-282-task-flow
**Draft:** `docs/specs/bookings/proposed/aside-header/`
**Behaviour:** changes
```

A tree with no "proposed" directory names the agreement by the domain spec itself — there it is
written straight into it, and nothing has to move at the closing of the work:

```markdown
**Spec:** `docs/specs/bookings/spec.md`
```

Work that does not touch `apps/**` and `libs/**` needs no agreement:

```markdown
**Behaviour:** unchanged — a move of the layer, invisible from outside. Подтверждено владельцем.
```

An empty reason is not accepted.

**Next move:** under the header the task footprint and the stages are written, the plan is
committed, and in the same turn the first stage begins.

### State `замысел-записан`: the first stage begins in the same turn

The plan is committed — the work moves into the first stage at once, without giving up the turn. The
state line is rewritten to `этап-идёт`, and from there the work is led by the resume pattern.

```markdown
- **State:** `этап-идёт`
- **Stage:** 1 из 3 — <название первого этапа из замысла>
```

The turn does not end on this boundary. A written plan looks like a finished piece: the stages are
laid out, the file is committed, there is something to report — and the report takes exactly the
place the work should have taken. The owner reads it as done, and nothing is done: on 21 August a
session ended with the line "next step — such-and-such" at a window fill of about two percent.

Four things end a turn, and they are the same as for the other states: the window fill limit, a
guard's refusal, a question to the owner and handed-in work with the next begun. A pattern read to
the end is not among them — the text ended, the work did not.

**Next move:** the first stage is done in the same turn, and it is declared closed after its command
from the "Checked by" line has passed.

## Common misses

- **The number never comes first.** Until the grill ends it is not even known how many tasks come
  out of it: a task created in advance is closed after the breakdown and stays as litter in the work
  queue.
- **The grill is written to disk at once, not stored up in the conversation.** The session breaks
  off, and a grill lived through in conversation is recovered only by the owner's retelling.
- **One grill produced several tasks — the common part leaves for the epic plan.** The task folder
  dies with the merge, and the task order outlives it; the directory is named by the rule's
  companion.
- **The task is created by a command, not by four calls in a row.** The board is not bound to the
  repository, and the task gets onto it only by an explicit addition.
- **The branch slug is taken from the terminology of the agreement, not from the words of the
  request.** The agreement is written before the branch, and that is exactly where it drops the
  owner's word. The task title and the PR title can be fixed; the branch name after the PR opens —
  no longer.
