# The memory of the intake about the taken-apart cargo

A report that arrived in the intake remembers not only that it arrived but also what was done with
it: whether it is taken into work, what it is fixed by and in which version that fix can be found.

## Why

The intake keeps the reviews of the incidents and the proposals and remembers nothing about them
apart from the arrival. In the record of a review lie the tree, the name of the file, the text and
two times; in the record of a proposal — the tree, the text, the sign, the address and the resource.
Neither a state, nor a reference to a work, nor an acceptance of a fixing, nor a version.

Over five days 107 records arrived from two trees, and as many will go from every next one. The
reader sees them as one list, where what is taken into work and what is untouched look the same.

Two things come from that, and both cost dearly.

- **The triage does not outlive a session.** Having taken the cargo apart today, tomorrow one starts
  from nothing: there is nothing to ask "what is already taken apart" of. A measurement on the disk
  shows the same illness in a mild form — there a mark is provided for, and of twenty taken apart,
  five carry the number of a task.
- **A tie between a report and a work does not exist.** There is nothing to judge whether the work
  helped: the review describes the miss, and what was done with the miss is written nowhere.

The third is about the reading. The reviews and the proposals are written by markup: headings, bold,
italic, lists, tables, blocks of code. The intake shows them as raw text, and a table of a review
looks like a palisade of sticks.

## Decisions

- **The states are four: arrived, taken into work, fixed and not released, released.** The division
  of the last two is no formality: between the fixing and the release stands an edition of the
  package, and the consumer gets the fix only after the layout at their own place.
- **The state is put by whoever takes the report into work.** The word of the owner. This is a step
  of the working order of the executor, not a click of a person in the admin application: a person
  reads the cargo, and it is taken apart by whoever works by it.
- **The version is written by whoever publishes.** They have it at hand; the hand of a person in the
  admin application will get a digit wrong, and a matching by the intake against the journal of the
  changes demands access to the releases for the intake.
- **The acceptance of a fixing is about the "what by", not about the "where".** The reference to the
  work answers where to look; what is needed is a short text about what changed: an article of a
  rule, a guard, a check, an edit of the code.
- **A tree edits its own records by its own token.** Today the token opens only the intake of the
  cargo, and the reading is closed by the entry of a person; there is no operation at all by which a
  tree edits what it sent.
- **The text of the cargo is shown by markup.** This cancels the decision of the spec "the text of
  the cargo is shown by text", and it is cancelled by the word of the owner. The argument of that
  decision — a tree with a token would get its markup executed in the browser of the one who signed
  in — is lifted not by a cleaning with a foreign library but by a parsing: only the markup of `.md`
  is parsed, and raw HTML, script links and external pictures do not reach the output at all. What
  does reach it is named by a list: headings, bold, italic, struck through, lists, tables, code by a
  line and by a block, a quotation, a link to an external address without an execution.
- **A row of the list still carries no text.** The showing by markup goes in the panel of a record: a
  page carrying the texts of all its rows grows in weight without a limit.

## The order

The card of the epic is the task RT-907; every line below is created by a task of its own.

| №          | Task                                                   | Why here                                                                                                                         |
| ---------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| 1 · RT-908 | A state at a record of the cargo                       | The foundation: while there is no state, there is nothing to write into it and nothing to select by                              |
| 2 · RT-909 | A path of a record for a tree, not for a person        | The state is put by the executor by their token; the operation by which they will do it does not exist now                       |
| 3 · RT-910 | The acceptance of a fixing at a record                 | It answers the "what it is fixed by"; it lands by the same path as the state                                                     |
| 4 · RT-911 | The version of the release at a record                 | It sets the fixed apart from the released; it is written by whoever publishes                                                    |
| 5 · RT-912 | The showing of the text by markup                      | It depends on nothing and is read at once: it cancels the decision of the spec about the raw text                                |
| 6 · RT-913 | The selection and the order by the state               | Closed: the selection stands in the toolbar of both sections of the cargo, the column is sorted by the steps of the taking apart |
| 7 · RT-987 | The column, the selection and the order by the version | It stands on the fourth and on the sixth: an index of its own and an operation of its own about the versions that were met       |
| 8 · RT-914 | The working order of the taking apart of the cargo     | It stands on the second and comes together with the epic about the conduct of the work: otherwise the mark is held by memory     |

## The boundaries

- **A product agreement of its own is written in every task.** The edit touches the code of the
  application, and the plan of the epic does not replace it.
- **The epic does not appoint a term of the keeping of the cargo** — that is an open question of the
  domain, and it stays open.
- **The epic does not change the recognition of a record.** A review is still recognised by the name
  of the file, a proposal — by the sign of the text; an edit of the text at a tree still arrives as a
  new record.
- **The rework of the conduct of the work goes by an epic of its own.** Here one task comes together
  with it — about the working order of the taking apart of the cargo.

## What it ended with

Eight tasks are closed. A record of the cargo has a state, a path for a tree, the acceptance of a
fixing, the version of the release, the showing by markup, the selection and the order by the state
and by the version — and the working order all of that is put by: `docs/specs/message-bus/cargo-triage/`.
The mark stopped being held by the memory of the executor.

What the epic left open and whose decision it is:

- **What a record no work will go by is marked with.** The set knows no state of a refusal; the
  question `Q-CT-1` of the subdomain about the taking apart of the cargo, it is decided by the owner.
- **Whether the rule of the taking apart of the cargo needs a branch in the gate map.** The question
  `Q-CT-2` there too; the sign is the records whose edit is merged and whose state is the former one.
- **The term of the keeping of the cargo** — as was declared by the boundaries, the epic did not
  appoint it.

The findings about the rules layer accumulated by the eight tasks lie next to it:
`docs/plans/intake-cargo-rules-findings.md`. They are read at once and are made into whatever the
owner names right.

**What came to light after the closing.** The line "the mark stopped being held by the memory of the
executor" is wrong: the mark did not work at all. The sign of the tree was counted by two copies —
the sending by the address whole, the mark by its last word — and the intake answered every mark by a
refusal about a foreign tree. The eight tasks did not see that because the tree had no reading of the
cargo: there was nothing to check the outcome by, and the answer of the call itself served as the
sign of the closing. Fixed by the work about the reading of the cargo RT-1046 — its record is removed
by the term of the keeping and is looked for in the history by the name of the file
RT-1046-intake-read-back.md.
