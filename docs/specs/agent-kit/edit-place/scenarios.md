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
