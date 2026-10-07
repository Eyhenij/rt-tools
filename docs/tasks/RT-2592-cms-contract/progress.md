# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — The spec and the checks
- **Done:** grill, plan, stages 1–2: the package builds, 18 tests pass with full coverage
- **Next step:** write the spec of the contract
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Create `projects/cms-contract` after the auth contract package
- [x] 1.2 Register it in the workspace, the lint ban and the commit scopes
- [x] 2.1 Carry over the block model, the parsing and the site page functions with their tests
- [x] 2.2 Carry over the `.proto` files and generate the contract into the package
- [>] 3.1 Write the spec, the scenarios and the bindings, and the README
- [ ] 3.2 Run the tree checks

## Decisions along the way

- **The branch of this task was created past this session's delivery guard.** The owner's word:
  «разрешаю обход, делай отсюда». The guard looked for the epic branch in another repository.
- **Stages 1 and 2 went in one commit.** An empty package has nothing to build: the skeleton
  builds only with its first source. Affected stage of the plan: 1, 2.
- **`sitePathOf` takes the section root as a parameter.** The page address under a fixed `/blog` was
  one application's choice. Affected stage of the plan: 2.
- **The generator is `@bufbuild/buf` 1.73.0 and `@bufbuild/protoc-gen-es` 2.11.0.** The generator
  matches the runtime version the workspace already has; `@bufbuild/buf` runs without its install
  script. Affected stage of the plan: 2.
