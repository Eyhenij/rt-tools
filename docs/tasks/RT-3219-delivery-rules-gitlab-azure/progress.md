# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — Patterns
- **Done:** stage 1 — the epic layer and two articles in `git-workflow` for GitLab and Azure, four rollout articles there, the article about the irreversible step in all three `deploy-flow`
- **Next step:** the sections «Точки» and «Цель» in the PR body samples of GitLab and Azure. The work is set aside for #3187 by the owner's word
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Add the epic layer to the GitLab and Azure variants of git-workflow
- [x] 1.2 Add the articles about a ready PR and about the merge by a person there
- [x] 1.3 Add the four rollout articles to the GitLab and Azure variants of deploy-flow
- [x] 1.4 Add the article about the requirement before an irreversible step to deploy-flow
- [>] 2.1 Add the sections of points and of the goal to the PR body samples of GitLab and Azure
- [ ] 2.2 Name the epic branch as the base in the PR patterns of both hosts
- [ ] 3.1 Run the role rules-reviewer over the host variants of the delivery family
- [ ] 3.2 Fix what the role names
- [ ] 3.3 Rebuild the rules graph and its report
- [ ] 3.4 Run the push gate
- [ ] 3.5 Take the task folder apart into the archive

## Decisions along the way

## Sessions

### 2026-11-12

- The epic branch took the main branch (24 commits) and the branch of RT-3196 took the epic branch:
  the delivery guard refused the new branch without both. Both push sets are green.
