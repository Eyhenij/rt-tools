# Binding — the entry into the specs by a resource name

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The spec about a resource is found by a command, not by reading the subdomains in a row.** — `projects/agent-kit/assets/checks/specs-for.mjs:main` — one argument or none; the suite is `projects/agent-kit/tests/specs-for.test.sh`
- **The entry is assembled from the bindings of the companions, not from a list of its own.** — `projects/agent-kit/assets/checks/specs-for.mjs:bindings` — every `implementation.md` under the specs directory; scenario `SC-AK-940`
- **A resource is matched with a binding by the tail of the path, not by the whole string.** — `projects/agent-kit/assets/checks/specs-for.mjs:tailMatches` — scenario `SC-AK-941`
- **The tail is matched by whole segments of the path.** — `projects/agent-kit/assets/checks/specs-for.mjs:segmentsOf` — the path is cut into segments before the match; scenario `SC-AK-942`
- **The answer names the statements about that very file, not the whole spec.** — `projects/agent-kit/assets/checks/specs-for.mjs:entry` — grouped by spec; scenario `SC-AK-944`
- **A name matched by nothing ends with a refusal, not with an empty answer.** — `projects/agent-kit/assets/checks/specs-for.mjs:entry` — code one and the name that was looked for; scenario `SC-AK-943`
- **Called without a name, the command names the resources no spec speaks of.** — `projects/agent-kit/assets/checks/specs-for.mjs:uncovered` — scenario `SC-AK-945`
- **The uncovered are counted by what the package carries, not by the files the bindings name.** — `projects/agent-kit/assets/checks/specs-for.mjs:carried` — the directories of the sources of portable texts named by the tree; scenario `SC-AK-946`

The names of this tree: the command is `npm run specs:for`, the laid-out copy is
`tools/specs-for.mjs`, the sources of what is carried are named by the key `portableDirs` in
`.claude/rt-kit/checks.json`.
