# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 2 of 4 — The component
- **Done:** the epic RT-2542 with nine tasks; the agreement; the pure logic (9 tests); the component, its directive, template, styles, barrel export and `CONTEXT.md` — typecheck and lint green
- **Next step:** `Overview.mdx` (step 2.4), then the stories with a preset half (stage 3)
- **Uncommitted:** the folders of RT-2549 … RT-2556 under `docs/tasks/` — each goes into its own branch; nothing of RT-2548
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Declare `IRtTree` in `rt-tree.model.ts`: the node, the mode, the mark.
- [x] 1.2 Write `rt-tree.logic.ts`: `rtTreeChoose`, `rtTreeMark`, `rtTreeSelectAll`, `rtTreeLabelParts` over the select tree module.
- [x] 1.3 Write `rt-tree.logic.spec.ts` for SC-UKV-639 … SC-UKV-643, SC-UKV-645, SC-UKV-647 by the logic.
- [x] 2.1 Write `rt-tree.component.ts`, `.html`, `.scss` and `rt-tree.directives.ts` with the row template directive.
- [x] 2.2 Export the folder from the components barrel.
- [x] 2.3 Write `rt-tree.component.spec.ts` for every scenario through the drawn component.
- [>] 2.4 Write `CONTEXT.md` and `Overview.mdx` next to the component.
- [ ] 3.1 Write the stories of `rt-tree` with a matrix per axis.
- [ ] 3.2 Run the story sweep over the raised showcase.
- [ ] 3.3 Take the snapshots of the new stories and look at every frame.
- [ ] 3.4 Give the owner the links to the stories on :6007.
- [ ] 4.1 Merge the agreement into `docs/specs/ui-kit-v2/tree/` and name it in the domain index.
- [ ] 4.2 Run the spec check and the full set before the push.

## Decisions along the way

- **The epic grill lives in this folder.** It was written for the whole epic before the numbers
  existed; RT-2548 is the first task, and the grill leaves for the archive with this folder.

## Sessions

### 2026-10-06

- The epic RT-2542 and tasks RT-2548 … RT-2556 created; the epic branch pushed.
- The consumer's name got into the first epic card and branch name; the owner caught it, both fixed
  before the branch left the machine.

## Handover of the session

### Work

RT-2548 «Во втором ките нет дерева выбора». Working tree — `/Users/sviatoslavkhutornoy/WebstormProjects/rt-tools`,
branch `RT-2548-kit2-tree` from the epic branch `RT-2542-kit2-app-parts`. The branch is committed
locally and has not left the machine: the gate before sending it refused (below). No PR yet.

### Where to look

The progress, the plan and the turn map arrive by the startup hook. The grill of the whole epic lies
in this folder. The agreement is `docs/specs/ui-kit-v2/proposed/tree/`; the epic plan is
`docs/plans/kit2-app-parts.md`.

### Epic RT-2542 — Деревья, крошки, палитра и карусель из приложения есть во втором ките

| #   | Task                                                                  | State       |
| --- | --------------------------------------------------------------------- | ----------- |
| 1   | **RT-2548 — дерево выбора `rt-tree` на логике дерева из `rt-select`** | in progress |
| 2   | RT-2549 — перетаскиваемое дерево `rt-draggable-tree`                  | ahead       |
| 3   | RT-2550 — режим «Применить» у `rt-multiselect`                        | ahead       |
| 4   | RT-2551 — гибридный выбор деревом: режим мультиселекта или покрыт     | ahead       |
| 5   | RT-2552 — хлебные крошки `rt-breadcrumbs`                             | ahead       |
| 6   | RT-2553 — правка значения на месте                                    | ahead       |
| 7   | RT-2554 — быстрое меню у плавающей кнопки                             | ahead       |
| 8   | RT-2555 — палитра цветов `rt-color-palette`                           | ahead       |
| 9   | RT-2556 — карусель `rt-carousel`                                      | ahead       |

### Done and the next step

Done: stage 1 whole and steps 2.1–2.2 — the model, the pure logic (9 tests), the component, the
directive, the styles, the barrel export, `CONTEXT.md`; typecheck and lint green.
Next step: the five gate refusals, then the component spec (2.3).

### What to keep in mind

- The gate before sending the branch refused with five checks, all real:
    - `check-specs` — SC-UKV-648 … 651 have no test yet: the component spec closes them.
    - `check-tokens-graph` — `--rt-color-text-secondary` and `--rt-font-size-sm` do not exist; take
      the names the select and the multiselect styles use.
    - `check-tokens-styles` — `box-shadow` and `border-bottom` need the block's own property
      (`--rt-tree-…`) with the step as its default, the technique of rule `rt-tools-styling`.
    - `check-preset-stories` — a story must show the tree under the preset and without it.
    - `check-kit-coverage` — `Overview.mdx` and stories for `rt-tree` and `rtTreeNodeEnd`.
- The label and the description truncate with an ellipsis and have no tooltip yet: the kit has a
  tooltip-when-truncated directive (`docs/specs/ui-kit-v2/tooltip-when-truncated/`) — apply it.
- A guard reads the word for sending a branch inside any shell text, a heredoc included, and runs
  the whole gate on it: write such text through the file editor, not through the shell.
- Consumers of the kit are never named in the tree, tasks, commits or PRs; the owner was sharp about
  it. The sample paths live in the session memory, not here.
- There is no machine-account token on this machine: the branch leaves by the owner's credentials,
  commits are signed `rt-tools-dev` through the environment variables.
- PR #2527 (RT-2526) is a draft waiting for its run; the run sat queued — the runner did not take it.
  When it is green, lift the draft.
- Colima was up before this session; the database container `rt-tools-db-1` is running.
