# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 7 — The rules with short statements
- **Done:** stage 1 — the gate delivers the rules that fit, with their companions, under the limit
  of the setting; stage 2 — the remaining refusals name their reason, a read of a rule file by the
  tool `Read` is a load, a subagent has a record of its own;  grill closed by assumption; agreement `docs/specs/agent-kit/proposed/rule-gate-delivery/`,
  SC-AK-1669…1680, its open questions closed by decisions; the card is in work.
- **Next step:** step 4.2 — the second cold part in the package, then spec-driven cut to 3 000
  bytes.
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
- [x] 2.1 A rule longer than the limit and a rule not read are refused with the reason, and a read of an over-limit rule by the tool `Read` loads it
- [x] 2.2 The record is created when missing, an unwritable record still passes, a call without a session id is refused, and a subagent is recorded apart
- [x] 2.3 A delivery is observed as a delivery
- [x] 3.1 The fact of a loaded rule counts a rule the gate would deliver as loaded, and the task guard on the same edit names no load
- [x] 3.2 The re-arming line names only the rules longer than the limit
- [x] 3.3 The package is laid out into this tree
- [x] 3.4 This session's own record holds a rule the host put into the session whole, by a hook answer of the gate
- [x] 4.1 The script of the meaning check is written, and the section tables of spec-driven, doc-style and browser-verification are in the progress
- [x] 4.2 spec-driven: the hot part is at most 3 000 characters, and nothing of the former text is lost
- [>] 4.3 spec-driven: the retelling matched the former text
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

## Section tables of the shortened rules

The outcome of every section by the form of a compressed article of `spec-driven`, and the bytes
it comes to in the hot part. The statements of «How the law applies here» stay verbatim, each as a
bare item; their arguments leave whole for the cold part, under the same section heading. The
frontmatter and the layout header weigh about 450 bytes in each rule.

| Rule | Section | Now, bytes | Outcome | In the hot part, bytes |
| --- | --- | --- | --- | --- |
| spec-driven | title, law line, cold-part line | 882 | stays; the intro paragraph leaves for the cold part | ~300 |
| spec-driven | What it is called here | 2 896 | leaves whole for the cold part | 0 |
| spec-driven | Where it lives | 255 | leaves whole for the cold part | 0 |
| spec-driven | Flow | 1 062 | leaves whole for the cold part | 0 |
| spec-driven | How the law applies here | 12 131 | 31 statements stay verbatim, arguments leave | ~2 050 |
| spec-driven | The shape of a compressed article | 2 921 | leaves whole for the cold part | 0 |
| spec-driven | What of the law is not here | 2 732 | leaves whole for the cold part | 0 |
| spec-driven | Patterns | 247 | leaves whole for the cold part | 0 |
| doc-style | title, law line, cold-part line | 939 | stays; the intro paragraph leaves for the cold part | ~300 |
| doc-style | What it is called here, Where it lives, Flow | 2 312 | leave whole for the cold part | 0 |
| doc-style | How the law applies here | 10 003 | 21 statements stay verbatim, arguments leave | ~1 470 |
| doc-style | Texts for a person | 2 816 | its 4 statements join the list above, the rest leaves | ~330 |
| doc-style | What of the law is not here | 2 403 | leaves whole for the cold part | 0 |
| doc-style | Patterns, Skills without a law | 580 | stay | ~580 |
| doc-style | the three sections of this tree | 2 200 | leave whole for the cold part | 0 |
| browser-verification | title, law line | 785 | stays, a cold-part line is added; the intro leaves | ~300 |
| browser-verification | What it is called here, Where it lives, Flow | 2 715 | leave whole for the cold part | 0 |
| browser-verification | How the law applies here | 9 910 | 23 statements stay verbatim, arguments leave | ~1 630 |
| browser-verification | What of the law is not here | 173 | leaves whole for the cold part | 0 |
| browser-verification | Patterns | 243 | stays | ~243 |
| browser-verification | Pitfalls, When this machine has no pinned profile | 7 581 | leave whole for the cold part, which the rule creates | 0 |

Totals by the table: spec-driven ~2 800, doc-style ~3 130 — over by the Texts for a person
statements, so `Skills without a law` leaves too and Patterns keeps names only — ~2 900,
browser-verification ~2 620.

### Shortened statements of spec-driven, «было → стало»

The statements alone came to 2 540 bytes, over what the 3 000 bytes leave after the frame; eleven
were shortened by meaning, and the first column of the companion was edited by the same change.
The first retelling diverged: the free scenario number from the companion's command, a deleted
scenario taking its test, the exception for a harness or published symbol, a spec rule with no
code place going to the open questions and the agreement sharing the spec prefix came back at
their articles. That brought the hot part to 3 180 bytes, and seven more statements were shortened
in the second round, to 2 999.

- «A companion's statement about the state of an external service is checked by the command the companion itself names.» → «A companion's claim about an external service is checked by the command it names.»
- «A rule description is no longer than three hundred characters and answers one question — load this rule or not.» → «A rule description is at most 300 characters and answers only: load it or not.»
- «A check nailed to a resource name breaks when the resource is split, and this has to be known before the edit.» → «Before a resource split, its name is searched across the tree's checks.»
- «The procedure table is checked against the decorators both ways, the permission together with the name.» → «The procedure table and decorators match both ways, permission with name.»
- «The set of spec sections is fixed in advance, and a missing section is a refusal.» → «Spec sections are fixed in advance; a missing one is a refusal.»
- «There are two layers of laws, and a law name is one for both.» → «A law name is unique across both law layers.»
- «A rule may have a third file, and what is not read when deciding goes there.» → «What is not read when deciding goes to the rule's third file.»
- «A law has a mandatory "Articles" section, and beyond it holds only open questions.» → «A law holds an "Articles" section and, besides it, only open questions.»
- «A spec declares the laws it applies, and the link is checked both ways.» → «A spec names the laws it applies, checked both ways.»
- «A "not carried out" binding moves together with its article.» → «A "not carried out" binding moves with its article.»
- «Every statement is bound to a place in code, and the link is checked both ways.» → «Every statement is bound to code, checked both ways.»
- «An anchor is checked against the raw text of the file, and a comment counts the same as code.» → «An anchor is checked against the raw file text, comments included.»
- «A spec has one scenario prefix, and across the whole tree it is taken by that spec alone.» → «A spec has one scenario prefix, taken by no other spec of the tree.»
- «The spec speaking of a resource is found by a command, not by walking the subdomains.» → «The spec of a resource is found by a command, not by walking the subdomains.»
- «An article without a sign is legitimate, and so is a rule without a single sign.» → «An article or a whole rule without a sign is legitimate.»
- «Portable text speaks of a neighbouring resource conditionally and names it by name.» → «Portable text names a neighbouring resource by name, and conditionally.»
- «An article of a rule speaks of its own applicability itself, by a sign line at its side.» → «An article states its own applicability by a sign line at its side.»
- «A divergence between a rule and its companion is resolved in favour of the rule.» → «Where a rule and its companion diverge, the rule wins.»

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

- **The neighbours' probes of a gate-held move use a rule longer than the limit.** The fact of a
  loaded rule now counts a deliverable rule, so a probe that wants «load the rule first» needs a
  rule the gate does not deliver: the fixture rule is padded past 10 000 characters, and the
  conformance sweep of the decision table runs every probe under `RT_GATE_CONTEXT_LIMIT=1` — the
  table speaks of a rule the session has not got. Affected stage of the plan: 3, the checks
  unchanged.
- **The cold part of a shortened rule gets a second file, by the owner's answer.** The cold part
  of spec-driven came to 28 400 characters and 401 lines against the prose limits of 24 000 and
  330. The question: «Как разместить вынесенный текст?», options «Вторая холодная часть
  (Recommended)» and «Делить правило надвое по теме»; an option that lifted the limit from the cold
  part was held by the question check as a weakening of a check. The owner answered «Вторая
  холодная часть (Recommended)». The grill stays as at the commit of the plan: the engine measures
  no step while the task folder differs from it. The package lays out a
  second cold part next to `pitfalls.md`; it is done inside step 4.2, before the first rule is
  cut, and the meaning check reads both files. Affected stage of the plan: 4.

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
