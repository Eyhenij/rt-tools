---
name: lib-layers
kind: rule
law: lib-imports
description: Rule under the lib-imports law. Load when editing project manifests, build paths, linter boundaries, any barrel and the layout checks, and when deciding where a shared symbol lives. Patterns lib-layers-new, lib-layers-move.
---
<!-- rt-kit v0.37.0 · rules/lib-layers.md · 65cbbc11b818 · правится надстройкой, не здесь -->

# Imports between libs — how it works here

Rule under the law `docs/constitution/lib-imports.md`. Cold part: `pitfalls.md`. Where it lives: the
table in `implementation.md` next to it.

| In the law             | Here                                                         |
| ---------------------- | ------------------------------------------------------------ |
| lib family             | keys `families` and `apiFamily` of the checks' settings      |
| the right to see a lib | a tag in `eslint/boundaries/domains/<family>.config.mjs`     |
| family base            | `<family>/core`; its tag is in `ADMIN_UNIVERSAL`             |

## How the law applies here

- **A foreign symbol is not re-exported in either of the two forms.** Neither `export { X } from
  '@<scope>/…'` nor the pair "import plus `export { X };`".
- **A line with a foreign lib alias in a barrel is the same re-export.** A relative path is legitimate.
- **A missing right is added as a line in the domain config with a comment.** Only a legitimate
  right; otherwise the symbol moves where both sides see it. An import that just worked proves
  nothing: a boundary is checked by an introduced violation.
- **`libs/common/util` has an empty dependency list, and Angular does not get in.** A DI token shared
  by the two frontend families lives in `common/platform`.
- **The family base sees only `util`.** Any dependency it takes is shared by every domain of the
  family. One exception: `CORE_EXCEPTIONS` lets `admin/core` see `common/proto` and `common/connect`.
- **Behaviour the family base cannot see comes to it by a token.** Declared in the `util` of the
  family's common domain (not `libs/common/util`), implemented by `data-access`. The base boundaries
  are never widened for one call: that opens the lib to the whole family for good.
- **A domain is started for a subject, not for mechanics.** Shared mechanics ride into the family
  base on the frontend, into `util` on the backend.
- **The name of a lib is what its manifest declares, and the path only suggests it.** The tag and the
  alias derive from it; the audit reads all three from the manifest. No name declared — the path
  says what it must become.
- **A domain with exactly one non-empty layer is listed as a line with a reason.** Empty layers are
  normal; unlisted, such a domain cannot be told from an empty slot.

## Patterns

- `lib-layers-new` — create or remove a lib: generator, tags, alias, README.
- `lib-layers-move` — move code between libs: order, boundaries, imports, README of both.
