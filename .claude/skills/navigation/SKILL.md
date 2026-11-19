---
name: navigation
kind: rule
law: navigation
description: Rule under the navigation law. Load when editing the menu declaration, libs/admin/common/container/**, apps/admin/src/app/app.routes.ts and any libs/admin/**/*.routes.ts. Names the menu declaration, panel columns and groups, gating and address nesting. Ready-made code is in pattern admin-nav-item.
---
<!-- rt-kit v0.37.0 · rules/navigation.md · e91b833beeab · правится надстройкой, не здесь -->

# Admin navigation — how it works here

Rule under the law `docs/constitution/navigation.md`. Cold part: `pitfalls.md`. Where it lives: the
table in `implementation.md` next to it.

A menu item is an entry of `admin-nav.items.ts`; the second-level panel is `rt-page-header` of the
kit, laid out in columns and groups; «no screen yet» is `disabled` in the declaration.

## How the law applies here

- **An item is declared once and serves as the source of both the menu and route gating.**
- **The declaration imports no `shell`.** It would close a cycle through `container/feature`.
- **Gating has two layers: the user right and the section flag.** An item with a flag has no
  rights and no address.
- **Domain data comes into the header by a token, not by an import.** The interface and the
  `InjectionToken` live in `container/util`.

## Patterns

- `admin-nav-item` — create a menu item and its route: the declaration, rights, the flag, address
  nesting, the caption in all locales.
