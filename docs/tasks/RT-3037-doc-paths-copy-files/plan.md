# Plan

**Task:** RT-3037 · **Branch:** RT-3037-doc-paths-copy-files
**Behaviour:** unchanged — the edit touches the known list of a tree check and no package code;
the owner's word: «если путь мёртв из-за общего правила дерева — вынеси отдельной задачей, не
закрывай чужим номером»

## Task footprint

| What  | Where                                                                      |
| ----- | -------------------------------------------------------------------------- |
| Specs | none — the check belongs to the tree tooling, not to a package             |
| Laws  | `docs/constitution/verifiability.md` — known lists of checks               |
| Rules | `.claude/skills/testing/` — every entry carries its reason and task number |
| Code  | `tools/doc-paths-allowlist.json`                                           |

## What counts as done

`node tools/check-doc-paths.mjs` gives zero divergences in a fresh detached copy of the branch,
where neither `.claude/rt-kit/tree-name` nor `.claude/handoff/` exists; on `origin/main` the same
command gives five today. Both entries carry `"task": "RT-3037"` and a reason of their own.

## Stages

### 1. The two entries

- 1.1 Take the branch from the previous branch of the chain, `RT-3036-pr-base-refresh`.
- 1.2 Add `.claude/rt-kit/tree-name` and `.claude/handoff/` to the `paths` of
  `tools/doc-paths-allowlist.json`, each with its reason and `"task": "RT-3037"`.
- 1.3 Run `node tools/check-doc-paths.mjs` in a fresh detached copy of the branch: zero
  divergences.

### 2. Hand-over

- 2.1 The push set `rt_push_checks` whole, green.
- 2.2 The folder taken apart into `docs/archive/RT-3037-doc-paths-copy-files.md`.
- 2.3 The PR into the base of the chain, the column moved to review.

## What the work does not do

- It does not teach the check to pass addresses covered by `.gitignore`: the grill records why.
- It does not touch the two entries in the branch of PR #3014: that branch is not merged by the
  owner's word, and its lines already carry this number.
