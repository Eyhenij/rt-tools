# Grill

## The owner request

> отправь через терминал, а на ошибку отдельный тикет и в работу

Said about the hook scenario SC-AK-1261 that went red on a clean `main` and held the push of the
review fixes of PR #3124.

## What the tree already has

- `projects/agent-kit/tests/pre-push.test.sh` — the scenarios of the git hook before a push. The
  fixture is a real repository with the hook wired and a bare remote next to it.
- SC-AK-1261 pushes `RT-90-hook` and `main` to the remote, then deletes `main` there and expects
  code 0: a deletion sends no tree, and the hook must not judge it.
- `projects/agent-kit/assets/hooks/pre-push.sh` skips a ref with a sha of zeros, as the spec
  `docs/specs/agent-kit/pre-push-hook/` says.

## What was found

A debug copy of the scenario printed the answer of git itself:
`refusing to delete the current branch: refs/heads/main`. The remote is a bare repository, and its
`HEAD` points at the default branch of the machine. On this machine the system configuration of
git sets `init.defaultBranch` to `main`
(`/Library/Developer/CommandLineTools/usr/share/git-core/gitconfig`). So the remote refuses the
deletion before the hook has anything to say, and the scenario is red for a reason that is not
the hook at all. On a machine whose default branch is `master` the same scenario is green.

## Questions and answers

Closed by assumption: the owner gave the order in one line.

- **Does the task change the behaviour** — no: the hook is right, the scenario depends on the machine.
- **What shows the task is closed** — the hook scenarios pass on this machine, and the deletion
  scenario still turns red when the hook judges a deletion.

## Decisions

- **The scenario deletes a branch that is not the current branch of the remote.** It checks the
  same thing — a deletion is not judged — without depending on the default branch of the machine.
  Rejected: setting `receive.denyDeleteCurrent` on the remote — the scenario would then test a
  setting the real host does not have.
