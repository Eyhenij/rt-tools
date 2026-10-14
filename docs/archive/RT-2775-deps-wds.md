# Grill

## The owner request

> обнови все пакеты до самых последних

## What the tree already had

- The root manifest held `webpack-dev-server` 5.2.6; the last published version was 6.0.0.
- `@angular-devkit/build-angular` 22.2.2 depends on 6.0.0 exactly, and the substitution
  `webpack-dev-server: '^5.2.6'` in the workspace file rolled it back to 5.2.6 silently.
- `@nx/webpack` 23.3.0 declares the dev server as an optional peer `^5.0.0`; no target runs the
  Nx webpack dev server.

## Decisions

- **6.0.0 for everyone:** the Angular build asks for it, and nothing else needs the 5.x line.
- **The substitution is removed:** after the install no 5.x copy was left in the lock, so the
  entry matched nothing. Rejected: narrowing it to `webpack-dev-server@5` — a dead entry.
- **The unmet optional peer of `@nx/webpack` is accepted:** the servers start through
  `@nx/js:node`, the Angular applications through `@angular/build`.
- **Checked by the first kit showcase**, built through webpack: it rose on the new dev server
  with 106 stories.
