---
name: deploy-flow
kind: rule
law: delivery
description: Rule under the delivery law for a tree on GitLab — the part about the rollout. Load when an edit goes to production — merge into the main branch, the pipeline, images and tags, storage migrations. Patterns git-workflow-migration, -restart, -docker, -secrets. Task and branch — rule git-workflow.
---

# Rollout — how it works here

Rule under the law `docs/constitution/delivery.md` — the part of it about production. Cold part:
`pitfalls.md` — the whole text, every section and article with its reasons.

## How the law applies here

- **The pipeline judges by the makeup of the edit and does not run everything in a row.**
- **What starts the rollout is named by the tree, not by the rule.**
- **The rollout goes from the merge — environment variables, secrets and name records are set before
  it.**
- **The mode sign is declared in the image, not only in the production stack.**
- **The image carries every file its own startup steps read.**
- **Images are rolled out by commit sha, not by the tag "latest".**
- **The rollout cleans up old images after itself, keeping the last three sha.**
- **A production breakage that has happened is analysed in a record, not by a fix alone.**
- **An edit to the rollout itself is run before the merge, and "I will check after the merge" is
  never the executor's decision.**
- **The description of production is edited together with the production stack.**
- **An edit to the pipeline is run before the merge with a manual run.**
- **An MR is checked before the merge by the same pipeline as the main branch.**
- **Which MRs the pipeline wakes for is named by the tree, and it sets the order of handing in.**
- **A package the tree's own applications install is released from a tip their end-to-end suites
  went green on.**
- **A divergence of production from the main branch is visible by the work queue audit.**
- **The migration chain is run from an empty storage before the merge.**
- **A migration without a reverse is merged only after a copy of the production storage, and the MR
  description names the copy.**
- **The divergence of migrations from the schema is measured on a shadow storage, not on the one the
  pusher works with.**
- **Skipping the schema audit is lawful while the branch has not touched the storage.**
- **A failed rollout is visible by the work queue audit apart from lagging production.**
- **A check standing in the gate set refuses when it could not do its work.**
- **The merge button and the manual rollout run get their requirement at the host.**
