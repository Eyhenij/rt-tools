---
name: git-workflow-hosting
kind: rule
law: delivery
description: Rule under the delivery law for a tree on GitLab — opening an MR, its draft, review and merge, the machine account. Load for every call of the hosting client about an MR. Patterns git-workflow-pr.
---

# Delivery — MR, its review and the machine account

Rule under the law `docs/constitution/delivery.md`, for a tree on GitLab. Cold part: `pitfalls.md`; articles whole — `git-workflow`, `pitfalls-2.md`.

## How the law applies here

- **The MR of a task has the epic branch as its base — `glab mr create --target-branch <ветка эпика>`.**
- **An MR in a chain has the previous branch as its base, not main.**
- **A code edit is handed to a person by an open MR, not by a pushed branch.**
- **What is not ready to merge opens as a draft — `glab mr create --draft`.**
- **An MR the pipeline does not wake for opens ready, without the draft flag.**
- **What checks an MR whose base is not the main branch is asked before the first MR of an epic opens.**
- **The working tree is emptied before the MR opens, not after.**
- **A push into a branch that has an open MR is followed by rereading its description.**
- **On remarks to an MR the person is asked whether to answer under them, and after a yes each one gets an answer.**
- **The draft is lifted by a separate call — `glab mr update <номер> --ready`.**
- **The MR merge is pressed by a person, not by the work's executor.** The executor merges only on a person's word about this very MR.
- **The draft is not lifted while the MR has no review.**
- **A branch with an open MR lags behind its base silently.**
- **MR labels and assignee are set at creation, not by an edit after.**
