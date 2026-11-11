# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — Findings
- **Done:** the folder, the plan; the role rules-reviewer started over the family
- **Next step:** read the role's findings, run the binding comparison
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [>] 1.1 Run the role rules-reviewer over the whole family
- [ ] 1.2 Compare rule articles with the companion bindings and hook code
- [ ] 1.3 Write the findings list into the progress with a decision for each
- [ ] 2.1 Edit the package texts by the findings
- [ ] 2.2 Build the package and lay out the tree
- [ ] 2.3 File tasks for findings that need code or another law
- [ ] 3.1 Rebuild the rules graph and its report
- [ ] 3.2 Run the push gate
- [ ] 3.3 Take the task folder apart into the archive

## Findings

Role rules-reviewer, 11.11.2026 (decisions pending):

- **D1** GitLab and Azure `git-workflow` have no epic layer; their patterns and the law depend on one.
- **D2** `git-workflow` flows (all three) take the folder apart after the PR opens; «two signs» of a
  draft and the pitfall about a draft carrying its folder keep the old order.
- **D3** `git-workflow-pr.github` «There are no checks on the PR itself» vs its own draft article and
  `deploy-flow.github`.
- **D4** `deploy-flow` (all three) flow and «not here» say the audit reads the main-branch run; prose
  says the last successful rollout. `queue-audit.github` flow too.
- **D5** `git-workflow-migration` «skips silently» on a stopped database vs `deploy-flow` «refuses».
- **D6** GitLab/Azure miss «opens ready where the pipeline does not wake».
- **D7** A PR on a base with no run: pr.github opens ready, queue-audit silent, pr-ready treats empty
  as red, freshness waits.
- **D8** Rebase in `git-workflow-stack` and `git-workflow-merge` vs the law «by merging».
- **D9** main merged into a task branch in merge, freshness, queue-audit-read, pr.github (`main...HEAD`)
  vs the law: the epic branch into the task branch.
- **D10** Build in the push gate: rules yes, pr patterns item 6 no.
- **D11** «the merge rolls out» unconditional in `git-workflow-restart` and `dependencies`.
- **D12** PR body sections: six vs four; item 10 lists three.
- **D13** Azure PR title example carries a task key the host has none of.
- **D14** `git-workflow-migration` and `-restart` name `.github/workflows/deploy.yml` for all hosts.
- **D15** Scopes listed in `git-workflow-commit.github` vs «scopes: implementation.md».
- **D16** «Item 1 changes with it — no run is asked for» in pr.github: stale item number.
- **G1** deploy-flow gitlab/azure miss four law articles github has.
- **G2** queue-audit names fewer audit lines than the family promises.
- **G3** GitLab/Azure: «merged by a person» only in the flow graph.
- **G4** `git-workflow-restart` points to a migration split that does not exist.
- **G5** Law article «A requirement before an irreversible step stands where the step is taken» has
  no rule line.
- **Pairs:** «task created by a command» belongs to `git-workflow` (drop from `task-flow-start`);
  «PR refused while the branch carries its folder» belongs to `task-flow` (drop from
  `git-workflow.github`, fix the three flows).

## Decisions along the way

## Sessions

### 2026-11-11

- Folder, plan; baseline: 43 articles of the family held by memory, 23 pairs of repeats.
