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
