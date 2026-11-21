# Grill

## The owner request

> изучи https://ngdoctor.dev/, прогони проверки и заведи эпик по исправлению всех замечаний, бери в работу

> эпик 3232 уже должен быть закрыт - проверь, и если эпик действительно закрыт - бери в работу ng doctor

## What the tree already has

- Angular Doctor is the npm package abiramcodes/angular-doctor, version 0.3.0, published on
  17.11.2026. It is a command line scan of Angular CLI and Nx workspaces: a score from 0 to 100,
  findings by severity, a Markdown report, a `--json` mode, a config file
  `angular-doctor.config.json` with the keys `reportPath`, `ignore` and `rules`.
- Score: 100 minus 1.5 per file where an error rule fires, minus 0.75 once per warning rule;
  info costs nothing.
- The scan of 21.11.2026 on main at 0c1f35410: score 31, 75 errors, 1182 warnings, 200 info.
  It ran 1 to 2 minutes and wrote its report into the tree root.
- `check:all` in `package.json` runs lint, types, tests, build and verify over every project,
  then the styles linter and knip. It is not the push set.
- The animations package of Angular stands in devDependencies, and no file of the tree imports
  it. Its two dependents, the browser platform package and the Storybook adapter, declare it an
  optional peer.
- The dependencies rule demands an exact version and a waiting term of one day
  (`minimumReleaseAge` 1440 in `pnpm-workspace.yaml`); 0.3.0 is four days old.
- The epic RT-3232 is closed on the board since 14.11.2026, its PR #3316 merged; `gh issue view
  3232` answers CLOSED. On main the row of this copy named RT-3302 by then; that epic is closed
  since 21.11.2026, PR #3472 merged.
- The `--json` output carries the field `score`. Of the files the scan names, 18 lie outside
  history: the storage client of prisma, which `pnpm install` generates on every machine, so the
  score does not depend on the machine. No finding lies in `dist/` or `tmp/`.
- `check:all` runs neither in the pipeline nor in the push set: the step guards whoever runs it.
- The tree checks live in `tools/*.mjs`, their scenarios in `tools/tests/*.test.sh`, the
  selection of scenarios by a changed file in `tools/tests/select.sh`.

## What the rules already say

- Rule `dependencies`: exact version, the waiting term.
- Rule `testing`: a decision is moved into a pure function and covered by a scenario.
- Rule `git-workflow`: the task branch stands on the epic branch; this one is the first of the
  stack.

## Questions and answers

**What to do with the findings that contradict the conventions of the tree?**
«Подогнать код»

**Take the info migrations — signal forms, @Service, DOCUMENT, NgOptimizedImage — into the epic?**
«Все четыре»

**Pin Angular Doctor as a check: an exact version in devDependencies and a step in check:all with a score threshold?**
«Да, в check:all»

**Reassign the working copy rt-tools to the new epic?**
«эпик 3232 уже должен быть закрыт - проверь, и если эпик действительно закрыт - бери в работу ng doctor»

## Decisions

- **The step judges the score against a threshold kept in the check itself, and every task of the
  epic raises it.** The score is what the owner saw in the question, and a falling score is what a
  new finding does. Rejected: a list of known findings to compare with — 1457 lines that every task
  would rewrite.
- **The report goes to `tmp/`, which is outside history.** The tool writes it on every run, and a
  report in the tree root dirties the working copy and blocks the push.
- **No rule of Angular Doctor is turned off.** The owner chose to fit the code.

## What is left unclear

- Whether the step belongs in the push set as well. The owner named `check:all`; the push set is
  not touched.
