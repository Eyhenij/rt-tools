# Grill

The request came from the application's session in chat on 13 October 2026 and is retold without
the application's names; the owner's word on it is verbatim below.

## The owner request

> заводи тикет и делай, прежде чем комитить покажи мсне в сторибуке

The request the owner's word answers, sent by the application's session (five optional extensions to
`rt-select` / `rt-input`; defaults keep the current behaviour):

> 1. rt-select: option row template. A content-projected template, e.g.
>    `<ng-template rtSelectOption let-option>`, rendered inside `li.rt-select__option` in place of
>    `option-label` (check icon and selection logic stay with the kit). A coloured circle before
>    each option label; `rtSelectTrigger` covers only the closed field, so the list loses the colour.
> 2. rt-select and rt-input: optional floating label on the border (Material outline look). An input
>    such as `floatingLabel="Budget"`. The label sits in the placeholder position when the field is
>    empty and moves to the top border when it is filled, without adding height. For compact
>    toolbars: `rt-field` puts the label above the control and makes the toolbar taller.
> 3. rt-input: actionable iconLeft / iconRight. Opt-in, e.g. `iconLeftAction` (boolean) + output
>    `iconLeftClick`. When enabled, the icon renders as a focusable button (tabindex 0, Enter/Space)
>    with an optional tooltip input (e.g. `iconLeftTooltip`). A server-side search runs on a
>    magnifier click; keyboard focus on the icon and its "Min 3 characters" tooltip are lost today.
> 4. rt-input and rt-select: optional tabbable clear button (e.g. `clearTabbable`). Today the clear
>    button has `[tabIndex]="-1"`.
> 5. rt-input: an output on clear (`cleared`). `clear()` today calls onChange('') only and fires no
>    `input`/`change` DOM event.
>
> Side note, not a request: `clearable` defaults to true in RtFormControlBase, so a plain
> `<rt-input formControlName>` gets a clear button the Material forms did not have. Worth
> documenting.

Before the owner's word I offered the names below, one task, version 0.24.0; the owner answered
with the line above.

The application's session then sent two more requests (badge, toggle group, divider, progress bar;
then tabs, expansion, toast, layout, autocomplete, checkbox, radio — 26 items in all, retold in the
progress). The owner's word on them, 13 October 2026, verbatim:

> какие несколько недель это минимальные правки?!

> какие несколько дней лол тут пару часов макс?!

> все правки в этой ветке, каждый компонент после правок расширить сторис и показать мне с пояснением что сделано

## What the tree already has

- `rt-input` (`projects/ui-kit-v2/src/lib/components/input/`): `iconLeft` / `iconRight` are drawn as
  bare `rt-icon`; the clear cross is `rt-icon-button` with `[tabIndex]="-1"`; the host's
  `mousedown` moves focus into the native field unless the target is a `button` or `rt-icon-button`.
- `rt-select` (`.../select/`): the trigger is a `<button>`; the clear cross sits inside it, also
  `[tabIndex]="-1"`; the option row draws `span.rt-select__option-label`; `rtSelectTrigger`
  (`rt-select-trigger.directive.ts`) is the sample of a consumer template picked by `contentChild`.
- `RtFormControlBase` (`.../form-control/rt-form-control.base.ts`) owns `clear()`, `clearable`
  (default `true`) and `showClearButton`; twelve fields extend it, nine of them draw a clear cross.
- The `rt-tooltip` directive exists in the kit.
- The material look comes from `projects/ui-kit-v2/src/styles/_preset-material.scss` by reassigning
  component properties.
- Specs: `docs/specs/ui-kit-v2/input/`, `docs/specs/ui-kit-v2/select/`.

## What the rules already say

- Precedent RT-2619: requests of the application go as one task. The kit does them in a way that
  does not break it, the PR names any divergence, and the application is never named.
- Memory «Перенос — два вида»: a new look is given in the kit look and in the material look.
- Memory «Перенос показывается до PR» and the owner's word: the showcase on :6007 before the commit.
- `rt-tools-styling-tokens`: a fallback stands only on a consumer handle, listed in
  `tools/tokens-handles.json`.

## Questions and answers

**Take the request, and how?**
«заводи тикет и делай, прежде чем комитить покажи мсне в сторибуке» — one task, all five items,
the showcase before the first commit of code.

Question closed by assumption: the behaviour changes (new inputs and outputs; defaults unchanged).
Question closed by assumption: no law or rule is edited.
Question closed by assumption: one task — the owner said «тикет», singular, as in RT-2619.
Question closed by assumption: not part of the task — changing the default of `clearable`, the
other seven fields with a clear cross, `rt-multiselect`.
Question closed by assumption: the task is closed when every item works in the showcase on :6007,
the specs carry scenarios covered by unit tests, and `check:all` is green.
Question closed by assumption: sample — `rtSelectTrigger` for the option template; the existing
input states for the label.

## Decisions

- **`<ng-template rtSelectOption let-option let-selected="selected">`** — the same marker shape as
  `rtSelectTrigger`; the template replaces only the label, the toggle of a tree row and the check
  stay with the kit. Rejected: an input taking a `TemplateRef` — the trigger already set the shape.
- **`floatingLabel: string | null` on `rt-input` and `rt-select`** — the label lies at the
  placeholder's place while the field is empty and unfocused. It rises onto the top border when the
  input is filled or focused, and when the select is filled or open. The placeholder is hidden while
  the label lies in its place. The label's look goes through properties of the field, and the
  material preset reassigns them. Rejected: putting it into `RtFormControlBase` — only two fields
  are asked and the look is per field.
- **`iconLeftAction` / `iconRightAction` (boolean), `iconLeftClick` / `iconRightClick` (output,
  `MouseEvent | KeyboardEvent`), `iconLeftTooltip` / `iconRightTooltip` (string | null)** — an
  actionable icon is a real `<button type="button">`, so Enter and Space come from the browser. The
  tooltip goes through the kit's `rt-tooltip`. `iconRightAction` does nothing on a password field:
  the place is taken by the toggle.
- **`clearTabbable` in `RtFormControlBase`, honoured by `rt-input` and `rt-select`** — the input
  lives beside `clearable`. The other fields keep `-1`; their templates are not touched. Named in
  the docs of the input.
- **`cleared` output in `RtFormControlBase`** — `clear()` is there, so every field with a cross gets
  the event at once; it fires after the value is reset and the change is sent to the form.
- **`clearable` default stays `true`** — changing it removes the cross from every existing form;
  the behaviour is documented in the Overview of the input.
- **Version 0.24.0** — new public API, nothing removed.

**Requests 2 and 3 — an epic or this task?**
«все правки в этой ветке» — all items go into RT-2812, no epic; each component gets its stories
extended and is shown to the owner with an explanation before the next is counted done.

**Request 4 of the application — this branch?**
«бери» (13 October 2026) — request 4 joins RT-2812. It acts under the material preset only. The
`rt-field` label lies inside the control for `rt-input`, `rt-textarea`, `rt-input-number` and
`rt-select`: at the placeholder while empty and unfocused, on the top border when filled or focused.
The field height does not change. The required asterisk takes the label colour, and the error colour
only when the field is invalid. The `rt-select` triangle turns 180° while the list is open. Outside the
preset nothing changes.

**The owner's look at the label inside the field**
«по ссылке аутлайн инпуты лейбл уходит на бордер но нет прмежутка в бордере для лейбла как у
материал еще нужна вьюха для не аутлайнд инпутов» — the outline border is broken under the raised
label as in Material, and the filled fields get their own showing.

## What is left unclear

- Whether a tabbable cross inside the select's trigger button passes the showcase accessibility
  check (a focusable inside a button). Checked in the browser; if it fails, the select's cross is
  moved out of the trigger in this same task and that is named in the PR.
