# Grill

## The owner request

> Задача: форма регистрации в теме входа Keycloak `rt` (пакет `projects/auth-keycloak-theme`) должна рисовать проверку reCAPTCHA, когда сервер её требует.
>
> Что сейчас: на проде realm требует reCAPTCHA v2 с флажком на регистрации. В `kcContext` страницы регистрации стоят `recaptchaRequired: true`, `recaptchaVisible: true`, `recaptchaSiteKey`, `recaptchaAction: "register"` и `scripts: ["https://www.google.com/recaptcha/api.js?hl=<lang>"]`. В бандле темы нет ни `recaptchaSiteKey`, ни `g-recaptcha`, есть только текст `recaptchaFailed`. Форма уходит без поля `g-recaptcha-response`, сервер отвечает «Invalid Recaptcha», и регистрация паролем не проходит ни у кого. Регистрация через Google работает.
>
> Что сделать:
>
> - при `recaptchaRequired` тема подключает скрипт из `kcContext.scripts` и рисует флажок `g-recaptcha` с `data-sitekey` из `recaptchaSiteKey` в форме регистрации, над кнопкой;
> - ответ флажка уходит в POST формы полем `g-recaptcha-response`;
> - учесть `recaptchaVisible` (невидимая v3 не нужна, но если флаг false, флажок не рисуется);
> - юнит-тест на страницу регистрации с этими полями контекста;
> - тестовая пара ключей Google (site key `6LeIxAcTAAAAAJcZVRqyHh71UZPB09XzwthjWJrm`) годится для проверки на локальном Keycloak.
>
> Порядок работы и выпуска — правила этого репозитория. Пуш, PR и выпуск версии пакета — только после одобрения владельца.

The request came through a session the owner started; the text above is its brief, cut to the
part about this tree.

## What the tree already has

- The theme's own registration page — `projects/auth-keycloak-theme/src/login/pages/register/`. No
  reCAPTCHA in the template or the class: a search for `recaptcha` over the theme sources is empty.
- The frame of the theme pages — `projects/auth-keycloak-theme/src/login/shell/rt-kc-root.component.ts`.
  It inserts no script of the context's script list. The standard Keycloakify layout does it in
  `LoginResourceInjectorService`, one `text/javascript` script per address. The theme pages bypass
  that layout, so these scripts are never loaded.
- The standard Keycloakify registration page draws a `g-recaptcha` block with `data-sitekey` and
  `data-action` when `recaptchaRequired && (recaptchaVisible || recaptchaAction === undefined)`, and
  an invisible button otherwise. The Google script renders every such block it finds on load and
  puts a `g-recaptcha-response` text area inside it, so a widget inside the form posts the answer.
- The spec `docs/specs/auth/theme/spec.md` and its scenarios up to SC-AUTH-83. There is no proposed
  directory: the agreement is written straight into the domain spec.

## Questions and answers

Every question is closed by the request or by assumption; none went to the owner.

- **Does the task change behaviour** — yes: the registration page draws a widget. Closed by the request.
- **A law or a rule edit** — none. Question closed by assumption: the work is one page and the frame.
- **One task or several** — one: the server rollout and the stand are tasks of the application
  repository. Closed by the request.
- **What is not part of the task** — the invisible reCAPTCHA v3, the passwords lost in the move, the
  server rollout. Closed by the request.
- **What shows the task is closed** — a unit test of the registration page with the reCAPTCHA
  fields of the context, and a page on a local Keycloak with the Google test key that shows the
  widget and posts `g-recaptcha-response`. Closed by the request.
- **Sample** — the standard Keycloakify registration page and its script injector. Closed by exploration.

## Decisions

- **The frame of the theme pages loads every address of the context's script list after the first
  draw.** Keycloak puts the scripts of a page there, and the Google script must find the widget
  already in the page. Rejected: a script tag in the registration page only — any other page script
  stays unloaded.
- **The widget is drawn only when both `recaptchaRequired` and `recaptchaVisible` are true.** The
  request names `recaptchaVisible: false` as "no widget". Rejected: the invisible button of the
  standard page — v3 is out of scope.
- **No Figma mockup for the widget.** Question closed by assumption: the widget is drawn by Google,
  and the theme only gives it a place above the button.

## What is left unclear

- Nothing.
