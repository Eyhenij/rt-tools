# The check of the specs and the addresses

**Status:** in force · **Revision:** 2026-09-06 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `project-documentation`, `verifiability`
**Procedures:** none

## Why

A statement of a spec and of a rule is bound to a place in code, an address in a text must exist, the
number of a scenario ties a promise to a probe, and an agreement about the product lives until it is
merged into the domain spec. The subdomain names what of this a machine counts and how: the check of
the specs, the check of the addresses of the documents and of the pointers of the directories, the
parse of the anchors of the bindings and the age of the agreements.

What must be true of the texts of the package themselves — the sections, the portability, the
glossary, the graph, the review of a family — is the neighbouring subdomain "The texts of the rules
layer" next to it.

## Terminology

- **An address** — a path, a bare name or a directory named in a text in backticks.
- **A bare name** — the name of a file without a directory before it.
- **A pointer of a directory** — a table in the overview document of the directory listing its
  records. For a reader it replaces a walk.
- **The table of the bindings** — the table of the section "Where the articles are carried out" in
  the companion of a rule; only its rows are bindings. The descriptive tables of the companion name
  the names of the tree and carry out not a single statement.
- **A portable text** — a law, a rule or a pattern written for any tree of this class: its addresses
  belong to the tree it lands in. A laid-out copy carries the layout header, a source does not.
- **An anchor** — the name of a file and a symbol in a binding line; the check looks for the symbol
  over the text of the file.
- **An agreement** — a feature spec written before the code in the "proposed" directory of a domain;
  it is merged into the domain spec by one of the last commits of the branch.

### What it is called in the interface

| In the agreement                            | In the launch line                                              |
| ------------------------------------------- | --------------------------------------------------------------- |
| the check of the specs of the tree          | the command of the check of the specs, a step of the gate suite |
| the check of the addresses of the documents | the check of the addresses, a step of the gate suite            |

## Rules

- **A table of refusal codes does not count as a procedure.** The section "Contract" holds two
  different tables — the procedures with their permissions and the refusal codes with their occasions
  — and by the shape of a row they are indistinguishable: both carry a value in quotes as the first
  cell. A spec that declared procedures got, because of this, its table of codes read as a list of
  procedures, and every row of it became a procedure the domain does not have. They are told apart by
  the second cell: a refusal code is a number.
- **A subdomain is checked on a par with a domain.** The same mandatory sections, the same companion
  next to it, the same link between the scenarios and the tests. A domain with half of its subdomains
  described and half created as empty directories is never green.
- **A proposed law demands no rule.** The sign stands as a status line in the law itself, not as a
  list of exceptions next to the check: an agreement written before the code has nothing to be bound
  to.
- **A merged agreement does not lock the branch.** After the merge the "proposed" directory is not on
  disk, while the plan refers to it to the end of the work. The guard of the plan tells the merged
  from the never-created by the history of the branch: a path that was never in it was no agreement.
- **A scenario prefix is taken by one spec across the whole tree.** A second prefix inside a spec
  means the subject is described twice; one taken by another means the number does not show whose
  scenario it is. An agreement about the product is the exception: it is numbered together with the
  spec it will merge into.
- **A bare name and a directory are judged on a par with a full path.** Half of the tables "Where it
  lives" are named by directories, and a check that knows only a line with an extension does not see
  them at all.
- **The tree for the check of the paths is taken from the version control system, not by a walk of
  the directories.** A walk does not see the directories that begin with a dot, and everything lying
  in them reads as non-existent.
- **The task folders are taken out of the check of the paths, like the archive.** The progress of the
  work lists findings — that is, exactly what is not in the tree.
- **A portable text is taken out of the check of the addresses.** A rule that lands in another tree
  names the addresses of that tree: a laid-out copy the check recognises by the layout header, a
  source by the directory named in the setting. Judging them means turning red on a hundred and fifty
  lines, not one of which is fixed by an edit of this tree.
- **The completeness of the pointer of a directory is checked from both sides.** A record of the
  directory without a row in the table and a row of the table without a record are both divergences,
  and both are named.
- **A divergence of the pointer is printed as a list of its own with an argument of its own.** The
  advice to put the path into the list of exceptions does not fit here: it is fixed by a row in the
  table, not by the silence of the check.
- **What count as bindings are the rows of one table of the companion, not every row that looks like
  a row of a table.** The section they are taken from is named by whoever calls the check: at a rule
  it is "Where the articles are carried out", at a domain spec there is no section — there the
  companion holds one table.
- **The companion of a rule without the section of the bindings is a refusal, not silence.** The
  section stands in the sample of the companion, and its absence means a file rewritten by hand,
  whose bindings are checked by nothing; to read the whole file instead of it silently means bringing
  the original defect back.
- **A subheading inside the section does not end the list of items, a table does, and the refusal
  about an empty section names what stands instead of the items.** The section is cut off by the
  level of the heading, and a `#` line in it is always deeper — a spec of a big domain groups the
  rules by it. A refusal without a reason made one rearrange the markup at random: the subheadings
  and a table before the list gave one and the same refusal.
- **A name in an anchor is written as it is declared in code, the hash included.** A private field of
  a class is declared with a hash, and before this such an anchor read as an empty binding: the
  sample did not parse the hash at all, and the count of occurrences looked for the name by a word
  boundary, which is not there before a hash. A name without the hash stays lawful — the bindings of
  the former shape are green — but it names the method not by the name it is declared with.
- **What counts as a symbol of an anchor is any letter, not only a Latin one.** A text carried out by
  a model holds by its own words; a parse that knows one alphabet leaves the author the choice
  between a binding to a name that holds nothing and a red check.
- **The alphabet is not listed as a list.** The property "a letter" knows no languages, and a text in
  the next language will demand no edit of the parse. Listed ranges silently do not cover a
  neighbouring alphabet: the miss at that looks like the absence of a binding, not like a narrow
  parse.
- **The path of the pair is parsed as before.** The name of the file and the extension stay Latin:
  they are an address in the tree, not a word of the text.
- **A scenario number of one digit the check sees on a par with two and three.** A heading that did
  not match the template creates no scenario and gives no refusal: such a scenario is visible neither
  in the coverage nor in the debts, and the check stays green.
- **A scenario number is issued once and is not used a second time.** The number is the only link of a
  scenario with a test: given to a new scenario, it leaves the old reference looking right and
  leading elsewhere.
- **A scenario and the title of its test are edited by one change.** Having drifted apart, they leave
  the run green while it checks something else.
- **A rule whose patterns the tree skipped at the layout demands no pattern.** A skip is a choice of
  the tree, not forgotten work: the rule about the procedures of the backend lands where there is no
  backend at all. Demanding a pattern there means demanding a file that has nothing to say, and the
  only way to go green becomes lifting the skip. There is nobody to ask about a skipped file in the
  tree, so the names of the patterns are read in the section "Patterns" of the rule itself.
- **The taking of a portable text out of the check of the addresses is older than the new
  requirement.** The rule in force takes a law, a rule and a pattern out of the check of the paths
  whole: the addresses in them belong to the tree the text lands in, and there is nothing to check
  them against. The new requirement does not cancel it and cannot argue with it — it judges not the
  existence of a path but the belonging of a name to a specific tree. Where both sides look at one
  line, the first decides earlier.
- **An agreement waiting for its domain longer than a month is named by a section of its own in the
  output.** A binding in it grows old silently: the declaration it points at moves together with
  neighbouring work, and nobody will check the agreement against the code until it is merged. Three
  such lay for a month, and the miss was found exactly at the merge — that is, at the hour when it is
  most costly to fix.
- **The age of an agreement is taken from the history, not from the time of the file on disk.** A
  fresh checkout makes all the directories simultaneous, and there is no day in the text of the
  agreement at all. The same argument stands at the age of the records of an account of the past, and
  the technique is taken from there.
- **This is not made a refusal.** Work on an agreement lawfully goes on for weeks, and a red check
  would refuse the push of every branch — including the one that is writing the agreement.
- **The key of a spec section is read under two names — the English one and the language of the
  owner.** The tree translates the specs one domain at a time, and a key that moved instead of the
  second name takes the untranslated domains out of the check silently: the heading is not found, the
  articles and the scenarios are not read, and the check stays green about a domain it no longer sees.
  The refusal names the first name of the pair — the one a new spec is written by.

## What is out of scope

- The content of a row of the pointer: the machine sees the presence of a row, not whether it
  describes the record rightly.
- Demanding a pointer of every directory of the tree: what is checked is those named in the setting of
  the checks.
- The order of the tables in the companion: the check judges the section by its name, not by its
  place.
- **The sections, the portability and the glossary of the texts of the package.** The subdomain "The
  texts of the rules layer" is next to it.

## Contract

The surface is the check of the specs and the check of the addresses of the documents; both stand as
steps of the gate suite. Each ends with a non-zero code on a divergence and stays silent when there
are no divergences. The section about the agreements waiting longer than a month is printed after the
list and does not change the exit code.

### Refusal codes

Not applicable: the answer is an exit code and text, not named codes.

| What happened                                   | Code | What it says                                                         |
| ----------------------------------------------- | ---- | -------------------------------------------------------------------- |
| a divergence of a spec, a binding or a scenario | `1`  | the file, the line and what is missing                               |
| a dead address or a divergence of the pointer   | `1`  | the file, the line and the address; the pointer by a list of its own |
| there are no divergences                        | `0`  | it stays silent or names the number of what was read                 |
| an agreement waits longer than a month          | `0`  | the directory of the agreement and its age in days                   |

## Data

There is no storage of its own. The subject of the check is the domain specs and their companions,
the rules and their companions, the documents with addresses, the pointers of the directories named
by the setting of the checks, and the history of the specs directory.

## Screens and states

Not applicable: there are no screens.

## Cross-cutting requirements

### Locales

Not applicable: the texts of the resources are single-language. The anchor of a binding at that is
judged by any alphabet — that is a rule of the subdomain, not a property of the locale.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The check goes over one tree: a laid-out copy is judged by its own header apart from the source, and
a portable text is taken out of the check of the addresses.

## Decisions

- **The task folders are taken out of the check of the addresses whole, not by name.** The analysis of
  a request names what is not in the tree by its nature — that is its subject.
- **The directories whose pointer is checked are named by the tree, not by the package.** A nailed-in
  archive directory would take away from a foreign tree its own pointers, and at a tree without an
  archive would create a check over nothing. The default is the archive directory.
- **The selection of the bindings is narrowed by the section, not by a widened sifting of the
  headers.** The sifting by the names of the headers is a list of two words that will have to be
  appended at every new table of the companion, and it removes 32 rows out of 261.
- **The companion of a domain spec has no section of the bindings, and this is not a refusal.** There
  the table is one, and there is nothing to narrow; the name of the section arrives as an argument
  from whoever calls the check.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## History of changes

- 2026-09-06 — a subheading inside a section does not end the list of items, and the refusal about an
  empty section names what stands instead of the items. It arrived as a proposal from the intake.
- 2026-09-05 — the subdomain was split out of the spec of the texts of the rules layer, which had
  outgrown the length limit. The rules, scenarios and bindings about the paths, the pointers, the
  bindings, the scenario numbers and the agreements moved here as they were: the scenario numbers were
  not recounted.
