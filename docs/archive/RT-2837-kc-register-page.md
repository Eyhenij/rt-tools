# Grill

## The owner request

> нужно показыать свой кастомный экран регистрации в стиялх как страницы логина, на странице
> логина в инкогнито не грузится иконка google в кнопке входа через google

## What the tree already has

- The theme `rt` draws eight pages of its own. `register.ftl` is not among them, so the
  registration page falls to the standard Keycloakify layout and looks foreign.
- The login page is the sample: the card, the kit fields, the hidden named fields, the provider
  buttons. The new password page is the sample for the requirement list under the confirmation.
- The provider button passes `google` to the `icon` input of the kit button. The kit resolves the
  name through `resolveIconGlyph`: `google` is neither a kit icon nor in the Material map, so the
  button draws a Material Symbols ligature. The theme loads no such font, and the button shows the
  word in a pending state instead of an icon. The `google.svg` the build copies is never asked.
- On the production realm the registration context carries `social` with the providers, though the
  Keycloakify type of `register.ftl` does not name it.
- Keycloak has no Russian text for `invalidPasswordNotEmailMessage`.

## What the rules already say

- Spec `auth/theme`: the theme draws its own pages with the second kit; form fields go by a plain
  submit with the standard names; the texts are Keycloak messages; the password requirements stand
  under the confirmation.
- Spec `auth/theme`: a password field has no placeholder. The owner's word below replaces this rule.

## Questions and answers

The mockup was drawn first and shown in five rounds. The owner's answers, verbatim:

**First mockup**
«выровняй иконку гугла по высоте, посмотри какой фактический отступ между селектором языка и
кнопкой переключения темы, добавь плэйсхолдер для инпута пароля, показывай иконку рент опс вместо
надписи, изучи как сейчас показываются критерии пароля на форме установки пароля (по-моему они
показываются под полем подтверждения пароля), покажи все состояния когда поля невалидны и покажи
все возможные ошибки, покажи состояние loading»

**Second mockup**
«покажи бэкграунд с облаком плавающих точек как это фактически реализовано сейчас, покажи как
высокая форма будет выглядеть на реальном экране iphone 11»

**Third mockup**
«нарисуй тёмную тему так же»

**First and last name**
«имя и фамилия являются обязательными в форме регистрации? проверь как это реализовано фактически
в keycloak», then «посмотри почему эти поля сделаны обязательными? это дейтсвительно нужно?».
Answer: «Убрать из формы».

**The fifth mockup**
«Одобряю, делай код»

## Decisions

- **The registration page asks for the address and the password twice, nothing else.** The owner
  removed the names. A realm that requires more attributes is out of the theme's reach: Keycloak
  refuses the form with its message above it. Rejected: drawing every attribute of the user
  profile — no mockup, and the realm of the consumer requires none.
- **The provider mark is a picture of the theme, not a kit icon.** The Google mark is in four
  colours, and the kit icons are one colour. Rejected: a brand icon in the kit — a kit release for
  one consumer.
- **The logo comes from the realm HTML display name.** The theme serves several realms, and a logo
  in the theme would be one realm's. Keycloak keeps exactly this field for the header of the login
  pages. Without markup in it, the card keeps the realm name as text.
- **Server errors stand under their fields.** Keycloak puts them per field, and the mockup draws
  them there.

## What is left unclear

- Nothing blocks the work.
