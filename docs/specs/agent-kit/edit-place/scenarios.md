# Scenarios — the place of an edit

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain, and the
numbers were not recounted on the move into the subdomain: the number ties a scenario to a test
title.

### SC-AK-534 — an edit of a laid-out copy is refused on its place

Given the file carries the layout header
When it is edited
Then the guard refuses, names the resource and the address where this edit is held: an edit in place
is lost at the next layout, and until then the layout refuses over this file whole

Covered: `projects/agent-kit/tests/rule-source-guard.test.sh`.

### SC-AK-535 — the guard does not touch a file of the tree's own

Given the file carries no layout header
When it is edited
Then the guard stays silent

Covered: `projects/agent-kit/tests/rule-source-guard.test.sh`.

### SC-AK-536 — the same edit by a shell command is judged on a par

Given a laid-out copy is edited not by a tool but by a write from a command
When the command goes
Then the guard refuses; a read of the same copy passes

Covered: `projects/agent-kit/tests/rule-source-guard.test.sh`.

### SC-AK-537 — removing a laid-out copy passes

Given a laid-out copy is removed by a command
When the command goes
Then the guard stays silent: a removed file the layout puts anew, and that is how a copy the
formatter rewrote is fixed

Covered: `projects/agent-kit/tests/rule-source-guard.test.sh`.

### SC-AK-801 — an edit of a laid-out copy by the body of an interpreter is refused

Given the path of a laid-out copy stands inside code the command passes to the interpreter as a body
or as an argument
When the command goes
Then the guard refuses: from outside such a command looks like a run, and it edits the copy

Covered: `projects/agent-kit/tests/rule-source-guard.test.sh`.

### SC-AK-802 — the body of the interpreter is judged, not the whole command

Given the interpreter is passed code without paths of laid-out copies, and next to it in the same
compound command a laid-out check is run
When the command goes
Then the guard stays silent: the targets of the write are taken from the body, and running the
laid-out does not count as an edit

Covered: `projects/agent-kit/tests/rule-source-guard.test.sh`.

### SC-AK-538 — the address of the edit depends on whether the tree holds the source

Given the tree names the directory of the package sources
When a laid-out copy is edited
Then the refusal sends into the source and names the override as the lawful shape for what is true
only of this tree

Covered: `projects/agent-kit/tests/rule-source-guard.test.sh`.

### SC-AK-539 — a write over a gained override is refused

Given the override of the tree is non-empty
When it is written whole
Then the guard refuses, names the size of what would be wiped — the lines and the number of sections
— and says that the override merges with the package resource by the heading of a section

Covered: `projects/agent-kit/tests/override-write-guard.test.sh`.

### SC-AK-540 — an edit in place and an empty override pass

Given the override is edited in place, or it is not there yet, or it is empty
When the edit goes
Then the guard stays silent: there is nothing to carry away

Covered: `projects/agent-kit/tests/override-write-guard.test.sh`.

### SC-AK-541 — the same overwriting by a shell command is judged on a par

Given the override is overwritten not by a tool but by a redirection, a copy or a hand-off into a
file
When the command goes
Then the guard refuses

Covered: `projects/agent-kit/tests/override-write-guard.test.sh`.

### SC-AK-542 — appending at the end passes

Given a section is appended into the override instead of putting it whole
When the command goes
Then the guard stays silent: the former sections stay in place

Covered: `projects/agent-kit/tests/override-write-guard.test.sh`.

### SC-AK-573 — the copy of a sample is assembled without the layout header

Given the sample of the task folder is laid out and carries a header
When the task creation command assembles the copy for the work
Then there is no header in the copy, and the removal names the files it left

Covered: `projects/agent-kit/tests/task-folder-stamp.test.sh`.

### SC-AK-570 — only the header is removed and only from markup

Given the folder holds a file with the project's own text and a non-markup file
When the removal goes over the directory
Then both stay as they were, and a repeated call finds nothing

Covered: `projects/agent-kit/tests/task-folder-stamp.test.sh`.

### SC-AK-571 — the removal on a non-existent directory stays silent

Given there is no directory
When the removal is called
Then it answers with an empty list instead of falling: this does not take the assembly of the folder
down

Covered: `projects/agent-kit/tests/task-folder-stamp.test.sh`.

### SC-AK-572 — the sample itself carries the header

Given the sample of the task folder is laid out by the package
When it is read
Then the header is in place: the removal in the copy makes sense exactly because it stands in the
sample

Covered: `projects/agent-kit/tests/task-folder-stamp.test.sh`.

## A laid-out file and the formatter

### SC-AK-805 — a file with the layout header visible to the formatter is named by name

Given a file with the layout header falls under no sample of the exception list of the formatter
When the check is called
Then it names that file and refuses

Not covered: the checks of the tree in `tools/` have no tests — they are accepted by introducing a
breach by hand. Checked on the spot: the dictionary line was taken out of the exception list, the
check named that file and returned code one; the line was returned — the check stays silent again.

### SC-AK-806 — files hidden from the formatter do not take the check down

Given every file with the layout header falls under a sample of the list
When the check is called
Then it prints their number and stays silent

Not covered: by the same technique as the scenario above. Checked on the spot: on the tree of this
branch the check found 190 files with the layout header and returned zero. Before the list was
edited, six of them were visible to the formatter — it named them by name.

### SC-AK-834 — a file in conflict is let through on a par with a removed one

Given a laid-out copy carries merge markers
When it is edited — by the edit tool or by a shell command
Then the guard of the place of an edit lets the call through, and with the conflict removed it
refuses it in the former order: resolving a conflict does not change the content of the copy, and the
layout puts it anew

Covered: `projects/agent-kit/tests/rule-source-guard.test.sh`.

### SC-AK-858 — the body of an interpreter without a write gives out no paths

Given a command calls an interpreter and gives it a body in which a laid-out file is only read
When the guard checks the command
Then the edit passes; a body with a write call is forbidden as before, including where the path
stands in it a line above the write itself

Covered: `projects/agent-kit/tests/rule-source-guard.test.sh`.

### SC-AK-864 — the target of a write counts as the address of the call, not as every word with a slash

Given the body passed to the interpreter holds the address of a laid-out copy — but not as the target
of a write, as a search sample or a comparison string — and the body writes another file at that
When the command goes
Then the guard stays silent: the paths are taken from the write lines, not from the whole body.
Before, an edit of one file was forbidden by the name of another the script did not even open, and
the refusal was bypassed by changing the shape of the command, not the action

Given the address of a laid-out copy is assigned to a variable, and it stands as the first argument
of the write call
When the command goes
Then the guard refuses: the assignment and the call are taken apart as a pair, otherwise a write
through a variable is lost

Covered: `projects/agent-kit/tests/rule-source-guard.test.sh`.

### SC-AK-924 — the parse names the write target in each of its shapes

Given a shell command writes a file by a redirection, by an append, through `tee`, by an in-place edit
or by a copy over the top
When the shared parse takes the write targets out of the command text
Then it names that file, and the source of the copy is not named: only what the command writes counts
as a target

Covered: `projects/agent-kit/tests/shell-write-paths.test.sh`.

### SC-AK-925 — the write path inside the body of an interpreter is named too

Given the code goes as an argument of an interpreter or as the body of a heredoc, and the write path
stands inside it
When the shared parse takes the write targets out of the command text
Then it names that path; a body that only reads gives out no paths at all

Covered: `projects/agent-kit/tests/shell-write-paths.test.sh`.

### SC-AK-926 — reading is not a write

Given the command reads a file, searches over the tree or prints a piece of a file
When the shared parse takes the write targets out of the command text
Then it names nothing: a guard that gets in the way of reading is switched off on the very first day

Covered: `projects/agent-kit/tests/shell-write-paths.test.sh`.

### SC-AK-927 — muted output is not a sign of a write

Given the command mutes its output into the empty device and into the error stream
When the shared parse takes the write targets out of the command text
Then the muted stream names nothing, while a real write standing next to it is still named

Covered: `projects/agent-kit/tests/shell-write-paths.test.sh`.

### SC-AK-1081 — the promise of merging by sections is given only where there are sections

Given the edit falls on a laid-out text — a law, a rule, a pattern, a skill
When the guard refuses
Then it names the override and promises merging by the section «## »

Given the edit falls on a laid-out shell script or check file
When the guard refuses
Then it does not promise merging by sections and says outright that a resource of this kind has no
override by sections: a promise true of a third of the cases sends people to work by it

Covered: `projects/agent-kit/tests/rule-source-guard.test.sh`.

### SC-AK-1140 — a quote inside a heredoc body is not a write target

Given the command writes a document by a heredoc, and inside the body stands a quote line with a
path of another file
When the shared parse takes the write targets out of the command text
Then the path from the quote is named by nothing, and the target standing before the body is named
as before

Covered: `projects/agent-kit/tests/shell-write-paths.test.sh`.

### SC-AK-1209 — a path inside a written or substituted string is not a write target

Given the command is a script that opens a work file for writing and substitutes a line whose text
names the path of another file
When the shared parse takes the write targets out of the command text
Then the path from the text of the line is named by nothing, and the path the script opens is named
as before; the same holds for the data of `write`, `write_text` and `writeFileSync`, while the paths
of `os.replace` and of the receiver of `write_text` stay

Covered: `projects/agent-kit/tests/shell-write-paths.test.sh`.

### SC-AK-1251 — an arrow inside quotes is not a write target

Given the command passes a string with an arrow or a comparison in it — `echo "a->b"`,
`process.exit(a>b?1:0)`, the code of `node -e` with
an arrow function, a message in single or back quotes
When the shared parse takes the write targets out of the command text
Then it names nothing, while `echo x > out` next to it still names `out`, and an arrow after an
escaped quote outside quotes is still a redirection

Covered: `projects/agent-kit/tests/shell-write-paths.test.sh`.

### SC-AK-1942 — every command of the line gives out its own targets

Given a command line with an in-place edit, an interpreter with code in an argument and a check next
to them, or a target named through a variable the same line gives a literal
When the shared parse takes the write targets out of the command text
Then the target of the edit and the paths of the code are named, every variable of a path is filled
in, and the path of the neighbouring command, of a read on the same line and of a message in quotes is
named by nothing

Covered: `projects/agent-kit/tests/write-targets.test.sh`.

### SC-AK-1943 — a script file run by an interpreter is read with the command

Given a script outside the tree that edits a laid-out copy, or opens a PR with a bad title
When the command runs it by an interpreter with or without keys, by `env`, by `source`, by `<`, by the
code of `bash -c`, by its path, through a variable, from another directory or under a time limit
Then the guard of the place of an edit and the delivery guard refuse it as they refuse the same call
written outright, and a title the script computes is named as computed; a script that only reads, a
comment, a heredoc body and an edit in a `mktemp` directory inside it, `bash -n`, a run named in
quotes, a tracked file of the tree, a missing file, a file longer than 64 KB and a command that prints
the script pass

Covered: `projects/agent-kit/tests/script-file-read.test.sh`.

### SC-AK-1946 — the refusal of a compound command names the judged part

Given a line of several commands, one of which edits a laid-out copy or writes into the progress
When the guard of the place of an edit or the guard of the course of work refuses it
Then the refusal quotes that part and says none of the parts ran; a read of the same file next to
the write is not the part named, also when a heredoc body holds the write, and then no part is named;
the refusal of a plain command, one line or several joined by a backslash, holds no such words

Covered: `projects/agent-kit/tests/combined-command-refusal.test.sh`.

### SC-AK-1962 — every form of a write names its target

Given a command writes by a redirection, `tee`, a copy or a move, an edit in place, code handed to an
interpreter or to a shell, or a heredoc body one of them reads; before the name of the command stand
assignments, words of the shell or runners with their flags
When the shared parse takes the write targets out of the command text
Then every target is named whole and nothing else is: a path with a space, two files of `tee`, the file
a copy makes in a folder, a path through a variable the command gave a literal, and the body of a script
the same command writes and runs; of code — a name, a list, a loop and a command the code runs

Covered: `projects/agent-kit/tests/shell-words.test.sh`, `projects/agent-kit/tests/code-writes.test.sh`.

### SC-AK-1963 — a read, a run and a text are not a write

Given a command reads, runs, searches or quotes a path — with an arrow in quotes, in a comparison or
in code, with a word of a write in a string, with a body handed to a script as its data
When the shared parse takes the write targets out of the command text
Then it names nothing of them, and a write that stands next to them is still named; a command of 40 KB,
of four thousand substitutions and of three thousand comparisons is read within five seconds each

Covered: `projects/agent-kit/tests/shell-words.test.sh`, `projects/agent-kit/tests/code-writes.test.sh`.

### SC-AK-1964 — a file written whole is told from a file added to

Given a command writes a file by a redirection, `tee`, a copy or code, or adds to it, edits it in
place or reads it; code that reads the file it writes edits it in place
When the parse is asked for the files written whole
Then it names the first and stays silent about the rest

Covered: `projects/agent-kit/tests/shell-words.test.sh`, `projects/agent-kit/tests/code-writes.test.sh`.

### SC-AK-1965 — a second parse in a hook is refused

Given a hook holds a pattern of a writing command or calls the module of words past the shared parse
When the suite reads the hooks
Then it names the hook; a comment about a write and a hook that runs `cp`, `tee` or `sed` itself pass

Covered: `projects/agent-kit/tests/write-parse-one.test.sh`.

### SC-AK-1966 — without the module of words a guard is silent

Given the module of words is not laid out next to the shared parse
When a guard judges a command that overwrites a non-empty override
Then no target is named, the call passes and nothing goes into the error stream; with the module the
same call is refused; without the module of code the writes of the shell are still named

Covered: `projects/agent-kit/tests/write-parse-one.test.sh`.

### SC-AK-1967 — a path stands from the directory of its call

Given a command handed to a shell, a body or a script file writes relative paths before, after and
between calls of `cd` and `pushd`, in a subshell, in a function, and in a directory given by a variable
When the shared parse takes the write targets out of the command text
Then each path is joined to the directory its own call stands in and loses its «.» and «..»; the root of
the tree by name leaves it as it is; a directory the text computes otherwise and one above the tree leave
the path out, and the rest of the targets stay; variables that name each other end the reading;
`cd` on the line of the command itself joins nothing

Covered: `projects/agent-kit/tests/write-dirs.test.sh`.
