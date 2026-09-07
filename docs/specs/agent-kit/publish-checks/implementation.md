# The binding — the checks of publishing

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The imports of a package from a neighbour are read from the sources, not from the build.** — `tools/check-package-imports.mjs:importsOf` — the sample `IMPORT` takes the list of names, `namesOf` removes `type` and the alias; scenario SC-AK-895
- **Probes, showcase stories and imports inside comments are not judged.** — `tools/check-package-imports.mjs:NOT_SHIPPED` — the comments are removed by the sample `COMMENTS`; scenarios SC-AK-897, SC-AK-901
- **The exports of a neighbour are read from the types of the published version, the greatest in the registry under the range of the manifest.** — `tools/check-package-imports.mjs:maxSatisfying` — the entry point of the types is picked by `typesEntry`; scenario SC-AK-894
- **The chain of `export *` is read to the end, and the file of types is taken before the source next to it.** — `tools/check-package-imports.mjs:resolveChained` — scenario SC-AK-896
- **The neighbour imported from is named in the manifest, and there is a version in the registry under its range.** — `tools/check-package-imports.mjs:satisfies` — scenario SC-AK-898
- **A symbol the published neighbour does not have, while the sources of the neighbour do, waits for publishing and does not drop the check in the push gate.** — `tools/check-package-imports.mjs:exportedInTree` — the strict mode is switched on by the flag `STRICT`; scenario SC-AK-900
- **The judging is narrowed down to one package by a flag, and an unknown package is refused.** — `tools/check-package-imports.mjs:ONLY` — scenario SC-AK-901
- **The registry did not answer — the check passes and says so.** — `tools/check-package-imports.mjs:publishedVersions` — scenario SC-AK-899
- **The published versions lie in a cache under the dependency directory.** — `tools/check-package-imports.mjs:unpacked` — the directory `CACHE`, a probe puts a fixture there by a variable
- **The comparison of the imports stands in the suite of the push gate, as a step of the pipeline and as a strict step before the publishing of every package.** — `.claude/rt-kit/project.sh:rt_push_checks` — the step of the pipeline is in `.github/workflows/ci.yml`, the strict step in every `.github/workflows/publish*.yml` before the publishing step
- **A pipeline that raises the version rebuilds the lock after the publishing and puts it by a request of its own.** — `tools/check-publish-lockfile.mjs:RESYNC` — the publishing step is `PUBLISHES`, the request is `COMMITS`; the probe on a fixture is `projects/agent-kit/tests/checks-publish-lockfile.test.sh`
