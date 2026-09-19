# Binding — the guard of the working tree against discarding commands

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A discarding command on a dirty tree is refused, and the refusal names the files.** — `projects/agent-kit/assets/hooks/git-guard-discard.sh:reason`
- **A clean tree lets the command through.** — `projects/agent-kit/assets/hooks/git-guard-discard.sh:changed`
- **`clean` is judged by the untracked files, the other three by the changed tracked ones.** — `projects/agent-kit/assets/hooks/git-guard-discard.sh:changed`
- **The lawful bypass is the discard mark with a non-empty reason.** — `projects/agent-kit/assets/hooks/git-guard-discard.sh:cmd`
- **The verb is looked for in the command position, and a nested call of the environment is unwrapped.** — `projects/agent-kit/assets/hooks/git-guard-discard.sh:hits`
