# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Review and closing
- **Done:** stages 1 and 2; the role `rules-reviewer` named 19 findings, the must-fix ones and four of the rest are fixed, the graph is rebuilt
- **Next step:** the push gate, then the archive record and the PR body
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Add the epic layer to the GitLab and Azure variants of git-workflow
- [x] 1.2 Add the articles about a ready PR and about the merge by a person there
- [x] 1.3 Add the four rollout articles to the GitLab and Azure variants of deploy-flow
- [x] 1.4 Add the article about the requirement before an irreversible step to deploy-flow
- [x] 2.1 Add the sections of points and of the goal to the PR body samples of GitLab and Azure
- [x] 2.2 Name the epic branch as the base in the PR patterns of both hosts
- [x] 3.1 Run the role rules-reviewer over the host variants of the delivery family
- [x] 3.2 Fix what the role names
- [x] 3.3 Rebuild the rules graph and its report
- [>] 3.4 Run the push gate
- [ ] 3.5 Take the task folder apart into the archive

## Decisions along the way

- **On Azure a PR that waits only for the run opens ready.** The check pipeline does not start on a
  draft there, so a draft waiting for a run waits for nothing. Affected stage of the plan: 1.
- **The calls of a chain for each host went into the PR patterns, not into the rules.** The Azure
  rule has about 800 characters of room. Affected stage of the plan: 2.
- **Left as is, named by the role as optional:** the name «Merge when pipeline succeeds» in the
  GitLab rule, the commit link form `AB#` in the Azure rule, the one-sided article about a ready
  opening — the GitHub rule has the same. Affected stage of the plan: 3.

## Sessions

### 2026-11-12

- The epic branch took the main branch (24 commits) and the branch of RT-3196 took the epic branch:
  the delivery guard refused the new branch without both. Both push sets are green.
