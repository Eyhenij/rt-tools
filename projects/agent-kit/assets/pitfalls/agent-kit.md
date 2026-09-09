# The portable rules layer — cold part

Pitfalls and traps already stepped on. Loaded not with the skill but on demand: an ordinary
layout does not need it — it is for whoever investigates an audit refusal or argues with the
layout.

The skill is `agent-kit`; the editing order, the commands and the structure of the layers stand
there.

## Pitfalls

- **A set that tests a guard reads the settings of the tree it was launched from.** The helper
  takes the settings by the project directory, and its agent sets that itself — a `cd` in the
  runner does not override it. A set that created no throwaway tree of its own turns green from a
  line in someone else's settings: six scenarios of the exam guard passed exactly so, because the
  role was disabled in the tree where they were run. One's own tree is declared for every
  scenario, not once per file.

- **An override replaces a section whole, and the package items in it have to be kept as a
  copy.** There is no way to append one article to a section: the merge goes by the `## `
  heading. A tree that needs one item of its own copies all the package ones next to it — and
  from that day an edit of any of them, arriving with a new version, does not reach this tree.
  The laid-out audit is silent: it counts an in-place edit as a discrepancy, not a replaced
  section. The sign shows in the overrides themselves — three out of three read ended with a
  paragraph saying the carry-over would have to be done by hand. So an override takes a section
  with few package items, and a replaced section that has grown is a reason to bring one's own
  into the package, not to keep it as a copy. The proposal by which it is brought in names this
  override in the line "closed by": otherwise the arrived edition and the override it closed are
  matched by nothing, and the override goes on replacing an already fixed section.

  A copied package line is edited in the package source, not in the copy: an edit inside the
  override diverges from the source silently, and it shows only where the text itself serves as
  the link key — in an article that has a binding. Before a line in the override is edited, it is
  looked up in the source; not found — the line is the tree's own, and it is edited in place.
- **The package's ready-made code names no names of a single tree.** The kit's directive prefix,
  label keys and entity names belong to the tree where the pattern was written; laid out in a
  neighbouring one, they teach to call what is not there at all. A directive name differs from a
  name in an example: an example is seen to be an example, while `<prefix>TableRow` from another
  tree looks like working code and is fixed only after the production build falls. Thirteen such
  names stood in four package resources until a consumer found them — not by its build, but by
  the override with which it covered the section.

- **Rules and patterns under a rejected law are not listed in the refusal.** The cascade removes
  them, and the line about them becomes derivable: the layout names it redundant together with
  the law because of which it stopped removing. The refusal measures the layer of laws, not the
  number of files in the package.

- **The linter that follows an edit judges the whole file, not the edit made.** An import added
  as a separate step is refused as unused before the line that calls it appears, and the work
  stalls halfway. The edit is made in one call or in the order "usage first, then import".
- **Guard scenarios can be run without laying anything out — where those scenarios exist.** The
  set's harness takes the guards directory as a variable, and the package edition is run before
  installation. It lives in the package's own repository: resources, the launch line and the
  library go into the shipment, and the scenarios directory is not in it at all. A consumer tree
  is left with its own scenarios for its own guards — looking for the package ones at home means
  spending a session on a diagnosis by consequences, exactly the one the advice promised to
  spare.
- **A refused edit is not always about the guard's text.** The guard is called by path, and a
  file without the execute bit answers with access denied — a non-zero code that reads as "edit
  refused". The set then refuses everything in a row, build and tests included, and names no
  reason.
- **An edit of a shell script by pattern replacement is checked with `bash -n` at once.** The
  replacement does not see construct boundaries: a `case` loses its `esac`, the file stays
  syntactically wrong, and a guard with a syntax error answers with a non-zero code — that is,
  "edit refused". Twice in one session, and both times it looked like a defect of the guard
  itself.
- **A guard subscribed to something other than what it declares looks working.** The guard
  carries its event and call pattern itself, in the `# rt-hook:` line, and it is called by the
  pattern in the agent settings — and the two diverge silently: the guard's path is named in the
  settings, the file is laid out, the scenario set is green. The set catches nothing here on
  purpose — it calls the guard directly with substituted input and reads no declaration at all.
  That is how the rules gate parsed browser calls with a branch that never ran once. The
  discrepancy is found by the layout audit: it compares the declared pattern with the one the
  guard stands under, names both sides and counts it among the discrepancies. The settings are
  fixed, and the correct value lies in the guard — its body parses what is declared.
- **A laid-out file is recognised by its header, not by its directory.** The layout lands in the
  same `tools/`, `.claude/hooks/` and `.claude/skills/` where the tree's own files lie, so a gate
  map written by paths demands a domain rule for it — and that leads to editing the file in
  place. An in-place edit is lost on the next layout, and until then looks applied. The branch by
  header is placed first in the map and decides before the paths.
- **Check settings merge by keys, and lists are replaced.** The `checks.json` object lands over
  the default key by key at any depth: naming one board key, the tree does not lose the
  neighbouring ones. A list arrives whole — naming the source roots, the tree gets exactly what
  it named, not the default together with its own: "append to the list" and "remove from the
  list" are indistinguishable in this notation.
- **A rule's statement moves together with the code.** What is moved into an override stops being
  found by the former symbol, and the binding in the rule's companion lies silently — the spec
  audit catches this, but only when called.
- **A sign by a path substring also judges what lies outside the tree.** Guards hand the profile
  the full absolute path, and a pattern like `*/projects/*` matches the agent's home directory
  just as it matches the tree's code: a write to a file outside the repository was refused by the
  progress guard with a demand for a plan that had nothing to do with it. The path in the profile
  is first reduced to the tree root, and everything outside the root gets no sign.
- **Text similarity does not find the nearest article.** A measurement showed that the lawful
  adjacency of two articles of one rule and the lawful move of a good article to a neighbouring
  place give the same number: so a quote is looked up by exact match, not by a similarity
  measure.
- **The sent mark lives in the working tree, and every branch has a tree of its own.** Set in one
  branch, it is invisible in a neighbouring one, and the same text leaves a second time; it does
  not become a second record though — the intake filters what already arrived by the proposal's
  sign, and its answer says how many records landed and how many already lay there. The line
  "accepted 0, already there 3" means nothing new left.
- **A mark set only on what was accepted would declare unsent what arrived earlier.** The file
  would stay without it forever: it will never become accepted again, and the proposals guard
  would refuse the turn to every following session. For the sender the difference between
  accepted and already there changes nothing — both outcomes mean one thing: the cargo arrived.
- **A send refusal that names only a config key leads the reader astray.** Neither the address
  nor the token is in the config, nor will be: both come from the intake's owner — the address by
  word, the token as a one-time invitation code. So the refusal names the invitation, not the
  key: whoever went to edit the config finds no answer there and asks the owner the second time.
- **A package edition bumped without a layout locks the whole tree.** It turns red not its own
  branch but main: the layout audit stands in the push gate, and it refuses other people's work
  that has nothing to do with the package. The author cannot fix this from their own branch — the
  edit lies in someone else's.
- **An edit of a laid-out file without an in-place guard surfaces in someone else's branch.** Only
  `sync --check` knew about it, and it spoke on the next layout: the refusal came to whoever
  edited a neighbouring resource that day, and looked like a breakage of their work.

## Version bump: how to check replaced sections

Measured on two bumps in a row: in one, six replaced sections were short of new statements; in
the other, two sections were short of eleven articles, and no command said a word about it. The
previous edition was found by chance as a copy in someone else's working tree: installation wipes
it without a trace, so the snapshot stands as the first step of the bump.

Articles are compared, not headings — the heading is exactly what matched, and that is how the
section got replaced:

```bash
sec() { awk -v s="$2" '$0 ~ "^## "s {f=1;next} /^## /{f=0} f' "$1" \
    | grep '^- \*\*' | sed 's/^- \*\*//;s/\*\*.*//'; }
comm -13 <(sec "$OLD/<resource>" '<heading>' | sort) <(sec "$NEW/<resource>" '<heading>' | sort)
```

A line in the output is an article the override swallowed: the package added it, and the tree did
not see it. It is carried into the override by hand.

## Disabled role: what happens with the settings

- **Settings that cannot be read do not disable a role.** No `jq` found, no settings, parsing
  broken in the settings — the guard judges as it judged. The opposite choice would silence the
  rules layer quietly, and there would be nothing to notice it with.
- **A key written not as a list is caught by the layout, not by the guard.** The guard sees only
  a list of names: a string instead of a list reads to it as "role enabled", and the role works
  although the tree counts it disabled. The settings parsing refuses on this — on the very first
  layout, naming the key.
- **Disabling lives in the tree's settings, not in the agent's settings.** A line cut out of the
  agent settings by hand is lost on the first edit of that file, and there will be nothing to
  bring the role back with. Here it is declared in one place and visible to anyone who reads the
  tree's settings.

## Tree traits: two boundaries

- **`only` is stronger than a requirement.** A resource named by name is laid out even with an
  unanswered requirement; the layout list says so aloud, and the refusal over its empty companion
  calls to remove the resource, not to fill in the draft.
- **A trait the package did not declare fails the layout** — whether in the tree's `has` or in a
  resource name. Traits are declared in a list with the package, next to the axes of difference.

## Layout pitfalls
- **The glossary is as much a laid-out resource as a rule.** The startup hook puts it into the
  context in full, before the first reply, and so it looks like an ordinary tree document; it has
  a header, but it reads as a service line. A new word goes into the glossary override, as a
  section of its own.

- **A file write by a shell command is checked on all paths named in its body.** The gate takes
  the paths out of the command text and reads the document body in full if the command holds an
  interpreter name; an import line of a laid-out module then demands a second rule, and one is
  demanded at a time — two refusals in a row, and each loses the written body. The edit tool is
  checked by its one path; a shell redirect is for what does not become a tree file.
- **Your own thing standing next to the laid-out repeats its mechanics silently.** Parsing the
  list of the known, the source roots and the debt snapshot is given by the checks config
  module; a second such parser in your own check is seen by neither the layout audit nor the
  duplicate check. Before starting your own, look at what the checks config module exports.
- **A rule loaded by a tool may be shown not in full, and the cut is marked by nothing.** A long
  file comes into the context cut at a line, and the cut falls on the tail — where the override
  sections are appended at the end. The shown lines are compared with the file length by one
  command; if they differ, the file is read to the end.
