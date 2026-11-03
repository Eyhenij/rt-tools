# Grill

## Records of the intake

| Kind     | Mark key                                                           | Intake sign                            | Tree           |
| -------- | ------------------------------------------------------------------ | -------------------------------------- | -------------- |
| proposal | `95ebb758266d7619bde14ef29ce44a8463e63b0bbaa87c804534e1e47264372d` | `2dfcb9ac-abf2-4f18-84ab-72c05cc09e39` | `70f4a3ad0c32` |
| proposal | `5d691a84466196b0ace28e8d07b378e8656a714086154ede2a6af528ee7ffb03` | `104f7800-fd30-453b-b291-55ea28e85809` | `70f4a3ad0c32` |
| proposal | `214e920b4fdce2349192843bb63ecb45d30c040dfb188b511593c7526e69c1a4` | `e827b067-1b2f-453d-b5dc-f1c9987a3a8f` | `b101ab1c9908` |
| analysis | `2026-10-29-push-moved-to-terminal-past-the-gate.md`               | `7446adf1-4d57-4a0b-9fce-3eb43e9e93d6` | `b101ab1c9908` |

This tree's two records moved to `in_work` on 03.11.2026 with the spec
`docs/specs/agent-kit/checks/spec.md`, the one `npm run specs:for` names for the resource. The
two proposals of tree `70f4a3ad0c32` are closed by `cargo:close` after the merge.

## The owner request

> читай что нового в приёмнике, заводи эпик и задачи под каждую находку и бери в работу, открывай
> пр по одному и отдавай мне на ревью, не переходи к следующей задаче пока я не дам аппрув и пока
> не будет вмержен этот пр

The epic grill, the decisions about splitting and the order live in the epic plan
`docs/plans/cargo-2026-11.md`.

## What the tree already has

- The guard is `projects/agent-kit/assets/hooks/git-guard-push-tests.sh`, its scenarios are
  `projects/agent-kit/tests/git-guard-push-tests.test.sh`: 39 ok on 03.11.2026.
- Line 64 looks for the word `push` anywhere in the command. Line 107 counts `git … push` calls
  and the loop sign by line, so `--all`, `--mirror`, two refs and a loop over several lines pass.
- The header `rt-hook` and the tool `case` name `Bash` and two editor tools. The session terminal
  tool `mcp__terminal__run_in_terminal` puts the command into the same field `command`.
- The articles of the push gate live in `docs/specs/agent-kit/delivery-gate/spec.md`, the
  scenarios next to it. «Several pushes in one command … refuse the command whole» stands there:
  the spec is right, the code is not.

## What the rules already say

- The spec names no article for the word `push` in another command of the line, nor for the
  terminal tab. The owner's order takes every finding into work, so both are written into the spec.

## Questions and answers

Closed by the epic grill: no law edit; the edit lies under `projects/agent-kit/`, outside `apps/**`
and `libs/**`, so no product agreement is written.

## Decisions

- **The push sign is the subcommand `push` of the same `git` call.** It is looked for after `git`
  and its keys and up to the nearest command separator. Rejected: cutting quoted text out of the
  line, since a quoted `push` after `git` options is still possible only as a key value.

## What is left unclear

- Nothing blocks the work.
