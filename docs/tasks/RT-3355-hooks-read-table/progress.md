# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 3 of 6 — the shared facts
- **Done:** stage 1 — snapshot (999 probes, stable), mutation sweep (`followed 0`), dispatcher median
  1966 ms. Stage 2 — every row carries its text; `checks/decide.mjs` reproduces all 670 stored rows
  and computes the 330 composed states (`rows 1000, ok 1000`); the composed rows left the table for
  `states` (conditions, pattern, probe); walk, conform and chains read `withDecided` — `derived 3584
  decided`; `hooks/decide.sh` gives `rt_decide`, FAIL-OPEN covered.
- **Next step:** 3.1 — `hooks/facts.sh` with `rt_fact_*` for the branch, the fresh base, the
  window, the loaded rules and the conversation record.
- **Uncommitted:** nothing after the stage 2 commit.
- **PR:** not open yet

## Steps

- [x] 1.1 The answers of all probes today — decision and full text — are saved as the snapshot
- [x] 1.2 The mutation sweep exists and shows that no hook follows the table yet
- [x] 1.3 The dispatcher time is measured by a script of the suites
- [x] 2.1 Every refusal row carries its full text in the field `text`, with `{name}` slots the hook fills
- [x] 2.2 `decide.mjs` answers every row of the table as the table says, and composes «this comes first» from the rows of the named move
- [x] 2.3 The walk, the conform mode and the chains take their rows from the decider; the stored composition rows leave the table
- [x] 2.4 `hooks/decide.sh` gives `rt_decide`; a decider that fails or is absent lets the action through
- [>] 3.1 `hooks/facts.sh` computes the branch, the fresh base, the window, the loaded rules and the conversation record once per call
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
- **The snapshot keeps texts steady.** The first compare found 44 rows changed between two runs of
  the same hooks: fixture commit hashes and random ports. `steadyText` replaces paths, hashes and
  ports; two runs then match. Affected stage: 1.
- **The texts of the rows come from the snapshot; slots come with each hook in stage 4.** Of 118
  distinct `says` only 67 are found literally in the hook sources: the rest are built from
  variables. So 2.1 stores the text each probe printed today, the common tail cut (`tail: true`
  marks where it stood); the fixture values in it (`'scratch'`, «other», the rule name) become
  `{name}` slots when the hook moves to the decider. Affected stage: 2, 4.
- **How a hook builds its text decides how the decider composes it** (measured by a prototype in
  the scratchpad, `proto2.mjs`): the neighbour's refusal goes before the closing «The rule is X.»;
  the base row of a composed state is the row whose conditions differ only in a fact a neighbour
  owns (`window_over_stop`, `exam`, `doc_pair`); the delivery guard joins every unmet fault into
  one text, so its rows are faults and its text is their sum. The prototype reproduces 584 of 669
  base rows and 67 of 330 composed ones; the rest are per-hook shapes to model in 2.2. Affected
  stage: 2.
- **The composed rows became states, not deleted outright.** product-strategist warned that
  dropping 330 rows takes their probes with them. A state keeps the conditions, the `says` pattern
  and the probe; the decider computes its decision, move and text. Before the move the computed
  rows were compared with the stored ones: 999 of 999 the same. Affected stage: 2, 5.
- **Two constants of the prototype became table data.** `asks` on nine hook entries names the
  action a composing hook asks its neighbours; an exam-guard row «edit_progress, window over the
  stop threshold → allow» replaces the hard-coded pass, with a probe of its own (conform: 0
  mismatches). Affected stage: 2.
- **The suites of the decider carry no scenario number yet.** The scenarios of the decider are
  written with the spec in stage 6; a test naming a scenario that does not exist turns the spec
  check red. Affected stage: 6.
- **`plan-red` did not find this session's record by itself.** It wrote the approval only with
  `RT_FLOW_TRANSCRIPT` naming the record; a finding of the epic.

## Sessions

### 16.11.2026

- Grill: four questions, the owner took the recommended option in each.
- Exploration: 83 `.sh` hooks, 31 deciding guards; 999 rows, 330 of them composition rows; 50 hook
  files hold a refusal path besides the dispatcher; a dispatcher pass over `ls` takes 2.0 s.
