# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 4 of 6 — the hooks switched to the decider
- **Done:** stage 3 — `hooks/facts.sh` with six `rt_fact_*`; the fact search over the hooks gives
  0; the snapshot compare gives `changed 0`; the decider and the facts are bound in the spec. stage 1 — snapshot (999 probes, stable), mutation sweep (`followed 0`), dispatcher median
  1966 ms. Stage 2 — every row carries its text; `checks/decide.mjs` reproduces all 670 stored rows
  and computes the 330 composed states (`rows 1000, ok 1000`); the composed rows left the table for
  `states` (conditions, pattern, probe); walk, conform and chains read `withDecided` — `derived 3584
  decided`; `hooks/decide.sh` gives `rt_decide`, FAIL-OPEN covered.
- **Next step:** 4.2 — the hooks of delivery and of git decide by `rt_decide`. 4.1 is done: nine
  hooks of the course of work decide by the table, the mutation sweep follows 484 of 999 rows, the
  snapshot compare gives `changed 0`.
- **Uncommitted:** nothing after the stage 3 commit.
- **PR:** not open yet

## Steps

- [x] 1.1 The answers of all probes today — decision and full text — are saved as the snapshot
- [x] 1.2 The mutation sweep exists and shows that no hook follows the table yet
- [x] 1.3 The dispatcher time is measured by a script of the suites
- [x] 2.1 Every refusal row carries its full text in the field `text`, with `{name}` slots the hook fills
- [x] 2.2 `decide.mjs` answers every row of the table as the table says, and composes «this comes first» from the rows of the named move
- [x] 2.3 The walk, the conform mode and the chains take their rows from the decider; the stored composition rows leave the table
- [x] 2.4 `hooks/decide.sh` gives `rt_decide`; a decider that fails or is absent lets the action through
- [x] 3.1 `hooks/facts.sh` computes the branch, the fresh base, the window, the loaded rules and the conversation record once per call
- [x] 3.2 No hook computes these facts past `facts.sh`
- [x] 4.1 The hooks of the course of work decide by `rt_decide`: task-flow, task-flow-draft, flow-step, exam, window-fill, handoff-entry, docs, skill-gate, turn-exit
- [>] 4.2 The hooks of delivery and of git decide by `rt_decide`: git-guard-* with every helper, pre-push, commit-msg; the helpers that refused become guards with rows
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
- **The snapshot ignores the line number in a shell message.** After the fact edit two
  turn-exit-guard rows differed only in «line 98» → «line 100»: the hook leaks a shell error into
  its text, and any edit moves the number. `steadyText` now replaces `line N:`, and the compare
  reads the old snapshot through the same rule. Affected stage: 3, 5.
- **The decider and the facts got their spec bindings in stage 3, not 6.** The package suites
  count every hook file without a spec, and three new files turned them red. Two rules went into
  the decision-table spec; 6.2 still checks the binding. Affected stage: 6.
- **The mutation sweep never reached a hook before this stage.** The probe harness drops every
  `RT_` variable, `RT_DECISION_FLIP` included, so stage 1 measured «followed 0» for a reason other
  than the one written. The flip now travels as `PROBE_FLIP` and is set again after the harness.
  Affected stage: 5.
- **The action of a call is computed, not named, by hooks that judge every edit.** The rows of
  window-fill, handoff-entry, exam, skill-gate and the task-flow guards differ only by the action;
  a hook that named one action for all of them would leave the other rows flippable with no effect.
  `checks/action-of.mjs` lists every class a call fits, and the decider takes the first the hook has
  a row for; a flip of any class of the call counts, since `task_new` and `new_task` name one call in
  two areas. Two window-fill probes changed their input to tell classes apart: `work_call` now runs a
  test command, `edit_laid_out` edits a file with the layout header. Affected stage: 4, 5.
- **Facts of neighbours are computed by `facts.sh`, not by running the neighbours.** The exam, the
  window, the loaded rule of a move, the handover entry and the window numbers are functions there.
  `rule_loaded` means the rule of the move for the gate and the rule of the course of work for the
  window and the handover entry; the decider reads the second from `task_flow_loaded` when it asks
  those two as neighbours (`ALIASES`). Affected stage: 4.
- **Variable parts of texts are slots.** The branch, the tasks directory, the state, the agreement
  path, the window numbers, the docs problems and the whole skill-gate reason are `{name}` slots;
  `decide.sh` fills the branch, the tasks directory and the window numbers for any hook, since those
  texts also stand first in the refusals of neighbours. 25 states whose `says` waited for the docs
  problems verbatim also accept the slot. Affected stage: 4, 5.
- **The docs problems are a neighbour text no other hook can fill yet.** When the delivery hooks
  move to the decider, the docs analysis has to become a fact function they call; until then their
  states compose with an unfilled `{problems}`. Affected stage: 4.
- **`plan-red` did not find this session's record by itself.** It wrote the approval only with
  `RT_FLOW_TRANSCRIPT` naming the record; a finding of the epic.

## Sessions

### 16.11.2026

- Grill: four questions, the owner took the recommended option in each.
- Exploration: 83 `.sh` hooks, 31 deciding guards; 999 rows, 330 of them composition rows; 50 hook
  files hold a refusal path besides the dispatcher; a dispatcher pass over `ls` takes 2.0 s.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3355-hooks-read-table

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 4 of 6 — the hooks switched to the decider
- **Next step:** 4.2 — the hooks of delivery and of git decide by `rt_decide`. 4.1 is done: nine
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3355-hooks-read-table/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/specs/agent-kit/decision-table/implementation.md
 M docs/specs/agent-kit/decision-table/spec.md
 M docs/specs/agent-kit/exam/implementation.md
 M docs/specs/agent-kit/guards/implementation.md
 M docs/tasks/RT-3355-hooks-read-table/progress.md
 M projects/agent-kit/assets/checks/action-of.mjs
 M projects/agent-kit/assets/checks/decide.mjs
 M projects/agent-kit/assets/checks/decision-table.json
 M projects/agent-kit/assets/hooks/decide.sh
 M projects/agent-kit/assets/hooks/docs-guard.sh
 M projects/agent-kit/assets/hooks/exam-guard.sh
 M projects/agent-kit/assets/hooks/facts.sh
 M projects/agent-kit/assets/hooks/flow-step-guard.sh
 M projects/agent-kit/assets/hooks/handoff-entry-guard.sh
 M projects/agent-kit/assets/hooks/skill-gate.sh
 M projects/agent-kit/assets/hooks/task-flow-context.sh
 M projects/agent-kit/assets/hooks/task-flow-draft-guard.sh
 M projects/agent-kit/assets/hooks/task-flow-guard.sh
 M projects/agent-kit/assets/hooks/turn-exit-guard.sh
 M projects/agent-kit/assets/hooks/window-fill-guard.sh
```

### Commits over the main branch

```
0a2f9c7a8 feat(rt:agent-kit): действие вызова определяет решатель, окно и вход из передачи по таблице
3ae100acc feat(rt:agent-kit): turn-exit и flow-step берут решение из таблицы
7842394cf feat(rt:agent-kit): общие факты хуков считает facts.sh
5c4372a65 feat(rt:agent-kit): решатель по таблице решений и rt_decide для хуков
7de6f3917 feat(rt:agent-kit): строки таблицы решений несут полный текст отказа
6188b4f7d feat(rt:agent-kit): снимок ответов проб и переворот строк таблицы решений
8694fbabe docs(rt:agent-kit): план задачи RT-3355 — проверки берут решение из таблицы
5b535a231 docs(rt:agent-kit): разбор задачи RT-3355, RT-3275 отмечена влитой
023128bbe Merge remote-tracking branch 'origin/main' into RT-3302-checks-rework-3
1b8cbfaf7 [RT-3275] Таблица решений хуков пакета: отказ называет разрешённый ход (#3358)
283bd9acf fix(rt:agent-kit): проверка назначения читает номер эпика и под nx
1ee761e03 fix(rt:agent-kit): первый вызов за порогом окна пропускает правку progress
4ae7f8dfc fix(rt:agent-kit): за порогом окна отказ называет закрытие сессии
05bfbe9fe chore(rt:agent-kit): хуки и таблица решений разложены из пакета
6fe42a388 fix(rt:agent-kit): отказ называет ход, разрешённый и в соседних областях
611c8675f docs(rt:agent-kit): папка задачи RT-3275 разобрана в запись архива
a7d989a2d fix(rt:agent-kit): все наборы пакета зелёные, шаги задачи RT-3275 измерены
3402681a4 feat(rt:agent-kit): отказы хода работы называют разрешённый ход, цепочки таблицы записаны сценариями
afe372403 docs(rt:agent-kit): шаг 2.2 задачи RT-3275 измерен
8c636dc4c docs(rt:agent-kit): задача RT-3275 снова идёт
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
