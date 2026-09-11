# Laying resources out into the tree

**Status:** in force · **Revision:** 2026-09-11 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `verifiability`, `project-documentation`
**Procedures:** none

## Why

The package carries resources, and it puts them into a foreign tree it knows nothing about: neither
its roots, nor its words, nor which laws the tree takes. The subdomain names what must be true at
that — what is laid out, what is not laid out at all and where the layout is bound to refuse instead
of staying silent.

The refusal cascade belongs here too: a tree refuses a law by one line, and the rules and the patterns
at it leave after it. Without the cascade the refusal of a tree grows faster than the set of the
package.

## Terminology

- **Resource** — a unit of what the package carries: a law, a rule, a pattern, a guard, a check, a
  role, a command, a pipeline, a template, a default, a document.
- **Layout** — moving a resource from the package into the tree by its kind and by the layer setting.
- **A laid-out file** — a file in the tree with the layout header; it is edited by an override, not in
  place.
- **Override** — a file of the tree that merges with a laid-out one by `## ` sections.
- **Companion** — `implementation.md` next to a rule: what the things the rule speaks of without names
  are called in this tree.
- **Kind of a resource** — the edition of a resource for the chosen value of an axis: the hosting of
  the repository and everything that depends on it.
- **A clean installation** — a tree where the package was not there before: creating the setting, then
  the layout.
- **Finishing by hand** — everything a person is bound to write or switch off after the layout so that
  the rules layer starts working.
- **The pick** — what the tree limits the layout by: a pick by name, a refusal by a line, the named
  kinds and the properties of the tree.
- **A property of the tree** — what the tree has and without which part of the rules is meaningless: a
  storage, an admin panel, published packages, an application. It is declared by the package as a list;
  the tree names its own in the setting, a resource demands what it needs by the name of the file.
- **A requirement of a resource** — another resource of the package without which this one is not
  executable. It is named by a line in the header of the resource, not derived by reading its text.
- **A broken link** — a resource picked by the tree whose requirement is not picked.
- **An unanswered requirement** — a property a resource demands while the tree did not name it as its
  own.
- **A parent** — a resource named in the preamble of another: for a rule the law by the field `law`,
  for a pattern the rule by the field `rule`.
- **A child** — a rule at a law, a pattern at a rule.
- **The refusal cascade** — the removal of the children after a rejected parent; it goes by both steps
  — from a law to a rule and from a rule to a pattern.
- **A derived refusal line** — a refusal line that removes nothing: what it names is removed by the
  cascade or is not in the catalogue at all.
- **The unpicked** — a resource of the package the tree did not lay out: removed by a list, left
  outside the picked or replaced by its own.
- **An application law** — the layer of the package laws that are not true of every tree: money,
  locales, access. It lies as a directory of its own inside the laws.
- **A subject of an application** — a thing existing in one application: its entities, its roles, its
  computations.
- **A technique** — a way of working that is true of any tree of its class. It differs from a subject
  in that it is carried into a foreign tree whole.

### What it is called in the interface

The subdomain has no interface beyond the launch line.

| In the agreement          | In the launch line       |
| ------------------------- | ------------------------ |
| creating the setting      | `agent-kit init`         |
| the layout                | `agent-kit sync`         |
| the check of the laid-out | `agent-kit sync --check` |
| the state overview        | `agent-kit doctor`       |
| the list of the resources | `agent-kit list`         |
| taking a foreign file in  | `agent-kit adopt <file>` |

## Rules

- **The package checks what it carries, not only what it carries with.** The guards, the checks and the
  defaults are executable resources; there is a scenario suite for every kind, and it is run by the run
  of the package. Today only the mechanism of the layout is checked, and everything executable travels
  unchecked.
- **A resource left without its kind is a refusal of the layout, not silence.** If the chosen kind
  leaves a laid-out rule without the tool it names, the layout says so and names what is missing.
- **A layout from a stale build does not pass itself off as a fresh one.** A divergence of the source
  of the resources and of what the launch line reads the package names aloud.
- **What is laid out is checked by content, not by the number of the edition.** A matching version in
  the header at a diverged body is a divergence, and `doctor` shows it.
- **The move of a foreign file under the package's management is made by a command, not by hand.** A
  file without a header the package does not overwrite silently; at that the consumer has a named way
  to hand a file over to the package.
- **An override of the check settings merges by nested keys.** A named key of a nested object does not
  carry away the other keys of the same object.
- **The package does not know the layout of a foreign tree.** The roots the checks walk are read from
  the setting; a path hardwired into the code is a defect.
- **The package does not know the words of a foreign tree either.** The prefix of the selectors, the
  name of the barrel and the tags of the libs that are due an empty list of dependencies are named by
  the tree; named by a default, they turn red on every lib of the very first tree whose words are its
  own. What the tree did not name is not judged at all: silence is "there is no rule about this", not
  "the rule is kept".
- **The name of a lib is read from what the tree declared, not derived from its path.** The name,
  the tag and the import alias are already written down — in the manifest of the lib and in the list
  of paths. A tree that named a lib otherwise used to redden on flat ground, and the only way to
  silence that was the exceptions list.
- **The formula over the path speaks where the tree declared nothing.** A lib without a name in its
  manifest is named by it: the refusal says what the name must become. So the formula stays useful
  and stops being a judge of what is already written down.
- **The alias of a lib is looked for by what it points at, not by its spelling.** A lib is reachable
  by an alias or it is not; how the tree spells the alias is the tree's own business. The lib
  nothing points at is named together with the alias the formula would give it.
- **The first installation demands no prose written by hand.** The drafts of the companions are created
  by a command; a person fills them, but not from a blank page and not by a sample out of their head.
- **A requirement of a resource is named in the resource itself, it is not derived by reading.** A link
  living only in the text is invisible to the layout and is not given to a check.
- **A broken link is a warning, not a refusal.** A tree has the right to close a requirement by a means
  of its own, but is bound to know what it closes. A refusal would refuse a lawful layout in which the
  resource is replaced by one's own.
- **The state report names the unpicked by name, not by a number.** A number answers no question it is
  read for.
- **The state report prints the thresholds of the session window.** The setting of the agent belongs to
  the tree, and the numbers in it lie in two different places: the thresholds of the watchman and the
  pair the compaction threshold is set by. Having drifted apart, they give a session that either
  compacts before the handover or lives to the limit of the window — while apart both sides look
  configured.
- **The package writes into no files belonging to the tree.** It prints the line for the ignore list,
  and the project writes it in — the same way the hook map is arranged.
- **Refusing a parent removes its children, and a surplus refusal line is declared a warning.** The
  rules at a rejected law and the patterns at those rules are not laid out, and there is no point in the
  tree naming them by a refusal line; a line that removes nothing after that does not refuse the layout
  but is named aloud together with what made it surplus.
- **A law that did not get into the pick is rejected on a par with one named in the refusal.**
  Otherwise an installation where the laws are picked by ticks puts the rules and the patterns of the
  laws the tree has just refused.
- **The cascade goes from the top down and only.** Refusing a pattern touches neither the rule nor the
  law: a tree has the right to take a technique without one of its ready pieces.
- **The link is taken from the preamble of the resources themselves.** Neither a separate list at the
  package nor a map of links: a list would diverge from the resources silently — by the very silence the
  cascade is created for.
- **What the cascade removed is named together with the parent.** The state report shows which rule left
  because of which law: a resource removed silently is indistinguishable from an unpicked one and from
  one that is absent from the package.
- **The package carries a law true of any tree of its class.** A law whose articles name the subjects of
  one application is not executable in a foreign tree at all. The sign is read by a person: there is no
  giving it to a machine.
- **A tree's refusal of a subject law is one line.** Not a line per rule at it, not a line per pattern
  at a rule: the length of a refusal measures the layer of laws, not the number of files in the package.
- **A resource that left the package leaves together with its children.** A rule whose law is removed
  stays a rule without a law, and the connectivity audit is red from the very first run.
- **The package remembers the names that left it.** The layout looks for an abandoned file by its own
  catalogue, and one that left is not in the catalogue — without a list of the removed the file stays in
  the tree with the header of the package, is never updated and reads as an acting rule. The tree
  removes it itself.
- **What the cascade removed stays on the disk and is named apart from the abandoned.** The layout never
  deletes files, and the tree did not refuse what the cascade removed: it would look for the cause in
  the refusal in vain.
- **A short name from the preamble is resolved by the last link of the name inside its own kind.** A
  rule holds `law: access`, while the law lies in the application layer and is called by a name with the
  layer: there is no full path in the header and none is created — a move of a law between layers would
  rewrite the headers of all the rules at it.
- **Two resources of one kind with the same last link of the name are a refusal of the set.** The link
  at them is ambiguous, and the cascade would remove the children of the wrong parent. This is judged by
  the connectivity audit of the package, before any layout in a tree.
- **A parent with several kinds is rejected only when not one of its kinds is picked.** The children
  hang on the name, not on the kind: counting a parent rejected by an unpicked kind would mean removing
  the patterns at every tree but one.
- **A removed grandchild is named by both: by the nearest parent and by the rejected root.** A pattern
  leaves after a rule the tree did not reject.
- **A pick that takes nothing after the cascade is named aloud.** A tree that named a rule by name at an
  unpicked law does not fail to get it silently.
- **The parent is not in the catalogue — the cascade stays silent.** An empty field in the preamble and
  a reference into nowhere have no right to remove anything: otherwise a typo in a header quietly
  carries a rule away from every consumer.
- **A link broken by the cascade itself is not counted as a warning.** A resource removed after its
  parent is named once — by the cascade.
- **A warning of the layout is printed at any outcome of it.** On a tree that came together the check
  stays silent, and a layout that succeeded names the files it put: otherwise a surplus refusal line and
  a removed resource surface nowhere.
- **The layout names the added debt at the same moment it added it.** Later it is indistinguishable from
  the old: the audit sees the divergence but does not know whose update it arrived by.
- **The articles are counted by the companion of the tree, not by the draft of the package.** There is
  no companion at all — that is a case of its own, and it is named apart: there the debt equals all the
  articles of the rule at once.
- **The count of the added debt is put together by a pure function.** The layout writes files, and the
  decision about what to call debt is not tied to the write and is checked without a file system.
- **A sample named by the text of the package is carried by the package too.** The text ordering to copy
  a sample and the sample itself arrive in the tree by one installation. Otherwise the instruction reads
  as an acting one and runs into emptiness exactly where the work begins — and the tree can fix that
  only by creating a copy of its own, which is tied to the texts of the package in no way.
- **The samples travel by a kind of resource of their own, not together with the override templates.**
  An override template lands in the directory of the rules layer and is read by whoever writes a rule; a
  sample lands where the work goes and is copied by whoever leads it. Mixing them in one kind, the tree
  can neither refuse some while keeping the others nor name them different paths.
- **A tree has the right to name the samples a path of its own and to refuse them whole.** The layout of
  the kind is set by the tree, as with any other kind, and the removal goes by the refusal list. A tree
  whose task folders lie differently gets the samples where its own guards look for them.
- **A sample carries the layout header on a par with the rest of the laid-out.** An edit in place is lost
  at the next layout, and a sample here differs from a rule in nothing: its own tree appends by an
  override. A copy taken from a sample carries the header away with it — this is a trace of the origin of
  the working file, not a statement about it: what lies on the layout path counts as laid out, not
  everything this line was met in.
- **The cold part of a rule is a kind of resource of its own, not a name inside the kind of the rules.**
  The kind sets both the layout directory and the refusal by a list: the cold part lands as a third file
  at its rule, is removed after it and is put anew at every layout, because its text belongs to the
  package whole. It looks for its parent by the name of the resource, not by a header field: a rule has
  one cold part and it is called the same way it is.
- **"Pitfalls" is a section of the cold part, not of the rule.** In a rule it stopped being mandatory and
  became mandatory in the cold part: otherwise the move takes the section completeness check down at
  every rule that gave it away. A rule whose pitfalls went nowhere is lawful — the section is simply not
  asked for.

- **The right to be executed at a file of the hooks directory is decided by the kind, not by the rights
  of the source.** The sign of the other kinds is read from the disk of the package, and the bit on the
  disk is lost silently: an archive without rights, a file system without the bit, a repository with the
  mode tracking switched off. Having lost it, the layout would put a guard with the rights 644 — and it
  would not start at all, looking installed: the file is in place, the layout reported, and the guards by
  construction refuse in favour of the work, that is they stay silent too. A hook exists so that the
  shell runs it, and the rights here are no choice. The same is not done to the checks: part of them are
  called by the executor, and they need no bit.

## What is out of scope

- A refusal on a broken link: the tree has the right to replace a resource by its own.
- Writing the package into the ignore list: it stays with the project.
- Connecting a laid-out guard to the agent: the record in the setting is the subdomain of the event
  dispatcher.
- Refusals not derived from the refusal of a law: a rejected hook, a rejected pattern at a taken rule —
  a pointed pick of the tree.
- Cleaning the subject pieces inside the laws that stay: a law recognised as a technique stays as it is,
  even if foreign entities stand in its examples.
- A refusal on a derived line: the tree has the right to list what is removed.
- Deleting files in a consumer tree: the package names the removed and the abandoned, but does not wipe
  them.
- A refusal line on a resource of a foreign kind: it puts out the refusal about a resource without a
  fitting kind, that is it does work, and it never counts as surplus.

## Contract

Creating the setting asks the unanswered axes, names the values the resources expect and lays nothing
out. The layout puts what is picked and refuses instead of a silent layout of what is knowingly dead.
Its check writes nothing and says what diverged. The state overview names the divergences of the tree
and of the package, including a divergence of the body at a matching header. The list shows the
resources of the catalogue with their kinds. Taking a file in hands over to the package what lies on
its path not from it.

### Refusal codes

Not applicable: the package answers with an exit code and a text, not with named codes. Zero means done,
one means a refusal with the reasons listed. Where the layout is bound to refuse instead of staying
silent:

| What happened                                              | Code | What it says                                                              |
| ---------------------------------------------------------- | ---- | ------------------------------------------------------------------------- |
| a rule or a pattern is removed after its parent            | `0`  | which resource is removed, by the nearest parent and by the rejected root |
| a refusal line removes nothing                             | `0`  | the line, and what exactly it names is already removed by                 |
| the pick named a child, and the parent is not picked       | `0`  | that what the pick named will not arrive, and by which parent             |
| the resource lies in the tree and left the set             | `0`  | the name from the list of the removed and that the tree removes it itself |
| a picked rule was left without a law in the package itself | `1`  | the connectivity audit names the resource and the reference into nowhere  |

## Data

The subdomain has no storage of its own. The state lives in the consumer tree: the setting, the
overrides, the companions and the headers of the laid-out files. The source of the resources is the
resource directory inside the package.

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

The package is laid out into many trees at once, and not one of them is named in its texts. A tree
differs from a tree by its setting: the layout layer, the values of the axes, the list of what is
switched off, the overrides and the companions. Everything that differs is bound to lie in the tree, not
in the package.

## Decisions

- **Silence counts as the worst of three outcomes.** A refusal costs one run more than a silent layout,
  while a silent layout of the dead costs the consumer a search for the cause in a foreign package.
- **An installation with a hosting kind other than the kind of this tree is checked.** An installation
  with the same kind is green by coincidence: the tools for it are in the package.
- **A requirement is declared in the header of the resource, not as a separate list of the package.** A
  list would diverge from the resources silently — by exactly the silence the requirement is created for.
  Rejected: a map of links as a separate file.
- **The law on money and the law on the owning entity leave the package.** Both named the subjects of a
  particular application and are not executable in a foreign tree at all. The rules and the patterns at
  them left with them. Rejected: a second package of the subject matter and a catalogue of samples — not
  one of the laws sorted through was sent there.
- **The other subject laws stay a technique.** Access, locales, visibility in search, editing a record,
  entity models, lists, navigation, observability, shared code and the layer of calls to the server are
  true of any tree of their class; a tree without such a class refuses them by one line.
- **The cascade instead of listing by hand.** Without it the refusal of a tree grows faster than the set:
  a line for a law, a line for every rule at it, a line for every pattern at a rule.
- **A surplus refusal line is a warning, not a refusal.** A tree has the right to name what is removed
  anyway, and after an update of the package the line becomes surplus by itself, without a single edit in
  the tree.
- **An empty pick takes the whole set, it does not remove it.** Creating the setting without an answer
  writes an empty list, and this is the default case: reading it as "nobody got into the pick, so all are
  rejected" would give a tree with laws and without a single rule.
- **The package names the removed but does not wipe it.** The file belongs to the tree, and a silent
  deletion would carry away an edit the package knows nothing about. A record in the description of the
  changes as the only measure was rejected too: it is held by the memory of whoever will read it.
- **References to removed laws in the resources that stay are fixed together with the removal.** Neither
  the cascade nor the connectivity audit sees them: the latter reads only the fields of the preamble, and
  the name of a law in the body of a pattern is prose to it.
- **A resource with an unanswered requirement is not put into the tree.** Neither it itself nor the draft
  of its companion is put: a file there is nothing to fill with is worse than an absent one — it looks
  like a debt of the tree while it is no debt.
- **The silence of the tree about its own properties answers no requirement.** A tree with an empty set
  of properties gets not one marked resource. Putting at random costs more: an empty companion gives back
  exactly the work the requirements are created for.
- **A pick by name is stronger than a requirement.** A resource named by the tree by name is put even when
  its requirement is not answered: a pick by a word is stronger than a derivation by a sign. The layout at
  that names the unanswered requirement aloud — a silent exception a month later reads as a rule.
- **A refusal about a companion names the requirement, not only the state of the file.** An empty
  companion of a resource demanding a property the tree does not have is no draft but a surplus file: the
  refusal says the demanded property and that the resource is removed by a refusal line.
- **A property the package did not declare takes the layout down from both sides.** Both one named by the
  tree in the set of properties and one demanded by a resource in the name of a file: this is a typo,
  while a resource silently not put is explained only by reading the name letter by letter.
- **A requirement stands in the name of a file next to the kind and is told from it.** The kind answers
  "which of the three", the requirement answers "is there one"; they are read by different lists, and the
  package cannot mix them up.
- **The list of the resources names what is not put by a requirement apart from what the tree removed.**
  "There is no such thing in this tree" and "the tree refused this" are different states, and they are
  taken apart by whoever reads the list.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## History of changes

- 2026-08-17 — the subdomain was split off from the domain spec, which had outgrown the length limit. The
  rules, the scenarios and the bindings of the layout moved here unchanged: the scenario numbers were not
  recounted.
