# Fewer touches of the owner: the findings about the rules layer

They accumulate along the epic RT-3693 (`docs/plans/owner-touches.md`) and are read at once when the
epic is over. The owner says what of this is right; what they name is made into an edit or a proposal
outward. Each finding names its address: **the rules layer** — true for any tree, **the names of the
tree** — true only here.

## RT-3695 — the measurement and the proposal

- **Branch protection is changed after the workflows that push to that branch are read.** On 26.11 the
  ruleset of the main branch lost its bypass without a look at the release workflow, which pushes the
  version straight into main; the release stopped. _The address: the rules layer —
  `git-workflow-hosting`, and a gate entry for an edit of branch protection._
- **A breakage the tree made is its own, even when another session shows it.** A neighbour session
  showed the stopped release as someone else's change. _The address: the rules layer —
  `task-flow-owner`._
- **The identity hook refuses a PR opened by a foreign token.** PR #3704 opened under the owner's
  account; nothing refused it. _The address: the rules layer — the delivery guard on `gh pr create`._
- **The progress with one `[>]` goes into the commit of the plan.** The engine's exit
  `progress.mirrors` asked for it after the plan was already committed. _The address: the rules
  layer — `task-flow-plan`._

## RT-3696 — the command of the measurement

- **The plan is committed once: after the last reading of the roles, before the window of the
  approval.** The step engine and the approval mark read the commit that added it; six later commits of
  the plan reached neither, and the steps they added could not be marked. Nothing warns between the
  second commit of a plan and the push set. _The address: the names of the tree —
  `task-delivery-loop`, «Duties of the steps»; mechanically — the engine's approval or the step guard
  on a write to a committed plan._
- **«Цена» and «Отменено» go into the progress before the push set starts.** `task:archive` refuses
  without them, and a set started without them was stopped and run again. _The address: the names of
  the tree — `task-delivery-loop-run`, section «9, 11–12»._
- **A duty only the handover names goes into the progress before the first move.** The word «Сливай
  задачи RT-3693 сам» was to be written into the epic plan by the first commit of RT-3696; it waited
  in the handover and moved to RT-3701. _The address: the rules layer — `task-flow-resume`, «Entry
  from a session handover»._
- **The host's merge button signs the merge by the merging account's private email.** The merge of
  PR #3708 into the epic branch carried `rt.tools.bot@gmail.com`; the epic branch was rewritten by the
  owner's word. RT-3701 names the form `gh pr merge --author-email`. _The address: the rules layer —
  `git-workflow-hosting`._
