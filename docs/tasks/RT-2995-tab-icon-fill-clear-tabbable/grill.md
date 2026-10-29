# Grill

## The owner request

> заводи тикет и бери в работу задача без эпика

It answers a request from the session of an application moving onto the second kit, 29 October
2026, retold by what it asks:

1. A tab of `rtTab` cannot fill its icon. The tab draws `rt-icon` without `fill`; the first kit
   filled tab icons one by one. Today the application forces it with a deep style per component.
2. The clear cross of a field does not go by Tab unless `clearTabbable` is set on each field. The
   application wants a kit-wide default through `provideRtKit`, as button, tooltip and aside have.
   The cross of `rt-autocomplete` ignores `clearTabbable` with a fixed `-1`; the application asked
   the same for `rt-dynamic-selector`.

## What the tree already has

- `projects/ui-kit-v2/src/lib/components/tabs/rt-tabs.component.html` draws the tab icon as
  `rt-icon` with `name`, `glyph` and `color` and no `fill`. The directive
  `rt-tab.directive.ts` carries `icon`, `glyph` and `iconColor`.
- `rt-icon` already has the `fill` input: a Material glyph is drawn from the filled set under it.
- `RtFormControlBase` in `rt-form-control.base.ts` has `clearTabbable` and the computed
  `clearTabIndex`; `rt-input` binds its cross to it.
- The cross of `rt-autocomplete`, `rt-input-number`, `rt-date-picker` and `rt-date-range` has a
  fixed `[tabIndex]="-1"`. Four controls carry the defect, not the one the request names.
- `rt-dynamic-selector` has no cross of a field. Its clear is the list action that drops the chosen
  keys, a button of its own, already in the Tab order.
- `rtKitDefault` and `provideRtKit` give node defaults to button, aside, data table, data list,
  dynamic selector and tooltip. No node covers the shared base of the fields.
- Specs: `docs/specs/ui-kit-v2/tab-additions/` with SC-UKV-925, a tab draws a Material glyph;
  `docs/specs/ui-kit-v2/field-label-icon-actions/`, which names `clearTabbable` in the shared base;
  `docs/specs/ui-kit-v2/kit-settings-theme/` on the kit settings.

## What the rules already say

- `kit-approval`: any file of `projects/ui-kit-v2/src` is a visible kit edit. A Figma frame
  approved by the owner comes first, then the code and the showcase, measured against the frame and
  approved by a second answer. Push, PR and release go after both.
- The rule `doc-style`: the consumer is called the application and is never named.

## Questions and answers

**Приложение просит две правки в ui-kit-v2. Браться?** Options: «Да, одной задачей
(Recommended)», «Да, двумя задачами», «Пока не браться».
«Да, одной задачей (Recommended)»

**Epic.** «задача без эпика»

## Decisions

- **Behaviour changes.** Two new inputs and a new kit setting, so a product agreement is written.
  Question closed by assumption.
- **No law or rule edit.** Question closed by assumption.
- **One task**, by the owner's answer.
- **The tab input is `iconFill`, not `glyphFill`.** It stands next to `icon`, `glyph` and
  `iconColor` and passes `fill` to `rt-icon` whatever source drew the icon. Rejected: `glyphFill`,
  it names one of two icon sources. The PR names the divergence.
- **The default lives in a node `formControl` with `clearTabbable`.** Every control of the shared
  base reads it, and the input on the element overrides it. Rejected: a field in `global`, which
  holds page-wide settings such as the theme.
- **All four controls with a fixed `-1` get `clearTabIndex()`.** A default that skips three of them
  does not hold.
- **`rt-dynamic-selector` is not touched.** It has no cross of a field, and its list clear already
  goes by Tab. The application is told so.
- **Not included:** the edits of the application itself; the first kit.
- **Closed when:** the showcase shows a tab with a filled icon and fields whose cross goes by Tab
  from the kit setting; unit tests cover the input, the setting and the four controls; the owner
  approved the frame and the showcase.
- **Samples:** `rtKitDefault` of the button; `clearTabIndex` of `rt-input`.

## What is left unclear

- Nothing blocks the work.

## Answers after the plan

**Где рисовать кадр?** Options: «Дам ссылку», «Новый файл».
«https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL/Design-System-V2?node-id=4630-21160&p=f&t=ZwN2u8eqjvDObDL1-0»

**Третий запрос приложения, бейдж поверх иконки вкладки. Как взять?** Options: «В RT-2995»,
«Отдельной задачей», «Не брать пока».
«В RT-2995»
