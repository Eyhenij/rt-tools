# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 3 — Rules
- **Done:** the branch stands on RT-3196, the folder and the plan are written
- **Next step:** the epic layer in `git-workflow.gitlab`
- **Uncommitted:** no
- **Waiting for the owner:** the merge of #3224; the PR of this task opens after it — «не переходишь к следующему пр пока не влит предыдущий»
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [>] 1.1 Add the epic layer to the GitLab and Azure variants of git-workflow
- [ ] 1.2 Add the articles about a ready PR and about the merge by a person there
- [ ] 1.3 Add the four rollout articles to the GitLab and Azure variants of deploy-flow
- [ ] 1.4 Add the article about the requirement before an irreversible step to deploy-flow
- [ ] 2.1 Add the sections of points and of the goal to the PR body samples of GitLab and Azure
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
