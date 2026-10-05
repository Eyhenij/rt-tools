# Plan

**Task:** RT-2539 · **Branch:** RT-2539-auth-contract-publish
**Behaviour:** unchanged — the owner's word «Опубликовать контракт 0.1.0 (Recommended)»: the work adds a publication workflow and no application code

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                         |
| ----- | --------------------------------------------- |
| Rules | `.claude/skills/deploy-flow/`                 |
| Code  | `.github/workflows/publish-auth-contract.yml` |

## What counts as done

- The publication workflow of the contract lies in main.

## Stages

### 1. Workflow

- **Steps:**
    1. Add the publication workflow
- **Readiness sign:** the workflow file parses.
- **Verified by:** `node -e "require('yaml').parse(require('fs').readFileSync('.github/workflows/publish-auth-contract.yml','utf8'))"` — exits with code 0.

## What this work does not do

- The run of the workflow — after the merge, on the contract branch.
