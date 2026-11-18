# package-release — where it is carried out

The names and bindings of this tree next to the rule `SKILL.md`.

## Where it lives

- **the loading check** — `tools/verify-package.cjs` — the `verify` target of every project that builds with `tsc` in two formats
- **the wiring check** — `tools/check-package-release.mjs` — one pass over every such project
- **the start guard** — `.claude/hooks/package-release-guard.sh` — a start of a publication workflow
- **the push set** — `.claude/rt-kit/project.sh:rt_push_checks` — the wiring check stands in the set
- **the pipeline** — `.github/workflows/ci.yml` — the wiring check is a step
- **the scenarios** — `tools/tests/check-package-release.test.sh`

## Where the articles are carried out

- **A package built from a copy of another package's pipeline carries the `verify` step of that pipeline.** — `tools/check-package-release.mjs:packageFaults` — the `verify` target with its own folder as the argument, the root command that runs `nx verify` after the build and the publication workflow that builds through it are demanded together; other steps of the pipeline are not compared
- **A built package is loaded the way a consumer loads it before it is published.** — `tools/verify-package.cjs:consumer` — both entry points from the built folder, then from an unpacked tarball in an empty folder
- **Every relative import of the built ESM names a file that exists, with its extension.** — `tools/verify-package.cjs:relativeSpecifiers` — every `from`, `import()` and bare `import` of the built ESM and of its declaration files is resolved against the folder
- **A commit header written by a publication workflow obeys the same list as a hand-written one.** — `tools/check-package-release.mjs:workflowHeaderFaults` — the type, the area and the Russian subject are judged by the settings of the commit check
- **A refusal of the commit check on one's own commit names a string that lives elsewhere too.** — **Not checked by anything.** The search across the tree after a refusal leaves no trace a machine reads. Held by the pitfall of the rule and by the analysis «Область коммита в процессе публикации никто не проверил до самого выпуска» in the intake.
- **A release does not go out unless the built package loads.** — `.claude/hooks/package-release-guard.sh:packages` — a start of `publish-<package>.yml` runs the wiring check for every package named in the command; the barrier itself is `build:<package>` in the root `package.json`
- **"Built" and "tested" are not "consumable".** — **Not checked by anything.** What a reply to the owner says about a package leaves no trace. Held by the author; the start guard holds the release itself.
