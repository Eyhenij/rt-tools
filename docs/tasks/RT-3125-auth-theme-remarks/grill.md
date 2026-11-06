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

## A kit edit joined to this task: the 16 px icon in the table cell

Relayed by the application session on 2026-11-06, the owner's words: «передай в соседнюю сессию
пусть возьмет эту правку кита». In this session: «Выполни эту задачу здесь: «Kit: 16 px icon in the
rt-data-table cell»», then «размер иконки в ячейке таблицы можно задавать конфигом или как-то еще».

The cell of `rt-data-table` (Figma «Data Table Cell», Kind=icon left / icon right in Design System
V2) needs a 16 px icon instead of 24 px. The nested icon size is locked in the Figma component, and
an instance cannot change it. The application's permissions table shows a tick and a cross in its
cells and wants them the size of the Icon Button sm icons in the group row.

### What the tree holds

- `projects/ui-kit-v2/src/lib/components/data-table/cell/rt-data-table-cell.component.html` draws
  the column icon with a fixed `size="lg"` (24 px).
- The application can already draw any icon size through its own `rtDataTableIcon` template.

### The mockup

Design System V2, page «Data Table», set «Data Table Cell»
(https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=6981-510): a variant property
«Icon size» (`lg` default, `sm`) added; every existing variant is `lg`; two new variants
«Kind=icon left, Icon size=sm» (7569:496) and «Kind=icon right, Icon size=sm» (7569:500). Measured:
cell 220×50, icon 16×16, icon centre y 24.5 = text centre y 24.5, gap 8, text starts at x 44
(was 52 with the 24 px icon).

### Questions and answers

| Question                                                                           | The owner's answer                                                                                                                    |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| How is the icon size set: a column field, a table-wide config or a style property? | «Поле в описании колонки» — `icon.size: 'sm' \| 'md' \| 'lg'`, default `lg` as now; in Figma an Icon size property on Data Table Cell |

The owner on where it goes: «так ты же уже работаешь над задаче по пунктам 15-21 включи в нее».
