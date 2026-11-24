---
name: git-workflow-hosting
kind: rule
law: delivery
description: Rule under the delivery law for a tree on Azure DevOps — opening a PR, its draft, review and merge, the machine account. Load for every call of the hosting client about a PR. Patterns git-workflow-pr.
---

# Delivery — PR, its review and the machine account

Rule under the law `docs/constitution/delivery.md`, for a tree on Azure DevOps. Cold part: `pitfalls.md`; articles whole — `git-workflow`, `pitfalls-2.md`.

## How the law applies here

- **The PR of a work item has the epic branch as its base — `az repos pr create --target-branch <ветка эпика>`.**
- **A PR in a chain has the previous branch as its base, not main.**
- **A code edit is handed to a person by an open PR, not by a pushed branch.**
- **What is not ready to merge opens as a draft — `az repos pr create --draft true`.**
- **A PR the pipeline does not wake for opens ready, without the draft flag.**
- **What checks a PR whose base is not the main branch is asked before the first PR of an epic opens.**
- **The working tree is emptied before the PR opens, not after.**
- **A push into a branch that has an open PR is followed by rereading its body.**
- **On remarks to a PR the person is asked whether to answer under them, and after a yes each one gets an answer.**
- **The draft is lifted by a separate call — `az repos pr update --id <номер> --draft false`.**
- **The PR merge is pressed by a person, not by the work's executor.** The executor merges only on a person's word — about this PR or a named allowance.
- **A branch with an open PR lags behind its base silently.**
- **A work item is bound to the PR at creation, not after.**
