# Grill

## The owner request

> ты не закончил работу пры весят с ошибками и не готовы к мержу!!! что делать с таймаутом пуш невозможен?

> сначала поправь уже открытые мр замечания и конфликты потом RT-3092

> убедись что меры подходящие и оптимальные и делай все

## What the tree already has

- The push guard `projects/agent-kit/assets/hooks/git-guard-push-tests.sh` runs the whole set of
  `rt_push_checks <base>` synchronously inside `PreToolUse`, with the hook limit of 1800 s. The base
  is always `origin/<main>`.
- The tree profile `.claude/rt-kit/project.sh:rt_push_checks` picks the heavy steps by the subjects
  the branch touched against that base. A branch of the second kit gets the showcase snapshots
  (about 23 minutes), the admin end-to-end suite and the auth stand with its suite.
- A heavy step is already a named notion: `rt_push_check_heavy` in the profile and
  `rt_push_check_heavy_default` in the package defaults. The guard uses it only to hold heavy steps
  back after a red one.
- The scenarios of the guard live in `docs/specs/agent-kit/delivery-gate/scenarios.md`, which is at
  499 lines out of 500: new scenarios need a subdomain of their own.
- The sample of a helper sourced by a guard: `git-guard-delivery-signature.sh` — no `rt-hook:` line,
  sourced by the guard.

## What the rules already say

- `git-workflow`: «The push gate set is never narrower than the pipeline set», «The gate set calls
  the package default instead of listing it line by line».
- `testing`: «A check that arrives by layout arrives with its place too».
- The guard header: with no base the profile falls back to a full run — the gate may be stricter,
  never weaker.

## Questions and answers

**Which of the three measures of the task are done in the first branch?**
«убедись что меры подходящие и оптимальные и делай все»

## Decisions

- **The base is the branch the current one was created from, read from the branch reflog.** Git
  writes the line `branch: Created from <ref>` itself at `checkout -b`. It is taken only when its
  remote copy exists and is an ancestor of the head; otherwise the base stays `origin/<main>`.
  Rejected: the base of an open PR. It is a network call to the host in every push, and the first
  push of a stacked branch has no PR yet — exactly the costly one.
- **A green mark is keyed by the check line, the tree of the head and the base commit.** It is used
  only on a clean working copy: the checks run over the working copy, the push sends commits, and on
  a dirty copy the two differ. Rejected: a key by the head commit — an amended commit with the same
  tree would pay again for nothing.
- **Heavy steps run ahead by a separate command, and the guard only reads their marks — where the
  tree opts in.** The opt-in is `RT_PUSH_HEAVY_AHEAD=1` in the profile. In a tree whose heavy steps
  fit the hook limit, a refusal for a missing mark is a new step for nothing. Rejected: a default for
  every tree — the package does not know how long another tree's heavy steps take.
- **The guard still runs light checks without a mark.** They take seconds, and a refusal for a
  missing mark names every unprepared step at once, together with the red light ones.

## What is left unclear

- Nothing blocks the work.
