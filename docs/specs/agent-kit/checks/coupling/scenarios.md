# Scenarios — the coupling of modules

The numbers run through the domain: they tie a scenario to a test title and are not recounted on the
move into a subdomain.

### SC-AK-1953 — every form of an import with a literal name is a link

Given a file that imports, re-exports, requires, joins or starts a neighbour by a literal name
When the numbers of the file are asked
Then the neighbour stands among its outgoing links, and a name in a comment or in a text does not

Covered: `projects/agent-kit/tests/check-coupling.test.sh`.

### SC-AK-1954 — a cycle is found among modules of any kind and among blocks

Given two modules of code, two scripts or two declared blocks that import each other
When the check runs without a base
Then the cycle is named by its members, and a link in one direction is not a cycle

Covered: `projects/agent-kit/tests/check-coupling.test.sh`.

### SC-AK-1955 — an import past an entry is named, a lawful one is not

Given a folder with a barrel or a declared entry and imports of its files from outside
When the check runs without a base
Then an import of an inner file is named, and one through the entry, from a test or without another
way is not

Covered: `projects/agent-kit/tests/check-coupling.test.sh`.

### SC-AK-1956 — the numbers of one module are printed

Given a module with importers, imports and names nobody takes
When its numbers are asked by the path
Then incoming, outgoing, imports past an entry, names shown and names taken by nobody are printed, and
who imports it and whom it imports, a folder gets its links to the outside by name, and an unknown
argument, an empty folder, a laid-out copy and a module with a base are refused

Covered: `projects/agent-kit/tests/check-coupling.test.sh`.

### SC-AK-1957 — with a base the check prints what was and what became

Given a branch that changed links of modules and of blocks
When the check runs with the base
Then every module whose numbers changed is printed with both, new links of blocks and the numbers of
the tree too, and a revision nobody has is refused by its name

Covered: `projects/agent-kit/tests/check-coupling.test.sh`.

### SC-AK-1958 — a new cycle is refused, an old one is not

Given a base with a cycle and a branch that added another
When the check runs with the base
Then only the new one is named, also where the branch dropped the block or the root from the settings,
and neither a rename of a block nor an entry added over old links makes the old one new; a module that
entered an old cycle is named, and a file moved into another block may close a new one

Covered: `projects/agent-kit/tests/check-coupling.test.sh`.

### SC-AK-1959 — a new import past an entry is refused, an old one is not

Given a base with an import past an entry and a branch that added another
When the check runs with the base
Then only the new one is named, also where the branch removed the entry, and neither a rename, a later
entry nor a link the entry lost makes the old one new; a file or an entry moved over the border of a
folder frees nothing

Covered: `projects/agent-kit/tests/check-coupling.test.sh`.

### SC-AK-1960 — growth past what the plan named is refused

Given a branch whose module imports more than at the point it left the base
When the check runs with the base
Then a number in the first plan lets it pass, a later line that calls itself an overrun and gives a
reason passes, and everything else is refused, the work of a merge apart

Covered: `projects/agent-kit/tests/check-coupling.test.sh`.

### SC-AK-1961 — the list of the accepted answers for itself, and the push set names the base

Given a list with a reason, without one and with a line whose violation is gone
When the check runs with the base and without it
Then a line of the branch lifts nothing with the base unless the owner's words stand in it, a line
without a reason or a violation is refused, and the push set calls the check once with its base

Covered: `projects/agent-kit/tests/check-coupling.test.sh`.
