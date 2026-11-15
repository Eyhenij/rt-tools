# Findings of the epic RT-3302 — the checks of the rules package stop work, part three

The findings accumulate here while the epic goes: the owner reads them at once when the epic is
over and says which of them are right. The file lies next to the plan of the epic,
`docs/plans/checks-rework-3.md`.

## RT-3329 — the task flow as an executable scenario

- **The guard of the course of work judges the marks of the progress, not the order of the work.**
  An edit of a file of a later stage passes while an earlier step is open; only a step marked done
  without the mark of the engine is refused. The role `goal-critic` read the owner's words «шёл
  исключительно по шагам» as an order on the edits themselves. **Address:** rules layer — the
  guard compares the path of an edit with the footprint of the current step, or the rule names the
  narrower reading.
- **The count of refusals in a row is one file for every copy of the tree.** `refusals-in-row` lies
  in the common directory of git, so two sessions in two worktrees add to one series, and the
  eighth refusal is written for a series no session had. **Address:** rules layer — the counter is
  kept per session.
- **The journal holds 112 lines of the eighth refusal in a row for 15.11.** Whether the client ends
  a turn by itself after eight continuations is not checked; if it does, those turns ended with
  open work, and the count of missed stops does not see them. **Address:** rules layer — the count
  of missed stops reads an end after a run of stop feedback as missed.
- **The count of missed stops had one stop in its window.** `owner-nudges.mjs --missed --last 200`
  answered `0 of 1` at the minute of the step; over 2000 calls it answered `1 of 16`. A window
  bounded by calls says little when a turn runs long. **Address:** rules layer — the window is
  bounded by the number of stops.

## Left unresolved

- **A session that wrote nothing releases the turn, and so do the silent hosting and a lost menu.**
  The role `goal-critic` judged these releases against «любые остановки должны быть исключены».
  They are the cases 2–5 and 8 of the approved plan of RT-3329; changing them needs the owner's
  word.
- **The own branch of RT-3329 stands in `words.legacyBranches`.** Its plan was approved before the
  engine existed; the branch leaves the list when the epic is merged.
