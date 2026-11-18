---
name: git-workflow-push
kind: rule
law: delivery
description: Rule under the delivery law for a tree on Azure DevOps — the commit and the set before a push. Load for a commit and a push. Pattern git-workflow-commit.
---

# Delivery — the commit and the push set

Rule under the law `docs/constitution/delivery.md`, for a tree on Azure DevOps. Cold part: `pitfalls.md`; articles whole — `git-workflow`, `pitfalls-2.md`.

## How the law applies here

- **A document goes in the same commit as the edit.**
- **The commit subject is checked against the format on the spot.**
- **Before a push all linters are run, not one.**
- **The build is in the set on a par with lint and unit tests.**
- **On a machine with several runners, any path from the home directory is shared.**
- **The push gate set is never narrower than the pipeline set.**
- **The final set before a push is read from the state review, not assembled in the head.**
- **A push is sent only by the path the push guard stands on.**
- **A review of a foreign branch starts with the gate set run on its tip.** The wording check runs apart over the changed texts; the output goes into the review.
- **Where neither the session's push guard nor the git hook fires, the set is run whole, as read at the minute of the run.**
- **An exclusion reason naming a work item is judged on whether that work item is alive.**
- **The layout audit stands in the push gate set on a par with lint and the build.**
- **After merging the base in, the check set is revised by what the branch now carries.**
- **A merge with auto-complete does not replace the checks before a push.**
- **Guard scenarios set the git settings themselves, not take them from the machine.**
