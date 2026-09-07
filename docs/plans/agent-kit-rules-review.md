# The review of the texts of the rules layer

An edit of a law or a rule that diverged from the rest of the texts of the package is found before
the release of a version, not in a foreign tree a week later.

## Why

The package carries seventeen laws, twenty-six rules and forty-five patterns at them. What they say
apart is read; what they say together is read by nothing. Today the texts are reconciled by
`integrity` — the links of the headers, a rule has a law, a pattern has a rule — and a set of bans on
words in `tests/texts.test.sh`. Neither of them judges either the completeness of a description or
the agreement of two texts with one another.

A defect of that kind already lies in the package and was found by a measurement before the work
began: the sample of a rule `assets/templates/rule.md` declares the section "When it is taken", which
is in not one of the twenty-six rules, and all twenty-six carry three sections the sample is silent
about. The form by which a new rule is created diverged from the whole corpus of the rules, and there
was nothing to see that by: the layout lays the files, it does not read them.

## Decisions

- **The layer is of two parts.** The machine counts what is countable: a resource without a mandatory
  section of its own kind, a rule without a single pattern, the name of a neighbour that nothing in
  the set answers to, the address of a specific tree inside a block of code. The role reads a family
  whole and looks for what the machine does not see: two texts saying different things about one
  matter, and a case not one of them named.
- **The review is called by two ways**: by a command by hand and by the machine part in the set that
  is run before a push. A hook on an edit of a file of a resource is thrown out of the work — an edit
  of these files is the work in the package itself, and the hook would go off at every movement by
  the direct appointment.
- **The unit of the work of the role is a family, not a file and not the package.** A family is a
  law, the rules under it and the patterns at them. The texts of the resources do not fit into the
  window of a session whole, and a role reading everything at once gives back a crumb per file
  instead of findings.
- **A graph depicts the course of a rule and lies in the text of the rule itself.** It is created for
  all the rules, not only for those whose course branches: a rule without a graph is read differently
  from a rule with one.
- **A gap of the level "an article of a law without a rule" is not given to the machine.** Every law
  has a rule, and at the level of a law such a check finds a zero; for it to become finer than a law,
  every article needs an anchor by hand — there are more than two hundred of them, and in half a year
  they will stop being put. The gaps are looked for by the role.

## The order

| №   | Task                                                                                     | Why here                                                                                                                                    |
| --- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The machine half: the articles of a law, the check of the texts, the refusal in the gate | It puts a new refusal into the gate and edits a law that leaves for all the trees. A false going-off is rolled back by one branch           |
| 2   | The role of the reviewer and the command of the meaning review                           | It puts two new resources into the layout. The halves are called apart: the machine one works without the role, the role — without the gate |
| 3   | The graphs of the course in the rules and the merging of the agreement                   | It edits the texts of the rules in force, by which the agent works in every tree. It is rolled back by itself                               |

The order holds to the end of the epic. A reconsideration is a decision of the owner, and it is
written into the progress of the task that called it.

**What the first ended with.** The task RT-703, PR #709. Six articles stand in the law about the
documentation of the project and are laid out into the constitution. The check counts four kinds of
divergences and refuses a push — confirmed by the removal of a section at the rule about the lists:
the run turns red, the return of the section turns it green. The sets of the sections are declared by
data, not derived from the sample of a kind; nine kinds of thirteen are declared silent. The debt "a
rule without a pattern" was measured and turned out zero — the check is created for the future. The
defect the layer was created for is fixed by the same branch: the sample of a rule is brought to the
declared set and from this day is judged on a par with the corpus — the section nobody has it no
longer declares, and about the three that all carry it is no longer silent.

## What is not included

- **An automatic fixing of what is found.** The review names a divergence and a gap, a person edits.
- **The review of the texts of the tree itself.** The specs of the domains, the READMEs and the tree's
  own skills stay outside: what is checked is what the package carries.
- **A hook on an edit of a file of a resource.** Thrown out by the decision of the owner.
- **A refusal of the build on a meaning finding.** Only the machine part stands into the gate and the
  pipeline: the answer of the role does not repeat from launch to launch.
- **The fixing of everything found.** A part of the findings is fixed by the same epic, the rest goes
  as tasks into the work queue.

## The sign of the closing

The review is run over two or three families, the owner read the list of the findings and confirmed
that these are defects, a part of them is fixed by the same epic. A check that found nothing is
indistinguishable from one that does not work.

## Next to it, but not in the epic

Two product agreements lay in the directory of the proposed unmerged — they are older than this work.
A task of its own was created for their merging, and the merging took place by it: there is no
directory of the proposed in the tree any more.

## What it ended with

16 August 2026, four tasks instead of three.

| Task                              | What it ended with                                                                                                                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RT-703 — the machine half         | The set of the completeness of the texts of the package: the sections by the kind of a resource, a rule without a pattern, the name of a neighbour without an answer. It stands in the gate of the push      |
| RT-704 — the role and the command | The role of the review and the command of its call. The very first run found five divergences in a family on which the set of the completeness is green                                                      |
| RT-705 — the graphs               | A graph of the course at each of the twenty-six rules, a check at it, the sample of a rule. The first run of the role found in the fresh graphs five divergences with the prose — the same branch fixed them |
| RT-706 — the merging              | Both agreements in the spec of the domain, the directory of the proposed is removed                                                                                                                          |
| RT-735 — outside the order        | The findings of the review of the PR of the task RT-704: the command sewed in the layout of the repository of the package and gathered the family not whole                                                  |

**What the epic left and what that ended with.** Nineteen divergences and gaps over two families it
left lying as a text — the owner did not read them then. They were taken apart later, by the epic
RT-1198: the file `docs/plans/agent-kit-rules-review-findings.md` names by every item what it ended
with — the tasks RT-1604, RT-1210, RT-1580, RT-1211, RT-1212 and RT-1213. Nothing unsorted is left in
it.

**What turned out costlier than in the plan.** The order of the tasks held, but their number did not:
the review of the work of the second task gave back findings a fifth one had to be created for. The
sign "two or three families" was confirmed from the first run: the review found defects in texts the
machine half counts whole.
