# Grill

## The owner request

> В эпик, перед RT-3478

The answer of 21.11.2026 to the question where the work on the red knip goes. The epic request it
belongs to:

> изучи https://ngdoctor.dev/, прогони проверки и заведи эпик по исправлению всех замечаний, бери в работу

The card RT-3492: «knip красный на main: неиспользуемые d3-пакеты и экспорты». Its premise that
`check:all` stops before `check:ngdoctor` went stale with RT-3477, which put the step ahead of knip;
the row of the epic plan names the goal: «knip зелёный: `check:all` снова зелёный целиком».

## What the tree already has

- `pnpm run check:unused` on this branch, 21.11.2026: 2 unused devDependencies, 2 referenced
  optional peers, 9 unused exports, 10 unused exported types, 14 configuration hints. Hints do not
  turn the run red; the other four groups do.
- **The d3 packages.** `d3-hierarchy` and `d3-shape` stand in the root devDependencies and as
  optional peers of the kit in `projects/ui-kit-v2/package.json`. The kit chart imports both:
  `rt-chart.blocks.ts`, `rt-chart.cartesian.ts`, `rt-chart.round.ts`. knip sees the import in the
  kit workspace, finds the peer there, and reports the root copy as unused. The root copy is what
  installs the package for the kit build, the showcase and the tests.
- **The same case is already settled for two other optional peers.** `pdfjs-dist` and `quill` are
  optional peers of the kit in the same shape, and `knip.json` lists them in
  `ignoreDependencies`.
- **The 19 exports and types are used inside their own files.** A search over the tree finds each
  name only in its own file, apart from mentions in spec bindings:
  - `projects/agent-kit/src/lib/epic-window-send.ts`: `EPIC_WINDOWS_MARK`, `windowsToSend`,
    `copiesOf`, `sendingEpicsOf`, `readWindowMark` and six types; the module itself is imported by
    `metric-send.ts`;
  - `projects/agent-kit/src/lib/metrics.ts`: `periodOf`, `IMetricsPeriod`;
  - `projects/agent-kit/src/lib/push-set-usefulness.ts`: `ESubjectMark`, `ICheckSums`;
  - the kit chart scene `rt-chart.scene.ts`: `RT_CHART_LEFT_MIN`, `rtChartNiceStep`,
    `IRtChartScale`;
  - the link block fixture of the AI chat: `AI_CHAT_LINK_MOCKUP`, used by the width cases of the
    same file.
- Spec bindings name `windowsToSend` and `periodOf` as `file:symbol`; the binding reads a symbol,
  not an export.
- `check:unused` is the last step of `check:all` and is not in the push set.

## What the rules already say

- The owner's word in RT-3477, «Подогнать код», was said about Angular Doctor findings: fix the
  code rather than switch rules off.
- Rule `dependencies`: exact versions; a package used by the build stays where it is installed.
- `knip.json` already carries the convention for optional peers of the kit: `ignoreDependencies`.

## Questions and answers

No question went to the owner. The one open choice, where the d3 packages go, had a single option
that keeps the check whole, and the question with an exception option was refused by the question
guard: the owner asked to fix the remarks, not to silence the check. Taking it as a decision below.

**Behaviour:** unchanged — the work touches no file under `apps/**` or `libs/**`: one `export`
word less on symbols nobody imports, and two dev packages declared by the kit that uses them.

## Decisions

- **The d3 packages move from the root devDependencies into devDependencies of the kit package.**
  The kit is the one that imports them; declared there, knip sees the import and the declaration in
  one workspace. The kit build, its tests and the showcase resolve them from the kit's own
  `node_modules`, and the check of the move is those three runs. Rejected: `ignoreDependencies` —
  an exception to the check; the two earlier exceptions for `pdfjs-dist` and `quill` stay outside
  this task.
- **The 19 exports and types lose `export`, and nothing else changes.** Each is used only inside
  its file; an `export` nobody imports is what knip names. Rejected: listing them in `ignoreIssues`
  — that switches the check off for those files, against «Подогнать код».
