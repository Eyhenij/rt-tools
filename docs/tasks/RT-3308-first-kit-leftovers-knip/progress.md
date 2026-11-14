# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — knip
- **Done:** task, branch from the epic branch, board column; the plan went through two rounds of
  the roles `product-strategist` and `goal-critic` and is approved: «Одобряю план RT-3308»
- **Next step:** step 3.1
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
- [>] 3.1 Add knip as a dev dependency by an exact version older than the waiting period
- [ ] 3.2 Write its settings for the workspace and the command `check:unused`
- [ ] 3.3 Run it, fix what it finds of the removed package, and file the rest as one task with the list

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

## Sessions

### 2026-11-14

- Task RT-3308 created in epic RT-3232; main merged into the epic branch (`e1bcfafbd`), the push
  set of 47 steps green, the epic branch pushed.
- The plan went through two rounds of the roles: the first round found a sign narrower than the
  point, a stage that contradicted the address check and two unused dependencies; the second found
  kit source files the approval check guards.
