# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `задача-взята`
- **Stage:** 0 of 6 — the plan waits for the owner's approval
- **Done:** grill committed (5b535a231); plan written and rewritten by the findings of
  product-strategist and goal-critic; `plan-check` silent.
- **Next step:** on the owner's approval commit the plan and begin stage 1.
- **Uncommitted:** `plan.md`, `progress.md`, the line `**Behaviour:**` in `grill.md`.
- **PR:** not open yet

## Steps

- [>] 1.1 The answers of all probes today — decision and full text — are saved as the snapshot
- [ ] 1.2 The mutation sweep exists and shows that no hook follows the table yet
- [ ] 1.3 The dispatcher time is measured by a script of the suites
- [ ] 2.1 Every refusal row carries its full text in the field `text`, with `{name}` slots the hook fills
- [ ] 2.2 `decide.mjs` answers every row of the table as the table says, and composes «this comes first» from the rows of the named move
- [ ] 2.3 The walk, the conform mode and the chains take their rows from the decider; the stored composition rows leave the table
- [ ] 2.4 `hooks/decide.sh` gives `rt_decide`; a decider that fails or is absent lets the action through
- [ ] 3.1 `hooks/facts.sh` computes the branch, the fresh base, the window, the loaded rules and the conversation record once per call
- [ ] 3.2 No hook computes these facts past `facts.sh`
- [ ] 4.1 The hooks of the course of work decide by `rt_decide`: task-flow, task-flow-draft, flow-step, exam, window-fill, handoff-entry, docs, skill-gate, turn-exit
- [ ] 4.2 The hooks of delivery and of git decide by `rt_decide`: git-guard-* with every helper, pre-push, commit-msg; the helpers that refused become guards with rows
- [ ] 4.3 The other hooks decide by `rt_decide`; a content analysis (prose-style, qa-dataid, reuse-first, sql) gives a fact
- [ ] 4.4 No hook re-runs its neighbours: `rt_move_first` is gone
- [ ] 5.1 Every refusal row flipped to «allow» makes its hook allow
- [ ] 5.2 All probes answer as in the snapshot
- [ ] 5.3 The reverse probe: the hook of each refusal's named move is run in the state of that refusal
- [ ] 5.4 The coverage counts the git hooks and the helpers that refused among the guards
- [ ] 5.5 The dispatcher is no slower than 2300 ms on an allowed command
- [ ] 6.1 Files left with no code are removed and named in the progress; the spec names the count before and after, and «after» equals the directory
- [ ] 6.2 The specs and bindings name the decider; the spec check is green
- [ ] 6.3 The layout matches the package, the decider laid out with it
- [ ] 6.4 All package suites are green on a full run, the decider's suite among them

## Decisions along the way

- **The plan was rewritten before approval by the roles' findings.** product-strategist and
  goal-critic showed that a search for printed refusals passes a hook that still decides by itself,
  that dropping 330 composition rows would shrink the walk silently, and that the «after» count was
  not checked. Stage 1 now fixes a snapshot and a mutation sweep; the walk reads the decider's rows.
- **Five checks were rewritten after the first approval, before the plan commit stood.**
  `plan-red` found 2.3, 5.4, 6.2, 6.3 and 6.4 green before the work: they measured the tree, not
  the edit. Each now names what the work adds; the plan goes to the owner again.

## Sessions

### 16.11.2026

- Grill: four questions, the owner took the recommended option in each.
- Exploration: 83 `.sh` hooks, 31 deciding guards; 999 rows, 330 of them composition rows; 50 hook
  files hold a refusal path besides the dispatcher; a dispatcher pass over `ls` takes 2.0 s.
