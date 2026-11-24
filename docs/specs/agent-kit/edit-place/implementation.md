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
- **A key with code belongs to its own interpreter, and an in-place edit to its own command.** — `projects/agent-kit/assets/hooks/shell-words.sh:given` — the code stands among the flags of its interpreter; the variables are filled by `projects/agent-kit/assets/hooks/write-targets.sh:RT_WT_VARS`; the literals are gathered by `projects/agent-kit/assets/hooks/script-files.sh:rt_cmd_vars`; scenario `SC-AK-1942`
- **A writing word is a command only at the start of its part.** — `projects/agent-kit/assets/hooks/shell-words.sh:command_at` — the words before the name of a command are passed over; scenarios `SC-AK-1942`, `SC-AK-1962`
- **A script file the command runs is read with the command.** — `projects/agent-kit/assets/hooks/script-files.sh:rt_script_files` — called by `projects/agent-kit/assets/hooks/write-targets.sh:rt_write_targets` and `projects/agent-kit/assets/hooks/git-guard-delivery.sh:rt_script_requests`; scenario `SC-AK-1943`
- **A refusal of a compound command names the part it judged.** — `projects/agent-kit/assets/hooks/deny-tail.sh:rt_judged_part` — called by `projects/agent-kit/assets/hooks/rule-source-guard.sh:refuse` and `projects/agent-kit/assets/hooks/flow-step-guard.sh:part`; scenario `SC-AK-1946`
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

- **The parse of write targets is declared once, and every guard that judges an edit calls it.** — `projects/agent-kit/assets/hooks/write-targets.sh:rt_write_targets` — the shared helper without a hook declaration of its own; its suite is `projects/agent-kit/tests/shell-write-paths.test.sh`, scenarios `SC-AK-924`–`SC-AK-927`; a second parse in a hook is refused by `projects/agent-kit/tests/write-parse-one.test.sh`, scenario `SC-AK-1965`
- **A command is cut into words sign by sign, and a writing word names its targets.** — `projects/agent-kit/assets/hooks/shell-words.sh:end_call` — the words of a call and what it writes; the rounds of a shell inside a shell and the folder on the disk are in `projects/agent-kit/assets/hooks/write-targets.sh:rt_shell_calls`; scenarios `SC-AK-1962`, `SC-AK-1963`
- **The parse tells a file written whole from a file added to.** — `projects/agent-kit/assets/hooks/write-targets.sh:rt_overwrite_targets` — called by `projects/agent-kit/assets/hooks/override-write-guard.sh`; scenario `SC-AK-1964`
- **Without the module of words a guard passes the action and stays silent.** — `projects/agent-kit/assets/hooks/write-targets.sh:rt_shell_words` — the stub under the source; scenario `SC-AK-1966`
- **The body of an interpreter without a write gives out none of its paths.** — `projects/agent-kit/assets/hooks/write-targets.sh:writes` — the sign of a write inside a body; scenario `SC-AK-858`
- **The body of a heredoc is data of the command, and the shell parse does not read it.** — `projects/agent-kit/assets/hooks/shell-words.sh:takes_body` — who reads the body decides whether it is code; scenarios `SC-AK-1140`, `SC-AK-1962`
- **A path inside a string the script writes or substitutes is the content of the write, not its target.** — `projects/agent-kit/assets/hooks/write-targets.sh:strip_content` — the arguments of the write calls are cut from the line before the paths are taken, the address of the call stays; scenario `SC-AK-1209`
- **An arrow inside quotes is text of the command, not a redirection.** — `projects/agent-kit/assets/hooks/shell-words.sh:rt_shell_words` — a sign inside quotes joins its word, `in_test` and `sums` hold the comparisons; scenarios `SC-AK-1251`, `SC-AK-1963`
- **Muted output is never a sign of a write, inside a body either.** — `projects/agent-kit/assets/hooks/shell-words.sh:target` — an empty device is no target, and a body loses the redirection in `projects/agent-kit/assets/hooks/write-targets.sh:rt_write_targets`; scenario `SC-AK-858`
