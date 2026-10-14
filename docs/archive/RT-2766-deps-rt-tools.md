# Grill

## The owner request

> обнови все пакеты до самых последних

## What the tree already has

- `pnpm outdated -r` on 2026-10-12: the lockfile resolves `@rt-tools/core` 0.5.0, `@rt-tools/store`
  0.3.3 and `@rt-tools/utils` 0.4.0, while the manifests of the published packages already ask for
  0.5.1, 0.3.4 and 0.4.1.
- The sign-in theme and the CMS packages declare `@rt-tools/core` ^0.5.0, `@rt-tools/utils` ^0.4.0
  and `@rt-tools/auth-server` ^0.2.1; the registry holds 0.5.1, 0.4.1 and 0.2.3.
- The second kit at 0.17 in the theme and the CMS front end carries styling and is raised by RT-2772.

## Decisions

- **The ranges of published packages stay ranges.** A package manifest declares what it accepts from
  a consumer; an exact number there would refuse every newer neighbour. The exact-number rule speaks
  of the tree root.
