# Scenarios — taking the state of the layout apart

The identifier stands at the start of the test title, followed by a dash. The prefix is shared by the
domain, and the numbers were not recounted on the move into the subdomain: the number ties a scenario
to a test title.

### SC-AK-435 — an unset compaction threshold the report names together with ready numbers

Given the tree declared the size of the window and declared no compaction threshold at all
When the state report prints the thresholds
Then it names the numbers of the watchman and says that the compaction threshold is assigned by the
tool — with ready values for both settings

Covered: `projects/agent-kit/src/lib/thresholds.spec.ts`.

### SC-AK-716 — the state report names the sections replaced by overrides

Given an override of the tree replaces a package section by a matched heading
When the state of the layout is taken apart
Then it names such a section by name — the resource and the heading: everything the package appends
into it by a new version vanishes silently, and the loss has no other witnesses. A tree without
overrides stays silent about this

### SC-AK-729 — the digest names the local values the taken hooks expect

Given a taken hook named by a header line the local value it lives by
When the state digest reads the tree
Then it says how many such values the hooks expect and names the missing ones by name — with the name
of the hook and what stops being checked without the value; a value that lies there it does not list

The key of the header is read in both languages at that: a hook with the owner's-language key the
digest counts on a par with an English one

### SC-AK-730 — an override matched to no resource is named

Given the overrides directory holds a file whose name matches no resource identifier
When the layout or its audit reads the tree
Then the file is named by a warning line — it was not applied; a file outside the kinds of resources, a
README of the directory, does not count as an override at all

### SC-AK-731 — the debt of bindings is counted by the laid-out body of a rule

Given the tree replaces the articles section of a rule by an override of its own
When the layout counts the articles without an address
Then the articles of the laid-out text go into the debt, not those of the package edition: the replaced
section is not in the tree, and there is nothing to bind in the companion

### SC-AK-846 — the mark names the resource, the article and the day of the send

Given a section of the override carries a markup comment with the package resource, the article and
the day
When the marks of the file are taken apart
Then the section is named together with these three values, and a section without a mark counts as
permanent

Covered: `projects/agent-kit/src/lib/override-marks.spec.ts`.

### SC-AK-847 — the layout names the overrides whose article already stands in the package

Given in the new edition of the package the article of the marked section already stands
When the layout runs
Then the section is named by a line of the output together with the file and the day of the send, and
it is not removed itself: that is done by a person. An article wrapped by the line width is found the
same way a continuous one is; the article is not in the edition — the section is not named

Covered: `projects/agent-kit/src/lib/override-marks.spec.ts`.

### SC-AK-848 — a mark on a resource that is not in the edition stays silent

Given the mark names a resource that is not in the new edition, or there is no overrides directory
When the layout runs
Then nothing is named: the package may have renamed the resource, and calling the override surplus on
that ground would mean advising to remove what no replacement came for

Covered: `projects/agent-kit/src/lib/override-marks.spec.ts`.

### SC-AK-854 — an unfilled hole does not count as a divergence

Given the tree is laid out and the companions are filled, and one resource holds a hole whose value is
not in the setting
When the layout audit runs
Then the exit code is zero, and the hole is named by a block of its own — with the name of the setting
key and a word saying that until the value the resource is not laid out

Covered: `projects/agent-kit/src/lib/commands.spec.ts`.
