# Grill

Cargo records this task works on, by full keys (all of them foreign; the signs in the intake are
what `cargo:close` takes):

- `222d988b5bdd8990208caabc3d7d07b358eede9fbe1b81cad7b1178cd7964c08` · sign `2e027ec9-42c8-44cb-b7a2-7f3a981ee42e` — dispatcher refusal text
- `1e0ac9eb9da0fa4678bbaaea99e306a1aa20830336eb6992275f5448a71345a7` · sign `76a77d16-d3e0-4956-90e3-8d25688b0f0b` — re-arm line
- `ca3f1772ac6958648334b41e38ec9b83be050051b9cce638e2fadd02befa8954` · sign `f9736707-aa4c-4015-8e63-74ab03ebb38e` — re-arm names the loaded rules
- `f4a9a37ed741c13d929ce455ed7a4d410343c8a91b075cc63501cc2df587b096` · sign `071caaf7-832b-45d1-954f-8f00c08118de` — interpreter read versus write
- `c718823a3e574fa2ea85a4a9f84f2ad0b043d335e6c73c693d9510d984788f1c` · sign `d309f28b-c0d6-4d61-9bef-847d25a18245` — merged epic branch as base
- `615f8fa5d2b8f7a4690daed30a91effed81fbacb4696484c44ae5ffa797870e5` · sign `8711d67c-c7f9-4eff-842e-1b95570b033e` — base checked on the host
- `c8a7d0cecaf81c65422e3111b5ebe5fb8a0f6ca82eb1034647a1fda513b738eb` · sign `2a52a0f9-442e-4ffc-835a-a935a7cac90f` — epic stop refusal text
- `f8a720b97ab4e772cbf49b4df181e2f6492b0698769b95adb620a953949bf7c7` · sign `b65c7039-167d-4646-b8e9-138478a6dcb4` — label precheck in `task:new`
- `d7bc79ab9795fd263cb6dca84bd65a8f83d99d6d991f4536e8106466420f51f7` · sign `b62fc8eb-560b-49f2-8c13-7ff661d4c44a` — lost colon in a binding cell
- analysis `2026-10-01-api-raised-past-dev-server-guard.md` · sign `b2cd499e-ceb2-41ba-9199-132fc6abbf2e` — part (b) only, the empty refusal

Rejected on the way, with reasons, in `docs/plans/cargo-october.md`: `423f89b6…` (one rule at a time
is deliberate), `047ed480…` (falls with the `defaults/shell.sh` edit).

## The owner request

> разбери всё новое что есть в приёмнике

Then, at the scope menu: «Все 22 по риску: 3 задачи» and «Завести отдельную особенность пакета».
Later: «я прямо поставил тебе задачу».

## What the tree already has

- The package sources are in `projects/agent-kit/assets/`, their tests in `projects/agent-kit/tests/`,
  and the package specs in `docs/specs/agent-kit/<domain>/` (dispatch, rule-gate, delivery-epic,
  epic-stop, specs-entry, board).
- `hooks/dispatch.sh` already prints a branch refusal to standard output and exits with the branch
  code; `SC-AK-860` covers a refusal said into the error stream.
- `hooks/task-flow-guard.sh` already lets a code file in an unmerged conflict pass (SC-AK-1180/1181).

## What the rules already say

- Rule `task-flow`: the owner's instruction holds until they cancel it.
- Rule `git-workflow`: the epic branch is merged into the task branch, and the base of a task PR is
  the epic branch while it is open.

## Questions and answers

**What to take of the intake's records?**
«Все 22 по риску: 3 задачи» — this task is the first, the hooks and checks code.

**What about the design-tool records?**
«Завести отдельную особенность пакета» — task RT-2848.

## Decisions

- **Reproduce before editing.** Each symptom is reproduced in the package tests first. The empty
  refusal of the dispatcher is the one the sender's text cannot prove: the refusals in this very
  session arrive with their text, so the claim "exit 2 reads only the error stream" is checked by a
  test of the real stream split and, if it does not reproduce, the record is reported back as not
  reproducible instead of changed.
- **One edit for the two re-arm records.** The hook reads the names of the loaded rules before
  removing the record and prints them in the context line.
- **`defaults/shell.sh` names its new price in the header.** A write by a rarer call passes unseen,
  and the header says so, as the old "wide on purpose" text did for its own price.
- **The dev-server guard's port logic is not in this task.** It needs a design of its own.

## What is left unclear

- Whether a closed epic is read from the epic card or from the epic tip being reachable from
  `origin/main`; the exploration of `hooks/git-guard-delivery-epic.sh` decides it.
