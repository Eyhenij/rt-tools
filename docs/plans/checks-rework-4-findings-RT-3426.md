# Findings of RT-3426 — the epic branch that holds the copy of a task stays the base

What the reviews of RT-3426 found outside its approved plan. Each finding waits for the owner's
decision: a task of its own or none.

## Outside the plan

- **An epic moved past the head only by a merge of a session is no candidate.** A session that
  syncs the epic with the remote one — «Merge remote-tracking branch 'origin/<epic>' into <epic>» —
  moves it past a task's head by its own merge, and the line «a shift not by the host» drops it:
  the task is counted against the main branch until it takes the epic in. The epic RT-3302 holds
  three such merges: 258ce324b, 6e4a5ef90 and ed8e3cb76. A replay of a head one commit above the
  copy of RT-3401 against ed8e3cb76 gives the main branch, 311 commits in the count instead of 1.
  Whether pushes hit this window is not checked. **Address:** package — the line of a shift not
  by the host in `rt_push_base` of `projects/agent-kit/assets/hooks/git-guard-push-marks.sh`
  counts a host merge behind a merge of the session as a shift by the host; a case in
  SC-AK-1340. **Metric:** pushes of a task of an epic counted against the main branch, down.
- **The removal of the old copy from the server is judged against the main branch.** The card
  #3426 names it as the second half of the incident of 19.11 and asks nothing about it. No
  scenario sends a removal through the push check. **Address:** package — a scenario of a push
  that removes a branch in `docs/specs/agent-kit/push-gate-ahead/scenarios.md` and its run in the
  suite of the base. **Metric:** refusals of a removal of a merged branch, down.

## Rules review by `skill-curator`

The proposals of RT-3465 in `docs/plans/checks-rework-4-findings-RT-3465.md` are not applied yet;
RT-3426 is a second case for its proposal of a fresh reading after round two and for its proposal
about the package suites. The new ones:

- **A step check is red before the work, and the plan is read from the commit that added it.**
  Step 1.5 of RT-3426 counted the former cases and was green before the work; `plan-red` refused
  it, and a later commit that corrected the plan was not seen: the engine reads plan.md from the
  oldest commit of the branch that added it. Two unpushed commits were squashed. **Address:**
  package — two paragraphs in the sample `projects/agent-kit/assets/samples/tasks/_template/plan.md`:
  a check of what stays true goes to «Verified by»; a plan corrected before the push is corrected
  by rewriting its commit. **Metric:** refusals «a check is green before the work» per plan, down.
- **The state guard reads a code path anywhere in a shell command that writes.** A commit message
  written by a heredoc into the scratchpad in the same call as `git commit` was refused as a code
  edit in the state that follows the written plan. **Address:** tree — a line in
  `.claude/skills/task-delivery-loop/GUARDS.md`; package — the refusal names the path it judged
  (`facts-flow.sh`, the `?edit_code` rows of the decision table). **Metric:** state refusals of
  shell calls that write outside the tree, down.
- **The mandatory action of the state after the written plan contradicts its refusal.** The
  refusal says «do the first stage» while it refuses the first edit: the state is left only by a
  committed progress that mirrors the plan's steps. **Address:** package — «commit the progress
  with the plan's steps, then do the first stage» in the five places the state table lives
  (`task-flow/flow.js` needs the owner's word). **Metric:** state refusals in that state, down.
- **A suite near the code limit takes new cases in a part it sources.** The suite of the base
  reached 491 of 500 lines, and fourteen cases moved into `git-guard-push-base-copy-lib.sh` after
  they were written. **Address:** tree — a pitfall in `agent-kit-source`. **Metric:** suite moves
  forced by the size check, down.
