---
name: git-workflow-hosting
kind: rule
law: delivery
description: Rule under the delivery law for a tree on GitHub — opening a PR, its draft, review and merge, the machine account. Load for every call of the hosting client about a PR. Patterns git-workflow-pr, -pr-body.
---
<!-- rt-kit v0.37.1 · rules/git-workflow-hosting.github.md · 528a9d8fd95d · правится надстройкой, не здесь -->

# Delivery — PR, its review and the machine account

Rule under the law `docs/constitution/delivery.md`, for a tree on GitHub. Cold part: `pitfalls.md`; articles whole — `git-workflow`, `pitfalls-2.md`.

## How the law applies here

- **The PR of a task has the epic branch as its base — `gh pr create --base <ветка эпика>`.**
- **A PR in a chain has the previous branch as its base, not main.**
- **What checks a PR whose base is not the main branch is asked before the first PR of an epic opens.**
- **A code edit is handed to a person by an open PR, not by a pushed branch.**
- **What is not ready to merge opens as a draft — `gh pr create --draft`.**
- **A PR the pipeline does not wake for opens ready, without `--draft`.**
- **The PR body is written in the turn the PR opens, and next to the sample.**
- **The draft is lifted by a separate call — `gh pr ready <номер>`.**
- **The draft is not lifted from a branch that does not merge.**
- **An index that branches only append lines to is declared a union of both sides.**
- **The working tree is emptied before the PR opens, not after.**
- **A push into a branch that has an open PR is followed by rereading its body.**
- **On remarks to a PR the person is asked whether to answer under them, and after a yes each one gets an answer.**
- **The draft is not lifted while the PR has no review.**
- **The PR merge is pressed by a person, not by the work's executor.** The executor merges only on a person's word about this very PR.
- **The identity of the call opening a PR is guarded by the delivery guard, not by the executor's memory.**
- **The host client's active account is chosen per machine, not per tree; the machine account is substituted per call, never made active.**
- **The PR author cannot be its reviewer.**
- **The host client call goes from the tree, and a command chain does not check the outcome.**
- **PR labels, assignee and reviewer are set by `gh api` calls, not by `gh pr edit`:** reviewer — the repository owner, assignee — the machine account, labels — as on the task.
- **The machine commit's email is copied from the companion, not typed from memory.**
- **The identity of the machine account is confirmed by the host's answer:** asked with the token, login and number come together.
- **Every commit of the branch's contribution is signed by the machine account, and the push set checks it.**
- **The PR state is reread from the host right after publishing.**
- **Reviewers are asked by a REST call, not by the client's selection.**
