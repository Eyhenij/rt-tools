# Grill

Read on 04.11.2026 by `npm run cargo:pull -- --kind postmortem --state new --text`. Keys are full,
as the read prints them.

| Kind     | Resource or name                         | Mark key                                 | Intake sign                            | Tree           |
| -------- | ---------------------------------------- | ---------------------------------------- | -------------------------------------- | -------------- |
| analysis | `2026-10-29-kit-pushed-past-its-gate.md` | `2026-10-29-kit-pushed-past-its-gate.md` | `e40fe0ef-d429-4ee5-a4f6-7d1693fa2825` | `70f4a3ad0c32` |

The record belongs to another tree, so it moves to `fixed` by `cargo:close` after the merge. No
proposal of the intake names a git hook: the analysis carries the proposal in its last line.

## The owner request

> читай что нового в приёмнике, заводи эпик и задачи под каждую находку и бери в работу, открывай
> пр по одному и отдавай мне на ревью, не переходи к следующей задаче пока я не дам аппрув и пока
> не будет вмержен этот пр

After the merge of #3099: «влил, бери следующую».

## What the tree already has

- The push gate is the session guard `projects/agent-kit/assets/hooks/git-guard-push-tests.sh`. It
  stands on the agent tools only; a push from a terminal outside the session, from another
  session through `git -C` or from an environment without the agent hooks runs no check.
- The package ships one git hook already, `projects/agent-kit/assets/hooks/commit-msg.sh`: a
  template without an `rt-hook:` header, laid out with the other hooks and wired by the tree. This
  tree skips it in `.claude/rt-kit.json` and runs commitlint from `.husky/commit-msg`.
- The git hooks path of this tree is `.husky/_` (husky 9, the `prepare` script). There is no
  `.husky/pre-push`.
- The set is `rt_push_checks <base>` from `.claude/rt-kit/defaults/project.sh` and
  `.claude/rt-kit/project.sh`; on 04.11.2026 it prints 46 lines and runs about 15 minutes.
- The neighbouring open PR #3094 (task RT-3092, another session) edits the same guard: it adds
  marks of checks already green on the same tree and base. It is not merged and stands on #3042.
- `docs/specs/agent-kit/push-sign/spec.md` names this task in its out-of-scope section: a push the
  text does not show is held by a pre-push git hook.
- The delivery gate texts stand near the length limit: `delivery-gate/scenarios.md` has 494 lines.

## Questions and answers

Closed by the epic grill of 03.11.2026: one edit is one task; the package is not released during
the epic; no law is edited; no product agreement is written, the edit does not touch `apps/**` or
`libs/**`.

Closed by assumption — the last two answers of the owner were the recommended options:

- The hook is a package template next to `commit-msg.sh`: the layout puts it into the hooks
  directory, and the tree wires it to git. This tree wires it by `.husky/pre-push`. Taken from the
  task body: «по образцу git-хука сообщения коммита».
- A push the session guard already judged does not run the set a second time. The guard writes a
  mark with the commit it judged green, and the hook trusts the mark for that commit only. A second
  run of a 15-minute set inside a session push would cut the session off.
- The mark is a file of its own, not the marks of #3094: that PR is not merged, and this task must
  not wait for another session's work.
- The hook judges the commit the working copy stands on. A push of another commit — another
  branch, a tag, an older commit — is refused: the set would check a tree that does not leave.
- The hook does not run in the pipeline: the pipeline is its own gate, and husky installs hooks on
  the runner too.
- `git push --no-verify` skips the hook by git's design. Refusing it is the session guard's work and
  is not part of this task.
- Done, from the task body: «Готово, когда установленный хук отказывает push на красном наборе в
  сценарии набора и раскладка ставит его в дерево».
