# Scenarios — the guard of the working tree against discarding commands

The spec is `spec.md` next to it. The scenarios check which calls are refused on a dirty tree,
what the refusal names and what is let through.

### SC-AK-1094 — a discarding command on a dirty tree is refused

Given the working tree holds an uncommitted edit of a tracked file
When `git reset --hard`, `git checkout -- <path>`, `git checkout .` or `git restore <path>` is
called — directly, from the environment's terminal, as a nested call, with a key between `git`
and the verb, or inside a compound command
Then the guard refuses the call

Covered: `projects/agent-kit/tests/git-guard-discard.test.sh`.

### SC-AK-1095 — the refusal names the files that would be lost

Given the working tree holds an uncommitted edit of `package.json`
When the guard refuses `git reset --hard`
Then the text of the refusal names `package.json`

Covered: `projects/agent-kit/tests/git-guard-discard.test.sh`.

### SC-AK-1096 — clean is judged by the untracked files, reset by the tracked ones

Given the working tree holds one untracked file and no changed tracked one
When `git clean -f` or `git clean -fd` is called
Then the guard refuses; `git reset --hard` on the same tree passes, and `git clean -n` passes too

Covered: `projects/agent-kit/tests/git-guard-discard.test.sh`.

### SC-AK-1097 — a clean tree and non-discarding calls pass

Given the working tree is clean, or the call is `reset --soft`, `restore --staged`, a checkout of
a branch, a history search with the word `hard`, or a build
When the guard reads the command
Then it stays silent

Covered: `projects/agent-kit/tests/git-guard-discard.test.sh`.

### SC-AK-1098 — the discard mark with a reason lets the call through, an empty one does not

Given the working tree is dirty
When the command carries `# discard: <reason>` with a non-empty reason
Then the guard lets it through; the same mark with an empty reason is refused

Covered: `projects/agent-kit/tests/git-guard-discard.test.sh`.
