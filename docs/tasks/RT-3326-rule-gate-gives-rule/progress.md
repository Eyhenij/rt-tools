# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 7 — The rules with short statements
- **Done:** stage 1 — the gate delivers the rules that fit, with their companions, under the limit
  of the setting; stage 2 — the remaining refusals name their reason, a read of a rule file by the
  tool `Read` is a load, a subagent has a record of its own;  grill closed by assumption; agreement `docs/specs/agent-kit/proposed/rule-gate-delivery/`,
  SC-AK-1669…1680, its open questions closed by decisions; the card is in work.
  spec-driven is cut to 2 997 bytes with a second cold part, and its third retelling matched.
  doc-style is cut to 2 994 bytes, its tree sections included.
- **Next step:** step 4.5 — the retelling of doc-style.
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
- [x] 4.3 spec-driven: the retelling matched the former text
- [x] 4.4 doc-style: the hot part is at most 3 000 characters, and nothing of the former text is lost
- [>] 4.5 doc-style: the retelling matched the former text
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
in the second round, to 2 999. The second retelling diverged on three points: the shape of a
compressed article stood only in the cold part, the divergence article lost «named to the owner»,
the description article lost the debt list. All three came back at their articles, the shape as a
statement of its own; eighteen more statements were shortened, to 2 991. The third reader named
two gaps the former text closed — fixing the lagging text, and measuring room before an article is
added — and both came back as tails; two more statements were shortened, to 3 000. The third round matched; its
critic named two soft losses — room is measured in lines and bytes, and the boundary includes the
exception and the sign — and both came back too, with seven more statements shortened, to 2 997. Each pair below reads
from the former text to the final one.

- «A companion's statement about the state of an external service is checked by the command the companion itself names.» → «A companion checks an outside service by its named command.»
- «A rule description is no longer than three hundred characters and answers one question — load this rule or not.» → «A rule description: at most 300 characters, answering only: load it or not.»
- «A check nailed to a resource name breaks when the resource is split, and this has to be known before the edit.» → «Before a split, a resource's name is searched in the tree's checks.»
- «The procedure table is checked against the decorators both ways, the permission together with the name.» → «Procedure table and decorators match both ways, with permissions.»
- «An anchor is checked against the raw text of the file, and a comment counts the same as code.» → «An anchor matches the raw file, comments included.»
- «A spec has one scenario prefix, and across the whole tree it is taken by that spec alone.» → «A spec has one scenario prefix, taken by no other spec.»
- «The spec speaking of a resource is found by a command, not by walking the subdomains.» → «A resource's spec is found by command, not by walking subdomains.»
- «An article without a sign is legitimate, and so is a rule without a single sign.» → «An unsigned article or rule is legitimate.»
- «Portable text speaks of a neighbouring resource conditionally and names it by name.» → «Portable text names a neighbour by name, conditionally.»
- «An article of a rule speaks of its own applicability itself, by a sign line at its side.» → «An article marks its own applicability by a sign line.»
- «A divergence between a rule and its companion is resolved in favour of the rule.» → «Where a rule and its companion diverge, the rule wins.»
- «The set of spec sections is fixed in advance, and a missing section is a refusal.» → «Spec sections are fixed; a missing one is a refusal.»
- «There are two layers of laws, and a law name is one for both.» → «A law name is unique across both layers.»
- «A rule may have a third file, and what is not read when deciding goes there.» → «What is not read when deciding goes to the cold part.»
- «A law has a mandatory "Articles" section, and beyond it holds only open questions.» → «A law holds "Articles" and only open questions.»
- «A spec declares the laws it applies, and the link is checked both ways.» → «A spec names the laws it applies, checked both ways.»
- «A "not carried out" binding moves together with its article.» → «A "not carried out" binding moves with its article.»
- «Every statement is bound to a place in code, and the link is checked both ways.» → «Every statement is bound to code, checked both ways.»
- «A pattern is found by the `rule:` field, not by the name prefix.» → «A pattern is found by its `rule:` field, not its name prefix.»
- «The first column of the companion is the article text copied, not retold.» → «A companion's first column copies the article text verbatim.»
- «A binding does not lead into code nobody calls, and a test is not a call.» → «A binding never leads into uncalled code; a test is not a call.»
- «A verdict is put by substance, not by the form of the address.» → «A verdict follows substance, not the address form.»
- «A refusal code is accepted only if the domain throws it.» → «A refusal code counts only if the domain throws it.»
- «A scenario and the title of its test are edited by one change.» → «A scenario and its test title change together.»
- «A rule declares the law it is written under.» → «A rule declares its law.»
- «A decision from a spec goes to the layer, not to the archive.» → «A spec's decision goes to the layer, not the archive.»
- «A name in an anchor is written as declared in code.» → «An anchor name is written as declared in code.»

### Shortened statements of doc-style, «было → стало»

doc-style was 21 253 bytes laid out, the tree's sections included; it is 2 994 now. Its sections
and every article whole went to `pitfalls/doc-style.2.md`; the tree's own sections went whole to
the override of that cold part, and the hot part keeps three short statements of them under «This
tree». The applicability signs stay with the articles in the cold part: a rule that fits the host
limit arrives whole, and the gate reads the signs only for a rule that does not. The description
was cut to the question «load it or not». Seventeen statements were shortened by meaning, and the
first column of the companion was edited by the same change.

The first retelling diverged on one case of four: the list of layer words a text for the owner
replaces, and the value a command about a machine is compared with, had left the hot part. Both
came back, and so did what the critic named untested: drafts are spared only when gitignored, a
spec splits and the limit stays, a new word joins the glossary in the same change, a number is
recomputed and a check is run, not retold. Two more statements were shortened, to 2 999. Each pair
below reads from the former text to the final one.

- «A bare name and a directory are judged the same as a full path.» → «A bare name or directory is judged as a full path.»
- «The description of the past is excluded from the path check entirely.» → «The archive and the task folder are outside the path check.»
- «Portable text is excluded from the address check, like the archive.» → «Portable text is outside the address check too.»
- «A directory index is checked against its contents from both sides.» → «A directory index and its contents match both ways.»
- «An index is kept for a directory people read through it, not by walking it.» → «An index is kept only for a directory read through it.»
- «A name mentioned only to say "it is gone" is listed in the exceptions by name.» → «A name kept only as gone is in the exceptions.»
- «A file placed by the layout needs no pair.» → «A laid-out file needs no pair.»
- «A document goes in the same commit as the change it describes.» → «A document ships in its change's commit.»
- «A file of the tree is edited by the edit tool, not by a shell command.» → «A tree file is edited by the edit tool, not shell.»
- «A file leaving for the description of the past names its former address in its header.» → «A file moving to the archive names its former address in its header.»
- «An override section replaces the package section of the same name entirely; it does not append to it.» → «An override section replaces the same-named package section whole.»
- «The working glossary and the screen language are two different vocabularies.» → «The working glossary is not the screen language.»
- «A text naming the state of a machine goes stale without a single edit in the tree.» → «Machine state is written as a command and the answer to compare.»
- «A record in the description of the past has an expiry, and after it the record is removed.» → «An archive record has an expiry, then is removed.»
- «The removal by expiry travels as a commit of its own.» → «Expired records leave in their own commit.»
- «A link to a record of the past in a live text lives exactly until the record's expiry.» → «A live text names a decision in words, not an archive address.»
- «A diagram is edited by the same change as the text it depicts.» → «A diagram changes with the text it depicts.»
- «The glossary is edited where it is assembled, not where it is read.» → «The glossary is edited where assembled, not where read.»
- «An index entry is named by its file name in backticks.» → «An index entry is its file name in backticks.»

### Shortened statements of browser-verification, «было → стало»

browser-verification was 21 407 bytes laid out and had no cold part; it is 2 996 now. Its sections,
its pitfalls and every article whole went to its first cold part, `pitfalls/browser-verification.md`;
the tree's section went whole to the override of that cold part, and the hot part keeps two short
statements of it under «This tree». Twenty-one statements were shortened by meaning, and the first
column of the companion was edited by the same change.

- «A second instance of an application that is already up is not raised.» → «A running application is not raised a second time.»
- «A browser raised by a library from inside a script is the same as launching the binary.» → «A browser a script raises counts as launching the binary.»
- «The browser choice goes stale and needs a repeated call.» → «The browser choice goes stale; the call is repeated.»
- «A refused profile choice ends the work with the browser; it does not start a search for a workaround.» → «A refused profile choice stops browser work.»
- «The profile is not picked from the list and not asked from the owner.» → «A profile is neither picked from the list nor asked of the owner.»
- «An unconfigured guard is a reason to stop, not a permission to go on.» → «An unconfigured guard is a stop, not a permission.»
- «A screen behind sign-in is checked on a stand, not with a live account.» → «A screen behind sign-in is checked on a stand, not a live account.»
- «A move of people into a sign-in system is checked by signing in as a moved person.» → «A move into a sign-in system is checked by signing in as a moved person.»
- «Changing the number of elements in a container is a layout edit.» → «A container's element count change is a layout edit.»
- «A measurement is taken on the longest value, not on the sample one.» → «A measurement takes the longest value, not the sample.»
- «The longest value is set for every node that shares the line, not only for the edited one.» → «The longest value is set for every node sharing the line.»
- «A ready-made kit piece taken for values of another size is measured, not looked at.» → «A kit piece reused for values of another size is measured, not looked at.»
- «The stand proxy supplies what the application recognises the request's tenant by.» → «The stand proxy supplies the request's tenant sign.»
- «What is shown to a person is built from the work under discussion.» → «What a person is shown is built from the work's branch.»
- «An edit of a shared frame is checked on every screen under it.» → «A shared frame's edit is checked on every screen under it.»
- «The work branch keeps the tip of its base merged in the whole time, not only before delivery.» → «The work branch keeps its base tip merged in all the time.»
- «The first visit to a public screen is marked with the service-visit sign.» → «A public screen's first visit carries the service-visit sign.»
- «A screen whose data never exists in the development database is measured with the component's real styles.» → «A screen whose data the dev database lacks is measured with the component's real styles.»
- «A measurement that will have to be repeated is taken by an end-to-end test, not by the driver.» → «A measurement to repeat is an end-to-end test, not the driver.»
- «A measurement is taken before the work is shown to the owner, not after their remark.» → «Measure before showing the owner, not after their remark.»
- «Work that carries a look over from a sample is accepted by a frame of one's own screen next to the sample's frame.» → «Work carrying a sample's look is accepted by its own screen's frame beside the sample's.»

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
- **Stage:** 4 of 7 — The rules with short statements
- **Next step:** step 4.2 — the second cold part in the package, then spec-driven cut to 3 000
- **PR:** not open yet. The branch stands on RT-3283 (PR #3371).

The progress in full — `docs/tasks/RT-3326-rule-gate-gives-rule/progress.md`; the plan lies next to it.

### Uncommitted

```
 M .claude/skills/spec-driven/SKILL.md
 M .claude/skills/spec-driven/implementation.md
 M projects/agent-kit/assets/rules/spec-driven.md
```

### Commits over the main branch

```
4dfd735a2 feat(rt:agent-kit): вторая холодная часть правила и spec-driven в 3000 байт
2819e0682 feat(rt:agent-kit): отказ шлюза называет причину, соседи не зовут загрузку доставляемого
004f918ec feat(rt:agent-kit): шлюз правил кладёт правило в заход вместо отказа
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
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
