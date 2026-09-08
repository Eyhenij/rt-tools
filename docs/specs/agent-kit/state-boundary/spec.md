# The boundary of a state in the texts of the work

**Status:** in force · **Revision:** 2026-08-22 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `work-conduct`, `project-documentation`
**Procedures:** none

## Why

The work goes by states, and every state has a mandatory action. Having done it, the executor stands
at a boundary: what is done is named, there is something to report — and the turn asks to go
outward, although it has four lawful exits and the boundary of a state is not among them.

The subdomain names what this boundary is closed by in the texts: by the line of the next move in
every section of a state, by an article of the law, by a statement of the rule, by a line of the map
of the turn — and by a check that reads all of this and refuses a divergence.

The subject here is prose, not an action. The guards judging the end of a turn are a neighbouring
subdomain: they look at what was done during the turn and know nothing of what is written in a
section.

## Terminology

- **A section of a state** — a piece of a pattern that leads the executor inside one state. There
  are eleven states, and more sections: three states have two and three of them.
- **The line of the next move** — the last line of a section: it names what is done right after the
  mandatory action of this section.
- **The opening** — the shared start of all such lines, the check finds them by it.
- **The tail** — the rest of the line after the opening: it is its own at every section.
- **The leading pattern** — the pattern the section of the state lies in.

### What it is called in the interface

Not applicable: the subdomain has no interface — its reader is the executor, not a user.

## Rules

- **A section of a state names the next move.** A section breaking off at the last technique reads as
  the end of the work: nothing is written after it, and the turn ends with a report.
- **The line stands in every section of a state, not one per state.** A state that has several
  sections leads the executor through them separately, and they read to the end the section they
  stand in: the next move at the exploration and at the review with the owner are different, although
  the state is one.
- **The wording is its own at every section.** A line identical word for word reads as a template and
  stops being noticed at the third section — and it has to be noticed exactly at the minute when the
  mandatory action is done and the turn asks to go outward.
- **The line is found by the opening, shared by all the sections.** A machine has nothing to tell an
  account of the next move from an account of anything else, and without a shared sign the check
  would be reading prose.
- **The tail is its own at every line, and two lines coinciding word for word are a divergence.** The
  shared opening invites copying the neighbouring line whole; the named move is the only thing the
  line stands in the section for.
- **The heading of a section of a state and the opening of the line are read under two names, English
  and Russian.** The package pattern carries "State `name`" and "Next move:", the pattern of the
  tree, written before the translation of the layer, "Состояние `имя`" and "Следующее движение:".
  Both mean one thing, and neither of the two checks makes the tree rewrite its pattern for the sake
  of a heading.
- **The rule of the conduct of work names the transition between states among what a turn does not
  end with.** The sections speak of their move one by one, and a shared statement cannot be assembled
  from them: an executor standing in one state reads one section.
- **The map of the turn says the same thing in the same words by meaning.** It arrives in the context
  at every launch and lists the exits on a par with the rule; staying silent about the transition, it
  diverges from the rule exactly where it is read most often.
- **The law of the conduct of work names this by an article.** What must be true is said by the law;
  in which words and in which section it stands is said by the rule and the patterns at it.
- **A check of its own is created, with a command of its own and a line of its own in the suite of
  the push gate.** The check of the states compares two sets of names; reading the text inside a
  section is another subject, and put into one command they turn red by one line on two different
  breakages.
- **The refusal names the state, the leading pattern and the heading of the section.** A divergence
  named by the number of sections without names is fixed by re-reading all the sections one after
  another.
- **The check lets through a tree where there is no rule of the conduct of work.** There is nothing
  to compare — a zero code. An empty list of states at that counts as a refusal: it means not "there
  is nothing to compare" but "the list is broken".
- **A section about a state outside the list this check does not judge.** It is caught by the check of
  the states, and a second check about the same would give two red lines about one miss.

## What is out of scope

- The guards of the end of a turn — a neighbouring subdomain: they judge what was done during the
  turn, not what is written in a section.
- The check of the states against the sections: it compares two sets of names, and its subject is the
  completeness of the list, not the text inside a section.
- Editing the patterns themselves: what is written in which section is decided by whoever writes the
  rule.

## Contract

The subdomain has no external calls. The contract of the check is what it reads.

| What                            | From where                                             |
| ------------------------------- | ------------------------------------------------------ |
| the list of the states          | the table of states in the rule of the conduct of work |
| the sections of a state         | the patterns named as leading in the same table        |
| the statement of the boundary   | the text of the rule of the conduct of work            |
| the line of the map of the turn | the file of the map resource laid out into the tree    |
| the article of the law          | the law of the conduct of work among the laid-out laws |

### Refusal codes

Not applicable: the check has no refusal code — it answers with an exit code and a list of
divergences. Every divergence is named by the state, the leading pattern and the heading of the
section.

## Data

The subdomain holds no data of its own: the check reads the laid-out texts and writes nothing.

## Screens and states

There are no screens. The states of the check are what it ends with:

| State                                          | What it ends with                                                                |
| ---------------------------------------------- | -------------------------------------------------------------------------------- |
| there is no rule of the conduct of work        | a zero code, the tree is not judged                                              |
| the list of the states is empty                | a refusal: the list is broken, not "there is nothing to compare"                 |
| all the sections have their own line           | a zero code and the number of sections read                                      |
| a section without a line or with a foreign one | a refusal with the name of the state, the pattern and the heading of the section |
| the rule, the map or the law stay silent       | a refusal with the name of the text the statement is missing from                |

## Cross-cutting requirements

### Locales

The language is one — the language of the tree, as for the rest of the rules layer. The opening of
the line is set in it too, and the check declares the locale of its run itself, it does not inherit
it.

### SEO

Not applicable: nothing is given outward.

### Mobile layout

Not applicable: the subdomain has no markup.

### Several objects

Every tree is judged by its own texts: the check goes from the root of the current tree and knows
nothing of the neighbouring ones.

## Decisions

- **The line stands in every section of a state, not one per state.** So the owner decided. Rejected:
  one article in the rule and a line in the map — the executor reads to the end the section they
  stand in, and does not assemble a shared statement from the neighbouring sections.
- **The wording is its own at every section, and the sign is shared.** So the owner decided: a line
  identical word for word reads as a template. The shared opening stayed at that — without it the
  check would have to read prose, and a machine has nothing to tell an account of the next move from
  any other.
- **A check of its own is created, it is not appended to the check of the states.** So the owner
  decided. Rejected: an extension of the check of the states — two different breakages would turn red
  by one line.
- **The check stays silent where there is no rule of the conduct of work.** A tree without this rule
  has nothing to compare, and a refusal at it would mean a miss that is fixed elsewhere.

## Open questions

None.

## History of changes

- 2026-08-22 — the subdomain was split out of the spec of the guards of the end of a turn: the
  agreement about the boundary of a state was merged there and by the same change took the scenario
  file past the length limit. The subject in it was double — the guard refusing a turn and the check
  reading prose.
