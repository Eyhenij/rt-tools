# The coupling of modules — where this is in the tree

The first column is the article verbatim, as it is written in the "Rules" section of the subdomain
spec.

- **The graph is read from texts, and a file is a module.** — `projects/agent-kit/assets/checks/coupling-graph.mjs:graphOf`
- **Every form of an import with a literal name is a link.** — `projects/agent-kit/assets/checks/coupling-graph.mjs:SPECIFIERS` — scripts are read by `calledScript` of the same file; scenario SC-AK-1933
- **A copy laid out from a package is not a module.** — `projects/agent-kit/assets/checks/coupling-read.mjs:LAID_OUT`
- **A cycle is judged among modules and among blocks.** — `projects/agent-kit/assets/checks/coupling-judge.mjs:structureOf` — the links of blocks are built by `projects/agent-kit/assets/checks/coupling-numbers.mjs:blocksOf`; scenarios SC-AK-1934 and SC-AK-1938
- **An import past an entry is lawful where there is no other way.** — `projects/agent-kit/assets/checks/coupling-numbers.mjs:bypassesOf` — scenario SC-AK-1935
- **What stood in the base is not judged.** — `projects/agent-kit/assets/checks/coupling-judge.mjs:structureOf` — scenarios SC-AK-1938 and SC-AK-1939
- **The settings of the base are in force together with those of the branch.** — `projects/agent-kit/assets/checks/check-coupling.mjs:baseSettings` — the roots are joined and the skipped folders crossed there too; scenarios SC-AK-1938 and SC-AK-1939
- **Growth is judged against the first plan of the branch.** — `projects/agent-kit/assets/checks/coupling-judge.mjs:growthOf` — the numbers are read by `projects/agent-kit/assets/checks/coupling-plan.mjs:namedOf`; scenario SC-AK-1940
- **An overrun carries its reason and is printed.** — `projects/agent-kit/assets/checks/check-coupling.mjs:later` — scenario SC-AK-1940
- **Growth is judged by the own edits of the branch.** — `projects/agent-kit/assets/checks/coupling-read.mjs:ownPaths` — scenario SC-AK-1940
- **The list of the accepted does not lift what the branch added.** — `projects/agent-kit/assets/checks/check-coupling.mjs:OWNER_WORDS` — scenario SC-AK-1941
- **Incoming links and names taken by nobody are printed, not judged.** — `projects/agent-kit/assets/checks/coupling-numbers.mjs:numbersOf` — scenario SC-AK-1936
- **The push set and the pipeline call the check with the base.** — `projects/agent-kit/assets/defaults/push.sh:rt_push_checks_default` — the pipeline step is «Coupling of modules» of `.github/workflows/ci.yml`; scenario SC-AK-1941
- **With a base an old violation missing from the list is printed.** — `projects/agent-kit/assets/checks/coupling-judge.mjs:countsOf` — scenario SC-AK-1941
- **A missing revision is a refusal with its name.** — `projects/agent-kit/assets/checks/coupling-read.mjs:RevisionMissing` — scenario SC-AK-1937
