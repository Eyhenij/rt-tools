# Plan

**Task:** RT-3219 · **Branch:** RT-3219-delivery-rules-gitlab-azure
**Behaviour:** unchanged — the owner ordered a revision of the package texts, «По семьям законов, правки сразу»; application code is not touched

## Points

- **A:** a tree on GitLab or Azure gets delivery rules without the epic layer: the rule sends task
  branches off the main branch and opens the PR into it, while the law and the shared patterns
  demand the epic branch. `deploy-flow` there has 17 articles against 28 for GitHub, and the PR body
  sample has three headings against five.
- **This task reaches:** the GitLab and Azure variants of `git-workflow`, `deploy-flow` and
  `git-workflow-pr` say the same as the GitHub one on the six points of the task, in the words of
  each host.
- **Sign:** the role `rules-reviewer` over the delivery family names no divergence between the host
  variants on these points; `pnpm run agent-kit:check` and `npm run check:spec-coverage` exit 0.
  The owner sees it in the PR body.
- **Milestone G of the epic:** a new version of `@rt-tools/agent-kit` on npm carries the revised
  texts of the four families.
- **Metric:** нет: the GitLab and Azure rules contradicted the law and their own patterns — a tree
  that followed them took branches from the main branch.

## Task footprint

| What     | Where                                                                               |
| -------- | ----------------------------------------------------------------------------------- |
| Law      | `projects/agent-kit/assets/laws/delivery.md` — read only                            |
| Rules    | `projects/agent-kit/assets/rules/` — git-workflow and deploy-flow, three hosts each |
| Patterns | `projects/agent-kit/assets/patterns/` — git-workflow-pr for GitLab and Azure        |
| Specs    | `docs/specs/agent-kit/`                                                             |

## What counts as done

- The six points of the task body are each closed by an edit named in the archive record.
- `pnpm run agent-kit:check`, `npm run check:specs`, `npm run check:spec-coverage` and
  `node tools/check-file-size.mjs` exit 0.
- The role `rules-reviewer` names no divergence between the host variants on the six points.

## Stages

### 1. Rules

- **Steps:**
    1. Add the epic layer to the GitLab and Azure variants of git-workflow
    2. Add the articles about a ready PR and about the merge by a person there
    3. Add the four rollout articles to the GitLab and Azure variants of deploy-flow
    4. Add the article about the requirement before an irreversible step to deploy-flow
- **Readiness sign:** both host variants fit the prose limit and the package builds.
- **Verified by:** `node tools/check-file-size.mjs` — exits 0; `pnpm run agent-kit:check` — prints
  «разложенное сходится с пакетом».

### 2. Patterns

- **Steps:**
    1. Add the sections of points and of the goal to the PR body samples of GitLab and Azure
    2. Name the epic branch as the base in the PR patterns of both hosts
- **Readiness sign:** the body samples of the three hosts carry the same headings.
- **Verified by:** `npm run check:spec-coverage` — prints «every resource the package carries is
  spoken of by a spec».

### 3. Review and closing

- **Steps:**
    1. Run the role rules-reviewer over the host variants of the delivery family
    2. Fix what the role names
    3. Rebuild the rules graph and its report
    4. Run the push gate
    5. Take the task folder apart into the archive
- **Readiness sign:** the role names no divergence on the six points, the gate is green.
- **Verified by:** `npm run graph:rules` — prints «0 unlinked».

## What this work does not do

- Does not edit the law: it is read only.
- Does not touch hooks and checks: a guard for the epic branch on GitLab and Azure, if one is
  missing, is a task of its own.
- Does not review the GitHub variant again: RT-3194 did.
- RT-3220, the cleanup after the rollout build, is the next task of the epic.
