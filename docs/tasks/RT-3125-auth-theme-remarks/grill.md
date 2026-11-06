# Grill

## The owner request

The task came from the session of the application that uses the theme, from its ticket with the
owner's screenshots of 04.11, items 15–21 (section «Экраны входа и регистрации (тема Keycloak из
rt-tools)»):

> 15. **Рамка вокруг капчи.** Флажок reCAPTCHA на регистрации стоит в рамке. Убрать рамку.
> 16. **Названия языков в выборе языка.** Хинди и корейский показаны кодами `hi` и `ko`, «русский» с маленькой буквы. Привести названия всех языков к одному виду.
> 17. **Выбор языка и тема на широком экране.** На больших экранах перенести выбор языка и переключатель темы в правый верхний угол страницы.
> 18. **Язык сбрасывается между экранами.** При переходе между входом и регистрацией выбранный язык не сохраняется. Сохранять его на всём пути входа и регистрации.
> 19. **Значок в плашке ошибки не выровнен.** На входе и на регистрации значок ✕ в плашке ошибки стоит ниже середины однострочного текста. Значок и текст стоят на одной линии.
> 20. **Экран подтверждения почты свёрстан криво.** Заголовок «Email address validation» стоит по центру, а текст под ним прижат влево. Почта переносится на вторую строку обрывком. Под кнопкой «Click here to proceed» пустая треть карточки. Привести экран к виду формы входа.
> 21. **После подтверждения почты некуда идти.** Экран «Email address verified» пишет «Your email address has been verified.», и на нём нет ни кнопки, ни ссылки. Человек не понимает, что делать дальше. Нужна кнопка «Перейти к входу» или сразу возврат в админку.

The owner's later remark to item 17, as the brief carries it: the switches sit on their own card
with a translucent blurred background — the surface at about 60 % opacity, backdrop blur 12,
radius lg, padding 8/4 — so they do not merge with the page background.

Done, by the brief: merged into main, a new theme release published with its version and the
sha256 of the JAR, the screens checked on a stand at 1440/768/375 in the light and the dark theme.

In this session: «пока заведи тикет и возьми в работу на меня», then «продолжай».

## What the tree already has

- The theme: `projects/auth-keycloak-theme/`, spec `docs/specs/auth/theme/spec.md`. Released 0.2.0;
  the package already says 0.2.1.
- Items 20 and 21 are both `info.ftl` (`rt-kc-info`): the action token page carries `actionUri`,
  the verified page carries none of `pageRedirectUri`, `actionUri`, `client.baseUrl`.
- Item 16: the language labels come from Keycloak's `locale_*` messages through Keycloakify.
- Item 17 reverses the spec rule «The language list and the theme switch stand in the first row of
  the card … They do not hang in the corner of the window over the dots» — on wide screens only.
- Item 19: the banner is the kit's `rt-message`; whether the kit or the theme is at fault is
  measured on the stand.
- Item 15: the frame is the widget's own border inside Google's iframe.
- No Figma mockups of the theme screens exist; the kit approval rule covers only the kit sources.

## Questions and answers

**Raise the rt-auth stand for the checks and stop it after?** (options: «Да, поднять», «Нет»)
«Да, поднять»

**Item 17, «padding 8/4» — 8 at the sides and 4 above and below, or 8 above and below and 4 at the sides?**
«как на макете»

**Item 19 — if the shift is in the kit itself, where is it fixed?** (options: «Только в теме», «В ките»)
«править в апке + запрос в кит»

## Decisions

## What is left unclear
