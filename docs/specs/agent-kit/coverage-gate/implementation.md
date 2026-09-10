# Implementation — a resource without a spec does not leave with the package

Every statement of the spec and the place it is carried out.

- **A resource of the package is described by a spec of its kind before it leaves.** — `projects/agent-kit/assets/checks/check-spec-coverage.mjs:uncovered` — the list of what no spec speaks of; scenario `SC-AK-1058`
- **The measure stands in the set before a push, not in a report to a person.** — `projects/agent-kit/assets/defaults/project.sh:rt_push_checks_default` — the check stands in the set on a par with the spec audit; scenario `SC-AK-1059`
- **The reading is asked from the command that prints the measure, not written a second time.** — `projects/agent-kit/assets/checks/check-spec-coverage.mjs:ENTRY` — the entry is called as a child process; scenario `SC-AK-1058`
- **The refusal names the count and prints the resources, a line each.** — `projects/agent-kit/assets/checks/check-spec-coverage.mjs:console` — the count and the list; scenario `SC-AK-1059`
- **A tree that declared no directories of package sources is not judged.** — `projects/agent-kit/assets/checks/check-spec-coverage.mjs:portableDirs` — an empty list lets the push through; scenario `SC-AK-1060`
- **A tree with no entry into the specs laid out is not judged either, and the check says so.** — `projects/agent-kit/assets/checks/check-spec-coverage.mjs:existsSync` — the entry is looked for on the disk; scenario `SC-AK-1061`
- **The check judges the tree, and the entry judges one resource.** — `projects/agent-kit/assets/checks/specs-for.mjs:entry` — the entry answers about one name; scenario `SC-AK-1058`
