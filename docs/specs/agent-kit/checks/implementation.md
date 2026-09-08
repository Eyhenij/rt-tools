# The checks of the tree — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec next to
it. A rule without a line and a line without a rule are a divergence: the spec promises what is not
in the code, or the code holds what the spec is silent about.

The anchor here is the word that holds the statement. The audit looks for it across the whole file
and is satisfied by any word, so the name of a field from a foreign line passes it the same way the
needed sentence does — and the statement stays green when the text of the role itself is rewritten
whole.

- **The directory of a foreign package is found by module resolution, not by a path in the dependency directory.** — `projects/agent-kit/assets/checks/check-dupes.mjs:resolveExternalDir`
- **A table of correspondences counts as a repeat by the share of matching pairs, not by full equality.** — `projects/agent-kit/assets/checks/check-dupes.mjs:tableOverlap` — the share is counted from the larger table, the threshold is `MIN_TABLE_SHARE`; scenarios SC-AK-596…598
- **The absence of a foreign package does not take the check down.** — `projects/agent-kit/assets/checks/check-dupes.mjs:holdersOf`
- **The length limit is declared as one number for all kinds of files.** — `projects/agent-kit/assets/checks/check-file-size.mjs:LIMIT`
- **What accumulated before the limit was declared is listed by name.** — `projects/agent-kit/assets/checks/check-file-size.mjs:parseAllowlist`
- **The accepted and the debt in the list are told apart.** — `projects/agent-kit/assets/checks/check-file-size.mjs:known`
- **The list of the accepted is read by a shared parser, not by every check in its own way.** — `projects/agent-kit/assets/checks/rt-kit-checks.config.mjs:parseAllowlist`
- **A record of the list carries a reason of its own and the number of the task that added it.** — `projects/agent-kit/assets/checks/rt-kit-checks.config.mjs:allowlistOf`
- **A side of the list written as a list of lines refuses the parse, and the refusal shows the shape of a record.** — `projects/agent-kit/assets/checks/rt-kit-checks.config.mjs:parseAllowlist`
- **The side the check reads is named to the parser by a list.** — `projects/agent-kit/assets/checks/lib-common.mjs:allowlist` — the list of sides includes the flat lib roots, and the gathering takes them parsed
- **There is no list at all — the parser gives back an empty one and refuses no work.** — `projects/agent-kit/assets/checks/rt-kit-checks.config.mjs:parseAllowlist`
- **Data is taken out of the length count.** — `projects/agent-kit/assets/checks/check-file-size.mjs:JUDGED`
- **The archive and the task folder are taken out of the count.** — `projects/agent-kit/assets/checks/check-file-size.mjs:SKIPPED_PREFIXES`
- **What is generated is taken out by directory, not by names.** — `projects/agent-kit/assets/checks/check-file-size.mjs:SKIPPED_PREFIXES`
- **The length is counted the same way the linter counts it.** — `projects/agent-kit/assets/checks/check-file-size.mjs:lineCount`
- **A declaration that arrived by a connected package is read on a par with one's own.** — `projects/agent-kit/assets/checks/check-styles.mjs:declarationsFromPackages`
- **What the application connected itself is read, and no deeper.** — `projects/agent-kit/assets/checks/check-styles.mjs:USE_RE`
- **A divergence is recognised by the name of the class, not by the list of files at it.** — `projects/agent-kit/assets/checks/check-styles.mjs:knownByName`
- **A changed list of files is named by its own kind.** — `projects/agent-kit/assets/checks/check-styles.mjs:changedFiles`
- **The name of an element is assembled from the nesting, not read as one line.** — `projects/agent-kit/assets/checks/check-styles.mjs:elementNames`
- **There are two length limits: code and the text of the rules layer.** — `projects/agent-kit/assets/checks/check-file-size.mjs:limitOf` — the limit is picked by the root of the file; the roots and the second number are declared in `projects/agent-kit/assets/checks/rt-kit-checks.config.mjs:DEFAULTS`.
- **A binding is written in two shapes, and both are read.** — `projects/agent-kit/assets/checks/spec-anchors.mjs:cells` — a list line is parsed by the same place as a table row; scenarios SC-AK-662…664
- **The text of the rules layer has a third limit — its weight in characters.** — `projects/agent-kit/assets/checks/check-file-size.mjs:charCount` — characters, not bytes: a letter outside Latin weighs two bytes, and a byte count would judge the language, not the text.
- **The companions are taken out of the weight count.** — `projects/agent-kit/assets/checks/check-file-size.mjs:companion` — the companion of a rule and the scenario list of a spec.
- **A tree that named no weight number and no text roots is judged by lines alone.** — `projects/agent-kit/assets/checks/check-file-size.mjs:PROSE_CHARS` — zero switches the weight count off entirely, and the second figure is not printed in the digest.
- **A check declares a skip by the exit code, not by a line of output.** — `projects/agent-kit/assets/checks/check-schema-drift.mjs:SKIP` — scenario `SC-AK-678`
- **A skipped check is named aloud but refuses no push.** — `projects/agent-kit/assets/hooks/git-guard-push-tests.sh:rt_skip_code` — scenario `SC-AK-679`
- **A check that could not do its work refuses, it does not skip.** — `projects/agent-kit/assets/checks/check-schema-drift.mjs:main` — an unforeseen failure and a comparison that did not run give back a non-zero code; scenario `SC-AK-549`
- **"There is nowhere to check" stops being a skip when the branch touched the subject of the check.** — `projects/agent-kit/assets/checks/check-schema-drift.mjs:unavailable` — scenario `SC-AK-822`
- **Touchedness is counted on both sides: the uncommitted and the contribution of the branch from main.** — `projects/agent-kit/assets/checks/check-schema-drift.mjs:touchedStorage` — main is taken by the remote reference, and where there is none, by the local one; no git — it counts as not touched
- **A refusal about an unavailable database names what to raise it with.** — `projects/agent-kit/assets/checks/check-schema-drift.mjs:unavailable` — the refusal calls the pattern `git-workflow-migration` with the commands of a one-off container
- **An empty name in the setting is asked about apart from a non-existent file.** — `projects/agent-kit/assets/checks/check-schema-drift.mjs:main` — an unset schema name answers with a line of its own and with zero; scenario `SC-AK-549`
- **A cheap check is not split by subject and is called at any composition of an edit.** — `.claude/rt-kit/project.sh:rt_push_checks` — the checks of the styling layer stand in the common list, not among the heavy steps; scenario `SC-AK-673`
- **A heavy step of the set is called by its own subject, not by the sign "the branch touched code".** — `.claude/rt-kit/project.sh:rt_push_touched` — the subjects are declared by paths, the unfamiliar and the common raise the whole set; scenario `SC-AK-569`
- **A sign names its own scope.** — `projects/agent-kit/assets/hooks/reuse-first-guard.sh:scope`
- **An empty field of a sign does not slide into the neighbouring one.** — `projects/agent-kit/assets/hooks/reuse-first-guard.sh:cancel`
- **A guard that got not a single sign says so.** — `projects/agent-kit/assets/hooks/reuse-first-guard.sh:signals_seen`
- **The guard on an edit and the sweeping check read the same fields of a sign.** — `projects/agent-kit/assets/hooks/reuse-first-guard.sh:rt_backend_roots`
- **A request opened not into the main branch is named by a line of its own.** — `projects/agent-kit/assets/checks/check-board.github.mjs:baseRefName` — the base arrives by the same request as the other fields of the request; scenario SC-AK-845
- **The check of the archive keeping time demands a day later than the cleanup removes.** — `projects/agent-kit/assets/checks/archive-age.mjs:CHECK_GRACE_DAYS` — the check calls the shared pick with a margin, the cleanup without one; scenarios SC-AK-869, SC-AK-870, SC-AK-871
- **The answer of the work queue helper says whose eyes the state was taken by.** — `projects/agent-kit/assets/checks/board.github.mjs:viewerOf` — the field is set by `taskState` and `pullState`; scenario SC-AK-873
- **The plan of an epic is the document that carries the makeup, not the first path in the card.** — `projects/agent-kit/assets/checks/board-epics.github.mjs:checkEpicLinks` — the table is read by `planRows`; scenario SC-AK-919
- **Belonging to an epic is declared by a word about the task, not by a mention of the number.** — `projects/agent-kit/assets/checks/board-epics.github.mjs:declaredEpicOf` — both sides call it; scenario SC-AK-920
