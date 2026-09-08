# The rework of the conduct of the work

The reviews of the incidents stop repeating because the rules layer changes the behaviour of the
executor, not because one more article is appended into a rule.

## Why

In the intake as of 19 August 2026 lie 49 reviews of the incidents and 54 proposals from two trees:
from the consumer tree — 28 reviews and 15 proposals, from this one — 21 and 39. They were gathered
over five days.

The cargo was not exhausted by the intake. On the disk of this tree lie 38 reviews, and in the intake
there were 21 of them; the seventeenth and three proposals left there by a sending at the word of the
owner — in the intake there became 50 reviews and 57 proposals. Sixteen still lie on the disk alone:
all of them have already moved into the directory of the taken apart, and the sender does not take
them. The whole corpus is 66 reviews and 57 proposals, and the count must go by it: a review left on
the disk describes the same kind of miss as one that left.

The cargo is not scattered over the whole rules layer but sits in two of its places. To the conduct
of the work fall 23 proposals of 54 — the rule, three patterns at it, its law and three guards; to
the delivery — 14. Forty-three per cent and twenty-six; to all the rest together — thirty-one.

The count must go not by the proposals but by the repetitions. `next-task-taken-formally` arrived
three times — on the 17th, the 17th and the 19th of August — and every time with a new proposal to
append an article. In this tree the review about a plan written for the sake of lifting a refusal of
a guard repeated on the same day it was written — by a layout laid earlier than the making up of the
work.

The local corpus says the same and louder. Of the 38 reviews of this tree twenty have already moved
into the directory of the taken apart — that is, a task is created under each. Among them are "A
report instead of the work", "A report instead of the work again", "The turn ends with a report, the
work stands: four times in one session", "Questions instead of the work", "The next task is named
aloud and not taken", "The waiting for a foreign step is made the content of the turn". They were
created from the 13th of August — and exactly the same miss arrived in the intake on the 18th and the
19th of August from both trees.

Here is the main number of the epic: the work by the reviews was going, the tasks were being created,
the articles were being appended — and not a single class of a miss closed.

That is the ground for the epic: the rules layer has already described each of these misses, and the
misses did not stop from that.

## What was found: five groups

The reviews are divided not by subjects but by the mechanism — by what exactly the miss ended with.

| The group                                          | Reviews | The mechanism                                                                                                                       |
| -------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| The turn ends instead of going                     | 27      | The artefact of a step is created — a branch, a folder, a column, a PR — and the turn ended at that; there is no work by the step   |
| The artefact of the delivery is in the wrong state | 14      | The PR is opened from yesterday's tip, without a reviewer, by the wrong account, merged before the tidying, the branch is recreated |
| The rules layer is fixed not where it is broken    | 8       | The override is wiped by a write of the file, a package text is edited inside the override, a refused edit landed past it           |
| What is inconvenient is muffled, not fixed         | 7       | A check is muffled, an exception of the linter is proposed instead of a fixing, the red is written off on the machine               |
| What is said to the owner diverges from the tree   | 10      | What lies on the disk is called ready, what is removed only locally — removed, a part of the set — checked                          |

The five groups cover all 66 reviews whole — 49 from the intake and 17 lying on the disk alone. The
product defects — there are two of them — stand in the last group: they are taken apart by code, not
by rules.

## Why there are so many of them

The reason is one, and it is not in the executor.

**The rules layer grew symptomatically.** Every review ended with a proposal to append an article or
a pitfall — into the same resource the miss already described. The rule of the conduct of the work
grew to seventeen steps, three dozen articles and a dozen pitfalls. A text of such a length is read
once, at the start of the session, and is not reread in the minute when a decision is taken. A new
article changes the text and does not change the behaviour — that is visible right by the cargo:
three identical reviews in a row, and three proposals to append an article about what an article
already stood about.

Three things follow from that, and each holds its own group of the misses.

- **The guards judge an artefact, not a transition.** They ask "is there a folder, a branch, a
  column" and never "did a transition of the state happen". An executor judged by an artefact is the
  one who produces the artefact: hence the nineteen reviews of the first group, where the branch is
  created, the column is moved, and there is no work.
- **A turn is not counted a unit of the account.** Nowhere is it said what a turn ends with lawfully.
  So it can be ended by a declaration of the next step, by a menu for the owner or by the waiting for
  a foreign step — and each of the three looks like finished work. The guard of the waiting is created
  later and patches a part of the cases instead of defining them.
- **A claim to the owner is derived from nothing.** The rule of the texts says itself that a reply to
  the owner is read by no check. Hence the fifth group whole.

**The feedback of the layer accumulates a text, not an execution.** A proposal is counted closed only
having entered a resource of the package; fifty-four proposals lie in the queue, and until then the
misses that gave birth to them are closed by nothing. A review that ended with a proposal is from
outside indistinguishable from a review that ended with a fixing.

## Decisions

- **The unit of the conduct of the work is a state, not a step.** The list of seventeen steps is
  replaced by a list of the states of the work with a declared transition between them. A state is
  declared machine-readably, by one line in the progress, and the guard judges the transition: an
  artefact without a transition stops being an evidence that the step is done.
- **Every state has a declared mandatory next action, and "to wait" is never one of them.** A state
  whose next action is the waiting for a foreign step is declared unlawful: an action executable now is
  named for it. This closes the first group whole, instead of six pitfalls patching it one by one.
- **A turn ends only at a permitted exit.** The exits are four: a question there is no answer to in the
  rules; a refusal of a guard; a filled window; the work is handed in and the next one is begun.
  Everything else is a continuation of the turn. Now this is partly done by the guard of the waiting;
  here it becomes a definition, not a patch.
- **The readiness for the delivery is one state, set once and whole.** The base of the branch, the
  account, the reviewer, the column, the taken-apart folder are checked together, not one at a time at
  the minute of the call: the conditions of the delivery are set at the start of the work and asked at
  the end — hence the second group.
- **The red has an assigned action.** A refusal of a check leaves exactly two lawful turns: to fix the
  code or to bring the owner the price of a bypass. A check must not be muffled without their word, and
  the word said is written down there where it is muffled.
- **A claim about the tree is derived from a command.** Everything the report to the owner says about
  the state of the tree carries a command and its output. What is said without a command is not counted
  a claim.
- **A repeat proposal does not append an article.** A proposal repeating a claim that already stands
  either turns it into a check or a guard, or is rejected. A rule grown to the length limit is divided
  or moved into an execution — appending into it is not allowed.

## The order

The card of the epic is the task RT-896; every line below is created by a task of its own.

| №          | Task                                                                            | Why here                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 · RT-897 | The states of the work instead of the list of the steps                         | The foundation for all the rest: without a declared state the guards have nothing to judge apart from the artefacts                         |
| 2 · RT-898 | The permitted exits of a turn and the ban of the waiting                        | The largest group — 19 reviews. It puts a guard on the ending of a turn and lifts six pitfalls patching it one by one                       |
| 3 · RT-899 | The readiness for the delivery by one state                                     | 12 reviews. It edits the delivery, so it goes after the states are declared                                                                 |
| 4 · RT-900 | An assigned action at the red and at a ban                                      | 6 reviews. It touches the checks and the guards, apart from the conduct of the work                                                         |
| 5 · RT-901 | A claim to the owner is derived from a command                                  | 5 reviews. It edits the rule of the texts and the sample of a report; it rests on nothing                                                   |
| —          | The edit of what is laid out, of the overrides and the sending of the proposals | Left for the epic RT-956 as the task RT-902: the repeat proposal is there too, and both are about the feedback of the rules layer           |
| —          | A repeat proposal becomes a check, not an article                               | Left for the epic RT-956 as the task RT-903 and goes there second: it judges the place the edit lands in                                    |
| —          | The mark about what is taken into work in the intake itself                     | Left for the epic RT-907 as the task RT-908: the acceptance of a fixing, the version of the release and the showing by markup are there too |

## The boundaries

- **A law is not edited in the branches.** The articles of the laws about the conduct of the work and
  about the delivery are brought to the owner as a text; the work goes on without them.
- **The package is edited, not one tree.** The conduct of the work is a resource of the package, and
  the misses arrived from two trees at once; a fixing in the override of one tree does not concern the
  second.
- **The product defects are not included here.** Two reviews about a showing and a layout are created
  as tasks of their own.
- **The taking apart of a foreign cargo does not do the foreign work.** The consumer tree gets a
  corrected edition of the package; this epic creates no tasks in its queue.

## What it ended with

20 August 2026, five tasks of seven; the two remaining are taken out into an epic of their own.

| Task                             | What it ended with                                                                                                                                              |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RT-897 — the states              | Eleven states of the work instead of a list of seventeen steps; the guard judges the transition between them                                                    |
| RT-898 — the exits of a turn     | A turn has four lawful exits declared, and the guard does not let out a turn in which nothing was done by the work                                              |
| RT-899 — the readiness           | The conditions of the delivery are asked by one state and where they are still cheap to fix; the refusal names what did not coincide whole                      |
| RT-900 — the red and the refused | A red check and a refused edit have an assigned action; the refusal of the guard names two lawful turns and the form of a bypass                                |
| RT-901 — a claim about the tree  | A claim to the owner about the tree is confirmed by a command of the turn, not by memory; the guard of the claim judges it together with the check of the style |
| —                                | The edits of the five tasks are gathered by the edition `0.10.0`; its release is led by the task RT-955                                                         |

**What the epic did not do.** The feedback of the rules layer stayed where it was: the edit of what is
laid out and the sending of the proposals go by hand, and a repeat proposal appends an article instead
of becoming a check. Both tasks stand in the epic RT-956, the plan is
`docs/plans/rules-feedback-loop.md`.

**The findings of the review of the work by the rules** lie next to it —
`docs/plans/work-conduct-rework-findings.md`: twelve of them by three addresses, and the owner reads
them at once.

**What turned out costlier than in the plan.** The order of the tasks held, but the number of the
turns per task did not: every edit of the conduct of the work aged the layout of the whole tree, and
the lifting of the edition at the end moved it all at once. The sign "the package is edited, not one
tree" was confirmed: not one of the five tasks ended with an override.
