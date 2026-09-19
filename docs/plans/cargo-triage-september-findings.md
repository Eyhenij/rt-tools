# The findings of the epic RT-2240

The findings accumulate here while the epic "Sorting out the intake cargo: the records of
September" goes: the owner reads them at once when the epic is over and says which of them are
right. The file lies next to the plan of the epic, `docs/plans/cargo-triage-september.md`.

## RT-2242 — the lib check reads a list of backend families

- **The free scenario number command does not see a four-digit number at all.** It reads the id
  shape as three digits at most, while the audit next to it reads four. From the thousandth number
  on, the command answers from the scenarios it did see and hands out one already taken. The number
  was taken by a search over every remote branch instead. **Address:** the names of this tree — the
  command takes the shape of an id from the shared reading of the specs, not from its own copy.
- **The check run from the package sources answers with a skip, not with the tree's result.** From
  `projects/agent-kit/assets/checks/` the config helper does not find the tree settings and reads
  the package defaults; the readiness sign of a stage is taken from the laid-out copy in `tools/`.
  **Address:** the names of this tree — the plan template names the laid-out copy as the command.
- **The work queue audit reads every `#<number>` in the epic plan as a task of the epic.** The
  line «влита, PR #2247» in the makeup table was named as a task that is not a sub-issue of the
  card; the PR number is written without the hash instead. **Address:** rules layer —
  `checks/board-gh.github.mjs` reads the task numbers from the makeup table, not from the whole
  text of the plan.
- **The work queue audit asks the epic branch for a task folder.** «RT-2240-cargo-triage-september:
  the task folder never travelled into the branch» stands in every run while the epic goes; the
  epic branch carries no folder by the rule. **Address:** rules layer — the audit knows the epic
  branch by the plan line, the same way the exit guard does since 0.29.0.

## RT-2245 — the board field mutation is named in the texts

- **The cold part of the delivery rule for this hosting stands at the length limit.** Its laid-out
  copy holds 329 lines of the 330 allowed: one more pitfall took the push gate down, and the case of
  the board mutation stayed in the tree's companion alone. **Address:** rules layer — the cold part
  `pitfalls/git-workflow.github.md` is split before the next record.

## RT-2246 — the grill closes questions by assumption, the turn does not end on a launch

- **The epic-stop guard refuses the switch to the epic branch for the epic's own request.** With
  every task merged, `git checkout <epic branch>` is read as taking new work, while the rule names
  the request of the epic into the main branch as the mandatory action of that state. The switch went
  through by the bypass line. **Address:** rules layer — the guard lets through a switch to the
  branch of the finished epic and a request opened from it.
- **The guard of the end of a turn is at its length limit, and its tiers land in the file of the
  epic tiers.** Two tiers in a row went to `turn-exit-epic.sh` for want of room, and the file name
  no longer says what lies in it. **Address:** rules layer — the state tiers move to a file of their
  own before the next one.
- **The clean-database step of the pipeline reads the container as ready before the server is.**
  `pg_isready` answers on the temporary server the image starts for its first setup, and the
  schema check then gets a reset connection: `read ECONNRESET` on the request of the epic, green on
  the five task requests minutes before. **Address:** this tree — the step waits for a real query to
  answer, not for the readiness probe.

## The rules review of the epic

The review of the closed work returned eight findings. They are written here whole: the owner reads
them together with the ones above and says which of them become edits.

- **The sentence limit and the words this tree forbids are learned only from a refusal.** The limit
  of 40 words lives in the wording check alone, and the seventeen forbidden words in the tree
  settings, which no session reads. The glossary carries ten words of its own, and only two of them
  are on both lists. The pattern about wording already orders the opposite: a dropped word is filed
  with its replacement on the same line. The glossary is left out of the wording check's own search,
  so a glossary line built out of a forbidden word never turns red. **Address:** rules layer for the
  article, this tree for the list of its own words and for a named command that calls the check.
- **A long text is checked after it is written, not before.** The guard on an edit takes the whole
  body of the command as the new text and prints eight findings at a time. A document written by one
  heredoc is therefore re-issued whole for every eight findings: five rounds for a page of prose.
  The cure is a draft outside the tree, checked by the command and only then written.
  **Address:** rules layer — the technique goes into the wording pattern.
- **The rule a text needs arrives after the text is composed.** The rules gate names the rules of
  the remaining targets of a command only together with the refusal of the first one. For a command
  that writes several files the wording rule therefore reaches a finished text. **Address:** rules
  layer — the gate gathers the targets before it words the first refusal.
- **The article about the client command covers the fields of a request and not its body.** The body
  is named one pattern away, and that pattern loads only when a body is being written by hand. The
  session met the refusal about rights and found the direct call again. The gate map is silent about
  it too: a body written by a direct call matches neither of its two signs, and both text rules are
  skipped. **Address:** rules layer for the article and for the map.
- **The end-of-epic guard reads a return to the epic branch as taking new work.** A local branch made
  from a branch already on the remote has the same shape as a branch for a new task. The refusal
  comes at the one move it exists to protect. **Address:** rules layer — the guard asks the remote
  whether the branch is already there, and the cold part takes the trap.
- **A tier that does not fit in its guard goes to the file that has room.** Two tiers about a next
  step and about a launch in the background sit in the file about epics, and its name says nothing
  of them. Splitting goes by subject, not by free space. **Address:** rules layer — the article into
  the skill about editing the package, and the file split by subject.
- **Reading the observations demands the rule for editing them.** Everything under the tree settings
  is sent to the rule about additions, and a tally of what the hooks wrote is refused by it.
  **Address:** the names of this tree — the branch of the map takes an exception for the
  observations.
- **What gave nothing in this epic:** the rules of work conduct with their patterns, the browser rule
  and the lib rule. No refusal and no rediscovery stands against them.

## Two findings of the closing turn

- **The work guard demands a task folder of the epic branch and reads a path out of the prose.** The
  branch of an epic carries no folder by the rule, and the guard knows no epic branch: it refuses an
  edit of the plan next to which the findings lie. It reaches that refusal because it took a path
  named inside the document text for a write target of the command. **Address:** rules layer — the
  guard learns the epic branch the same way the exit guard learned it, and reads write targets from
  the command rather than from the text being written.
- **The clean-database step is the only red one in six requests.** Five task requests and the request
  of the epic ran the same steps minutes apart; the step refused once and passed on the repeat
  without a single edit. **Address:** this tree — the step waits for an answer to a query.
- **The table of assignments sets the working copies against each other on every change of an
  epic.** One table holds a row per copy, and two copies rewrote their own rows the same day: the
  merge is a conflict over the file, and the host marks the request as conflicting. Both sides are
  right, and adding them up resolves nothing — the rows are resolved one by one. The tree's own
  rule warns of exactly this about a list every branch appends to. **Address:** rules layer — a row
  per copy in a file of its own, or the union of both sides declared for the table.
- **The table has no shape for work outside an epic.** Its epic cell takes a number or a dash, and
  a dash means «no work is assigned»: a copy working by the owner's word outside an epic can write
  neither. The number of the work goes into the cell, and the plan cell says what it really is.
  **Address:** rules layer — the cell takes a task key with a number and says which of the two it
  is.
- **A staging call over a directory takes in the folders of other sessions.** One working copy holds
  the unstarted task folders of neighbouring work, deliberately outside the index. A staging call
  named by the directory adds them all, and the branch carries eighteen foreign files into the
  request: the file count on the page is the only place it shows. The removal from the index leaves
  them on disk. **Address:** this tree — the files of a commit are named one by one, and what is
  staged is read back before the commit.
