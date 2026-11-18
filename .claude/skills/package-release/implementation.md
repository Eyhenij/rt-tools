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

- **A package built from a copy of another package's pipeline carries every step of that pipeline, and the `verify` step is one of them.** — `tools/check-package-release.mjs:packageFaults` — the `verify` target of the project, the root command and the publication workflow are demanded together
- **A built package is loaded the way a consumer loads it before it is published.** — `tools/verify-package.cjs:consumer` — both entry points from the built folder, then from an unpacked tarball in an empty folder
- **Every relative import of the built ESM names a file that exists, with its extension.** — `tools/verify-package.cjs:relativeSpecifiers` — every `from './x'` of the built ESM is resolved against the folder
- **A commit header written by a publication workflow obeys the same list as a hand-written one.** — `tools/check-package-release.mjs:workflowHeaderFaults` — the type, the area and the Russian subject are judged by the settings of the commit check
- **A refusal of the commit check on one's own commit names a string that lives elsewhere too.** — **Not checked by anything.** The search across the tree after a refusal leaves no trace a machine reads. Held by the pitfall of the rule and by the analysis «Область коммита в процессе публикации никто не проверил до самого выпуска» in the intake.
- **A release starts only when the check passes.** — `.claude/hooks/package-release-guard.sh:package` — a start of `publish-<package>.yml` runs the wiring check with the build
- **"Built" and "tested" are not "consumable".** — **Not checked by anything.** What a reply to the owner says about a package leaves no trace. Held by the author; the start guard holds the release itself.
