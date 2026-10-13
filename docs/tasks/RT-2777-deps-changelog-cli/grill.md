# Grill

## The owner request

> обнови все пакеты до самых последних

## What the tree already has

- The root manifest holds `conventional-changelog-cli` 5.0.0. The registry marks it deprecated
  and names `conventional-changelog` as the replacement; its last version is 8.1.3, and it carries
  the same `conventional-changelog` command.
- Six `changelog:*` scripts call it, and six publishing pipelines call those scripts. Each script
  passes `-p angular -i <file> -s -k <manifest> --commit-path <dir> --tag-prefix <prefix>`.
- Version 8 dropped `-s`: the output file is the input file by default. The `angular` preset is
  a package of its own, `conventional-changelog-angular`, last version 9.4.0; the tree does not
  declare it.
- `tools/fold-unreleased-changelog.cjs` names the old call in its header comment.

## Decisions

- **`conventional-changelog` 8.1.3 and `conventional-changelog-angular` 9.4.0 replace the old
  CLI:** the preset is declared by itself, because pnpm does not hand a package an undeclared one.
- **The scripts lose `-s` and keep everything else.**
- **The change is checked by comparing outputs:** the old and the new command print the last three
  releases of three packages, and the texts are compared.
