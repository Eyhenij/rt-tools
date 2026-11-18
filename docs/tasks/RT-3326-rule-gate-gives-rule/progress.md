# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 7 — The remaining refusals and the record
- **Done:** stage 1 — the gate delivers the rules that fit, with their companions, under the limit
  of the setting;  grill closed by assumption; agreement `docs/specs/agent-kit/proposed/rule-gate-delivery/`,
  SC-AK-1669…1680, its open questions closed by decisions; the card is in work.
- **Next step:** step 2.1 — the refusals for a rule over the limit and a rule not read.
- **Plan approved:** «Одобряю plan.md RT-3326». After the word, the checks of stages 4–6 were
  tightened by `goal-critic` before the commit: the meaning script, the verdict by a role, the
  section tables, `&&` in place of `;`. The stages, the rules and the number stayed as approved.
  `plan-red` then found four checks green before the work (3.3 and the three retelling checks of
  stage 5); they were made red in the same unpushed commit, and the approval mark was written.
- **Uncommitted:** nothing.
- **PR:** not open yet. The branch stands on RT-3283 (PR #3371).

## Steps

- [x] 1.1 The gate passes a call whose rule fits the limit, puts the rule with its opening line into the hook answer and records the rule as loaded
- [x] 1.2 The companion arrives with the rule when it fits, falls back to its path, and the limit is read from the setting
- [x] 1.3 Every call kind gets the delivery, a call needing two rules passes with both, and rules that do not fit together are refused together
- [>] 2.1 A rule longer than the limit and a rule not read are refused with the reason, and a read of an over-limit rule by the tool `Read` loads it
- [ ] 2.2 The record is created when missing, an unwritable record still passes, a call without a session id is refused, and a subagent is recorded apart
- [ ] 2.3 A delivery is observed as a delivery
- [ ] 3.1 The fact of a loaded rule counts a rule the gate would deliver as loaded, and the task guard on the same edit names no load
- [ ] 3.2 The re-arming line names only the rules longer than the limit
- [ ] 3.3 The package is laid out into this tree
- [ ] 3.4 This session's own record holds a rule the host put into the session whole, by a hook answer of the gate
- [ ] 4.1 The script of the meaning check is written, and the section tables of spec-driven, doc-style and browser-verification are in the progress
- [ ] 4.2 spec-driven: the hot part is at most 3 000 characters, and nothing of the former text is lost
- [ ] 4.3 spec-driven: the retelling matched the former text
- [ ] 4.4 doc-style: the hot part is at most 3 000 characters, and nothing of the former text is lost
- [ ] 4.5 doc-style: the retelling matched the former text
- [ ] 4.6 browser-verification: the hot part is at most 3 000 characters, and nothing of the former text is lost
- [ ] 4.7 browser-verification: the retelling matched the former text
- [ ] 5.1 The section tables of task-flow, git-workflow and ui-component-tests are in the progress, with the pairs of shortened statements
- [ ] 5.2 task-flow: every part is at most 3 000 characters, and nothing of the former text is lost
- [ ] 5.3 task-flow: the retelling of every part matched the former text
- [ ] 5.4 git-workflow: every part is at most 3 000 characters, and nothing of the former text is lost
- [ ] 5.5 git-workflow: the retelling of every part matched the former text
- [ ] 5.6 ui-component-tests: every part is at most 3 000 characters, and nothing of the former text is lost
- [ ] 5.7 ui-component-tests: the retelling of every part matched the former text
- [ ] 6.1 agent-kit-extend: the hot part is at most 3 000 characters, and nothing of the former text is lost
- [ ] 6.2 agent-kit-extend: the retelling matched the former text
- [ ] 7.1 The agreement merges into the package spec as the subdomain `rule-gate-delivery` with its bindings
- [ ] 7.2 The README of the package says the gate puts the rule into the session

## Decisions along the way

- **The branch stands on RT-3283, not on the epic branch.** PRs of the epic go as a cascade, each
  from the previous one. Affected stage of the plan: none.
- **The task had a number before the grill, so there was no task creation.** The card #3326 was
  filed earlier by the owner's word «Задача в RT-3302»; the folder took its name from the branch.
  Affected stage of the plan: none.
- **The delivery answer carries no `permissionDecision`.** The agreement named `allow`; but `allow`
  also skips the host's own question before a call that a tree's settings ask for. The answer now
  holds only the context field, the same form a neighbouring guard already prints; SC-AK-1669 and
  a rule of the agreement were edited. Affected stage of the plan: 1, the checks unchanged.
- **The refusal texts of the gate are tested under `RT_GATE_CONTEXT_LIMIT=1`.** A refusal now
  remains only for a rule over the limit; the old probes of its text run under a limit nothing
  fits. Affected stage of the plan: none.

## Sessions

### 18.11.2026

- Grill written; the host limit for a hook's context field measured by its reference: 10 000
  characters.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3326-rule-gate-gives-rule

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 of 7 — The delivery
- **Next step:** step 1.1 — the gate delivers a rule that fits.
- **PR:** not open yet. The branch stands on RT-3283 (PR #3371).

The progress in full — `docs/tasks/RT-3326-rule-gate-gives-rule/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/tasks/RT-3326-rule-gate-gives-rule/progress.md
```

### Commits over the main branch

```
0e7750a2a docs(rt:agent-kit): ход работы RT-3326 — план одобрен, этап доставки начат
a56f2a991 docs(rt:agent-kit): план шлюза, который даёт правило, и сокращения семи правил
08ff109c5 docs(rt:agent-kit): договорённость о шлюзе правил поправлена по критику
42649274a docs(rt:agent-kit): находки разбора правил по пользе проверок набора
f67170bcb docs(rt:agent-kit): разбор и договорённость о шлюзе правил, который даёт правило
63bfaa68b chore(rt:agent-kit): таблица чтений набора записана заново
a68987b50 docs(rt:agent-kit): папка задачи о пользе проверок набора разобрана в архив
0fcb26e72 Merge remote-tracking branch 'origin/RT-3302-checks-rework-3' into RT-3283-push-set-uselessness
253fd7042 docs(rt:agent-kit): спек пользы проверок набора вошёл в пакет поддоменом
cd2698050 docs(rt:agent-kit): этап отчёта о пользе проверок набора закрыт
23f1816a4 feat(rt:agent-kit): отчёт метрик считает пользу каждой проверки набора
8350b61f6 feat(rt:agent-kit): оба исполнителя набора пишут строку запуска из семи полей
d1bdf0cef feat(rt:agent-kit): строка запуска шага набора несёт время, базу и предмет
c0fb0c756 feat(rt:agent-kit): профиль дерева называет предмет сценариев хуков пакета
67b394559 feat(rt:agent-kit): выбор шагов набора говорит, тронут ли предмет шага
3ef88cbe9 docs(rt:agent-kit): метрики результата работы влиты, польза проверок набора идёт
6f931486f [RT-3270] Метрики показывают результат работы: выпуск, простой, отказы на сто вызовов (#3369)
79ed3e5ac docs(rt:agent-kit): план задачи о пользе проверок набора
18cd991a3 docs(rt:agent-kit): договорённость о пользе проверок набора поправлена по ролям
6e7a85b85 docs(rt:agent-kit): договорённость о пользе проверок набора
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
