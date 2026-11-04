# Grill

## The owner request

> RT-3087 (Рекомендуется)

The owner picked it from three described tasks; the other options were RT-3086 (the scenario check
misses long prefixes) and RT-3100 (an arrow in quotes read as a write to a file). The task body: a
PR opens while the feature agreement still lies unmerged in `proposed/`; the guard refuses a branch
carrying its task folder and stops nobody for the agreement. In a tree that installs the package 13
tasks merged that way, about 4000 lines of agreements never reached the domain specs.

## What is already in the tree

- The open-PR condition is `rt_delivery_open_folder` in
  `projects/agent-kit/assets/hooks/git-guard-delivery-folder.sh`; the word `proposed` appears in no
  delivery guard.
- The plan header names the agreement as `**Draft:** \`path\``; the draft guard
`task-flow-draft-guard.sh` reads the same line.
- By the time the PR opens the task folder, plan included, is taken apart, so the plan is read from
  the history of the branch, not from disk.
- The tests of the folder conditions are in `projects/agent-kit/tests/git-guards.test.sh`
  (SC-AK-526…528); the spec `docs/specs/agent-kit/work/` stands at 494 scenario lines.

## Questions and answers

The owner took the recommended answer four times in a row, so the six questions are closed by
assumption:

- **Does the task change the behaviour** — yes, of a delivery guard in the package; no application
  code.
- **Does it need an edit of a law or a rule** — no: a spec rule of a new subdomain.
- **One task or several** — one.
- **What is not part of the task** — the merge and lifting-draft conditions; finding agreements
  that no plan names.
- **What shows the task is closed** — a scenario: opening a PR from a branch whose plan named a
  draft that still lies in the branch is refused and the refusal names the directory; a merged draft
  and the folder-skip bypass pass; the guard suite is green.
- **The sample** — the folder condition next to it, with the same bypass.

## Decisions

- **The rule goes to a subdomain of its own, `delivery-agreement`.** The work spec's scenario file
  has no room for another scenario, and by RT-3088 the room is measured before the edit.
- **The folder-skip bypass covers the agreement too.** Work merged in parts may merge its agreement
  by the last part.
