# Grill

## The owner request

> обнови все пакеты до самых последних

## What the tree already has

- The root manifest holds `webpack-dev-server` 5.2.6; the last published version is 6.0.0, out
  since 2026-07-03. Nothing in the tree configures the dev server itself.
- `@angular-devkit/build-angular` 22.2.2 depends on `webpack-dev-server` 6.0.0 exactly, while the
  substitution `webpack-dev-server: '^5.2.6'` in the workspace file rolls it back to 5.2.6 silently.
- `@nx/webpack` 23.3.0, which builds the receiver and the auth example API, depends on `^5.0.0`.
  `webpack-cli` and `@angular-devkit/build-webpack` accept both 5 and 6.
- The substitution came in as a security patch: older 5.x releases carry known holes.

## Decisions

- **The root and the Angular build take 6.0.0:** it is the last release, and the Angular build
  asks for it itself.
- **The substitution narrows to the 5.x line:** `webpack-dev-server@5` keeps the security floor
  for the copy `@nx/webpack` installs, and stops rolling the Angular build back. Rejected:
  dropping it — a fresh lock would then be free to take a holed 5.x for `@nx/webpack`.
