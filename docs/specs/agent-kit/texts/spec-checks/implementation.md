# The check of the specs and the addresses — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec next to
it. A rule without a line and a line without a rule are a divergence: the spec promises what is not
in the code, or the code holds what the spec is silent about.

The anchor here is the word that holds the statement. The audit looks for it across the whole file
and is satisfied by any word, so the name of a field from a foreign line passes it the same way the
needed sentence does — and the statement stays green when the text of the role itself is rewritten
whole.

- **A subdomain is checked on a par with a domain.** — `projects/agent-kit/assets/checks/check-specs.mjs:collectSpecDirs`
- **A proposed law demands no rule.** — `projects/agent-kit/assets/checks/check-specs.mjs:isProposedLaw`
- **A merged agreement does not lock the branch.** — `projects/agent-kit/assets/hooks/task-flow-draft-guard.sh:draft_path`
- **A scenario prefix is taken by one spec across the whole tree.** — `projects/agent-kit/assets/checks/check-specs.mjs:prefixOwners`
- **A bare name and a directory are judged on a par with a full path.** — `projects/agent-kit/assets/checks/check-doc-paths.mjs:existsInTree`
- **The tree for the check of the paths is taken from the version control system, not by a walk of the directories.** — `projects/agent-kit/assets/checks/check-doc-paths.mjs:treeOfRepo`
- **The task folders are taken out of the check of the paths, like the archive.** — `projects/agent-kit/assets/checks/check-doc-paths.mjs:isSkipped`
- **A portable text is taken out of the check of the addresses.** — `projects/agent-kit/assets/checks/check-doc-paths.mjs:isPortable`
- **The completeness of the pointer of a directory is checked from both sides.** — `projects/agent-kit/assets/checks/check-doc-paths.mjs:checkIndex`
- **A divergence of the pointer is printed as a list of its own with an argument of its own.** — `projects/agent-kit/assets/checks/check-doc-paths.mjs:reportIndex`
- **What count as bindings are the rows of one table of the companion, not every row that looks like a row of a table.** — `projects/agent-kit/assets/checks/spec-anchors.mjs:rowsOfMap`
- **The companion of a rule without the section of the bindings is a refusal, not silence.** — `projects/agent-kit/assets/checks/spec-anchors.mjs:rowsOfMap`
- **A subheading inside the section does not end the list of items, a table does, and the refusal about an empty section names what stands instead of the items.** — `projects/agent-kit/assets/checks/spec-common.mjs:bulletsOf`
- **What counts as a symbol of an anchor is any letter, not only a Latin one.** — `projects/agent-kit/assets/checks/spec-common.mjs:ANCHOR`
- **A name in an anchor is written as it is declared in code, the hash included.** — `projects/agent-kit/assets/checks/spec-common.mjs:ANCHOR`
- **The alphabet is not listed as a list.** — `projects/agent-kit/assets/checks/spec-common.mjs:ANCHOR`
- **The path of the pair is parsed as before.** — `projects/agent-kit/assets/checks/spec-common.mjs:ANCHOR`
- **A scenario number of one digit the check sees on a par with two and three.** — `projects/agent-kit/assets/checks/spec-common.mjs:SCENARIO_HEADING`
- **A scenario number is issued once and is not used a second time.** — `projects/agent-kit/assets/rules/spec-driven.md:spec-driven`
- **A scenario and the title of its test are edited by one change.** — `projects/agent-kit/assets/patterns/spec-driven-domain.md:spec-driven-domain`
- **A rule whose patterns the tree skipped at the layout demands no pattern.** — `projects/agent-kit/assets/checks/check-specs.mjs:skippedPatterns`
- **The taking of a portable text out of the check of the addresses is older than the new requirement.** — `projects/agent-kit/assets/checks/check-doc-paths.mjs:PORTABLE_DIRS`
- **A table of refusal codes does not count as a procedure.** — `projects/agent-kit/assets/checks/spec-contract.mjs:contractRows` — a row with a number in the second cell is skipped; scenario SC-AK-688
- **An agreement waiting for its domain longer than a month is named by a section of its own in the output.** — `projects/agent-kit/assets/checks/spec-proposed.mjs:STALE_PROPOSED_DAYS` — the threshold in days; scenario `SC-AK-807`
- **The age of an agreement is taken from the history, not from the time of the file on disk.** — `projects/agent-kit/assets/checks/spec-proposed.mjs:lastCommits` — one pass over the history of the specs directory; scenario `SC-AK-807`
- **This is not made a refusal.** — `projects/agent-kit/assets/checks/spec-proposed.mjs:staleProposed` — the section is printed after the list of divergences and does not change the exit code; scenario `SC-AK-808`
- **The key of a spec section is read under two names — the English one and the language of the owner.** — `projects/agent-kit/assets/checks/spec-common.mjs:REQUIRED_HEADINGS` — the list of pairs and the reading of a section by either of the names in `sectionOf`; scenarios `SC-AK-912`, `SC-AK-913`, `SC-AK-914`
