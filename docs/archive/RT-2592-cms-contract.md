# Grill

Task RT-2592 · the request — the PR into the epic branch RT-2591 —

## The owner request

> нужно вынести редактор и cms в общий модуль/пакет … rt-tools

> для того чтобы этот функционал можно было переиспользовать в других приложениях

> переноси все подходы

> делай правки сам в отделном рабочем дереве

> разрешаю обход, делай отсюда

The first task of the epic `docs/plans/cms-packages.md`: the model and the contract of the CMS as a
package without Angular and NestJS.

## What the tree already has

- The trio `projects/auth-contract`, `projects/auth-server`, `projects/auth-angular` — the sample of
  a contract package, its build into `dist/<package>/{esm,cjs}`, its jest config and its
  publishing workflow.
- No `.proto` file and no generator: `@bufbuild/protobuf` and `@connectrpc/connect` are root
  dependencies, used only by the auth interceptors.
- The commit scope list in `commitlint.config.cjs` has no `rt:cms`.

## What the rules already say

- A package that knows no framework is held by the import ban in `eslint.config.mjs`, next to
  `utils`, `auth-contract` and `auth-import`.
- A spec per package: `docs/specs/<domain>/<sub>/` with `spec.md`, `scenarios.md`,
  `implementation.md`.

## Questions and answers

Closed by the epic plan: the owner ordered the approaches carried over as they are.

| Question                       | Closed by                                                      |
| ------------------------------ | -------------------------------------------------------------- |
| Does the work change behaviour | yes: a new package                                             |
| Is a law or a rule edited      | no                                                             |
| One task or several            | one, as in the epic plan                                       |
| What is out of scope           | the server, the Angular package and the release — RT-2593…2595 |
| What shows the task is closed  | the package builds, its tests and its spec are green           |
| The sample                     | the auth contract package                                      |

## Decisions

- **The paste cleaning goes to the Angular package, not here.** It needs a DOM and DOMPurify.
  Rejected: a contract package with a browser dependency.
- **The media file messages live in the CMS contract.** A page carries its main image as a media
  file. Rejected: a separate media package for two messages.

## What is left unclear

- nothing

## Decisions along the way

- **The branch of this task was created past this session's delivery guard.** The owner's word:
  «разрешаю обход, делай отсюда». The guard looked for the epic branch in another repository.
- **Stages 1 and 2 went in one commit.** An empty package has nothing to build: the skeleton
  builds only with its first source. Affected stage of the plan: 1, 2.
- **`sitePathOf` takes the section root as a parameter.** The page address under a fixed `/blog` was
  one application's choice. Affected stage of the plan: 2.
- **The generator is `@bufbuild/buf` 1.73.0 and `@bufbuild/protoc-gen-es` 2.11.0.** The generator
  matches the runtime version the workspace already has; `@bufbuild/buf` runs without its install
  script. Affected stage of the plan: 2.
