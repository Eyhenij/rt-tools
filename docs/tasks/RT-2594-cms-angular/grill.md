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
