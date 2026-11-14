# Grill

## The owner request

The request came from the session that leads the counters of the platform, by the owner's word.
Its brief, in the owner's language:

> Тема входа `rt-auth-keycloak-theme` грузит на всех своих страницах счётчики GA4 и Яндекс Метрики,
> если номера заданы, и шлёт в них просмотр страницы и отправку формы. Номера приходят свойствами
> темы из окружения узла входа (`environmentVariables` Keycloakify → `kcContext.properties`).
> Пустой номер — счётчик не грузится. Имя страницы — `pageId` шаблона. Событие отправки формы:
> `auth_form_submit` с параметром страницы. Значения полей в события не кладутся. Метрика с
> Вебвизором, ввод в полях замазан. Скрипты грузятся асинхронно после отрисовки. Проверить, нужна
> ли рамка `mc.yandex.ru` для Вебвизора.

Decisions of the owner passed on with it: no consent banner on the entry pages; the address, the
name and anything typed into a field never reach a counter; Webvisor records with the input
masked; the counter numbers are set by the environment of the rollout and never written into the
code. The owner allowed a working tree of its own for this task: «Разрешить (Рекомендую)», the
option reading «Задача кита идёт своей веткой от main и не трогает ветку RT-3190 и чужие файлы.
После слияния дерево удаляется».

## What the tree already has

- The theme spec `docs/specs/auth/theme/spec.md` and its scenarios up to SC-AUTH-107.
- `projects/auth-keycloak-theme/src/login/kc-page-scripts.ts` adds an async script once per
  address; the frame calls it after the first draw.
- Keycloakify 11 writes every name of `environmentVariables` into `theme.properties` as
  `${env.<name>:<default>}`, and Keycloak puts the value on the page in `kcContext.properties`.
- The realm file `deploy/auth/realm/rt.json` sets no browser security headers: the Keycloak
  default stands, `frame-src 'self'` with no rule for scripts or requests.
- The Keycloak container of the login node takes its environment from
  `deploy/auth/prod/docker-compose.prod.yml`; the counter variables are not passed there yet.
- Pages the theme does not draw start the standard Keycloakify layout from `main.ts`.

## What the rules already say

- A side session decides the contract by the brief and the code, and asks the session that
  started it, not the owner.
- A visible kit edit needs a mockup; this task draws nothing, so no mockup is needed.

## Questions and answers

Every question closed by assumption from the brief:

- **Does the task change behaviour** — yes: the theme loads the counters; the spec gets rules.
- **Does it need an edit of a law or a rule** — no.
- **One task or several** — one: the theme and the variables passed to its container go together.
- **What is not part of the task** — the counters of the platform page and of the admin; a consent
  banner; the realm security headers of other realms.
- **What shows the task is closed** — on the theme stand with numbers set, the network shows
  `g/collect` with `page_view`, the hit `mc.yandex.ru/watch/<number>`, and the event on a form
  submit.
- **Sample** — `kc-page-scripts.ts` for loading, the standard snippets of both tags for the queue.

## Decisions

- **The submit event is sent from a listener on the document, for a submit not prevented.** The
  page holds an invalid form by preventing its submit, so a held form is not counted. Rejected: a
  call in each page component — the standard pages would get none.
- **A malformed number counts as absent.** A typo in the environment loads no foreign tag.
  Rejected: passing the value as is.
- **The page id goes with the GA config and with the Metrika hit as `page_id`.**

## What is left unclear

- Whether Webvisor needs `frame-src mc.yandex.ru`: answered by the console of the stand.
