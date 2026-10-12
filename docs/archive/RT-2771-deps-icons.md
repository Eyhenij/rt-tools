# Grill

## The owner request

> обнови все пакеты до самых последних

## What the tree already has

- The root manifest holds `simple-icons` 16.30.0. The last release is 16.35.0, out on 2026-10-11 —
  one day before the work; 16.34.0 is out on 2026-10-04.
- `tools/build-social-icons.mjs` draws the second kit's social marks from the package outlines; the
  files lie in the repository and are rebuilt by hand after a version change. The sign-in theme
  copies the package icons at its build.
- `minimumReleaseAgeExclude` names `simple-icons@16.30.0`: that version was taken while fresh.

## Decisions

- **16.34.0, not 16.35.0:** a release one day old waits — the dependencies rule; nothing needs it
  now.
- **The social marks are rebuilt and compared:** a changed outline is a changed look of the kit,
  and the showcase frames judge it.
- **The release-age exclusion of 16.30.0 leaves the list** once 16.34.0 installs without it.
