# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Review and closing
- **Done:** stages 1 and 2; the findings of `rules-reviewer` and of the first review round are fixed; RT-3261 and RT-3262 are filed for what is out of scope
- **Next step:** merge the epic branch in, the second review round, the push gate, the archive record
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
- **What the role named optional went into task RT-3262:** the name «Merge when pipeline succeeds»,
  the commit link form `AB#`, the one-sided article about a ready opening. Affected stage of the plan: 3.
- **The base from the epic branch on GitLab and Azure is held by memory, and the rules say so.** The
  delivery guard reads the base from `--base` alone; the code is task RT-3261. Affected stage of the
  plan: 1.

## Sessions

### 2026-11-12

- The epic branch took the main branch (24 commits) and the branch of RT-3196 took the epic branch:
  the delivery guard refused the new branch without both. Both push sets are green.
