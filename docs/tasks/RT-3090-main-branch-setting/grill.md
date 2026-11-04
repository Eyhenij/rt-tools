# Grill

## The owner request

> RT-3090 (Рекомендуется)

The owner picked it from three described tasks; the other options were RT-3095 (the dispatcher
glues the output of several guards) and RT-3096 (the guard of outside browser drivers misses the
plugin drivers). The task body: the guard of the main branch guesses the name by the pointer of the
remote repository and falls back to `main`, while six other guards of the package read
`RT_MAIN_BRANCH` from the tree profile. In a tree with `develop` and no remote, a commit into
`develop` passes and a commit into a missing `main` is refused.

## What is already in the tree

- `projects/agent-kit/assets/hooks/git-guard-main.sh` — the `symbolic-ref` lines and the fallback
  `main`; it loads no profile.
- `projects/agent-kit/assets/defaults/project.sh` — `RT_MAIN_BRANCH` defaults to `main`.
- `projects/agent-kit/assets/hooks/git-guard-delivery.sh` — the loop that loads the profile.
- The suite `projects/agent-kit/tests/git-guards.test.sh` stands at 499 lines; the spec of the tree
  profile is `docs/specs/agent-kit/delivery-tree/` (100 scenario lines).

## Questions and answers

Closed by assumption, as the tasks before it:

- **Does the task change the behaviour** — yes, of one package guard; no application code.
- **Does it need an edit of a law or a rule** — no: one spec rule.
- **One task or several** — one.
- **What is not part of the task** — the other guards: they already read the setting.
- **What shows the task is closed** — scenarios: a tree with `develop` and no remote refuses a
  commit into `develop` and lets one into `main` through; a tree without the setting keeps the
  guessing.
- **The sample** — the profile loop of the delivery guard.

## Decisions

- **The setting is read from the tree's own profile, not from the package default.** The default
  always says `main`; read through it, a tree on `master` with no setting would lose the guessing.
- **The tree is the one the commit runs in.** The guard already looks at the branch there.
- **The scenarios go into a suite file of their own.** The delivery suite is at its length limit.
