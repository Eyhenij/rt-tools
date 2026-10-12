# Grill

## The owner request

> обнови все пакеты до самых последних

## What the tree already has

- `pnpm outdated -r` on 2026-10-12 lists the Angular framework at 22.1.6 and its build tooling at
  22.1.8; the last released version of both is 22.2.2.
- The compiler of 22.2.2 accepts TypeScript `>=6.0 <6.1`, the same bound as 22.1, so TypeScript
  stays on 6.0.3.
- The published packages declare `@angular/core` as `^22.0.0`; the new minor fits the range, and
  the manifests of the packages are not edited.

## Decisions

- **CDK and Material stay out:** they carry styling and have their own task (RT-2769).
- **`@angular-eslint` stays on 22.5.0:** it has its own release line, and 22.5.0 is its last.
