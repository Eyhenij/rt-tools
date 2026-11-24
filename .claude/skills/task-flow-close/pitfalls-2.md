<!-- rt-kit v0.39.1 · pitfalls/task-flow-close.2.md · 905c7fee1a5a · правится надстройкой, не здесь -->
# Closing the work — cold part, continued

The second half of the pattern `task-flow-close`; the first is `pitfalls.md`.

## Оставшийся шаг

Папка задачи разобрана коммитом `<sha>` — за работой убрано. Осталось дождаться прогона и снять
черновик; до этого кнопка слияния заблокирована хостингом.
```

The draft is lifted — the section is rewritten by the same call that edits the body:

```markdown
## Оставшийся шаг

Не осталось: прогон зелёный, черновик снят. Можно вливать.
```

Where the pipeline does not wake for this base, the PR opens with the section already in this
second form: nothing is left to wait for, and the check standing behind it is the push gate.

```markdown
## Оставшийся шаг

Не осталось: набор проверок перед push зелёный, CI на эту базу не ходит. Можно вливать.
```

The section heading and the words of both samples are written in the language of the PR, not the
language of the pattern. The heading is named by the tree in its profile, `RT_PULL_BODY_SECTION`,
and is taken from there, not from the samples above. What is carried over whole is the order of
thoughts, not the words. The same holds for the messages to the owner below: they are samples of
**what** is said, not of which words.

The section is neither left empty nor removed altogether: a missing section and "no steps left" read
the same and mean different things. The full sample of a PR body — in the pattern for creating a
commit and a PR, if the tree laid it out.

Where the tree laid out the delivery guard, it reads the body straight from the opening command —
passed as an argument or as a file — and refuses the call together with everything else that does
not match. It judges the section by the heading the profile names; unnamed, the section is not
judged at all. Without the guard the section is held only by whoever writes the body.
The work queue audit still does not read the body: the miss is caught at the minute of opening, that
is, where one call still fixes it.

The difference between the section and the spoken word is one, and it is all. The owner reads a
message only if they return to the conversation, and the section they see where they look when
pressing the button.

### The messages to the owner, and the run between them

Where the pipeline wakes for this base both are mandatory, and the order between them is one.
Neither replaces the other: the first says the work is handed in and what it waits for, the second
— that it is ready. Where no run comes, there is nothing between them, and they are written as one.

Right after the PR opens:

```
PR #<номер> открыт черновиком, папка задачи уже разобрана — за работой убрано. Жду прогона:
пока он идёт, о работе известно только то, что она запушена. Как закончится — сниму черновик и
попрошу тебя влить. Следующая задача уже взята: #<номер>, ветка <имя ветки>.
```

Где CI на эту базу не просыпается, оба сообщения складываются в одно — его пишут тем же ходом,
каким открыли PR:

```
PR #<номер> открыт и готов к слиянию: набор проверок перед push зелёный, папка задачи разобрана.
CI на PR в ветку эпика у нас не ходит — влей его, пожалуйста. Следующая задача уже взята:
#<номер>, ветка <имя ветки>.
```

The last line names what is taken, not an intent to take, and that is no figure of speech. A sample
that ends with a promise is carried out as a promise: the session says the last line and ends the
turn on it. The message looks complete, and nobody sees the emptiness behind it, neither the owner
nor the session itself. A sample that ends with the number of a created branch cannot be carried out
so: while there is no branch, there is nothing to write the line with. The incident analysis —
`2026-08-16-next-task-said-not-taken.md`.

The run is green, the draft is lifted:

```
PR #<номер> готов к слиянию: прогон зелёный, черновик снят. Влей его, пожалуйста.
```

The draft is lifted before the second message, not after it. The owner, having read the request to
merge, goes to press the button — on a draft it is locked, and the turn comes back to the executor
for nothing.

The run is red — the message is the same in form, but speaks of the red and of what is being done
about it; there is no request to merge in it. The request sounds once and only when the work is
ready whole: said ahead of time, it stops meaning anything, and the owner returns to the old way —
merging by a green page.

Between the two messages the executor does not wait: the work is handed in for review, and the next
task is taken by the same move. They return to the PR by the turn that reads the end of the run.

### An edit after remarks goes without a plan on disk

The review returned remarks, or the run went red — it is fixed in the same branch. The plan is no
longer there, and the folder is not assembled again: the progress guard lets the edit through on the
sign from the branch history. What exactly is fixed is taken from the remark, not from the plan. The
one exception is the `git revert` the engine names for a step whose fix lies in the folder.

A merge left in the working copy is either pushed in the same turn or not made — otherwise the owner
sees the old state and decides by it.

**Next move:** the run is green and there are no remarks — the draft is lifted, and the owner is
told the work is ready. Where no run comes, the same move follows the fix itself.

## State `задачи-эпика-кончились`: the epic is handed in by a request into the main branch

Every task of the epic is merged into its branch and every folder is taken apart — only then does
the epic branch get a request of its own, and its base is the main branch. Until that minute the
branch is not offered to a person at all: the merge button on it means the whole epic, and there is
nothing to press it for while a task is still being written.

Before opening, three things are checked by a command rather than by memory:

```bash
gh pr list --base <ветка эпика> --state open      # no task of the epic is left unmerged
git ls-tree -r --name-only HEAD -- docs/tasks/    # no folder of a task of this epic is left
git fetch origin && git merge origin/main         # the main branch is merged into the epic branch
```

A folder left in the epic branch reaches the main branch with it: what one branch needed becomes the
tree's for good. A foreign folder, arrived with a merge of the main branch, is not touched.

**A step of the milestone that the merge does not make gets a holder before the request opens.** A
release, a rollout, an install in the consumers and a task taken out of the epic belong to no task
of it, and after the merge nothing keeps them: each becomes a task in the work queue in the same
turn, and the body of the request names their numbers.

The body is written the same way as a task's, and its "Что сделано" is the list of the tasks by
number: the reviewer opens one page instead of five. The plan of the epic stays in the tree — it
outlives the branch.

**Next move:** the request is open as a draft, the run is awaited, the draft is lifted, and the
owner is asked to merge — by the number, in one turn.

## Common misses

- **The texts are edited before the folder is taken apart:** the list lies in the plan, which the
  taking-apart deletes.
- **A decisions entry repeating a rule's article word for word is no reason next to it.** It leaves
  whole even if the section empties; a reason the article lacks is appended to it.
- **The PR body stays older than the taking-apart.** The taking-apart is the last commit of the
  branch and makes untrue everything the body promised to do before the merge; it is edited in the
  same turn.
- **A rule statement is lifted together with its binding line.** The link goes by text, and either
  half alone reddens the spec audit.
- **The section "What of the law is not here" is read by eye, grep does not help here.** The word
  to search for is not the one expected, and the untruth is not where the theme word leads.
- **"Audited" cannot be said without opening the file.** The rule is read whole: a stale statement
  stands among true ones and differs by nothing.
- **The merge is not done after the merge into main:** main then holds a "proposed, not rolled out" section with what has worked for a month.
- **Scenario numbers are not renumbered at the merge.** The id is the key of the link to the tests.
- **"What is not included" is read whole after the merge, not appended to.** The feature's
  boundaries land next to the domain's, and the line "this section does not exist yet" becomes a lie
  by the very work that merges it. The spec audit does not look there.
- **One's own line of the work queue audit is found by name** — by the task number and the branch
  name: the audit answers for the whole tree.
- **The pair "size label — line in the epic plan" breaks from both sides.** A task on the trail of a
  closed one inherits the label without the line about sessions, and a closed epic takes the line
  away from everyone who carries it.
- **A rule without a binding does not enter the domain spec.** Nothing carries it out, so it is an
  intent, and its place is the domain's open questions.
