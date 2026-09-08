# The place of an edit

**Status:** in force · **Revision:** 2026-08-23 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `verifiability`, `work-conduct`
**Procedures:** none

## Why

The rules layer is edited by the same executor the rules layer governs, and the difference between "I
carry out a rule" and "I edit a rule" is visible in the tree by nothing: a laid-out copy lies next to
the ordinary files and is edited the same way. The edit reaches the disk and does not reach the place
where the miss is fixed.

The subdomain names where every kind of rules-layer text is fixed — the package source, the override
of the tree, a file of the tree's own — and what happens to an edit put in the wrong place. The
layout itself is a neighbouring subdomain: the subject there is different, there files are put, and
here the place of an edit is judged.

## Terminology

- **A laid-out copy** — a file put by the package; it is recognised by the header
  `rt-kit v<version> · <resource> · <digest>` at the start.
- **A source** — the resource file in the tree the package is carried by; a consumer tree has no
  source.
- **An override** — a file of the tree in the overrides directory, merging with the package resource
  by the heading of a `## ` section.
- **Overwriting** — writing a file whole over an existing one: the write tool, a redirection, `tee`
  without appending, copying over. Appending at the end does not count as overwriting.

### What it is called in the interface

These guards have no interface: only the executor sees them — as the text of a refusal in their own
turn.

## Rules

- **An edit of a laid-out copy is refused at the minute of the edit, not at the next layout.** One
  `sync --check` knew about it, and it spoke in a foreign branch and in a foreign turn: the layout
  refuses over the edited file whole, and the price is paid by whoever edits a neighbouring resource
  that day.
- **The refusal names the resource and the address where the edit is held.** The address depends on
  whether the tree holds the source: at the package tree it is the source, at a consumer it is the
  override. A refusal without an address leaves the executor before the same choice the edit landed in
  the wrong place over.
- **The directory of the sources is asked of the tree profile, it is not guessed by the name.** A tree
  where the package lies differently would get the address of a non-existent file — that is, an
  instruction by which a new file is created next to it.
- **The guard judges the write, not the tool.** The same edit by a shell command is lost at the layout
  the same way an edit by a tool is.
- **The target of the write is taken from the command outright, not by a general sign of a write.**
  The general sign is wide on purpose — it holds the name of the interpreter too — and running a
  laid-out check would read as an edit of the check itself. A refusal on a read costs more than a
  miss: a guard that gets in the way of reading is switched off on the very first day.
- **The parse of write targets is declared once, and every guard that judges an edit calls it.** Two
  copies of one sign diverge silently: each is fixed on its own, and neither says the rest stayed
  blind. The parse has a suite of its own, so that a failure names the parse and not the guard that
  called it.
- **The body of an interpreter without a write gives out none of its paths.** Inside the body there is
  nothing to parse a foreign language with, and everything looking like a path is taken from there; a
  body holding not a single write call gave out its paths on a par with one that writes. A command
  that loaded a laid-out helper and printed its answer was forbidden as an edit of that helper —
  three times in a row in one session, and not one call wrote anything. A body that does write gives
  out its paths whole: the path and the write call stand there on different lines, and there is
  nothing to link them by.
- **Muted output is never a sign of a write, inside a body either.** A redirection into the empty
  device and into the error stream is removed before the parse — by the same technique the shell write
  sign removes it. Otherwise a body that writes nothing gives out all its paths again: a command with
  an edit of one file and a run of a check next to it was forbidden by the path of that check.
- **Removing a laid-out copy passes.** A removed file the layout puts anew, and that is how a copy the
  formatter rewrote is fixed.
- **Writing whole over a non-empty override is refused by a refusal of its own.** An override
  accumulates sections from different branches and sessions, and put whole it carries away all of them
  that this edit did not touch: the package text silently comes back in their place, the layout comes
  together, and the checks are green.
- **The refusal about overwriting names the size of what would be wiped.** The number of lines and the
  number of sections tell an override of three lines from one gained over half a year, and without
  them the refusal reads as a ban on the technique.
- **Appending at the end and editing in place pass.** They carry nothing away: the former sections
  stay where they were.
- **An empty override and an unwritten one are put whole.** There is nothing to overwrite in them, and
  a refusal would be a ban on creating one.
- **The copy of a sample for the work is assembled by a command, and the command removes the header.**
  While the copy was made by `cp -r` along a line the command printed into a hint, the header travelled
  into it and refused the very first edit of the request analysis — that is, the first move of any work
  — and the refusal led to editing the sample of the package instead of the copy. It was removed by
  three lines by hand, anew with every piece of work. The argument is the same one the package puts the
  draft of a companion by without a header: from the first edit this is the text of the project, and
  there is nothing to check in it. The sample itself still carries a header and is updated by the
  layout.

- **A laid-out file hides from the formatter, and a check watches this.** The guard of the place of an
  edit judges a call of the executor, while the formatter works as a hook of the version control
  system — that is, it edits a file already in the index, without a single call, and the guard does
  not reach it. This is held by the exception list of the formatter, and the list falls behind
  silently: the look of a laid-out file matches the look of the formatter by chance, until a line in
  the package is edited.
- **All the files with the layout header are judged, not a list of directories.** They have one sign,
  and a list of directories in the check would repeat the exception list from the other side — they
  would diverge silently.
- **The check is the tree's own, not the package's.** It reads the exception list of exactly this
  formatter, and a consumer tree may have another formatter or none at all.
- **A file in conflict the guard lets through on a par with a removed one.** Resolving a conflict does
  not change the content of the copy — the layout puts it anew — and an executor refused over it is
  left with a half-merged branch and without a lawful move: there is nothing to edit in the source, and
  an override does not remove a conflict.

## States

| The state of the edit               | What the executor sees                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------- |
| a file of the tree's own            | nothing: the guards stay silent                                               |
| a laid-out copy, there is a source  | a refusal with the address of the source and the override as the second shape |
| a laid-out copy, there is no source | a refusal with the address of the override                                    |
| a gained override, a write whole    | a refusal with the size of what would be wiped                                |
| a gained override, an edit in place | nothing                                                                       |

## What is out of scope

- The layout itself: putting files is a neighbouring subdomain, here the place of an edit is judged.
- The merge of an override with the package resource: the guard knows it goes by section and says so,
  and it is done by the layout.
- An edit that came not from the executor: the formatter of the tree and the hooks of the version
  control system go past the events of the agent, and the guards do not see them.

## Contract

The surface is the events of the agent: editing a file and calling the shell. The answer of the guard
is either a pass or a refusal with the address where this edit is held.

### Refusal codes

Not applicable: the guard refuses a call before it is carried out, and such a refusal has no command
exit code.

| What happened                            | How it ends      | What it says                                             |
| ---------------------------------------- | ---------------- | -------------------------------------------------------- |
| an edit of a file with the layout header | the call refused | the resource and the address: source or override         |
| a write whole over a non-empty override  | the call refused | the size of what would be wiped and how to edit in place |
| a read, a search, removing a copy        | a pass           | nothing                                                  |
| no parser, broken input, no file         | a pass           | nothing: a broken guard does not jam the work            |

## Data

There is no storage of its own: the header is read from the first lines of the edited file, the
directory of the sources from the tree profile, the directory of the overrides from the environment
or by the default of the package.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

Not applicable: the refusal texts are single-language.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The guards are one set for all trees, and the address of an edit depends on the tree: the one the
package is carried by has a source, a consumer has only an override. A tree that named no directory
of sources gets the second address, not an invented first one.

## Decisions

- **Two guards were created, not one.** The subjects differ: one judges whether this is the right
  file, the other whether this is the right way of writing. Merged into one, they would share the
  parse of the input and would diverge in their refusal texts silently. Rejected: one branch for both
  cases.
- **The header is looked for in the first lines, not across the whole file.** The guard stands at
  every edit, and the price of reading a file whole is at every one. Twelve lines are enough for both
  cases that push it down: the launch line at a scenario suite and the heading at a rule.
- **Overwriting is refused by the non-emptiness of the file, not by its content.** Taking apart what
  exactly the write would carry away is possible only by reading what will be put — and the guard is
  not given that. Rejected: comparing the sections before and after.
- **Appending at the end is let through.** A section standing at the end touches none of the former
  ones; refusing it along the way, the guard would forbid a lawful technique and would be switched off
  whole.

## Open questions

- `Q-EP-1` — the formatter of the tree edits a laid-out copy past the guard: it works not by a command
  of the agent but as a hook of the version control system. This is held by a list of names in the
  setting of the formatter, and the list falls behind silently.

- `Q-EP-2` — the rule "what lies on the layout path counts as laid out" is not carried out by the
  guard of the place of an edit: it judges by the header and refuses every file the header was met in.
  It has no layout path — for the kind of samples it is assembled from the setting of the tree, and for
  the rules the layout renames the resource, and there is no general way to assemble the address. The
  copy of the task folder sample is taken out from under this by a technique of its own — the command
  removes the header at the assembly — and the other kinds of copies, including the copy of the domain
  spec sample, stay.

## History of changes

- 2026-08-24 — the copy of a sample for the work is assembled by a command and the header is removed
  from it; the divergence of the rule about the layout path with the guard is written down as the
  question `Q-EP-2`.
- 2026-08-23 — the subdomain was created: the scenarios about the place of an edit moved from the
  layout subdomain, which had outgrown the length limit. The numbers were not recounted.
