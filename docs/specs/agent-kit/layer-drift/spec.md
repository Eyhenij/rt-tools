# Divergences inside the rules layer

**Status:** in force · **Revision:** 2026-08-28 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `verifiability`, `project-documentation`
**Procedures:** none

## Why

The rules layer is held not by texts alone: part of it is the overrides of the tree and the guards,
and both halves diverge silently. The tree replaces a package default by a variable of its own, and
the rule companion says nothing about it — the reader leaves with the package default instead of the
acting order. A guard declares itself by one sample, and its body branches on a tool name that is not
in the sample — and that branch is never carried out, while looking as if it works.

Both halves are alike in one thing: the divergence breaks nothing visible. The run is green, the file
is in place, the text reads coherently, and the miss can be noticed only by comparing two places
nobody compares. The subdomain gathers the audits that make that comparison.

The neighbouring subdomain "The checks" answers another question: how a check declares a skip, what
counts as a breakage of the check itself and by which sign a heavy step is called. Here it is the
subject of two particular audits.

## Terminology

- **A profile override** — a variable of the tree profile whose value diverged from the package
  default. A line repeating the default does not count as an override.
- **A rule companion** — the file `implementation.md` next to a rule: there it is listed what the
  things the rule speaks of are called in this tree.
- **The declaration of a guard** — the line `# rt-hook: <event> <sample>` in the second line of the
  file; by it the guard is subscribed in the setting of the agent.
- **A branching of the body** — a tool name the guard branches on by a selection construct over the
  tool name. A mention in the text of a refusal or in a comment does not count as a branching.

### What it is called in the interface

| In the agreement      | In the launch line                                      |
| --------------------- | ------------------------------------------------------- |
| the overrides audit   | `node <the root of the checks>/check-profile-drift.mjs` |
| the guard scope audit | `node <the root of the checks>/check-hook-scope.mjs`    |
| the tree profile      | the profile file next to the layout setting             |
| the package defaults  | the defaults file laid out by the package               |

## Rules

- **A profile override the rule companion is silent about is a divergence.** The rule demands one
  thing, the tree works another way, and both places are lawful; but the reader looks for this in the
  companion. A replacement not named there leaves them the package default instead of the acting one:
  the rule demanded one shape of the request title, the tree replaced it by a variable, and the guard
  reading the shape took out no number at all.
- **A replacement counts as a divergence of the value from the package default, not as the profile
  line itself.** A line repeating the default says nothing new about the tree, and demanding it in the
  companion would mean retelling the package.
- **The name of an override is looked for across all the companions of the tree, not in the companion
  of one rule.** An override happens to be about a foreign rule: the list of stands belongs to the
  browser-check rule, not to delivery.
- **A check the package default calls while the set of the tree does not is named by the audit.** The
  push gate set is assembled by the default and by an override, and the override has the right to
  declare its function anew. A check cut out that way is indistinguishable from one that is not in the
  tree at all: the gate is green because nobody called it. The name of the check file is checked, not
  the line of the command: calling it by its own runner and with its own arguments is a right of the
  tree, not a divergence. The set is assembled by a shell call, not by reading the text: it looks at
  the tree, and read as text it would name as commands what is not in this tree. A default that
  declared no function of the set holds no audit.
- **A branch of the body that is not in the declaration of the guard is a divergence.** Under that
  name the guard is not called, and the branch is never carried out; from outside it looks working —
  the path is named, the file is laid out, the scenario suite is green, because it calls the guard
  directly with substituted input.
- **A divergence of a declaration is fixed in the package, and the tree pays for it.** A tree that
  subscribed the guard wider than the declaration gets a refusal of the layout audit and narrows the
  subscription to the declaration — removing, together with the divergence, the coverage that worked.
- **The sample of a declaration is read as an expression, not as a list of names.** A sample that
  cannot be parsed does not count as coverage: not one name will match under it, while the declaration
  looks written.

## What is out of scope

- **Checking the value of an override against the text of the rule.** There is nothing for a machine
  to say whether the value is right by: it sees that the tree works in its own way and demands that
  this be named, it does not judge it.
- **The completeness of a companion.** What is said in it about the override on the merits is not
  visible to a machine: the name is checked, not the explanation at it.
- **The subscription of a guard in the setting of the tree.** It is compared with the declaration by
  the layout of the package; here another pair is judged — the declaration against the body.

## Contract

Not applicable: the subdomain has no procedures, both audits are launch-line commands.

### Refusal codes

Not applicable: the audits answer with an exit code and a text, not with named codes.

| What happened                                                           | Code | What it says                                       |
| ----------------------------------------------------------------------- | ---- | -------------------------------------------------- |
| the override is named by not a single companion                         | `1`  | the name of the variable and its value             |
| there is no profile, no defaults or no companions in the tree           | `0`  | what is missing and that there is nothing to check |
| the body of the guard branches on a name that is not in the declaration | `1`  | the name of the guard and the name of the tool     |
| there is no hooks directory in the tree                                 | `0`  | that there is nothing to check                     |

## Data

Not applicable: the subdomain has no storage of its own. The audits read the tree profile, the package
defaults, the rule companions and the hook files.

## Screens and states

Not applicable: the subdomain has no screens.

## Cross-cutting requirements

### Locales

Not applicable: the output of the audits is single-language.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The audits are one set for all trees: the profile, the defaults, the companions and the hooks are read
from the root of the tree the audit was called in. What the tree did not find is not judged at all —
silence means "there is nothing to check", not "it came together".

### Shared

- Both audits declare a skip by a zero code and a line about what is missing: there is no profile, no
  defaults, no companions, no hooks directory.
- Both stand in the push gate set and in the pipeline: a check living only in the umbrella target
  answers whoever remembered it.
- A divergence is named by name — by the variable or by the guard with the name of the tool — not by a
  number.

## Decisions

- **The subdomain was split off from "The checks" when their scenarios outgrew the length limit.** The
  scenario numbers were not recounted on the move: the identifier is the only thing a scenario is tied
  to a test title by.
- **Two audits live as one subdomain, not as two.** Their subject is one — a divergence of two places
  of the rules layer that breaks nothing and therefore is not found by itself.

## Open questions

- An override named by the companion of a foreign rule passes the audit — while it ought to stand at
  its own. A variable has no sign of "its own rule", and creating one by the name would mean guessing.

## History of changes

- 2026-08-28 — the subdomain was created: the audit of the profile overrides and the audit of the
  guard scope.
