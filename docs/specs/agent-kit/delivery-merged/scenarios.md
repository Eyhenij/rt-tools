# Scenarios — the push into a branch whose PR is merged

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain.

### SC-AK-1233 — a push into a branch whose PR is merged is refused

Given the host answers that the branch has a merged PR and no open one
When the executor pushes that branch, by name or as the checked-out one
Then the push is refused with the number of the merged PR; a dry run, a branch with no merged PR and
a tree with no profile function pass

Covered: `projects/agent-kit/tests/git-guards-merged.test.sh`.
