# Binding — taking the state of the layout apart

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The report names the sections replaced by overrides by name — the resource and the heading.** — `projects/agent-kit/src/lib/commands.ts:replacedLines`
- **A tree without overrides stays silent about what is replaced.** — `projects/agent-kit/src/lib/commands.ts:replacedLines`
- **The digest names the local values the taken hooks expect.** — `projects/agent-kit/src/lib/commands.ts:localValueLines`
- **The key of the header of a local value is read in both languages.** — `projects/agent-kit/src/lib/commands.ts:LOCAL_VALUE`
- **An override matched to no resource is named together with the reason.** — `projects/agent-kit/src/lib/snapshot.ts:overridesOf`
- **A file outside the kinds of resources does not count as an override.** — `projects/agent-kit/src/lib/snapshot.ts:treeSnapshot`
- **The debt of bindings is counted by the laid-out body of a rule, not by the package edition.** — `projects/agent-kit/src/lib/sync.ts:mergedBody`
- **An unset compaction threshold the report names together with ready numbers.** — `projects/agent-kit/src/lib/thresholds.ts:thresholdLines`
- **An override created for the sake of a sent proposal is marked in the override itself.** — `projects/agent-kit/src/lib/override-marks.ts:MARK` — the shape of the mark; scenario `SC-AK-846`
- **The layout lists the marked sections whose article already stands in the new edition.** — `projects/agent-kit/src/lib/commands.ts:staleOverrideLines` — scenario `SC-AK-847`
- **A section is removed by a person, not by a command.** — `projects/agent-kit/src/lib/override-marks.ts:staleOverrides` — the function only names the sections and writes nothing; scenario `SC-AK-847`
- **A section without a mark counts as permanent.** — `projects/agent-kit/src/lib/override-marks.ts:marksOfOverride` — scenario `SC-AK-846`
- **A mark on a resource that is not in the new edition stays silent.** — `projects/agent-kit/src/lib/override-marks.ts:staleOverrides` — scenario `SC-AK-848`
- **An unfilled hole does not count as a divergence and is named as a state of its own.** — `projects/agent-kit/src/lib/commands.ts:syncCheck` — the count of divergences does not include it; scenario `SC-AK-854`
- **A hole is named at any outcome of the audit, together with the move.** — `projects/agent-kit/src/lib/commands.ts:holeWarningLines` — the block stands among the warnings, and they are printed on a tree that came together too; scenario `SC-AK-854`
