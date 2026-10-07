# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — The site
- **Done:** stages 1 and 2 — the clients, the stores, the tokens, the block editor, the admin
  components, the screens and the `cmsRoutes` and `mediaRoutes` sets
- **Next step:** 3.1 — carry over the block renderer through a registry, the page data with the
  transfer state and the redirect resolver into the `site` entry; the sources are the site page
  libraries of the application
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Create `projects/cms-angular` after the auth Angular package and register it
- [x] 1.2 Carry over the editor model, the form decisions, the paste cleaning and the labels with their tests
- [x] 2.1 Carry over the clients, the stores and the configuration tokens
- [x] 2.2 Carry over the block editor and the admin components
- [x] 2.3 Carry over the screens and the routes of the content and the media library
- [>] 3.1 Carry over the block renderer, the page data and the redirect resolver
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
- **A store keeps a label key, not a text, and reads the text when it speaks.** So a message follows
  a language change made after the store was created. Affected stage: 2.
- **The package tests hold full coverage by a threshold, as the server package does.** The nx test
  target does not count coverage itself. A component, a directive and a pipe stay out of the
  threshold: they are thin wrappers over the tested functions and stores, and the scenarios that draw
  them check them. Affected stages: all.
- **The package windows stand on the kit dialog box, not on an application window layout.** The
  application layout class does not exist in another application; the styles a window needs beyond
  the box move into the window itself. Affected stage: 2.
- **The selectors and the style blocks carry the `rt-cms-` prefix of the package.** Affected stage: 2.
- **The content section is one flat route set under the application's mount place, and a screen
  navigates from the section root.** The type id stands after the words `tags` and `redirects`, so
  they are declared first. Angular's `..` climbs a route level, not an address segment, so a screen
  names its path from `route.parent` instead. Affected stage: 2.
- **The side panel opens in the outlet the kit route panel closes, `ro`.** The kit closes that
  outlet by name, so the application shell declares an outlet of this name. Affected stage: 2.
- **Every screen stands on one package frame `rt-cms-page`, and the list frame stands on it too.**
  The application page layer does not exist in another application; the section card and the list
  row of a form go to one style partial of the package. Affected stage: 2.
- **A language is shown by its code in the filters and the edit form.** The package gets the codes
  from the application and has no names for them. Affected stage: 2.

## Sessions

### 2026-10-07

- The branch taken from the epic branch after RT-2593 was merged.
- Stage 1 done: lint, tests (33) and the build green, coverage 100%.
- Step 2.1 done: the server is replaced in the tests by an in-memory Connect transport; 65 tests,
  coverage 100%.
- The block editor carried over with its window and the label pipe; 82 tests.
- The media library clients, stores and model carried over as part of 2.1; the file bytes are now
  read inside the stream, so an unreadable file refuses its own upload. 74 tests, coverage 100%.
- Step 2.2 done: the list frame and its base, the page, type and redirect tables, the name and
  unsaved-edits windows, the tag tree, the page images and connections, the media folders, table and
  picker window. A table cell row is untyped, so a label read by the row is put into the row by a
  computed signal. The page type comes from the kit utilities package, now a peer dependency.
- Step 2.3 written: the screens of the content types, the type settings, the pages of a type, the
  page edit with its editor sources, the tags, the redirects with the panel and the media library,
  and the `cmsRoutes` and `mediaRoutes` sets. Not yet checked against a running application: that
  comes with the switch of the application to the package.
