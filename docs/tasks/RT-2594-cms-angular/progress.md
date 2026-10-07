# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 4 — The admin
- **Done:** stage 1 — the package builds, the editor model, the form decisions, the paste cleaning
  and the labels are carried over with their tests at full coverage
- **Next step:** carry over the clients, the stores and the configuration tokens
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Create `projects/cms-angular` after the auth Angular package and register it
- [x] 1.2 Carry over the editor model, the form decisions, the paste cleaning and the labels with their tests
- [>] 2.1 Carry over the clients, the stores and the configuration tokens
- [ ] 2.2 Carry over the block editor and the admin components
- [ ] 2.3 Carry over the screens and the routes of the content and the media library
- [ ] 3.1 Carry over the block renderer, the page data and the redirect resolver
- [ ] 4.1 Write the spec, the scenarios and the bindings, and the README
- [ ] 4.2 Run the tree checks

## Decisions along the way

- **The guards that look for the epic branch and the plan in another repository are bypassed for
  this epic.** The owner's words: «Да, на весь эпик», «Обходи и его на весь эпик».
- **The texts follow the kit: English labels by key and a translator signal the application
  replaces.** The kit already gives its labels so. Affected stage of the plan: 1.
- **A screen label is a key, not a ready string, in the model.** The status, the block kind, the
  form section and the page field map to a label key by a full record; the row of a list carries
  the status, and the screen reads its label. A ready string in a row would not follow a language
  change. Affected stages of the plan: 1, 2.
- **The generic list page is carried into the package, not left to the application.** The admin
  screens stand on it, and the package has no other list base of this shape. Affected stage: 2.
- **The admin routes are relative to the place the application mounts them at.** The package does
  not know the application's paths. Affected stage: 2.
- **The locales, the site address with its section root and the labels come by tokens.** These are
  the application's facts. Affected stages: 1, 2.
- **The site layout, the SEO and the styles stay with the application.** The package gives the
  block renderers through a registry and the page data. Affected stage: 3.
- **The package tests hold full coverage by a threshold, as the server package does.** The nx test
  target does not count coverage itself. Affected stages: all.

## Sessions

### 2026-10-07

- The branch taken from the epic branch after RT-2593 was merged.
- Stage 1 done: lint, tests (33) and the build green, coverage 100%.
