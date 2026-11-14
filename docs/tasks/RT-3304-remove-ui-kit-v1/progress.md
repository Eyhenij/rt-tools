# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — the tree checks pass
- **Done:** stages 1–3: the package, its build, tools, checks, rules and texts are free of the first kit
- **Next step:** run the push set, push, open the PR into the epic branch
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Remove `projects/ui-kit`, `docs/specs/ui-kit` and the first kit's publish workflow
- [x] 1.2 Remove the first kit from `tsconfig.base.json`, `package.json`, the linters and the version scripts
- [x] 1.3 Remove the first kit's snapshot step from the pipeline
- [x] 1.4 Rebuild the lockfile
- [x] 2.1 Remove the first kit from the tree profile and the checks settings
- [x] 2.2 Remove the first kit from the tools, their allowlists and signals
- [x] 2.3 Bring the scenarios of the tools and of the rules package up to date
- [x] 3.1 Bring the rules of this tree and the overrides up to date
- [x] 3.2 Bring `README.md`, `CLAUDE.md` and the documents up to date
- [x] 4.1 Run `pnpm run check:all`
- [>] 4.2 Run the push set

## Decisions along the way

- **The words "first kit" stay where they describe a move away from it.** The second kit's README,
  the coexistence file and the material preset speak to an application that still holds the
  published package. Paths and commands of the removed package are gone everywhere.
- **The stage 3 search keeps four kinds of hits, each on purpose.** The decisions in `docs/adr/`
  and the plans in `docs/plans/` describe the day they were written. The task folder quotes the
  owner. The rules package ships `checks/signals/ui-kit.json` to trees that still install the
  published package, so it stays in the package and in its layout here. The generated code graph is
  rebuilt by the head after the commit.
- **Four bindings that lived on a name shared with the first kit were bound again.** After the
  removal `check-specs` named them dead code: the table selection, the table spacer, the snapshot
  harness hooks. Each now points at the live symbol of the second kit.
- **The scenarios `SC-UKV-133` and `SC-UKV-353` are removed, not marked uncovered.** Both promised a
  check between the two kits: a shared token name and a shared frame. With one kit there is nothing
  to promise; the numbers are not given out again.
- **The old migration plan `docs/rt-ui-config-migration.md` is removed.** It planned the first kit's
  defaults and footers, and nothing of it applies to the second kit.
- **The first kit's mission is removed from `docs/product/missions.md`.** It promised to keep the
  package working until the move; the owner's order removes the package itself. The second kit's
  mission is not touched.

## Sessions

### 2026-11-14

- The epic branch `RT-3232-remove-ui-kit-v1` is taken from main with the plan and pushed.
- Stages 1–3 done in the working tree: 490 files of the package, its specs, the publish workflow,
  the frame-pair check and the paint probe removed; the profile, the pipeline, the tools, the
  allowlists, the rules, the overrides, `README.md` and `CLAUDE.md` brought up to one kit.
  `check-specs` and `check-doc-paths` are green, the push-set input table is recorded again
  (42 steps).
- `pnpm run check:all`: 358 tasks, 8 typechecks and builds of the receiver red on a stale storage
  client — it lies outside history; after `pnpm run prisma:generate` all 8 green, the styles linter
  green.
