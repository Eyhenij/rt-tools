# Scenarios: an unmerged agreement at opening a PR

A subdomain of the work. Here is how opening a PR treats a feature agreement the plan of the branch
named and the branch did not merge.

### SC-AK-1249 — a PR does not open while the draft of the plan lies in the branch

Given the plan of the branch named a draft by the line `**Draft:**`, the task folder is taken apart,
and the draft directory still lies in the branch
When a PR is opened
Then the call is refused, and the refusal names the draft directory

Given the draft directory was removed by the branch, or the plan named no draft, or the command
carries the folder-skip bypass
When a PR is opened
Then the draft does not refuse the call

Covered: `projects/agent-kit/tests/git-guards-agreement.test.sh`.

### SC-AK-1296 — a PR into an epic does not wait for the draft, the PR of the epic does

Given a plan of the branch named a draft, and the draft directory lies in the branch
When a PR is opened into another branch than the main one
Then the draft does not refuse the call

Given the epic branch carries the plan of a task that named a draft, and the draft directory lies in
the branch
When the PR of the epic is opened into the main branch
Then the call is refused, and the refusal names the draft directory

Covered: `projects/agent-kit/tests/git-guards-agreement.test.sh`.
