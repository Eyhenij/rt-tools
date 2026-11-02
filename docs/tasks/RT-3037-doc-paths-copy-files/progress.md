# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — hand-over
- **Done:** stage 1 — both entries reached `main` with PR #3014; a fresh copy of the branch gives
  zero divergences
- **Next step:** 2.1 — the push set `rt_push_checks` whole on the head of this branch
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Take the branch from the previous branch of the chain, `RT-3036-pr-base-refresh`.
- [x] 1.2 Add `.claude/rt-kit/tree-name` and `.claude/handoff/` to the `paths` of `tools/doc-paths-allowlist.json`, each with its reason and `"task": "RT-3037"`.
- [x] 1.3 Run `node tools/check-doc-paths.mjs` in a fresh detached copy of the branch: zero divergences.
- [>] 2.1 The push set `rt_push_checks` whole, green.
- [ ] 2.2 The folder taken apart into `docs/archive/RT-3037-doc-paths-copy-files.md`.
- [ ] 2.3 The PR into the base of the chain, the column moved to review.

## Decisions along the way

- **The list already holds an entry of the same kind.** `.claude/rt-kit/browser-device-id` stands
  under RT-1871 with the reason «a file of the machine, deliberately outside version control». The
  two new entries follow its form. Affected stage of the plan: 1.
- **Step 1.2 was done by PR #3014, not by this branch.** The owner merged it on 2026-11-02 as
  `b71bbc781`, and its branch already carried both entries under RT-3037. After `main` was merged
  into `RT-3036-pr-base-refresh` and this branch was moved onto it, the list holds both lines, and a
  fresh detached copy of the branch gives «documents checked 1056, no divergences». This branch
  edits no line of the list. Affected stage of the plan: 1.
