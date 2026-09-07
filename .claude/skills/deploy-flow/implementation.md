# deploy-flow — what is its own here

The names and bindings of this tree, next to the rule `SKILL.md` beside it. Work with the queue,
the branch, the commit and the request are the rule `git-workflow`, and its own lies in
`implementation.md` beside it.

## What it is called here

- **In the rule** — Here
- **a rollout** — a manual start of the publication workflow, one workflow per package
- **the changelog** — `projects/<package>/CHANGELOG.md`, the section `## [Unreleased]`

## Where it lives

- **the publication workflows** — `.github/workflows/` — `publish.yml` and one workflow per package

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section «How the law applies
here» (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **The pipeline judges by the makeup of the edit and does not run everything in a row.** — `.github/workflows/ci.yml:docs_only` — a sign computed against the main branch by the step «Состав правки»; by it the stand, the snapshots of both showcases, `verify` and both image builds are skipped.
- **What starts the rollout is named by the tree, not by the rule.** — `.github/workflows/deploy.yml:workflow_dispatch` — here the only trigger is manual: a merge rolls out nothing. What is actually rolled out is asked of the last successful rollout: `gh run list --workflow=deploy.yml --status=success --limit 1 --json headSha`.
- **The rollout goes from the merge — environment variables, secrets and name records are set before it.** — **Not carried out.** Here the rollout goes not from a merge but from a manual start, and the boundary for variables, secrets and name records is the start itself: before it, not before a merge.
- **The production stack is raised on one's own machine before the merge, not after.** — Not checked: that the stack was raised leaves no trace in the tree. The stack is `docker-compose.prod.yml`, the same one that travels to the node; it is raised by `docker compose -f docker-compose.prod.yml up`.
- **The mode sign is declared in the image, not only in the production stack.** — `deploy/message-bus.Dockerfile:NODE_ENV` — the second stage: the image is also raised past the production stack, by a manual run and by debugging on the node.
- **The image carries every file its own startup steps read.** — `deploy/message-bus.Dockerfile:prisma` — the second stage takes the schema, the migrations and the storage client config: the receiver itself does not read them, while applying storage changes does, and without them it refuses on the first raise.
- **Images are rolled out by commit sha, not by the tag "latest".** — `.github/workflows/deploy.yml:IMAGE_TAG` — the node is raised by sha; the tag «latest» is left for a person.
- **The rollout cleans up old images after itself, keeping the last three sha.** — `deploy/prune-images.sh:KEEP` — the rollback depth, the last three; an image tagged by sha is never dangling, and a cleanup of dangling ones does not touch it.
- **The machine that builds the images cleans up after itself too.** — **Not applicable.** This tree neither builds nor rolls out images: it ships packages to the package registry
- **A production breakage that has happened is analysed in a record, not by a fix alone.** — Not checked: that production was down leaves no trace in the tree, and there is nothing to tie the fix to the record with. The records live in the intake, and the form is held by the rule `doc-style`.
- **An edit to the rollout itself is run before the merge, and "I will check after the merge" is never the executor's decision.** — Not checked: a manual start of the rollout workflow on a branch leaves no trace in the tree, and the owner word about a postponed check lies outside the repository. It is held by this article and by the article about a manual run above.
- **The description of production is edited together with the production stack.** — `.claude/rt-kit/project.sh:rt_docs_pair_for` — the pair «an edit and its document», guarded by `.claude/hooks/docs-guard.sh`.
- **An edit to the pipeline is run before the merge with a manual run.** — `.github/workflows/deploy.yml:workflow_dispatch` — it starts on any branch, while the rollout itself is nailed by a condition to the main one.
- **A PR is checked before the merge by the same pipeline as the main branch.** — `.github/workflows/ci.yml:pull_request` — the checks and the image builds go on this event; there is no rollout among them.
- **A divergence of production from the main branch is visible by the work queue audit.** — `tools/board-runs.mjs:deployLag` — the last successful rollout against the tip of the main branch; the workflow and the branch are named in `.claude/rt-kit/checks.json` by the key `deploy`. The line is printed by `tools/check-board.mjs`.
- **The migration chain is run from an empty storage before the merge.** — Not checked: the migrations are in the tree, and there is no audit against an empty storage — it was filed as the task RT-663 and never reached the gate.
- **The divergence of migrations from the schema is measured on a shadow storage, not on the one the pusher works with.** — `tools/check-schema-drift.mjs:SHADOW_SUFFIX` — a shadow database is created next to the working one; the gate and the rollout call the same check.
- **Skipping the schema audit is lawful while the branch has not touched the storage.** — `tools/check-schema-drift.mjs:unavailable` — stands in the push gate set as the line `node tools/check-schema-drift.mjs`; the scenario SC-AK-822
- **A failed rollout is visible by the work queue audit apart from lagging production.** — `projects/agent-kit/assets/checks/board-runs.github.mjs:lastDeploy` — the rollout workflow is named by the key `deploy.workflow` in `.claude/rt-kit/checks.json`; the scenario SC-AK-824
- **A check standing in the gate set refuses when it could not do its work.** — **Not checked.** Telling «there is nowhere to check» from «the check is broken» can only be done by the check itself, each in its own way; there is no shared sign by which this would be judged from outside. What has piled up is fixed one check at a time.
