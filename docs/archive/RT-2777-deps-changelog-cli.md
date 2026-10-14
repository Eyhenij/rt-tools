# Grill

## The owner request

> обнови все пакеты до самых последних

## What the tree already had

- The root manifest held `conventional-changelog-cli` 5.0.0, which the registry marks deprecated
  and replaces with `conventional-changelog`, last version 8.1.3.
- Six `changelog:*` scripts called it, and six publishing pipelines called those scripts.
- Version 8 dropped the `-s` key: the output file is the input file by default. The `angular`
  preset became a package of its own, `conventional-changelog-angular`, last version 9.4.0.

## Decisions

- **`conventional-changelog` 8.1.3 and `conventional-changelog-angular` 9.4.0:** the preset is
  declared by itself, because pnpm does not hand a package an undeclared one.
- **The scripts lose `-s` and keep everything else.**
- **Two differences in the output are accepted:** `%40` instead of `@` in the compare links, and
  no blank line after a release heading. Both links open on the host; the fold script reads
  headings, not links.
- **Checked by comparing outputs** of the last three releases of three packages, and by a run of
  the whole script on a copy of the core log.
