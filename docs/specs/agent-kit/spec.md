# The agent rules package

**Status:** in force · **Revision:** 2026-08-17 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `verifiability`, `project-documentation`, `delivery`, `work-conduct`, `reuse-first`,
`observability`
**Procedures:** none

## Why

The agent rules package carries laws, rules, patterns, guards, checks, roles and defaults into
another tree. The promise it is installed for is this: the tree gets a working rules layer by one
command, not by rewriting it all by hand.

Today that promise is written down nowhere, and so there is no seeing where it is broken. After the
installation the tree is finished by hand: rule companions are written from scratch, the unneeded
subject layer is switched off one piece at a time, and part of what was laid out cannot fire at all
— the package holds no tool for the chosen kind, and the hook map the layout does not touch. No
refusal comes of it: everything looks installed.

The agreement names what the package promises a consumer on a clean installation and where exactly
it is bound to refuse instead of staying silent.

## Terminology

The terms of the subjects live in the subdomains. What is shared by the domain:

- **Resource** — a unit of what the package carries: a law, a rule, a pattern, a guard, a check, a
  role, a command, a pipeline, a template, a default, a document.
- **Layout** — moving a resource from the package into the tree by its kind and by the layer
  setting.
- **A laid-out file** — a file in the tree with the layout header; it is edited by an override, not
  in place.
- **Override** — a file of the tree that merges with a laid-out one by `## ` sections.
- **Companion** — `implementation.md` next to a rule: what the things the rule speaks of without
  names are called in this tree.
- **Kind of a resource** — the edition of a resource for the chosen value of an axis: the hosting of
  the repository and everything that depends on it.
- **Kind of a file** — what the edit was by its look, without the path: an extension or one of the
  known kinds of the rules layer.

### What it is called in the interface

The package has no interface beyond the launch line. The consumer sees `init`, `sync`,
`sync --check`, `doctor`, `list`, `stats`, `cost`, `propose` and their output. What each of them
does is named by the subdomain it belongs to.

## Rules

The subject rules live in the subdomains — the domain grew three times past the length limit, and
reading it whole for one detail became dearer than finding that detail. The boundaries between
subdomains are the ones the rule groups had already drawn.

- **The scenario prefix belongs to the domain together with its subdomains.** A domain is split when
  its spec outgrows the length limit, and the scenarios move over unchanged: the number ties a
  scenario to a test title, and numbering of its own in every subdomain would mean recounting every
  number at once.

| Subdomain                                                        | About                                                                                          |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [Laying resources out into the tree](layout/spec.md)             | what is laid out and what is not, the requirements of a resource, the refusal cascade, samples |
| [The texts of the rules layer](texts/spec.md)                    | mandatory sections, bindings and anchors, addresses, the flow graph, the review of a family    |
| [The edit guards](guards/spec.md)                                | the plan behind an edit, missing profile functions, the refusal tail                           |
| [The rules gate](rule-gate/spec.md)                              | picking a rule by path and by layers, what counts as a write, taking a shell command apart     |
| [The exam on the rules](exam/spec.md)                            | when it is asked, what counts as passing, what switches the role off                           |
| [The place of an edit](edit-place/spec.md)                       | where a rules-layer text is fixed, what is refused on a laid-out copy and on an override       |
| [The state mark of a cargo record](cargo-mark/spec.md)           | what moves the state of a record, what is refused before the network, how the intake answers   |
| [The applicability sign of a rule article](rule-article/spec.md) | the shape of the sign at an article, picking the article that fits, its text in the refusal    |
| [The turn-closing guards](turn-guards/spec.md)                   | the exits of a turn, the work watchman, the conversation guard, windows, incidents, proposals  |
| [The handover and the entry](turn-entry/spec.md)                 | the handover written before the compaction, the flow map and what a session gets at the start  |
| [The state boundary in texts](state-boundary/spec.md)            | the next-move line in the section, the law article, the flow map and the check over them       |
| [The prose guard](prose-guard/spec.md)                           | officialese and words from the left column of the glossary, a finding with its replacement     |
| [The checks of the tree](checks/spec.md)                         | file length, uniformity, declarations of markup classes, repeats                               |
| [The delivery guards and the push gate](delivery-gate/spec.md)   | the base of a branch, the signature of a machine commit, the completeness of the gate set      |
| [Conducting work by commands](work/spec.md)                      | creating a task, closing a session, the task folder on the merge                               |
| [Observations and cargo outward](observations/spec.md)           | an observation and a digest, proposals and blocks, the send, the snapshot of overrides         |
| [The boundary of the package](package-boundary/spec.md)          | what is carried to a consumer and what stays with the package's own tree, the sign and check   |
| [The cost of context](context-cost/spec.md)                      | what the weight of the input, of a rule and of the layer is counted by; why on the spot        |
| [The publish checks](publish-checks/spec.md)                     | imports from neighbours against the published version of the neighbour, the lock after publish |

## What is out of scope

The boundaries of the subjects are named in the subdomains. What is shared by the domain:

- Publishing a new edition of the package to the registry.
- The generator of rule drafts by a law: it is about creating a new rule, not about the
  installation.
- The launch line and its commands: the set of commands does not change, their behaviour on a
  refusal does.

## Contract

The package has no network contract: it serves no procedures. Its surface is the launch-line
commands and their exit codes; what each command does is named by the subdomain it belongs to.

### Refusal codes

Not applicable: the package answers with an exit code and a text, not with named codes. Zero means
done, one means a refusal with the reasons listed. Where exactly each command is bound to refuse
instead of staying silent — the tables in the subdomains.

## Data

The package has no storage of its own. The state lives in the consumer tree: the setting, the
overrides, the companions and the headers of the laid-out files. The source of resources is the
resource directory inside the package. What exactly lies in each record is named by the subdomain
that lays it.

## Screens and states

Not applicable: the package has no screens.

## Cross-cutting requirements

### Locales

Not applicable: the launch-line output is single-language, and so are the resource texts.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The package serves many trees at once, and not one of them is named in its texts. A tree differs
from a tree by its setting: the layout layer, the values of the axes, the list of what is switched
off, the overrides and the companions. Everything that differs is bound to lie in the tree, not in
the package. The observations of one tree never reach another: they live where they were made, and
that too differs by the same setting — whether the record is on, how long it is kept, where it is
sent.

## Decisions

The decisions of the subjects live in the subdomains. What is shared by the domain:

- **The promise is written by the spec before the fix.** Defects are named as a breach of a written
  rule; otherwise each of them is a private opinion on how the package ought to behave.
- **The domain is split into subdomains by rule groups, not by sections.** The boundaries taken are
  the ones the groups had already drawn; the scenario prefix stayed one per domain, and the numbers
  were not recounted on the move. Rejected: cutting by sections and by hundreds of scenario numbers
  — the reader would have to assemble a subdomain out of two directories.

## Open questions

- `Q-1` — whether the second and the third hosting have tools of their own for creating a task and
  auditing the queue. Today they do not, and a tree on such a hosting is bound either to create the
  kind itself or to give them up by the list; the layout says so and does not do the work for it.
- `Q-2` — whether the hook map stays the business of the project. The package assembles a ready
  piece and checks that it is inserted, but writes into no foreign JSON: the file belongs to the
  tree, and a silent merge would lose what the package knows nothing of.
- `Q-3` — how many companions a tree is bound to fill before the run comes together. On a full
  installation there are twenty-five of them; the articles in them the package moves over, the
  second column the project writes.
- `Q-4` — whether the package should carry the restore order by the handover itself. Today a pattern
  holds it, not a check: the content of a handover is not for a machine to judge.
- `Q-5` — whether the directory index should be checked for the order of its lines. Today only the
  composition is judged: the order in the table does not carry meaning everywhere.
- `Q-6` — the completeness of the set of samples of admitting a miss. It is checked on live sessions:
  a miss admitted in words outside the set adds to the set. This blocks no work — the set was begun
  with the words the admission had already sounded in.
- `Q-7` — what to do with a tree where many requirements are broken. Today it is a warning for each;
  if they pass a dozen, the output will fold to a line with a number and a list on request.
- `Q-8` — the shape of grouping repeats at three trees and more. It is checked on the live data of
  the first digest run. It blocks no work: at two trees grouping by resource is enough.
- `Q-9` — the keeping time of observations. Thirty days are taken. The number changes by one line and
  moves nothing in the construction.
- `Q-10` — whether to judge the length of code in a language whose linter already watches it. Today
  no: two refusals over one file read as two different claims.
- `Q-11` — what to do when debt goes unsorted for months. Today it is visible as a list; the
  threshold past which debt becomes a refusal the tree has not declared.
- `Q-12` — what a tree takes a rule with when its law is refused, should that be needed. Today there
  is nothing: a pick by name limits the kind whole, and naming one rule means losing all the rest.
  There has been no such case yet.
- `Q-13` — what a consumer does with the refusal lines for laws removed when the package is updated.
  The package writes into no tree setting, so the lines stay and turn into warnings.
- `Q-14` — whether the cascade reaches the kinds of resources that have no entry link with a parent:
  hooks, checks, templates, commands. Today no — nothing declares such a link for them.
- `Q-15` — what confirms that a law is carried as a technique, not as a subject. The sign is read by
  a person; there is no check that would refuse a subject law at the entry into the package.
- `Q-16` — how many editions the package remembers removed names for. Taken: until a name leaves the
  set by the decision of whoever edits it. No threshold is assigned.
- `Q-17` — whether a file left over from a removed resource counts as a divergence in the layout
  check. Today no: it is named aloud but does not refuse the layout.
- `Q-18` — whether to check the declared sign bundles against the dependencies of the tree. Today no:
  the tree names them itself, and nobody stops it from naming a kit it does not install.
- `Q-19` — what to do with accumulated uniformity debt when the bundles change. Today the snapshot is
  re-read by hand, by the work that changed the bundles.
- `Q-20` — what confirms that a name in a bundle belongs to the package and not to the consumer tree.
  The sign is read by a person: there is no giving it to a machine, exactly as with the sign of the
  intake in the law. So "the package names only its own names" stands as a question, not as a rule:
  there is nothing to carry it out in code with.
- `Q-21` — what to do with a word said not about the rules layer. Today such a word is told from a
  proposal about the rules by nothing but reading. It is settled by the first reply that turns out to
  be about something else — not in advance.
- `Q-22` — whether the incident guard gives out an observation about the admission of a miss. The
  agreement demanded it, and the code never appeared: the guard catches an admission and demands a
  record, but writes no observation line. While there is none, the number of incidents over a stretch
  is unknown to the digest, and the scenario `SC-AK-161` stands uncovered for the same reason.
- `Q-23` — whether an anchor is bound to be a word of that very statement. The work goes with the
  assumption that it is not: the check looks for the word across the whole file, and this is its
  known boundary, written down in the rule on project documentation.
- `Q-24` — what to do with the question numbers duplicated by the merges of agreements. In the list
  above, the numbers from the first to the fourteenth were created twice: an agreement numbered its
  questions anew, and the merge added both rows together. The recount is postponed — tasks and
  commits refer to a question number, and a shift breaks those references silently.

- `Q-25` — whether to print the name of the tree after it is created by an issued token. The command
  does not know the name: it arrives only as an answer to the exchange by code. The work goes with
  the assumption that the name is not printed, and the link is checked by a dry send.

## History of changes

- 2026-08-09 — the agreement was created and merged into the package spec together with the work
  that carried it out.
- 2026-08-11 — the agreement on reading the rules before a question and on the completeness of the
  spec audit was merged: the conversation guard, the subdomains, the proposed law, the prefix across
  the whole tree.
- 2026-08-11 — the agreement on the glossary, on filling the window and on the session handover was
  merged: a resource kind for the tree's documents, the window-fill watchman and several event
  declarations at one guard.
- 2026-08-12 — the agreement on the gate over three kinds of files, on the audit of bare names and on
  the completeness of the index was merged: a rule and a pattern are judged as a spec, a directory
  counts as an address, the portable text was taken out of the audit, the directory index is checked
  from both sides.
- 2026-08-12 — the agreement that one table of the companion counts as the bindings was merged: the
  rows of descriptive tables stopped being bindings, a rule companion without a bindings section is
  refused.
- 2026-08-12 — the agreement on closing a session by command was merged: the main branch, the merged
  branches and the handover by one call, an audit template tolerant of a one-digit number, a
  continuous count of the work steps, the life of a scenario number and a section for the tree's own
  skills.
- 2026-08-13 — the agreement on where the rules layer stayed silent was merged: a resource
  requirement as a line in the header, a warning about a broken link, what is not picked by name, the
  hook's word about a missing profile function, a resource's conditional speech about a neighbour, an
  incident record and a question to the owner judged before it is sent.
- 2026-08-13 — the agreement on the feedback of the rules layer was merged: an observation in the
  tree instead of a temporary directory, a digest over a stretch with what went unused, proposals
  with an address and their send, the guard of a merged main branch when a PR is opened.
- 2026-08-13 — the agreement on the gate layers and on file length was merged: a layer over the
  domain rule by a file of its own, a sign by the text of the edit, a length limit with a list of the
  accepted and of the debt. By the same move the gate map began judging a call, not a mention, and
  the push gate began calling the laid-out checks and the guard scenarios.
- 2026-08-14 — the agreement on the cascade of refusing a law was merged: refusing a parent removes
  its children, a derived refusal line is declared a warning, what the cascade removed is named
  together with the parent and apart from what was abandoned, and the package remembers the names
  that left the set. By the same move the law on money and the law on the owning entity left the
  package with their rules and patterns.
- 2026-08-14 — the agreement on the uniformity signs was merged: a sign became data, the bundles are
  cut by workshop packages, a tree names its own and appends its own on top of them, and the guard
  and the sweeping audit read one and the same list. By the same move the names belonging to a
  consumer tree left the package resources.
- 2026-08-14 — the agreement on confirming a created task was merged: the creation ends with the
  answer of the work queue, three divergences end the command with a non-zero code, and the decision
  about the output was moved into a pure function of the board module.
- 2026-08-14 — the agreement that the layout names the added debt was merged: articles without an
  address are counted over the tree's companions and named by a number right after the list of what
  was laid out.
- 2026-08-15 — the agreement on the signature of a machine commit was merged: the delivery guard
  reads the mail of the branch's contribution and refuses the push when it diverges from the one the
  tree profile declares.
- 2026-08-15 — the agreement on samples was merged: a resource kind for what is copied into a working
  file, its layout and the header the copy carries away with it.
- 2026-08-16 — the agreement on a person's word mid-work was merged: the feedback command puts a
  block into today's file, creates it from a sample, asks about an unclear address by one question
  and goes to no network — the block is carried away by the ordinary send.
- 2026-08-16 — the agreement on the anchor of a binding was merged: any letter counts as a symbol,
  the alphabet is not listed out, the path of the pair stays Latin.
- 2026-08-17 — the spec was split into six subdomains: the domain had outgrown the length limit three
  times over. The rules, the scenarios and the bindings moved over unchanged, the scenario numbers
  were not recounted.
