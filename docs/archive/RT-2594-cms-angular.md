# Grill

## The owner request

> нужно вынести редактор и cms в общий модуль/пакет … rt-tools

> для того чтобы этот функционал можно было переиспользовать в других приложениях

> переноси все подходы

> делай правки сам в отделном рабочем дереве

> разрешаю обход, делай отсюда

The third task of the epic `docs/plans/cms-packages.md`: the CMS client as an Angular package — the
block editor, the admin screens of pages, types, tags, redirects and the media library, and the site
page renderer.

## What the tree already has

- `projects/cms-contract` — the model, the block kinds, the body parsing, the site page functions
  and the generated services.
- `projects/cms-server` — the services the client calls.
- `projects/auth-angular` — the sample of an Angular package: ng-packagr, a secondary entry point,
  jest with `jest-preset-angular` and the zoneless setup.
- `projects/ui-kit-v2` and `projects/core` — the kit components and the list store base the admin
  screens are built on.
- The working implementation carried over: about eleven thousand lines over the admin pages and
  media library, a shared block model and the site page of the blog.

## What the rules already say

- An Angular package declares Angular as a peer and keeps its own dependencies in
  `allowedNonPeerDependencies`.
- The look of the admin comes from the kit; a screen does not draw its own primitives.
- A user-visible text is translated; the package names its texts in English and lets the
  application translate them.

## Questions and answers

Closed by the epic plan and the owner's words.

| Question                       | Closed by                                                                |
| ------------------------------ | ------------------------------------------------------------------------ |
| Does the work change behaviour | yes: a new package                                                       |
| Is a law or a rule edited      | no                                                                       |
| One task or several            | one, as in the epic plan                                                 |
| What is out of scope           | the release — RT-2595; switching the application to the packages — later |
| What shows the task is closed  | the package builds, its tests and its spec are green                     |
| The sample                     | the auth Angular package                                                 |
| The paste cleaning             | here, with DOMPurify (RT-2592 decision)                                  |

## Decisions

- **The paste cleaning lives in the Angular package.** It needs a DOM and DOMPurify.

## What is left unclear

- nothing

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
- **The site page screen stays in the application.** Its layout, breadcrumbs, structured data
  wording and related cards are the site's; what of it is CMS went into the page client, the
  block body, the head service and the redirect loader. Affected stage: 3.
