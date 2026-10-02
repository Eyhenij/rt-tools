# Binding — the guard of the commit hooks against a skip

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A commit or a push that skips the hooks is refused, and the refusal names the form of the skip.** — `projects/agent-kit/assets/hooks/git-guard-no-verify.sh:reason`
- **There is no lawful bypass.** — `projects/agent-kit/assets/hooks/git-guard-no-verify.sh:deny_tail_text`
- **The skip is read in the command position, and a nested call of the environment is unwrapped.** — `projects/agent-kit/assets/hooks/git-guard-no-verify.sh:hits`
- **`-n` is a skip on `git commit` only.** — `projects/agent-kit/assets/hooks/git-guard-no-verify.sh:hits`
