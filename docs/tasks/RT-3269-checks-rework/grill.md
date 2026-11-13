# Grill

## The owner request

> Делай эти правки сейчас, без задачи. Сейчас, в этом рабочем дереве, где ты находишься, делай эти правки. Ты написал сейчас проверки так, что что бы ты ни делал, это займет час проверок. Ты обязан прямо сейчас, без всяких задач, без ничего, поменять эти проверки.

Said on 13.11.2026 after the full set before a push ran on a branch equal to `main`.

## What the tree already has

- The push guard runs the light checks on every push and refuses until the heavy steps carry green
  marks. It never compares the tip of the branch with the base.
- The set of steps is printed by `rt_push_checks` in the tree profile. It takes the base and does
  not read which files the branch changed.

## Decisions

- **A branch whose commits all lie in the base on the server is pushed with no set** — there is
  nothing the set could judge that the base has not been judged for.
- **The heavy steps are chosen by the changed paths** — a text commit changes the outcome of no
  build, no suite and no frame.
- **The edits are made in this working copy, in the branch of the epic, by the owner's word** — the
  owner said so outright.
