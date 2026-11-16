# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 6 of 6 — the files left with no code, the specs and the layout
- **Done:** stage 5 — the mutation sweep gives `rows 1003, followed 1003`; the snapshot `rows 999,
  changed 0`; the reverse probe `moves 1467, refused 0`; the coverage counts 33 git hooks and
  helpers; the dispatcher takes 1532 ms. Stages 1–4 are committed: every hook of the package
  decides by `rt_decide`, the facts are computed by `facts.sh`, `facts-docs.sh`, `facts-flow.sh`.
- **Next step:** 6.1 — the files left with no code are removed and named; the spec line «hook
  files: 83 before, N after».
- **Uncommitted:** none after the stage 5 commit.
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
- [x] 4.2 The hooks of delivery and of git decide by `rt_decide`: git-guard-* with every helper, pre-push, commit-msg; the helpers that refused become guards with rows
- [x] 4.3 The other hooks decide by `rt_decide`; a content analysis (prose-style, qa-dataid, reuse-first, sql) gives a fact
- [x] 4.4 No hook re-runs its neighbours: `rt_move_first` is gone
- [x] 5.1 Every refusal row flipped to «allow» makes its hook allow
- [x] 5.2 All probes answer as in the snapshot
- [x] 5.3 The reverse probe: the hook of each refusal's named move is run in the state of that refusal
- [x] 5.4 The coverage counts the git hooks and the helpers that refused among the guards
- [x] 5.5 The dispatcher is no slower than 2300 ms on an allowed command
- [>] 6.1 Files left with no code are removed and named in the progress; the spec names the count before and after, and «after» equals the directory
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
- **A miss of delivery is a fact or a class of the call.** The rows of delivery name a miss of the
  state as a fact (`task_on_board=no`) and a miss of the call itself as the action
  (`pr_create_bad_title`). The hook records the first by `unmet <fact> <value>`, the second by
  `unmet_class <action>`; a fact it did not find wrong keeps its lawful value from one list in the
  hook. The words of the misses go in the slot `{faults}`. Affected stage: 4, 5.
- **The analysis of the document pair is a fact function.** It moved from the document guard to
  `rt_fact_doc_problems` in `hooks/facts-docs.sh`; the delivery hooks and `no-verify` call it for
  the commit their refusal names, and the decider composes the document guard's word first. The
  re-run of neighbours left the signature helper. Affected stage: 4.
- **The word of a neighbour goes where the hook marks `{first}`.** A refusal of delivery names
  several misses, and the word of a neighbour belongs after the miss whose move it is. 36 probes
  with two misses changed until the decider placed it by the mark and the composed rows were
  recomposed by the decider itself. Affected stage: 4, 5.
- **A row with slots names its own move.** Many rows of delivery share one text, so the decider
  takes the move of a row with no word of a neighbour from the row itself, and of a composed row from
  the row of the same state without the facts of the neighbours. Affected stage: 4.
- **The hooks of git refuse with code 2.** `rt_decide` with the event `git` prints the words on the
  error stream and returns 2: git reads any code but zero as a refusal, and the probe reads 2. The
  push run ahead refuses the same way. pre-push and commit-msg are guards with rows; the run ahead
  is a helper: its exit code is the count of red checks.
- **A guard of the agent that refused by code 2 keeps that form.** `rt_decide` with the event
  `stderr` prints the words on the error stream and returns 2, the same as for git.
- **A content analysis is a fact or a slot.** The sql hook names the class of the request and its
  target; reuse-first, qa-dataid and prose-style hand what they found to a slot of the row.
- **The facts of the course of work for one edit are computed once.** `hooks/facts-flow.sh` gives
  them to the two work-conduct guards and to the guards that name an edit of another file; those
  ask them of the named file in a subshell instead of running the neighbours. `rt_fact_move` in
  `hooks/facts.sh` gives the exam, the window, the gate and the handover entry for a named move.
- **The decider call writes the record of the decision.** `guard-deny` for a refusal and
  `guard-ask` for a question: before, a question passed through the tail and was counted as a
  refusal. SC-AK-811 is rewritten to the decider call.
- **The closing of the conversation passes without jq.** The decider cannot be asked without jq
  and node, and a broken decider lets the action through; SC-AK-1121 is rewritten to that.
- **The field `fault` of the send mark is renamed `failure`.** It matched the search of step 4.3
  while it is no refusal; a mark of the former version is read by the old names.
- **The assignment reader names the kind of its answer.** `tree-assignment.mjs --unmet` prints the
  kind (`ok`, `unnamed`, `no_row`, `dash`, `foreign`) with the text: the kind is the fact
  `copy_assignment`. `--fault` stays for the hooks of 4.3.
- **A push command the guard cannot read had no row.** `push_opaque` is added with its probe: the
  table allowed such a push, while the hook refused it.
- **The plain action of a call is named to the decider, not asked by a second call.** The delivery
  guard asked the plain action again when the class of the call had no row; a class row flipped to
  «allow» was then refused by the plain one, and the sweep gave `followed 725`. `rt_decide` takes
  `<class>><action>`: the plain action decides only when no row of the class fits the facts.
  Affected stage: 5.
- **The reverse probe asks the decider, not the hooks.** The sweep proves row by row that every
  hook follows the table, so the hook's answer is the decider's: 1467 pairs of a refusal and a hook
  that judges its move cost no probe each. Affected stage: 5.
- **The stop guard measures `эпик-заведён` while the suites load the machine.** Three times in this
  session; a measure right after gives `этап-идёт`. A finding of the epic.

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
- **Next step:** 5.1 — the full mutation sweep. 4.3 and 4.4 are measured: every hook of the
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3355-hooks-read-table/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/specs/agent-kit/decision-table/implementation.md
 M projects/agent-kit/assets/checks/decide.mjs
 M projects/agent-kit/assets/checks/decision-table.mjs
 M projects/agent-kit/assets/hooks/decide.sh
 M projects/agent-kit/assets/hooks/git-guard-delivery.sh
```

### Commits over the main branch

```
6f22f4a87 feat(rt:agent-kit): все хуки решают по таблице, соседей никто не перезапускает
404eda370 feat(rt:agent-kit): хуки отправки и git решают по таблице
74d7cc5bd feat(rt:agent-kit): хуки хода работы решают по таблице
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
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
