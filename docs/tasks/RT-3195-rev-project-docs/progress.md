# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — Fixes
- **Done:** package texts and both companions edited by the findings, the tree laid out, the
  spec audit, the size, path and glossary checks are green
- **Next step:** run the push gate in the background, then take the folder apart into the archive
- **Metric:** held by memory 13 → 14 (doc-style 8 of 21, spec-driven 6 of 31): the edit-tool
  article lost a false binding; pairs of repeats 17 → 16
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Run the role rules-reviewer over the whole family
- [x] 1.2 Compare rule articles with the companion bindings and hook code
- [x] 1.3 Write the findings list into the progress with a decision for each
- [x] 2.1 Edit the package texts by the findings
- [x] 2.2 Build the package and lay out the tree
- [x] 2.3 File tasks for findings that need code or another law
- [x] 3.1 Rebuild the rules graph and its report
- [>] 3.2 Run the push gate
- [ ] 3.3 Take the task folder apart into the archive

## Findings

Role rules-reviewer, 12.11.2026 — decision: fix here, unless named.

- **D1** spec-driven:51 names Russian headings for a law and a rule.
- **D2** spec-driven-domain teaches spec headings and markers in Russian only; the check names the
  English ones first.
- **D3** spec-driven-rule lists the Russian binding verdicts; the audit prints the English ones.
- **D4** «Pitfalls» is both a hot section and the cold file; spec-driven carries a hot copy.
- **D5** a statement with no place in code: flow → open questions, pattern → «Pitfalls», prose →
  a verdict line.
- **D6** an open question: «no date» vs «carries its creation date»; one letter vs two.
- **D7** the agreement merges «after the rollout» vs «before the PR opens».
- **D8** the task folder «dies with the merge» vs «taken apart before the PR».
- **D9** archive expiry vs «untaken task checked against the archive» — task-flow names history.
- **D10** doc-style states a future cure (check moved to main's pipeline) as fact — removed.
- **D11** doc-style-trace selects merges into main; tasks merge into the epic branch.
- **D12** doc-style-write reads `origin/main`; a task reads its base.
- **D13** doc-style-sweep names one machine's host client path.
- **D14** «a rule and its mirror» in the pairs of docs-guard; no mirror exists.
- **D15** `docs/BACKLOG.md` stated as fact in the pitfalls.
- **D16** steps «live in the branch or the PR description» vs the plan.
- **D17** a document «outside docs/archive/» omits the task folders.
- **D18** «ten times» for seven of eight; a one-off measurement in the present tense.
- **G1–G7** law articles with no rule line: work only in the queue, drift fixed on the wrong side,
  dropping a word outside the tree, an unformulated requirement stays silent, the agreement merge
  step, where moved decisions went, completeness from the side of the work.
- **P1–P9** repeats inside the family and with git-workflow.
- **Outside the family:** git-workflow.github still says «merging main in» at two places — a
  leftover of RT-3194, fixed here.

Binding comparison, 12.11.2026:

- doc-style: «Texts for a person» has five articles and no binding (the audit reads one section);
  three symbols declared in other files; the edit-tool article is bound to a guard that judges shell
  writes on purpose; the size article names the code limit; a laid-out rule still demands its
  companion; the prune command makes no commit; `indexedDirs` is empty here, so the index
  articles run on nothing; a stale reason about screen strings; an incomplete pair list.
- spec-driven: seven symbols declared in other files; the verdict-substance article is bound to a
  form regex; liveness is judged for `.ts` only; «first column copied» is checked; servers and
  refusal codes exist; ten scenario prefixes, eight domains with subdomains; a reused number is
  refused only while alive; `packageDirs`, not `portableDirs`; a private field is a binding now.
- Code, not text — a task: a laid-out rule with the header still demands its companion in
  docs-guard; the anchor check matches a word anywhere in the file, imports and comments included.

## Decisions along the way

- **P5** no repeated measurement found between doc-style-write and the pitfalls by a search; left.
- **P6** the `Docs-skip` line stays in both rules: each is bound to its own guard.
- **P7** the doc-style texts say only "diagram"; nothing to edit.
- **G2, G4, G5, G6** closed in the spec-driven half; **G1, G3, G7** in doc-style.
- G1 is not a rule article: nothing holds it here, and as an article it repeated the law and grew
  the memory count. It stands in "What of the law is not here". `UI-KIT-V2-ISSUES.md` diverges
  from the law's article: named in the companion, to be named to the owner in the PR.
- Step 2.3 files no task. The companion pair for a laid-out rule is right: its articles are keyed
  by text, so a package edit of them needs the companion too; the false claim was the companion's
  and is fixed. The anchor matched as a word anywhere in the file is what the rule article "An
  anchor is checked against the raw text of the file" states.
- The spec-driven line about a reused number is kept: no refusal of a repeated number was found
  in the audit code.

## Sessions

### 2026-11-12

- Folder, plan; branch from RT-3194 by the stack.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-role-exit
**Branch:** RT-3195-rev-project-docs

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — Fixes
- **Next step:** edit the package texts by D1–D18, G1–G7, P1–P9, then the two companions
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3195-rev-project-docs/progress.md`; the plan lies next to it.

### Uncommitted

```
 M projects/agent-kit/assets/rules/doc-style.md
```

### Commits over the main branch

```
b3a8aa1aa docs(rt:agent-kit): правило и паттерны спеков называют английские заголовки и не спорят о ловушках
e83f21172 docs(rt:agent-kit): находки ревизии семьи о документации записаны
50628a985 docs(rt:agent-kit): этап находок задачи RT-3195 начат
b601cd8d2 docs(rt:agent-kit): папка задачи RT-3195
b4bcd9fe1 docs(rt:agent-kit): остатки ревизии поставки, найденные ролями, закрыты
1c4e52a48 docs(rt:agent-kit): папка задачи RT-3194 разобрана в архив
54200c74d chore(rt:agent-kit): графы кода и граф правил пересобраны на голове ветки
eb988bfe0 docs(rt:agent-kit): находки сверки привязок поставки записаны, RT-3220 стоит в плане эпика
3f0304f1c Merge branch 'RT-3193-rev-work-conduct' into RT-3194-rev-delivery
8e8d2234c docs(rt:agent-kit): закон о ведении работы снова в пределе длины
a4288aea1 fix(rt:agent-kit): сверка очереди считает отставание задачи от её базы, привязки поставки сверены с кодом
82d0082df docs(rt:agent-kit): решения по находкам ревизии поставки записаны, RT-3219 стоит в плане эпика
76b97b6c4 docs(rt:agent-kit): чтение сверки очереди называет ход на каждую её строку
e37948b38 docs(rt:agent-kit): пустой прогон и откат миграции описаны без противоречий
e48d9a8c5 docs(rt:agent-kit): общие паттерны поставки не несут имён одного дерева и одного хостинга
938baeec6 fix(rt:agent-kit): ветка задачи сверяется со своей базой, а не с main
21d868e16 docs(rt:agent-kit): выкатка и миграции говорят об одном и том же одинаково
18dc62744 docs(rt:agent-kit): список перед PR не спорит с правилом о сборке и прогоне
c2feb92a2 docs(rt:agent-kit): схемы поставки разбирают папку задачи до PR, повторы с task-flow убраны
13ca73ae9 Merge branch 'RT-3193-rev-work-conduct' into RT-3194-rev-delivery
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
