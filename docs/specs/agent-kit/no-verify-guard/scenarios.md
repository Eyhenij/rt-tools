# Scenarios — the guard of the commit hooks against a skip

The spec is `spec.md` next to it. The scenarios check which calls are refused as a skip of the
hooks, what the refusal says and what is let through.

### SC-AK-1170 — a commit or a push that skips the hooks is refused

Given a working copy of a repository
When `git commit` or `git push` is called with `--no-verify` or its abbreviation, `git commit`
with `-n` alone or in a cluster, a call with `-c core.hooksPath=<path>` or with `HUSKY=0` in front
of it — directly, by the full path to git, from the environment's terminal, as a nested call, with
a key between `git` and the verb, or inside a compound command
Then the guard refuses the call

Covered: `projects/agent-kit/tests/git-guard-no-verify.test.sh`.

### SC-AK-1171 — the refusal names the form of the skip and offers no bypass

Given an amend called with `--no-verify`
When the guard refuses it
Then the text of the refusal names `git commit --no-verify` and says there is no lawful form of
bypass

Covered: `projects/agent-kit/tests/git-guard-no-verify.test.sh`.

### SC-AK-1172 — what is let through

Given a working copy of a repository
When a commit or an amend is called without a skip, `git push -n` is called, a commit message or a
history search names the key, another verb carries the same key, or `git` carries a setting other
than the path of the hooks
Then the guard lets the call through

Covered: `projects/agent-kit/tests/git-guard-no-verify.test.sh`.
