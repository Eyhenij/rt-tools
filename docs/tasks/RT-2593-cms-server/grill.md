# Grill

## The owner request

> нужно вынести редактор и cms в общий модуль/пакет … rt-tools

> для того чтобы этот функционал можно было переиспользовать в других приложениях

> переноси все подходы

> делай правки сам в отделном рабочем дереве

> разрешаю обход, делай отсюда

The second task of the epic `docs/plans/cms-packages.md`: the CMS server as a package — the
procedures of the three services, the page rules, the scheduled publication and the media library.

## What the tree already has

- `projects/cms-contract` — the model and the generated services `CmsService`, `CmsPublicService`
  and `CmsMediaService`.
- `projects/auth-server` — the sample of a server package: `connectAccessEntries` checks a
  per-method access map, `createAuthInterceptor` checks the token and puts the caller under
  `CONNECT_CALLER`.
- The working implementation carried over: the procedures take every source through one port
  object, storage helpers take structural delegates of a database client, and the media library
  takes its file store and its resizer as ports.

## What the rules already say

- A server package depends on `@rt-tools/auth-contract` and keeps NestJS as a peer.
- A package keeps 100% test coverage; a procedure is checked by a call with a hand-written double.

## Questions and answers

Closed by the epic plan and the owner's words.

| Question                       | Closed by                                                            |
| ------------------------------ | -------------------------------------------------------------------- |
| Does the work change behaviour | yes: a new package                                                   |
| Is a law or a rule edited      | no                                                                   |
| One task or several            | one, as in the epic plan                                             |
| What is out of scope           | the Angular package and the release — RT-2594, RT-2595               |
| What shows the task is closed  | the package builds, its tests and its spec are green                 |
| The sample                     | the auth server package; the rights are named by the app (epic plan) |
| The storage                    | a port the app implements (epic plan)                                |

## Decisions

- **The services are given as Connect service implementations, not as NestJS classes.** The app
  registers them on its own router; the access goes through the auth server interceptor. Rejected:
  one class per procedure with a decorator registry — the registry belongs to the app.
- **The caller is read from `CONNECT_CALLER`.** The auth interceptor already puts it there.
  Rejected: a caller function in the port — a second road to the same value.
- **The file store and the resizer stay ports; the S3 client and the native resizer stay in the
  app.** The package would otherwise carry a native binary and a cloud SDK. Rejected: shipping both
  as optional dependencies.
- **The site locales are named by the app.** One app keeps four languages, another one.

## What is left unclear

- nothing
