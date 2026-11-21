---
name: deploy-flow
kind: rule
law: delivery
description: Rule under the delivery law for a tree on GitHub — the rollout. Load when an edit goes to production: the merge, the pipeline, images, migrations. Patterns git-workflow-migration, -restart, -docker, -secrets. Task and branch — rule git-workflow.
---
<!-- rt-kit v0.38.0 · rules/deploy-flow.github.md · 1f694a7eb7ca · правится надстройкой, не здесь -->

# Rollout — how it works here

Rule under the law `docs/constitution/delivery.md`. Cold part: `pitfalls.md`.

## How the law applies here

- **The pipeline judges by the makeup of the edit.**
- **What starts the rollout is named by the tree.**
- **Variables, secrets and name records are set before the merge.**
- **The production run mode is set in the image itself.**
- **The production stack is raised locally before the merge.** A package bump too.
- **A variable read by several procedures goes first to a production-build stand.**
- **The production name is confirmed by its live answer.** A moved domain: search the old name.
- **Data screens need and migrations do not create is a rollout step.** Rerun-safe.
- **A runner move is closed by a label search across all workflows.**
- **The epic plan is checked against the rollout pitfalls before the epic merge.**
- **The image carries every file its startup reads.**
- **Images roll out by commit sha, not "latest".**
- **The build machine cleans up after itself.** One script for both; the builder named.
- **The rollout keeps the last three image sha.**
- **A production breakage gets a record, not only a fix.**
- **A rollout edit runs before the merge, never "after".** Else the owner hears the cost and
  decides; dev-machine production keys need their word.
- **The production description changes with the production stack.**
- **A pipeline edit runs before the merge by a manual run.** Not for a trigger edit.
- **A PR is checked by the main branch's pipeline.**
- **Which PRs wake the pipeline is named by the tree and sets the hand-in order.**
- **A package the tree's applications install is released from a tip their suites passed.**
- **Production lagging main shows in the work queue audit.**
- **The migration chain runs from empty storage before the merge.**
- **A migration with no reverse merges after a production storage copy named in the PR.**
- **Migration drift is measured on a shadow storage.**
- **The schema audit is skipped only while storage is untouched.**
- **A failed rollout shows in the audit apart from lag.**
- **A gate check that could not work refuses.** Nothing to check: skip code; the owner's word counts
  only when told it did not run.
- **The merge button and the manual run get their requirement at the host.** Else the PR's
  remaining step names it to the presser.

## This tree

- **A merge rolls nothing out: the owner starts `deploy.yml` by hand.** A refused press is not repeated another way; name what waits, follow the run.
