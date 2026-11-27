---
name: navigation
kind: rule
law: navigation
description: Rule under the navigation law. Load when editing the menu declaration, libs/admin/common/container/**, apps/admin/src/app/app.routes.ts and any libs/admin/**/*.routes.ts. Names the menu declaration, panel columns and groups, gating and address nesting. Ready-made code is in pattern admin-nav-item.
---
<!-- rt-kit v0.42.0 · rules/navigation.md · 0790e6d1a79e · правится надстройкой, не здесь -->

# Admin navigation — how it works here

Rule under the law `docs/constitution/navigation.md`. Cold part: `pitfalls.md`. Where it lives: the
table in `implementation.md` next to it.

## What it is called here

| In the law               | Here                                                                            |
| ------------------------ | ------------------------------------------------------------------------------- |
| menu item                | an entry in the `admin-nav.items.ts` declaration                                |
| section with a panel     | an item with columns; has no address of its own                                 |
| second-level panel       | the `rt-page-header` popup from the kit package, laid out in columns and groups |
| unread sign              | a dot, comes as a predicate by the item id                                      |
| the "no screen yet" flag | `disabled` in the declaration                                                   |

Items without a screen are rolled out as unavailable, not removed. The header is drawn by the kit;
the project only declares items.

## How the law applies here

- **An item is declared once and serves as the source of both the menu and route gating.** A second
  declaration drifts: the item is not visible, but the page opens.
- **The declaration imports no `shell`.** It would close a cycle through `container/feature`.
- **Gating has two layers: the user right and the section flag.** The flag marks an item with no
  screen yet: it has no rights and no address, and stays visible to everyone.
- **Domain data comes into the header by a token, not by an import.** The interface and the
  `InjectionToken` live in `container/util`; the composition root binds the token to the domain
  implementation.

## Patterns

- `admin-nav-item` — create a menu item and its route: the declaration, rights, the flag, address
  nesting, the caption in all locales.
