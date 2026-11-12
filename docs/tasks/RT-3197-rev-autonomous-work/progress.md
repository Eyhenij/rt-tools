# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — Edits
- **Done:** findings of the role and of the binding comparison written; package texts and the companion edited and laid out
- **Next step:** decide on the findings that need code: the delivery guard and the chain without an epic
- **Uncommitted:** yes — the edits of stage 2
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Run the role rules-reviewer over the whole family
- [x] 1.2 Compare rule articles with the companion bindings and hook code
- [x] 1.3 Write the findings list into the progress with a decision for each
- [x] 2.1 Edit the package texts by the findings
- [x] 2.2 Build the package and lay out the tree
- [>] 2.3 File tasks for findings that need code or another law
- [ ] 3.1 Rebuild the rules graph and its report
- [ ] 3.2 Run the push gate
- [ ] 3.3 Take the task folder apart into the archive

## Findings

Role rules-reviewer:

- R1. The rule's flow ended with a PR, while the law forbids anything outside at night. Fixed: the flow stops at the folder taken apart.
- R2. The chain was drawn from main; the delivery rule takes the first branch from the epic branch. Fixed in the rule, the pattern and the flow.
- R3. The morning list lived only in the last reply; the command already writes a file. Fixed: the table names the file, the command does not write over a broken night's list.
- R4. The boundary was written nowhere on disk. Fixed: the command writes it into the list head.
- R5. Moving a board card read as an outside action. Fixed: the table says it is not.
- R6. Red that cannot be made green had no outcome. Fixed: the work stops, the next branch comes from the last green one.
- R7. A refusal that demands a push had no outcome at night. Fixed in the rule.
- R8. The pitfalls lived in the rule body. Moved to the cold part `pitfalls.md`, spec line added.
- R9. The pattern copied the template by `cp -r` with a fixed directory. Fixed: per file, by `RT_TASKS_DIR`.
- R10. The pattern named this tree's key in two samples. Fixed: `<КЛЮЧ>`.
- R11. Repeats between the rule, the pattern and the command (P2–P6). Kept where each text needs its own sample; the command's §7 shrunk to a pointer.

Binding comparison (11 articles, 7 lines right):

- B1. Chain line said no guard judges the base. Wrong: the delivery guard demands main's tip, the epic guard the epic branch. Fixed; without an epic a moved main refuses the next chain branch.
- B2. Readiness line bound to the turn-exit guard as if it held the article. It checks only that «Verified by» commands of a closed stage ran. Fixed to «Not checked» with that explanation.
- B3. Red run line bound to the push gate set. Nothing is pushed at night. Fixed to «Not checked».
- B4. Refusal line said the guard knows nothing after a refusal. One tier exists: a prose question after the conversation guard's refusal. Fixed.
- B5. The cargo mark guard refuses `git rm` of a folder whose grill names cargo keys. Named in the companion; the archive pattern uses `rm -r`.

## Decisions along the way

- **B1 stays a named fact, not a task.** The refusal arises only on a night without an epic while main moves; the rule already takes the first branch from the epic branch, and the guard's base demand protects the daytime work. A task would change the delivery guard for one rare case.
- **B5 stays a named fact.** The archive pattern already removes by `rm -r`; changing the guard would weaken the daytime mark.

## Sessions

### 2026-11-12

- Folder, plan; branch from RT-3196 by the stack.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-role-exit
**Branch:** RT-3197-rev-autonomous-work

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — Findings
- **Next step:** write the findings of both into the progress with a decision for each
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3197-rev-autonomous-work/progress.md`; the plan lies next to it.

### Uncommitted

```
 M .claude/skills/autonomous-work-run/SKILL.md
 M .claude/skills/autonomous-work/SKILL.md
 M .claude/skills/autonomous-work/implementation.md
 M docs/specs/agent-kit/patterns/implementation.md
 M projects/agent-kit/assets/commands/night.md
 M projects/agent-kit/assets/patterns/autonomous-work-run.md
 M projects/agent-kit/assets/rules/autonomous-work.md
?? .claude/skills/autonomous-work/pitfalls.md
?? projects/agent-kit/assets/pitfalls/autonomous-work.md
```

### Commits over the main branch

```
996322e1a docs(rt:agent-kit): папка задачи RT-3197
cbaa05068 docs(rt:agent-kit): остатки ревизии семьи о проверяемости, найденные ролями, закрыты
b2afa3160 docs(rt:agent-kit): папка задачи RT-3196 разобрана в архив
36bc482dd docs(rt:agent-kit): графы пересобраны после ревизии семьи о проверяемости
b832cbab2 docs(rt:agent-kit): привязки правил о проверяемости сверены с кодом
2237fe2fd docs(rt:agent-kit): тексты семьи о проверяемости не спорят с законом и между собой
90328e498 docs(rt:agent-kit): папка задачи RT-3196
ed2bb634b docs(rt:agent-kit): остатки ревизии семьи о документации, найденные ролями, закрыты
40f3ff9bb docs(rt:agent-kit): папка задачи RT-3195 разобрана в архив
86f52b986 docs(rt:agent-kit): статья об очереди задач перенесена в то, чего правило не держит, графы пересобраны
6082cf08c docs(rt:agent-kit): правило оформления текстов и компаньоны сверены с деревом
b3a8aa1aa docs(rt:agent-kit): правило и паттерны спеков называют английские заголовки и не спорят о ловушках
e83f21172 docs(rt:agent-kit): находки ревизии семьи о документации записаны
50628a985 docs(rt:agent-kit): этап находок задачи RT-3195 начат
b601cd8d2 docs(rt:agent-kit): папка задачи RT-3195
b4bcd9fe1 docs(rt:agent-kit): остатки ревизии поставки, найденные ролями, закрыты
1c4e52a48 docs(rt:agent-kit): папка задачи RT-3194 разобрана в архив
54200c74d chore(rt:agent-kit): графы кода и граф правил пересобраны на голове ветки
eb988bfe0 docs(rt:agent-kit): находки сверки привязок поставки записаны, RT-3220 стоит в плане эпика
3f0304f1c Merge branch 'RT-3193-rev-work-conduct' into RT-3194-rev-delivery
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
