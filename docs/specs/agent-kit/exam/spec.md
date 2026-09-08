# The exam on the loaded rules

**Status:** in force · **Revision:** 2026-08-23 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `verifiability`, `work-conduct`
**Procedures:** none

## Why

A loaded rule and a read rule are indistinguishable to the tree: a rule travels into the context
whole and is carried out selectively. The exam asks the executor about what they loaded during the
session, and until it is passed no edit goes. The subdomain names when the exam is asked, what counts
as passing and what switches the role off.

The other edit guards are a neighbouring subdomain: the subject there is different, and they grow
apart.

## Terminology

- **The exam** — a call of the role that asks the executor about the rules loaded during the session
  and gives a verdict.
- **The verdict** — the answer of the role: a score and a word about whether it is learned or not.
- **Passing** — a full score. Any answer not counted is not a pass.
- **A switched-off role** — a role named in the list of the tree's switched-off roles; the guard at it
  leaves silently, and the role itself stays laid out.

### What it is called in the interface

The exam has no interface: only the executor sees it — as the questions of the role and the text of a
refusal in their own turn.

## Rules

- **No edit goes while the exam on the loaded rules is not passed during the session.** A loaded rule
  and a read rule are indistinguishable to the tree: a rule travels into the context whole and is
  carried out selectively.
- **Only a full score counts as passing.** Any answer not counted means the rule is re-read whole, not
  the piece of it that was asked about: an answer shown gives knowledge of one line.
- **The exam is asked twice: at the start of the session and before the draft is lifted.** Between
  reading the delivery rules and lifting the draft lies the whole session, and the first exam says
  nothing about the second: they ask about different things.
- **The second exam is asked only where there is an open request.** Without one there is nothing to
  lift, and the demand would refuse calls that have nothing to do with the readiness of the work.
- **The records of a turn are gathered into one stream in order.** A command and the answer of a tool
  lie in different fields of the record, and an index from one array means nothing in another: that is
  how a verdict given before a request was opened read as given after it.
- **The last verdict of the role is judged, not the first.** Otherwise an exam passed once would hold
  the edit open until the end of the session, whatever happened after.
- **A role switched off by the tree holds no guard at it.** The guard leaves silently, and the role
  itself stays laid out: what is switched off is the obligation to call it, not the role, and it can be
  called by hand at any minute.
- **A setting that cannot be read does not switch a role off.** The guard judges as it judged: a broken
  read putting the role out would switch the rules layer off silently, and there would be nothing to
  notice it by.
- **The other commands of the hosting client the guard does not judge.** It stands at the lifting of a
  draft, not at every call of the client.
- **The verdict of the second exam is looked for in all the shapes of a turn record, as the verdict of
  the first is.** A role working in the background gives its result back as a notification of the host:
  it has no record of the kind "answer of a tool", and the narrow selection that read only commands and
  answers did not count the second exam. Two selections differ by the point of reference, not by the
  set of shapes.
- **The refusal has an exit that does not demand lifting the protection.** The list of switched-off
  roles lies in the setting of the tree, and the runtime environment may forbid editing such a list by
  a mechanism of its own: an exit available only through switching the check itself off does not work
  in such an environment. The second exit is a declared bypass as a line in the body of the last commit
  of the branch: it stays in the history and is visible to the owner on the page of the request.
- **Both refusals say that the path through the list of switched-off roles demands lifting the
  protection.** Otherwise the executor spends a turn on an attempt a mechanism outside the rules layer
  forbids.
- **A call of the client counts as lifting the draft, not an occurrence of words.** A command that
  writes about the lifting was checked on a par with the lifting itself, and the refusal arrived at an
  attempt to describe this defect.

## What is out of scope

- The content of the questions: they are assigned by the role, not by the guard.
- Judging whether the executor understood the rule deeply: the guard sees a verdict, not understanding.
- A rule the executor read as a file past the loading: it adds nothing to the list of the loaded, and
  there is nowhere for the role to ask about it from.

## Contract

The surface is the events of the agent: editing a file and a call of the hosting client that lifts a
draft. The answer of the guard is either a pass or a refusal with a text naming what the refusal is
lifted by.

### Refusal codes

Not applicable: the guard refuses a call before it is carried out, and such a refusal has no command
exit code.

| What happened                           | How it ends      | What it says                                          |
| --------------------------------------- | ---------------- | ----------------------------------------------------- |
| an edit without a passed exam           | the call refused | the name of the role and that passing is a full score |
| lifting a draft without the second exam | the call refused | what is asked before the lifting                      |
| the role is switched off by the tree    | a pass           | nothing: the guard leaves silently                    |

## Data

There is no storage of its own: the verdict is read from the record of the turn, the list of
switched-off roles from the setting of the tree.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

The guard lets the action through when it is itself broken: no input parser, empty input, the wrong
directory — the move is allowed. A broken check has no right to jam the work.

### Locales

Not applicable: the refusal texts are single-language.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The guard is one for all trees, and the list of switched-off roles arrives from the setting of the
tree. A tree that switched the role off gets no guard at it; the package has no list of its own.

## Decisions

- **The exam is asked twice, not once.** The first asks about the rules loaded at the start; the
  second about the delivery rules, which are loaded towards the end of the work. Rejected: one exam per
  session — it says nothing about the second set of rules.
- **The last verdict is judged, not the best one.** A failure after a pass means the rule managed to be
  forgotten; the best verdict would hold the edit open until the end of the session. Rejected: any
  passed verdict during the session.
- **Switching a role off is read from the setting of the tree, not from removing the file of the
  role.** A removed file takes the role away together with the possibility of calling it. Rejected:
  giving up the file of the role.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## History of changes

- 2026-08-23 — the subdomain was split off from the subdomain of the edit guards, which had outgrown
  the length limit. The rules, the scenarios and the bindings of the exam moved here unchanged: the
  scenario numbers were not recounted.
