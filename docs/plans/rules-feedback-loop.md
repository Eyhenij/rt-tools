# The feedback of the rules layer

An edit of the rules layer reaches the place where the miss is fixed, and a proposal reaches an
execution, not one more article.

## Why

The epic about the conduct of the work closed five misses of five groups and left two open. Both stand
in one place: the rules layer takes in the feedback and accumulates a text instead of an execution.

The first is about the address of an edit. Eight reviews of the group "the rules layer is fixed not
where it is broken" say one thing: an override of 242 lines is wiped by a write of a new file over it,
a package text is edited inside the override, a refused edit landed by a neighbouring instrument.
Every time the edit reached the disk and did not reach the place where the miss is fixed: in the tree
it is visible, in the package it is not, and a month later the layout refuses on the edited copy whole.

The second is about a repetition. The rule of the conduct of the work grew to three dozen articles and
a dozen pitfalls, and every review ended with a proposal to append one more — into the same resource
the miss already described. A text of such a length is read once, at the start of a session, and is not
reread in the minute when a decision is taken. One and the same review arrived three times over three
days with three proposals about one thing.

What they have in common is what a review ends with. A proposal is counted closed when it is written,
not when it entered a resource of the package; an edit is counted laid when it landed on the disk, not
when it reached the source. Both times the appearance of the work differs from the work, and only
whoever comes next can notice that.

## Decisions

- **An edit of the rules layer has one address, and it is checked.** A package text is edited in the
  package, the names of the tree — in the override, a laid-out copy is not edited at all. What goes
  where is decided not by memory but by a check.
- **A repeat proposal does not append an article.** One repeating a claim that already stands either
  turns it into a check or a guard, or is rejected.
- **A rule grown to the limit is divided or moved into an execution.** Appending into it is not allowed.

## The order

The card of the epic is the task RT-956; every line below is created by a task of its own.

| №          | Task                                                                            | Why here                                                                                              |
| ---------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1 · RT-902 | The edit of what is laid out, of the overrides and the sending of the proposals | It fixes the place the edit lands in. Without it the edits of the second task will land there past it |
| 2 · RT-903 | A repeat proposal becomes a check, not an article                               | It closes the reason both epics were needed for: a review ends with a text, not with an execution     |

## The boundaries

- **A law is not edited in the branches.** The articles of the laws are brought to the owner as a text;
  the work goes on without them.
- **The package is edited, not one tree.** Both tasks touch a resource of the package, and a fixing in
  the override of one tree does not concern the second.
- **The former epic is not reopened.** RT-896 is closed: its five tasks are merged, and this work does
  not undertake to take them apart anew.

## Where it came from

Both tasks were created inside the epic RT-896 and postponed by the owner when the other five were
merged. The plan of that epic is `docs/plans/work-conduct-rework.md`; there too is the count of the
reviews by the five groups both tasks came out of.

## What it ended with

Both tasks are closed. An edit of the rules layer reaches the place where the miss is fixed: the guard
of the place of an edit names the address in the minute of the edit, the guard of the override refuses
a write over a non-empty one, and a laid-out copy is not edited at all. A repeat proposal does not
reach an article: the block of a proposal names the nearest claim of the resource by an exact
quotation, and the sending looks for it in the resource and refuses the one not found. A similarity of
the texts does not fit here — this is measured: a lawful neighbouring of two articles of one rule gives
0.345 of common meaningful words, a lawful moving of an article to a neighbouring place — 0.355, and
there is no threshold between them.

The findings of the epic were taken apart by the task RT-1582 — each is read against the present code,
not against the body of the task that wrote it. Three are taken out into works of their own: the
laid-out files outside the list of the formatter — RT-1583, a silent guard in the digest of the
observations — RT-1584, an agreement waiting for a merge longer than a month — RT-1586.

What the epic left open and whose decision it is:

- **The article of the law about the three outcomes of a review.** The text lies in the record of the
  past of the record about a repeat of a proposal — removed by the term of the keeping, in the history
  it is looked for by the name of the file RT-903-proposal-repeat.md, the section "The article of the
  law brought to the owner"; the owner decides. Without it the law obliges a review to give birth to a
  text, and the refusal by a quotation leaves a part of the reviews without a lawful end. The boundaries
  of the epic declared this in advance: a law is not edited in the branches.
- **The limit of the rule of the delivery.** It stands two lines from the limit, and there is nothing to
  divide it by: the rule has one law and one subject. It is written down by its own pitfall.

## The findings of the tasks of the epic

They accumulate here while the epic is not over: a task folder dies with the merge, and the owner must
read them at once.

**Taken apart by the task RT-1582.** Every finding below is read against the present code, not against
the body of the task that wrote it.

Closed earlier, by foreign works: the header in a copy of the sample and the printed line `cp -r` — the
command of the creation of a task removes the header itself; the paths from the text of a command — by
the task RT-1571; "over this, not instead" — by the wording of the guard of the waiting; the form of
the waiting in the map of the claims — by the map itself; a section of the rules with subheadings — by
the checking that reads a section up to a heading of the same level; the similarity of the texts as a
sign of a repetition — by RT-903 itself, refusing by a named quotation.

Closed by this task, by a line in the rules layer: the moving of a "not carried out" binding together
with its article — by an article of the rule `spec-driven`; the check of the requirement "the step is
done" at the ending of a turn, a claim with several places of an execution and the list of the tree
before the common words — by three misses of the pattern `spec-driven-rule`; the selection of the tasks
into an epic by an outdated body — by a pitfall of the rule `task-flow`.

Created as tasks of their own: the laid-out files outside the list of the formatter — RT-1583; a silent
guard in the digest of the observations — RT-1584; an agreement waiting for a merge longer than a month
— RT-1586.

Waiting for the owner: the article of the law about the three outcomes of a review — its text lies in
the record about a repeat of a proposal, removed by the term of the keeping; in the history it is
looked for by the name of the file RT-903-proposal-repeat.md.

Fell away: the limit of the rule of the delivery — its cold part is already taken out, and there is a
margin to the limit of the weight; there is still nothing to divide the rule by, and that is written
down by its own pitfall.

### RT-902 — the place of an edit

- **A laid-out copy is edited not by a hand alone.** The formatter of the tree, having reached a
  laid-out file, rewrites it its own way, and the layout reads that exactly as an edit by hand; the
  guard of the place of an edit does not reach here — it judges a call of the agent, and the formatter
  works by a hook of the version control system. This is held by a list by name in the setting of the
  formatter, and the list falls behind silently: a check is created that every file with the header of
  the layout stands in that list.
- **Three parts of the plan turned out closed before the work began.** The argument of a help no longer
  begins the sending, the mark about a sending lands in a block of its own at any number of them, and
  the guard of a proposal tells a dry run from a sending. The grill of the request claimed the opposite
  — the record in it was older than the code. The selection of the tasks into an epic is worth beginning
  with a reading of the code, not of the body of the task: months pass between them.

### RT-903 — a repeat proposal

- **A similarity of the texts does not tell a repetition apart — this is measured.** A lawful
  neighbouring of two articles of one rule gives 0.345 of common meaningful words, a lawful moving of a
  successful article to a neighbouring place — 0.355. Any check that starts judging the proposals by a
  threshold of similarity will refuse edits instead of repetitions; the refusal judges a named
  quotation, that is, a fact.
- **Three parts of the task turned out closed before it began** — the same as at RT-902: the argument
  of a help no longer begins the sending, the mark about a sending lands in a block of its own at any
  number of them, the guard of a proposal tells a dry run from a sending. The body of the task described
  a tree a month old. The selection of the tasks into an epic must begin with a reading of the code.
- **The article of the law about the three outcomes of a review waits for the owner** — the text lies in
  the record about a repeat of a proposal, removed by the term of the keeping; in the history it is
  looked for by the name of the file RT-903-proposal-repeat.md, the section "The article of the law
  brought to the owner". Without it the law still obliges a review to give birth to a text, and the
  refusal by a quotation leaves a part of the reviews without a lawful end.

### RT-1046 — the reading of the cargo

- **A copy of the sample carries the header of the layout.** A task folder is gathered by `cp -r` from
  the sample, and the files of the sample are laid out by the package and carry the header `rt-kit`.
  The guard of the place of an edit refuses the very first edit of the grill of the request — that is,
  the first movement of any work. The header is removed by three lines, but there is nowhere to know
  that in advance: the command of the creation of a task prints `cp -r` and is silent about the header.
  It fits either as a line in the command itself — to lay the copies without a header — or as a branch
  in the guard: a file under the directory of the tasks is not counted a laid-out copy.

### RT-1049 — the header in a copy of the sample

- **The trace of the origin was read as a claim about the file.** A copy of the sample carried the
  header of the layout, and the guard of the place of an edit counted it laid out. The spec of the
  layout at that already said the right thing — "laid out is a file by the path of the layout" — and the
  guard did not follow it, and the divergence between the text and the guard is seen by no checking. It
  fits as a line in the pattern of the creation of a rule: at an article a guard carries out, the
  binding leads into the guard itself, and they cannot diverge silently.
- **A line printed by a command into a hint is executed as it is.** `cp -r` was a hint and became the
  way to gather the folder — together with the header. A command that can do a step itself does it: a
  printed line is checked by nothing and is repeated by hand with mistakes.

### RT-1056 — the word of the owner and the silence of the guards

- **A list lying in a companion loses to an argument lying in the head.** A common argument comes into
  the context always, and a list — only when it is read. The rule now says this by an article, but the
  case is wider than one list: every time the package demands "the list is named by the tree", it also
  demands that the list be read earlier than the common words. It fits as a line in the pattern of the
  creation of a rule — next to how the companion is named.
- **The agreement promised what the executor did not do, and both sides were silent.** The spec of the
  guards openly allows a file to declare several events, the binding led into the gathering of the
  setting — there everything read right — and the dispatcher read one. The binding names one place of an
  execution, whereas the article is carried out by two: the check reconciles the presence of a line, not
  the completeness of the list of the places. It fits as a check: an article whose claim is carried out
  by several sides names them all.
- **A guard that catches at a repetition and is silent at a live turn is struck out of the list of the
  defences.** The sign "the guard refused" was taken from what it can refuse, not from the fact that it
  refused at least once. Three guards judged a text that was not in the record, and all three were
  honestly silent. It fits as a digest of the observations: a guard that refused not once over a stretch
  is named in it apart — a silent guard and an unneeded guard look the same exactly up to a review.
- **The gate of the rules reads the paths from the text of a command whole.** A write of a task folder
  by a command of the shell was refused as an edit of the code: the addresses under the directory of the
  package stood in the body of the plan, not in the goal of the write. It fits as a line in the gate
  itself — the path is taken at the writing piece of the command, not at the line whole; the same edit
  was already made for another guard, and here it is not repeated.

### RT-1059 — the drafts of the handed-in work

- **A guard judging whoever does an action is silent about whoever does not do it.** The guard of the
  lifting of a draft stands at a call and therefore does not see what is undone at all. The same gap
  will be at any guard tied to a call: it catches a form, not an absence. It fits as a line in the
  pattern of the creation of a rule — at a requirement "the step is done" the check stands at the ending
  of a turn, not at the call of the step.
- **A requirement named by one phrase is carried out literally and instead of the neighbouring one.**
  "Take the next task" was carried out exactly — and what was handed in stayed invisible. It fits as a
  rule of the wording: a requirement added to a former one is written by the word "over", not as a
  separate item next to it.
- **The words about the waiting for a foreign step are the same kind of claims as those about the
  tree.** The map of the guard knew "the run is green" and did not know "I am waiting for the run",
  although they have equally much to lie by. It fits as a walk of the map: every claim about a state has
  a form of the waiting, and both stand in the map as a pair.

### RT-954 — the run driven out of the queue

- **The rule of the delivery runs into the limit of the text at every new article.** It stands two lines
  from the limit, and the next article will again force something out of it. There is nothing to divide
  it by: the rule has one law and one subject, and rules have no subdomains — the division is provided
  only for the specs. It fits either as a second rule under the same law with a named boundary between
  them, or as a moving of the cold part whole: now both the requirements and the behaviour from the
  reviews of the incidents lie in the rule, and only the second can be taken out.
- **The line of a binding holds an article in a rule stronger than its content.** An article carried out
  by nothing still cannot be taken away into the cold part without removing its line of the companion:
  otherwise the checking of the specs sees a binding without an item. It comes out that the admission
  "it is carried out by nothing" costs more than a real binding — it locks the article into the hot
  part. It fits as a line in the rule of the conduct of the specs: a "not carried out" binding moves
  together with its article.

### RT-940 — the domain of the first kit

- **A section of the rules broken up by subheadings is read by the checking as a section without
  rules.** A spec put together from three agreements naturally asks for three groups, and the checking
  counts the items only up to the first heading of any level. The refusal at that says "there is not a
  single item", although there are fourteen. It fits either as a reading of the items to the end of the
  section of the upper level, or as a line in the pattern of the spec of a domain: the subjects must not
  be grouped by subheadings inside the rules.
- **The binding of an agreement goes stale while the agreement waits for its domain.** Three of them lay
  in the "proposed" for a month, and over that time the declaration moved into a neighbouring directory:
  the binding led into nowhere, and only the checking at the merging noticed that. It fits as a line of
  the audit of the work queue: an agreement ready for a merge longer than a month is named by a line of
  its own — now it is seen only by `check:specs`, and that at the very end of the output.
