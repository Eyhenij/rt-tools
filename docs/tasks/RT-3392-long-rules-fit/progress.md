# Ход работы

## Где мы

- **State:** `этап-идёт`

## Шаги

- [x] 1.1 The gate refusals are counted by reason
- [x] 1.2 The rules delivered with no refusal are counted and printed
- [x] 2.1 agent-kit fits
- [x] 2.2 testing fits, its override included
- [x] 2.3 reuse-first fits
- [x] 2.4 deploy-flow fits, its override included
- [x] 2.5 typescript-conventions fits
- [x] 2.6 styling-bem fits
- [x] 2.7 write-a-skill fits
- [x] 2.8 lists fits, its override included
- [x] 3.1 rt-tools-storybook fits
- [x] 3.2 rt-tools-styling fits
- [x] 3.3 agent-kit-source fits
- [x] 3.4 cargo-triage fits
- [x] 4.1 The probe passes every area and no paragraph is lost

## Decisions along the way

- 19.11, stage 4: after the twelve rules were cut, the probe still refused 5 of 21 areas. Three
  rules outside the list stood behind them: `angular-patterns` (6 262 characters), `component-structure`
  (7 762 with its override) and `permissions` (7 930). The done-sign of the plan is a probe with no
  refusal, so they were cut by the same technique: statements in the hot part, the whole text in
  `pitfalls.md`. `reuse-first` and `rt-tools-storybook` gave their pitfall lines to the cold part:
  together with `rt-tools-styling` and `styling-bem` they did not fit on `.storybook/preview.scss`.
  That area now passes with 9 915 characters of 10 000.
- The overrides of `testing`, `deploy-flow`, `lists` and `component-structure` moved whole to
  `.claude/rt-kit/overrides/pitfalls/`; the rule keeps one short section «This tree».
- The retelling found 128 requirements a session must follow that the cut hot parts did not state:
  names of prefixes, tags and decorators, and what to do instead of a forbidden technique. All of
  them returned to the hot parts, folded into the statements, within the same bounds; `styling-bem`
  gave up its `rt-when` lines so that `.storybook/preview.scss` still fits. The probe stays at 0.
- Shortened statements changed the first column of the companions of `testing`, `deploy-flow`,
  `rt-tools-storybook` and `cargo-triage`: merged articles keep every binding in one line.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3392-long-rules-fit

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`

The progress in full — `docs/tasks/RT-3392-long-rules-fit/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/specs/agent-kit/work-result/implementation.md
 M docs/specs/agent-kit/work-result/scenarios.md
 M docs/specs/agent-kit/work-result/spec.md
 M docs/tasks/RT-3392-long-rules-fit/progress.md
 M projects/agent-kit/assets/checks/record-count.mjs
 M projects/agent-kit/assets/checks/work-result.mjs
 M projects/agent-kit/tests/record-count.test.sh
```

### Commits over the main branch

```
10862c6a8 docs(rt:agent-kit): план задачи RT-3392
c4d26402f docs(rt:agent-kit): папка задачи RT-3392, разбор
fb7360b91 Merge remote-tracking branch 'origin/RT-3302-checks-rework-3' into RT-3352-consent-by-prompt
55c73ede7 [RT-3332] Метка шага и одобрение плана перемеряются, а не принимаются на веру (#3403)
7af1a510b [RT-3395] Движок не требует PR эпика, пока задачи эпика не взяты и не влиты (#3405)
51487c4ef fix(rt:agent-kit): ответ «сделаю сам» в меню не спрашивает окно второй раз
8e70102e5 docs(rt:agent-kit): папка задачи RT-3352 разобрана
598f93eb6 docs(rt:agent-kit): спека движка и правило хода называют окно владельца, а не цитату
de1f7a291 feat(rt:agent-kit): замену проверки и шаг владельца владелец подтверждает в окне
558322d45 feat(rt:agent-kit): движок не ищет цитаты владельца в записях разговора
2fd1bc3ca docs(rt:agent-kit): план задачи RT-3352
d1d7d5ae3 docs(rt:agent-kit): папка задачи RT-3352, разбор
6feaa28e6 docs(rt:agent-kit): папка задачи RT-3395 разобрана
9e56f6c32 docs(rt:agent-kit): этапы задачи RT-3395 измерены
5741209e4 fix(rt:agent-kit): движок не требует PR эпика, пока задачи эпика не взяты и не влиты
edbc8dbdd docs(rt:agent-kit): план задачи RT-3395
bf35a68ff docs(rt:agent-kit): папка задачи RT-3395, разбор
bae7cb086 Merge remote-tracking branch 'origin/RT-3302-checks-rework-3' into RT-3332-step-mark-signature
4e1e1cac7 Merge remote-tracking branch 'origin/main' into RT-3302-checks-rework-3
34c11040c fix(rt:agent-kit): перемер перед PR идёт на node из .nvmrc дерева
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
