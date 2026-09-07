---
name: deploy-flow
kind: rule
law: delivery
description: Rule under the delivery law for a tree on GitLab — the part about the rollout. Load when an edit goes to production — merge into the main branch, the pipeline, images and tags, storage migrations. Patterns git-workflow-migration, -restart, -docker, -secrets. Task and branch — rule git-workflow.
---

# Rollout — how it works here

Rule under the law `docs/constitution/delivery.md` — the part of it about production. The law
says what must be true; here — by which technique it is held in a tree that lives on GitLab.
Working with the queue, the branch, the commit and the PR — the rule `git-workflow` under the
same law.

## What it is called here

| In the law                            | Here                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------- |
| an edit reaching the main branch      | an MR merge; what starts the rollout — the merge or a manual run — is named by the companion next to it |
| the image of that commit              | `IMAGE_TAG=<sha>` in the `docker compose` commands on the server                                  |
| a storage change                      | a migration in `prisma/migrations/<метка>_<имя>/`                                                 |

## Where it lives

In this tree — the table in `implementation.md` next to it. Paths live there, not here: the rule
travels between repositories, the layout does not, and a path named in the rule lies in the
first tree that keeps its code differently.

## Flow

The flow of a rollout: what leaves for production, how the image is tagged and what is done with
the old ones.

```mermaid
flowchart TD
    A[Merge into the main branch] --> B{The edit touched code}
    B -->|No| C[Build steps are skipped by the sign of the edit's makeup]
    B -->|Yes| D[The image is built and tagged with the sha of that commit]
    D --> E{The storage changes with this edit}
    E -->|Yes| F[The migration chain was run from an empty storage before the merge]
    E -->|No| G[The image is rolled out by sha, not by the tag "latest"]
    F --> G
    G --> H[Old images are removed, the last three sha stay as rollback depth]
    H --> I{Production answers with what was rolled out}
    I -->|No| J[Rollout analysis: the restart goes by sha, not by the latest tag]
    I -->|Yes| K[The work queue audit reads the last run of the main branch]
    C --> K
    J --> K
```

## How the law applies here

- **The pipeline judges by the makeup of the edit and does not run everything in a row.** Steps
  with nothing to check are skipped by a sign computed from the main branch: a branch that touched
  no line of code raises no stand, takes no frames and builds no images. The `rules:changes` rules
  count this themselves, but by paths, not by the makeup of the edit — a path match does not yet
  mean the build is touched, so the sign is declared explicitly and once. A skipped step is
  visible in the run as skipped — one that silently dropped out reads as passed.
- **What starts the rollout is named by the tree, not by the rule.** In one tree production
  moves on a merge, in another on a manual run, and an unconditional statement here lies about the
  second: the rule enters the context of every session, and whoever reads it takes the merged as
  rolled out. Production hundreds of commits behind the main branch was read exactly that way, as
  an application breakage. The line stands in the companion next to it, together with the way to
  ask what is actually rolled out.
- **The rollout goes from the merge — environment variables, secrets and name records are set
  before it.** The pipeline's `only`/`rules` rules cover documents separately. A tree with a manual
  run reads this article differently: there the border is the run itself, and the same is set
  before it.
- **The mode sign is declared in the image, not only in the production stack.** A value set by
  the stack acts only on a container raised by that stack; a manual run of the same image goes
  with an empty value, and empty here means localhost — with all the debugging defaults it allows.
  The image default is set in the image itself.
- **Images are rolled out by commit sha, not by the tag "latest".** The tag in the registry lags
  behind the main branch, and production silently falls back to the previous version while still
  answering.
- **The rollout cleans up old images after itself, keeping the last three sha.** An image tagged
  with a sha is never dangling, and a dangling cleanup does not touch it: in half a year they eat
  the server disk whole. Three sha is the rollback depth, and fewer cannot be taken: a breakage
  noticed two rollouts later has nowhere left to roll back to.
- **The description of production is edited together with the production stack.** The layout,
  the request path, the gates and the backups are described in texts outside the rules layers, and
  neither linter nor build reads them: the divergence piles up silently, and these texts are read
  as current. The pair is watched by the documents guard.
- **An edit to the pipeline is run before the merge with a manual run.** The pipeline starts on any
  branch, while the rollout step is pinned by a rule to the main branch: a run for the sake of
  checking reaches the builds and ends there. Running the step's commands on one's own machine
  does not cover it: that checks the commands, not the pipeline file — the correctness of the file
  itself is read only from the list of pipelines after the push, and the syntax is judged
  separately by the `.gitlab-ci.yml` check in the project.
- **A PR is checked before the merge by the same pipeline as the main branch.** Checks and image
  builds go on the MR pipeline, the rollout does not: it is held by the main-branch
  rule on its step, and a PR image does not leave for the registry.
- **A divergence of production from the main branch is visible by the work queue audit.** A task
  leaves the queue by a merge, but a merge is not yet production: a failed or unstarted rollout
  touches neither the task nor its list, and there is nowhere to notice it. The audit asks for
  the last successful rollout and counts how far the main branch has gone from it. The main-branch
  run is no use for that: where the rollout is started by hand, a merge does not move production
  at all, and the run says nothing about it — production was 476 commits behind, and the audit was
  silent. A tree that has not named its rollout workflow gets no audit, and it says so out loud.
- **The migration chain is run from an empty storage before the merge.** The apply order is
  lexicographic by directory name, and the timestamp is set at creation: a migration from a branch
  started earlier lands before the one it depends on.
- **The divergence of migrations from the schema is measured on a shadow storage, not on the one
  the pusher works with.** That one lawfully carries the trace of any unfinished branch, and a
  check against it would hold up someone else's edit. The gate and the rollout call one and the
  same check — otherwise "matched" would mean different things in two places.
- **Skipping the schema audit is lawful while the branch has not touched the storage.** A stopped
  database is a state of the machine, not a reason to refuse a documentation push; but a branch
  that edited the schema or the migrations leaves for main blind without a chain run, and it is not
  the branch that falls but the rollout. In such a branch the check refuses and names how to bring
  the database up.
- **A failed rollout is visible by the work queue audit apart from lagging production.** A merge
  is not yet a rollout: a failed one leaves the main branch ahead of the server, and merges on top
  go the same way. The lag is counted from the last successful rollout and does not tell "not
  started" from "failed".

- **A check standing in the gate set refuses when it could not do its work.** "Nowhere to check"
  and "the check is broken" are different things: the first the tree names itself — no subject, no
  address set, the service not answering — and each such exit returns zero with its own line. The
  second — a missing package, an empty name in the settings, an unexpected exception — returns a
  non-zero code and says that the check itself broke, not the subject. A shared zero for both makes
  a broken check indistinguishable from a passed one: the schema-to-migrations audit stood like that
  in the gate set, checking nothing, and hid three causes at once behind its zero.

## What of the law is not here

The state of production is not visible to the machine: the work queue audit asks for the last
run of the main branch and judges by it, and nobody asks whether production answers with the
build it rolled out. That is held by whoever rolled out.

Nothing counts the completeness of the registry cleanup: the script keeps the last three sha,
and a miss in its selection shows only when the server disk has run out.

## Patterns

- `git-workflow-migration` — editing the storage schema and its migrations.
- `git-workflow-restart` — a manual production restart.
- `git-workflow-docker` — images on one's own machine: the daemon, the registry, building for
  the server platform.
- `git-workflow-secrets` — keys of external services: where they live, how they are created,
  what their state says.
