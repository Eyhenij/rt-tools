# Plan

**Task:** RT-3308 · **Branch:** RT-3308-first-kit-leftovers-knip, taken from `RT-3232-remove-ui-kit-v1`; its PR goes into that branch
**Behaviour:** unchanged — the owner's word of 14.11.2026: «Бери RT-3308, возможности оставить»: the Material icon names and the violet preset of the second kit stay, only their names and the leftovers of the removed package go.

## Points

- **A:** the first kit is removed, and the tree still holds its leftovers. The rules package
  publishes a set of signs for the removed package. The showcase holds stories made to compare the
  two showcases side by side, and the second one is gone. The preset id `first-kit-theme`, story
  names, test components, a test fixture, the showcase toolbar labels, the icon map check and the
  specs of the second kit carry the words. Two root dependencies nobody imports stayed after the
  kit. The snapshot spec describes the removed showcase. Nothing in the tree finds unused files,
  exports or dependencies.
- **This task reaches:** no file name, identifier, preset, toolbar label, check message or spec
  term of the tree names the first kit; the move guides, the history notes and the comments in kit
  source files stay. One command lists what nobody uses in every project of the workspace.
- **Sign:** two commands, both on 14.11.2026 at `e1bcfafbd`:
  `git grep -c -iE 'first-kit|firstkit|first_kit' -- projects tools .claude/rt-kit .github apps libs docs/specs ':!**/graphify-out/**' ':!**/CHANGELOG*'`
  — 51 lines in 22 files, 0 after; `git ls-files | grep -ic first-kit` — 7, 0 after. The toolbar
  labels and the check messages are read by eye in the diff. `pnpm run check:unused` prints its
  findings by project; the owner reads them in the PR body.
- **Milestone G of the epic:** one kit in the repository, and a push spends no time on the first.
- **Metric:** нет: what was broken — the leftovers of the removed package.

## Task footprint

| What  | Where |
| ----- | ----- |
| Epic plan | `docs/plans/remove-ui-kit-v1.md` |
| Specs | `docs/specs/ui-kit-v2/table-full-port/`, `side-menu/`, `side-menu-options/`, `expansion-panel/`, `snapshots/`; `docs/specs/agent-kit/hooks/` |
| Rules | `.claude/skills/dependencies/`, `.claude/skills/rt-tools-storybook/` |
| Code  | `projects/agent-kit/assets/checks/signals/`, `projects/ui-kit-v2/.storybook/`, `projects/ui-kit-v2/src/lib/components/data-list/stories/`, `projects/ui-kit-v2/src/lib/components/data-table/stories/`, `projects/ui-kit-v2/src/lib/components/side-menu/stories/`, `projects/ui-kit-v2/src/lib/components/side-menu/Overview.mdx`, `projects/utils/src/lib/functions/text-color-on-background/`, `tools/`, `.github/workflows/ci.yml` |
| Tree  | `.claude/rt-kit.json`, `package.json`, `pnpm-lock.yaml`, `projects/core/README.md` |

## What counts as done

- Both commands of the sign give 0.
- `projects/agent-kit/assets/checks/signals/ui-kit.json` is gone, with its `skip` line and its
  binding line in the hooks spec.
- `grep -cE '"(@angular/material|ngx-image-cropper)"' package.json` gives 0.
- The snapshot spec speaks of one kit: SC-UKV-07 is removed with its number left free, SC-UKV-18
  speaks of any foreign showcase, the rule about a harness per kit and the line about the first
  showcase are rewritten.
- `pnpm run check:unused` runs knip over the workspace and its output names every project under
  `projects/`, `apps/` and `libs/`; the PR body lists the findings, and what is left goes into one
  task with the list.
- The epic plan names RT-3308 as its second task, and its lines about one task are rewritten.
- The push set is green.

## Stages

### 1. Leftovers of the removed package

- **Steps:**
    1. Add RT-3308 to the epic plan and rewrite its lines about one task
    2. Remove the signs set of the removed package from the rules package, its `skip` line and its binding line in the hooks spec
    3. Remove `@angular/material` and `ngx-image-cropper` from the root dependencies
    4. Remove SC-UKV-07, rewrite SC-UKV-18 about any foreign showcase, rewrite the harness rule and the out-of-scope line of the snapshot spec
    5. Rewrite the comments that name removed paths or a kit in the tree: `check-boolean-inputs.mjs`, `build-tokens-v2.mjs`, `projects/core/README.md`
- **Readiness sign:** the package carries no signs set for the removed package, the two
  dependencies are gone from the manifest and the lockfile, the spec audit is green.
- **Verified by:** `npm run check:specs` — exit 0; `grep -cE '"(@angular/material|ngx-image-cropper)"' package.json` — 0.

### 2. The second kit without the words "first kit" in names

The new terms: the preset is «the violet preset» (`violet-theme`), an icon name is «a Material
name», a table drawn in that preset is «a table in the violet preset».

- **Steps:**
    1. Remove the stories made to compare with the removed showcase, their test component and their three snapshots, by the owner's approval of this plan
    2. Rename the preset `first-kit-theme` to `violet-theme`, a name apart from `material-violet`, move its users and rewrite both toolbar labels
    3. Rename the side menu story and its test components, and move its snapshot
    4. Rename the test fixture `FIRST_KIT_ANSWERS` of the colour function
    5. Rewrite the header and the messages of the icon map check and the comment of its CI step to «Material name»
    6. Rewrite the terms in the specs of the second kit and in the side menu overview by the new terms
- **Readiness sign:** both commands of the sign give 0, and the showcase snapshots are green.
- **Verified by:** `git grep -c -iE 'first-kit|firstkit|first_kit' -- projects tools .claude/rt-kit .github apps libs docs/specs ':!**/graphify-out/**' ':!**/CHANGELOG*'` — no output; `git ls-files | grep -ic first-kit` — 0.

### 3. knip

- **Steps:**
    1. Add knip as a dev dependency by an exact version older than the waiting period
    2. Write its settings for the workspace and the command `check:unused`
    3. Run it, fix what it finds of the removed package, and file the rest as one task with the list
- **Readiness sign:** the command runs over every project of the workspace.
- **Verified by:** `pnpm run check:unused` — its output names every project under `projects/`,
  `apps/` and `libs/` and ends with the findings, not with a settings error.

## What this work does not do

- The move guides of the second kit («Переход с первого кита»), its history notes, the selector
  names `rtui-*` in them and the comments that say where a piece came from stay: the removed package
  is still published, and its users move by them. So do the alias of the first kit's input in
  `rt-data-list-selectors.directive.ts` and the switch `customProperties` of the styles rule.
- `./styles/tokens.coexist.css` of the second kit stays for the same reason: an application that
  moves holds both kits at once, and the file is a published export. Its comment in
  `tools/build-tokens-v2.mjs` is rewritten to name the moment it leaves — the end of the published
  first kit.
- The signs set leaves although task RT-3304 kept it for trees that install the published rules
  package: the owner's word of 14.11.2026 named it among what goes.
- The address list keeps the entries of removed paths: the epic plan and an older plan name those
  paths, and the list exists for such names.
- The comments in `tokens.scale-material.mjs` and in the icon map `rt-icon-material-map.ts` that
  name the first kit stay: an edit of a kit source file is a visible kit edit to the approval
  check, and it needs a mockup and the owner's approval.
- The Material icon names and the violet preset stay as features of the second kit — the owner's
  word.
- knip does not enter the push set: the owner's goal is a shorter push. Its place in the set or in
  CI is decided by the plan of push time.
- The rules package on npm still gives the signs set until its next release; the release is the
  owner's step.
