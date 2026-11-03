# Scenarios — what the push gate counts as a push

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain.

### SC-AK-1237 — the word push outside the git call runs no gate set

Given the command reads pipeline runs and filters them by the event `push`, after a `git fetch`
When the command comes to the push gate guard
Then the set is not run: `push` is not the subcommand of a `git` call. A push with `-c` and `-C`
keys before the subcommand is recognised as before

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-1238 — several recipients in one push are refused

Given the push names `--all`, `--mirror` or two refs after the remote, or a loop over several lines
holds a push
When the command comes to the push gate guard
Then it is refused as several pushes; a push of one branch passes as before

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-1239 — a push typed into the terminal tab is judged by the set

Given the session types a push into its terminal tab, and the set is red
When the call comes to the push gate guard
Then it is refused the same way as a shell call

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.
