# Grill

**Описание фичи:** не нужно — правка сверки таблицы решений пакета правил; код приложений не меняется.

## The owner request

> обязан сам следить за проверками и ci

The owner's word of 21.11.2026. The pipeline run 44884048830 on the epic's PR #3472 into main is
red: the suite `decision-table.test.sh`, scenario `SC-AK-1563`, «rows 1012, mismatch 2». The epic is
closed by the owner's word «Закрыть эпик сейчас», and the PR waits for a green run.

## What the tree already has

- **The hook.** `projects/agent-kit/assets/hooks/pre-push.sh:42` passes everything under the
  variable `CI`: the pipeline is its own gate.
- **The sweep.** `projects/agent-kit/assets/checks/decision-table.mjs:runProbe` runs every probe
  with the environment of the process that called it, `{ ...process.env, … }`.
- **The two rows.** Both are rows of `pre-push.sh` with the decision «deny». On the pipeline
  `CI=true` reaches the hook, and it answers «allow».
- **The measurement.** On this machine the suite gives 516 ok. The sweep with
  `CI=true GITHUB_ACTIONS=true` gives the same two mismatches as the pipeline.

## What the rules already say

- The rule `testing`: a scenario sets the environment it needs itself, not takes it from the machine.

## Questions and answers

None. The run names the case; the owner's word orders the checks to be watched and fixed.

## Decisions

- **A probe judges a hook as a session sees it: the variables of the pipeline do not reach it.** The
  table speaks of the session's calls; the pipeline's pass of the push hook is a fact of another
  place. Владелец здесь, а правка — одна строка окружения пробы. Цена ошибки: если таблица должна
  судить и конвейер, нужна своя строка для него.

## What is left unclear

- Whether other hooks read other pipeline variables. The sweep with the pipeline's variables shows
  only these two rows today.
