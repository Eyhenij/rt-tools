# Binding — the place of an edit

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **An edit of a laid-out copy is refused at the minute of the edit, not at the next layout.** — `projects/agent-kit/assets/hooks/rule-source-guard.sh:deny`
- **The refusal names the resource and the address where the edit is held.** — `projects/agent-kit/assets/hooks/rule-source-guard.sh:deny`
- **The directory of the sources is asked of the tree profile, it is not guessed by the name.** — `projects/agent-kit/assets/defaults/project.sh:rt_kit_sources_dir`
- **The guard judges the write, not the tool.** — `projects/agent-kit/assets/hooks/rule-source-guard.sh:rt_write_targets`
- **The target of the write is taken from the command outright, not by a general sign of a write.** — `projects/agent-kit/assets/hooks/rule-source-guard.sh:rt_write_targets`
- **Writing whole over a non-empty override is refused by a refusal of its own.** — `projects/agent-kit/assets/hooks/override-write-guard.sh:deny`
- **The refusal about overwriting names the size of what would be wiped.** — `projects/agent-kit/assets/hooks/override-write-guard.sh:deny`
- **Appending at the end and editing in place pass.** — `projects/agent-kit/assets/hooks/override-write-guard.sh:rt_overwrite_targets`
- **Removing a laid-out copy passes.** — `projects/agent-kit/assets/hooks/rule-source-guard.sh:rt_write_targets`
- **An empty override and an unwritten one are put whole.** — `projects/agent-kit/assets/hooks/override-write-guard.sh:overrides_dir`
- **The copy of a sample for the work is assembled by a command, and the command removes the header.** — `projects/agent-kit/assets/checks/board.github.mjs:unstampFolder`
- **A laid-out file hides from the formatter, and a check watches this.** — `tools/check-format-ignore.mjs:STAMP` — the header is looked for in the head of every file of the tree, and what is found is checked against the exception list
- **All the files with the layout header are judged, not a list of directories.** — `tools/check-format-ignore.mjs:walk` — the walk goes over the whole tree, past the build, the dependencies and the generated
- **The check is the tree's own, not the package's.** — `tools/check-format-ignore.mjs:IGNORE_FILE` — `.prettierignore` is read; there is none — there is nothing to check against, and the check stays silent
- **A file in conflict the guard lets through on a par with a removed one.** — `projects/agent-kit/assets/hooks/rule-source-guard.sh:ls-files` — there are two signs: an index record about an unmerged file and merge markers in the file itself; scenario SC-AK-834

The names of this tree: the source is `projects/agent-kit/assets/<resource>`, the overrides directory
is `.claude/rt-kit/overrides/`, the tree profile is `.claude/rt-kit/project.sh`, the setting of the
formatter is `.prettierignore`.

- **The body of an interpreter without a write gives out none of its paths.** — `projects/agent-kit/assets/hooks/write-targets.sh:writes` — the sign of a write inside a body; scenario `SC-AK-858`
- **Muted output is never a sign of a write, inside a body either.** — `projects/agent-kit/assets/hooks/write-targets.sh:rt_write_targets` — the redirection is removed before the parse; scenario `SC-AK-858`
