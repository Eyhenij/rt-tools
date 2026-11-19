---
name: lib-layers
kind: rule
law: lib-imports
description: Rule under the lib-imports law. Load when editing project manifests, build paths, linter boundaries, any barrel and the layout checks, and when deciding where a shared symbol lives. Patterns lib-layers-new, lib-layers-move.
---

# Imports between libs — how it works here

Rule under the law `docs/constitution/lib-imports.md`. Cold part: `pitfalls.md`. Where it lives: the
table in `implementation.md` next to it.

## How the law applies here

- **A foreign symbol is not re-exported in either of the two forms.** Neither `export { X } from
  '@<scope>/…'` nor the pair "import plus `export { X };`".
- **A line with a foreign lib alias in a barrel is the same re-export.** A relative path is legitimate.
- **A missing right is added as a line in the domain config with a comment.**
- **`libs/common/util` has an empty dependency list, and Angular does not get in.** A DI token shared
  by the two frontend families lives in `common/platform`.
- **The family base sees only `util`.**
- **Behaviour the family base cannot see comes to it by a token.** Declared in the `util` of the
  common domain, implemented by `data-access`; the base boundaries are not widened.
- **A domain is started for a subject, not for mechanics.** Shared mechanics ride into the family
  base on the frontend, into `util` on the backend.
- **The name of a lib is what its manifest declares, and the path only suggests it.** The tag and the
  alias derive from it.
- **A domain with exactly one non-empty layer is listed as a line with a reason.**

## Patterns

- `lib-layers-new` — create or remove a lib: generator, tags, alias, README.
- `lib-layers-move` — move code between libs: order, boundaries, imports, README of both.
