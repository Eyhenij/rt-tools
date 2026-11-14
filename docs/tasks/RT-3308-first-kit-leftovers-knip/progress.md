# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — knip, done
- **Done:** all three stages; the plan went through two rounds of the roles `product-strategist`
  and `goal-critic` and is approved: «Одобряю план RT-3308»
- **Next step:** closing — texts, the folder taken apart, the push set, the PR
- **Uncommitted:** nothing beyond the step under way
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Add RT-3308 to the epic plan and rewrite its lines about one task
- [x] 1.2 Remove the signs set of the removed package from the rules package, its `skip` line and its binding line in the hooks spec
- [x] 1.3 Remove `@angular/material` and `ngx-image-cropper` from the root dependencies
- [x] 1.4 Remove SC-UKV-07, rewrite SC-UKV-18 about any foreign showcase, rewrite the harness rule and the out-of-scope line of the snapshot spec
- [x] 1.5 Rewrite the comments that name removed paths or a kit in the tree: `check-boolean-inputs.mjs`, `build-tokens-v2.mjs`, `projects/core/README.md`
- [x] 2.1 Remove the stories made to compare with the removed showcase, their test component and their three snapshots, by the owner's approval of this plan
- [x] 2.2 Rename the preset `first-kit-theme` to `violet-theme`, a name apart from `material-violet`, move its users and rewrite both toolbar labels
- [x] 2.3 Rename the side menu story and its test components, and move its snapshot
- [x] 2.4 Rename the test fixture `FIRST_KIT_ANSWERS` of the colour function
- [x] 2.5 Rewrite the header and the messages of the icon map check and the comment of its CI step to «Material name»
- [x] 2.6 Rewrite the terms in the specs of the second kit and in the side menu overview by the new terms
- [x] 3.1 Add knip as a dev dependency by an exact version older than the waiting period
- [x] 3.2 Write its settings for the workspace and the command `check:unused`
- [x] 3.3 Run it, fix what it finds of the removed package, and file the rest as one task with the list

## Decisions along the way

- **The merge of main into the epic branch kept the time limits off** — the owner's word of
  14.11.2026 about the broken check; the auth stand limits of task RT-3301 and their test left with
  them. Affected stage of the plan: none.

- **The side menu look and its props are named «classic»** — `ClassicLook`, `classicProps`,
  `app-side-menu-cell--classic`; the visible captions of the matrix stay, so its snapshot only moves
  to the new story name. Affected stage of the plan: 2.
- **The second sign command gives 3 until the folder is taken apart** — the task folder itself is
  named by the branch, `RT-3308-first-kit-leftovers-knip`; it leaves the branch before the PR.
  Affected stage of the plan: 2.
- **The knip sign reads as entries declared for every project** — the apps and libs carry no
  `package.json`, so knip sees them as part of the root workspace; `knip.json` names their entries
  by globs. The run ends with the findings and exit code 1, not with a settings error. Affected
  stage of the plan: 3.
- **Of the removed package knip found `@floating-ui/dom` and the fixture `test-data-list-people.ts`**
  — both are removed. The rest goes to task RT-3310, outside the epic: the epic PR does not wait
  for it. Affected stage of the plan: 3.

## Sessions

### 2026-11-14

- Task RT-3308 created in epic RT-3232; main merged into the epic branch (`e1bcfafbd`), the push
  set of 47 steps green, the epic branch pushed.
- The plan went through two rounds of the roles: the first round found a sign narrower than the
  point, a stage that contradicted the address check and two unused dependencies; the second found
  kit source files the approval check guards.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3308-first-kit-leftovers-knip

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — knip
- **Next step:** step 3.1
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3308-first-kit-leftovers-knip/progress.md`; the plan lies next to it.

### Uncommitted

```
 M package.json
 M pnpm-lock.yaml
D  projects/ui-kit-v2/src/lib/components/data-list/stories/component/test-data-list-people.ts
?? knip.json
```

### Commits over the main branch

```
0f8b9ae21 refactor(rt:ui-kit-v2): слово first-kit ушло из имён второго кита
393ce6f82 refactor(rt:agent-kit): остатки первого кита — набор признаков, две зависимости, спек снимков
98d68078e docs(rt:ui-kit-v2): папка задачи RT-3308 — остатки первого кита и knip
e1bcfafbd Merge remote-tracking branch 'origin/main' into RT-3232-remove-ui-kit-v1
05cfece33 [RT-3304] Первый кит удалён вместе с витриной, проверками и выпуском (#3307)
3bb56b00c fix(rt:agent-kit): наблюдения агента во вложенных каталогах не входят в таблицу входов набора
443ec213a chore(rt:agent-kit): лимиты времени набора отправки сняты по слову владельца
603461390 docs(rt:agent-kit): находки эпика RT-3232 по задаче RT-3304
937715e68 fix(rt:agent-kit): наблюдения агента не входят в таблицу входов набора
8ecda2246 chore(rt:agent-kit): таблица входов набора записана по вершине задачи RT-3304
0a87c876c test(rt:agent-kit): образец области коммита без снятой rt:ui-kit
6d599ec4a refactor(rt:ui-kit-v2): сняты последние следы первого кита
0b1780e59 docs(rt:ui-kit): папка задачи RT-3304 разобрана в запись архива
3acb6df55 docs(rt:ui-kit): проверки дерева пройдены, задача RT-3304
33e098db8 chore(rt:ui-kit): графы кода пересобраны по вершине без первого кита
75a2b88d5 refactor(rt:ui-kit): первый кит удалён из репозитория
59f094b50 docs(rt:ui-kit): папка задачи RT-3304 — удаление первого кита
6b46bb6f3 docs(rt:ui-kit): план эпика RT-3232 — первый кит удалён из репозитория
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
