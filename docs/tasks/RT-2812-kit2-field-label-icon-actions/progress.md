# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 6 of 6 — Docs, version and the check suite
- **Done:** stages 1–5 and 7; 6.1; the review of the whole branch and its fixes; the owner's remarks of 14 October (chosen value by the option template, the muted sound icon); main merged in on 14 October
- **Next step:** 6.3 — the agreement merged into the domain specs, and the snapshot references re-taken, when the owner says to open the PR
- **Uncommitted:** nothing; the code went in by the commit the owner ordered on 14 October: «если все сделано и проблем нет комит по правила и собери пакет на рабочий стол»
- **Waiting for the owner:** «пр не открывай» — no PR, no push
- **PR:** not open yet

## Steps

- [x] 1.1 `clearTabbable` and `cleared` in the shared base of the fields
- [x] 1.2 the input and the select take `clearTabbable` into the cross
- [x] 1.3 tests for SC-UKV-865 and SC-UKV-866
- [x] 2.1 the icon inputs, outputs and tooltips of the input
- [x] 2.2 the template draws an actionable icon as a button with the tooltip
- [x] 2.3 tests for SC-UKV-862, SC-UKV-863, SC-UKV-864
- [x] 3.1 the marker directive and its context type
- [x] 3.2 the select draws the template in the row
- [x] 3.3 tests for SC-UKV-856 and SC-UKV-857
- [x] 4.1 the input draws the label on the border
- [x] 4.2 the select draws the label on the border
- [x] 4.3 the properties of the label and their material values
- [x] 4.4 tests for SC-UKV-858, SC-UKV-859, SC-UKV-860, SC-UKV-861
- [x] 5.1 stories of the five items in both looks
- [x] 5.2 the owner looks at the showcase on :6007
- [x] 6.1 the Overview of the input and the select, the default of the cross named
- [>] 6.2 the version 0.24.0 and the changelog line
- [ ] 6.3 the agreement merged into the domain specs

## Decisions along the way

- **The owner's «прежде чем комитить» is read as «before the code commit».** The task folder, the
  agreement and the assignment row are committed now: the guard refuses a code edit while the folder
  is not in the branch's HEAD. Affected stage of the plan: 5.

- **The actionable icon reuses `rt-icon-button`, and its output carries `MouseEvent`.** The kit's icon
  button already has a tooltip and a tab index; the browser turns Enter and Space on a button into a
  click, so the agreement's `MouseEvent | KeyboardEvent` narrows to `MouseEvent`. Affected stage: 2.
- **The label on the border takes no new tokens.** Its colours are the field's own properties over
  the placeholder, focus and error colours, which the material preset already reassigns. Affected stage: 4.
- **The browser measurement of the label is not taken.** The pinned browser profile file is absent on
  this machine, and the rule forbids driving the browser without it; the owner looks at the showcase.
  Affected stage: 4.

- **Requests 2 and 3 join this task by the owner's word «все правки в этой ветке».** The plan is not
  edited; the extra work goes as stage 7 below, one step per component, each closed by extended
  stories and a showing to the owner. The task card body is not edited without the owner's word.
  Affected stage: 7 (new), 6 moves after it.

    Stage 7 steps (component — items):
    7.1 checkbox `checked`/`checkedChange`; radio group with arrows and `role=radiogroup`
    7.2 autocomplete `loading`, end-of-scroll output, own empty text and template
    7.3 toggle-button-group: form value accessor, option template, wrap and vertical layout
    7.4 tabs: closable with `tabClose`, tooltip, tooltip on a disabled tab, `glyph`, header-only mode
    7.5 expansion: header actions slot, accordion over projected panels, `preserveContent`
    7.6 new `rtBadge`, `rt-divider`, `rt-progress-bar`
    7.7 toast: own component with data, a handle (dismiss, update, afterDismissed), live progress and details
    7.8 container: right side panel beside the content, resizable width; an embeddable drawer

- **The Escape bug from the application's session goes into this branch.** Escape in an open list
  bubbled to the document after the panel closed, and the side panel under it closed too. The fix is
  `stopPropagation` in the open-state Escape branch of select, multiselect, autocomplete and the menu
  panel; one line each, scenario SC-UKV-871. Affected stage: 7.
- **7.1 done.** Checkbox: `checked` input and `checkedChange` output, as the radio button has.
  `rt-radio-group`: `role=radiogroup`, `ariaLabel`, `orientation`; arrows choose and focus the next
  enabled radio button, wrapping around; the group hands out one Tab stop after render
  (`afterRenderEffect`), because radio buttons drawn by `@for` get their values one by one and an
  earlier read threw NG0950. Stories: `Atoms/Forms/Checkbox` → Standalone, `Atoms/Forms/RadioButton` → Group.

- **7.2 done.** Autocomplete: `loading` (spinner row instead of the empty result, or under the list),
  `scrolledToEnd` (once per list length, never while loading), `emptyText` and `emptyTemplate` (the
  typed query in its context). SC-UKV-872…874. Stories `Molecules/Forms/Autocomplete` → PanelLoading,
  PanelLoadingMore, PanelEmptyOwn, PanelPaged.
- **The application's note on `cleared` with `[ngModel]` needs no kit change.** A host writing the same
  value back after a clear is not redrawn by Angular; the application handles it on its side.

- **The owner found two autocomplete stories broken; both fixed without a browser.** «panel-paged не
  работает», «panel-empty-own иконка под ней текст а не в один ряд». The pinned browser profile file is
  absent, so the browser was not driven. The empty row of the kit now lays its content out in a row
  (`display: flex`, gap) — any own empty template with an icon sits in one line; the paged demo now
  loads 20 per page, so the panel clearly scrolls. Checked live afterwards, by the single connected browser (now pinned in the profile file): the paged
  story loaded 3 pages by the wheel, the empty row stands in one line, the radio group and the
  standalone checkbox behave as specified. A programmatic `scrollTop` in a background tab fires no
  scroll event — the wheel is the honest check.
- **Request 4 joins this branch by the owner's word «бери».** Step 7.9, before 7.3. Under the material
  preset the `rt-field` label lies inside the control and floats onto the top border. The asterisk
  takes the label colour, and the error colour only when invalid. The select triangle turns while open.
  One technique serves all four controls: `rt-field` reads whether the projected control has a value
  (`displayText`) and carries `--filled`; the preset rule places the label over the control. The
  `floatingLabel` inputs of the input and the select are not reused: the textarea and the number
  field have none, and four copies would drift. The fill appearance keeps the label on the border,
  as the input's own `floatingLabel` does, so the field height stays. Scenarios SC-UKV-875…877
  follow 874: `spec:next-id` does not see the numbers of the proposed folder. Affected stage: 7.
- **7.9 items 1–3 done and checked live.** Story `Molecules/Forms/Field` → LabelInside. Under the
  material preset the field top equals the control top, and the control stays 40 px. The label rests
  11 px into the control and rises to −6 px on value or focus. The asterisk takes the label colour
  (116,116,116) and turns red (235,80,85) when invalid. The select triangle turns to
  `matrix(-1,0,0,-1,0,0)` while open, over 0.12 s. Specs: rt-field-material 7, rt-field 28, select 39.
  The showcase sweep is clean: 889 stories, 107 overview pages. The material halves of the field
  snapshots will diverge, and their references are re-taken after the owner's look.
- **Request 4 grew by items 4 and 5 after the owner's «бери»; they wait for the owner's word.** Item 4
  asks for the outline look under the preset: a transparent ground, the Material outline colour, and
  Material hover and focus. Item 5 asks for the Material sizes: 56 or 52 px high, a 16 px font, and
  a density choice per field. Both repaint and resize every field of the preset, not one component.
  The radius part of item 4 needs no kit change: `radius="xl"` is the kit step of 15 px under any look,
  and the preset default is already 1.5rem — the application drops `radius="xl"`.
- **The owner asked for the Material gap in the border and a showing of filled fields.** The gap
  needs a transparent field, so the outline part of item 4 is taken: under the preset the field
  ground is transparent, the border takes the Material outline colour, and focus draws a second line
  inside instead of the outer ring. `rt-field` measures its raised label and cuts that width out of
  the top border of the control zone. Filled fields under the preset are 56 px high, and the raised
  label lies inside them, 8 px from the top. The own `floatingLabel` of the input and the select
  takes the surface as its ground under the preset. Not done: the Material hover border, the 16 px
  font and the density choice. The contrast check now reads `transparent` and measures such a ground
  on the page. Measured live: the gap equals the label width, 105 px; focus gives a 2 px border in
  the brand colour. The showcase sweep is clean. Affected stage: 7.
- **Two more looks by the owner, both checked live before the reply.** «в неаутлай режиме … сделать
  отступ между значением и лейблом … значение должно быть по центру инпута и крупнее лейбла»: in a
  filled field under the preset the value is 16 px and lowered by 8 px. The raised label spans
  4–16 px and the value 21–43 px of the 56 px field, a 5 px gap. «лейбл на аутлайн … слева не имеет
  отступа от бордера»: the raised label lay on the rounded corner, where there is no top border to
  break. Now it starts past the corner plus a 4 px straight piece. The corner is capped by half the
  field height, so the pill shape does not throw it off. The same holds for the input's and the
  select's own `floatingLabel`; their filled look keeps the former start. «смотри все живьем сам
  перед тем как мне» — every story is opened and measured before the owner is called.
- **The owner corrected both readings.** «по не аутлайн все было ок только при пустом значении
  лейбл размером с велью при фокусе уменьшатся и смещается вверх но не на бордер как аутлайн» — the
  value offset and the 16 px font of the filled `rt-field` are taken back. The input's and the
  select's own `floatingLabel` in the filled look under the preset now behave the same: the field is
  56 px, and the raised label lies 8 px inside, not on the border. «в аутлайн режиме лейбл имеет фон
  другого цвета и не нужно было менять Свой набор, только материальный вид» — the own `floatingLabel`
  under the preset has no ground now: the select cuts the gap in its trigger border, and the input
  draws its border with a layer over the field and cuts the gap there. The width is measured by
  `rtNotchWidth`, shared by the field, the input and the select. Every change of this round sits
  under the preset sign; the kit look is untouched. The visual audit needs the image browser
  (`node tools/visual-gate.mjs ui-kit-v2`), and it is not run yet.
- **The label on the border is the material look only.** «измения касательно лейблов отлько для
  материально набора откатывай бля базового» — in the kit look the input and the select with
  `floatingLabel` keep their placeholder and draw no label; the label element stays in the markup and
  still names the control. The agreement's rule about the two looks is rewritten. «в материальном
  Рамка fill лейбл чутка выше» — the risen label of a filled field stands 4 px from the top instead
  of 8 px, in `rt-field` and in the own label of the input and the select.

- **The owner's browser rule is written into the rules.** «я просил если открыт все один браузер то
  открывать его запиши это в правила!» and «проверь живьем в сторибуке прежде чем мне смотреть» —
  `.claude/rt-kit/overrides/rules/browser-verification.md`, laid out by `agent-kit:sync`. Uncommitted.
- **7.3 done and checked live.** The toggle group is a form control now: `formControlName`,
  `[formControl]` and the signal `[formField]`, single and multiple. A press writes the value and
  marks the control touched. A control disabled by the form takes no press. Without a form the group
  still waits for the host, as before. `rtToggleButtonOption` draws own segment content and gets the
  option and whether it is pressed. The `layout` input takes `row`, `wrap` or `column`. SC-UKV-878…880;
  specs: forms 9, the group 26. Stories `Molecules/Forms/ToggleButtonGroup` → Forms, OptionTemplate,
  Layout. The forms showing is a component of its own, so each half of the preset pair holds its own
  controls. Angular does not return a press to the other bindings of one control. A shared control
  left the second half with the old value. Measured live: wrap in 22rem gives two rows and no
  overflow, the column stands seven rows high, and a segment keeps 22 px in every layout.
- **7.4 done and checked live.** `[rtTab]` takes `closable`, `tooltip` and `glyph`; `rt-tabs` takes
  `headerOnly` and raises `tabClose`. The cross is a `span` hidden from screen readers, not a button:
  a button inside the tab button is invalid HTML. Delete closes the focused closable tab, and focus
  moves to the tab that became active. A disabled tab now carries `aria-disabled` instead of the
  `disabled` attribute, so it takes the hover and shows its tooltip; a click still chooses nothing.
  A tab without a label is named by its tooltip. SC-UKV-881…885; specs: additions 13, tabs 23. Stories
  `Molecules/Navigation/Tabs` → Closable, IconOnly, HeaderOnly. Measured live: a closable tab stays
  30 px like a plain one, the cross is 20 px and centred; the disabled tab shows its tooltip; the
  header-only strip draws no panel and no `aria-controls`. The sweep is clean: 895 stories, 107
  overview pages.
- **Request 5 from the application waits for the owner's word.** It asks for a vertical `rt-stepper`:
  every step listed with a numbered mark and its label, the label as a template, a mode without a
  current step, and a line between the marks with its own tokens. It is not counted into stage 7.
- **The owner took every remaining request in one word.** «Делай все запросы без остановки я утром
  все гляну пр не открывай» — 7.5 to 7.8, the rest of items 4 and 5 of request 4, and request 5 go
  one after another without a showing between them. Each is still checked live before the next. No
  commit and no PR until the owner looks. Request 5 becomes step 7.10.
- **7.5 done and checked live.** `rtExpansionPanelActions` puts the header actions in the header row
  outside the toggle button; the chevron then stands after them and toggles by itself. The group is
  a directive `rtExpansionPanelGroup` on any wrapper, single-open by default, `multi` optional; the
  panel finds it by the token `RT_EXPANSION_PANEL_GROUP` and reports its own opening. `rt-accordion`
  stays a list of items from its input: changing its default would break its present users.
  `preserveContent` keeps the body after the first opening and hides it collapsed (height 0,
  `visibility: hidden`, `inert`). SC-UKV-886…888; specs: additions 10, panel 7. Stories
  `Molecules/ExpansionPanel` → HeaderActions, Group, PreserveContent. Measured live: the checkbox and
  the add button in the header did their work and the panel stayed collapsed. The group showed 100 →
  010 → 001 on the left and 100 → 110 → 111 with `multi`. The kept panel went 104 → 48 → 104 px and
  kept «Казань»; the default panel lost it. The background tab freezes transitions, so the end
  states were measured with transitions off.
- **The docs verifier flags more than step 6.1 named.** Besides the field inputs it lists
  `autocomplete` (`loading`, `emptyText`, `emptyTemplate`), `checkbox` (`checked`), the input's icon
  inputs and `floatingLabel`, and `radio-button` (`orientation`). All of them go into step 6.1.
- **7.6 done and checked live.** Three new entry points of the package: `badge`, `divider`,
  `progress-bar`. `rtBadge` is a directive that appends a bubble node to its host; its styles go
  through the kit's shared style set, as the button directive's do. It takes a corner, overlap, size
  `sm`/`md`, a colour of the action palette, and `undefined` from an optional data field. Zero is
  shown, an empty value is not. `rt-divider` is the host's own border with `role="separator"`;
  `inset` shifts a horizontal line to the text and shortens a vertical one. `rt-progress-bar` has a
  share clamped once by `clampProgress`, an indeterminate sweep, a colour, and `ariaLabel`. The
  coverage list names the five new markers shown inside a neighbour's story. SC-UKV-889…891; specs:
  badge 5, divider 3, progress bar 10. Stories `Atoms/Badge` (Playground, Position, Color, Value),
  `Atoms/Divider` (Playground, Orientation), `Atoms/Feedback/ProgressBar` (Playground, Value, Mode,
  Color, Live), each with Presets and Themes. Measured live: the overlap bubble centres on the host
  corner and the beside bubble starts at the host edge. An inset horizontal line starts at 64 px,
  under the row text. The inset vertical line is 24 px in a 40 px row. The live bar went 0 → 7 →
  14 → 21 and the other half stayed at 0. The sweep runs `rt-progress-bar-sweep` over 1.5 s without
  `aria-valuenow`.
- **7.7 done and checked live; the handle diverges from the request.** The request asked
  `success()` and `emit()` to return a handle. That breaks every caller that wraps the call in an
  arrow typed `void`; the showcase itself had one, and the application's lint style writes such
  arrows. So the short methods stay `void`, and two new ones return `NotificationRef`: `open(payload)`
  and `openFromComponent(component, options)`. The handle has `update`, `dismiss` and
  `afterDismissed` (`close`, `timeout`, `replaced`, `action`, `dismiss`); after the toast leaves it
  is silent. `onDismiss` keeps its old meaning. The toaster listens to each handle in one stream set
  up in its constructor. The toast takes `progressValue` (drawn by `rt-progress-bar`) and `details`
  (behind a «Детали» button, drawn by `rt-copy-value`, which gained `wrap`). It re-measures its
  height after each change. Its own component gets `RT_TOAST_DATA` and the handle by injection, and
  a live share does not recreate it. SC-UKV-892…894; specs: toast 55 (13 new), copy-value 6. Stories
  `Atoms/Feedback/Toast` → Extras, `Molecules/Feedback/Toaster` → Handle. Measured live: the details
  opened with the text wrapped and the toast grew to 180 px. The log read `close` after the cross
  and `dismiss` after the network came back and after the component's own button. The share went
  0 → 9 → 18 → 27, and the toast closed itself at 100.

- **7.8 done and checked live; two divergences named.**
    - New entry point `drawer` holds three parts:
        - `rt-drawer-container`, the page area;
        - `rt-drawer`, which takes `opened` and `width` both ways and has `mode`, `position`,
          `hasBackdrop`, `disableClose`, `minWidth`, `maxWidth`, `resizable` and `ariaLabel`;
        - `rt-resize-handle`, a separator moved by the pointer, the arrows, `Home` and `End`.
    - The right panel of `rt-container` gains these inputs; the default stays the old overlay:
        - `rightMode`, `over` or `side`, which can be switched while the page runs;
        - `rightBackdrop`;
        - `rightWidth`, taken and given back by the container;
        - `rightResizable`, `rightMinWidth` and `rightMaxWidth`.
    - Divergence 1: switching the place recreates the panel content, so typed text does not
      move with it. One template cannot stand in the overlay and in the grid at once.
    - Divergence 2: beside the content, neither the drawer nor the right panel closes on Escape.
      Material closes a side drawer too; here a side panel is part of the page.
    - Scenarios SC-UKV-895…899.
    - Specs:
        - drawer: 21;
        - the container's right panel: 7 new;
        - container total: 66.
    - Stories:
        - `Organisms/Layout/Drawer`: Playground, Mode, States, Presets, Themes;
        - `Organisms/Layout/Container`: RightSide, RightOver.
    - Measured live:
        - drawer beside the content: a pointer drag took it from 200 to 349 px, and the content
          moved with it. The closed drawer is inert and hidden.
        - drawer over the content: the backdrop and Escape close it, and focus returns to the button.
        - shell beside the content: the column is 280 px, and the content goes 487 → 767 → 487 px.
          The place switches there and back with the panel still open.
        - the handle: a drag took the width from 296 to 396 px.
        - over the page without a backdrop: no backdrop and no scroll lock.
    - Fix from the look: the 1 px border of a closed panel.

- **Request 4 items 4 and 5 done and checked live; one divergence named.**
    - Item 5, the size, applies under the material preset only:
        - a field is 56 px high with a 16 px value;
        - the attribute `data-rt-density` (`0` … `-5`) on the field or on any ancestor takes 4 px
          off per step.
    - Divergence: the request offered `density="-5"` as an input or a `--rt-input-height` token.
      The attribute is chosen instead:
        - one attribute on a form makes every field inside dense, whichever kit control it is;
        - a reference in a custom property is resolved where it is declared, so a root assignment
          would not see a step set lower in the tree.
    - The rules live in `src/styles/_density.scss`. The fill heights of the input, the select and
      the field follow the same middle height.
    - Item 4, the rest: under the preset, hovering darkens the border to the text colour. The
      input, select, multiselect, autocomplete, textarea, number and both date fields each carry
      their own rule and property. Focus, error, fill and borderless override it.
    - Scenarios SC-UKV-900…901. Specs: density styles 5; the field controls' specs stay green
      (35, 80, 69, 33, 29, 20, 31, 50, 27). Story `Molecules/Forms/Field` → Density.
    - Measured live:
        - under the preset, density 0…−5 gives 56/52/48/44/40/36 px with a 16 px value;
        - the kit's own look stays 40 px and 14 px;
        - hover takes the border from (116,116,116) to (24,24,24);
        - fill and error keep their own border under hover.
- **7.10 done and checked live.** `rt-stepper` takes `orientation="vertical"` and draws an `<ol>`:
  a round numbered mark, the label, the description when there is one, and a line between the
  marks. The label can be a template `ng-template[rtStepLabel]` with the step and its number. A
  current index below zero is a static instruction: every mark neutral, no `aria-current`. The
  description of a step is now optional. The horizontal bar is untouched.
    - Divergence from the request: no separate line tokens in the theme files. The line, the mark
      size and the mark colours are properties of the block, as in every other kit component; a
      consumer overrides them on the block.
    - Divergence: in the vertical list the index is not clamped. An index past the last step shows
      every step complete; the bar keeps its clamp.
    - The digit colours were changed after the live check: white on amber gave 2.1:1 and white on
      the dark-theme progress gave 2.0:1. Now the digit on amber is dark in both themes, the digit
      on a complete step is the inverse text colour, the upcoming digit is the primary text colour.
      The lowest pair left is the complete step under the material preset, 3.8:1: the preset's own
      primary and inverse colours.
    - Scenarios SC-UKV-902…904. Specs: vertical 6, stepper total 26. Stories
      `Atoms/Feedback/Stepper` → Vertical, and Themes now holds both vertical cases.
    - Measured live: mark 24 × 24 px, line 1 px with a 4 px gap at both marks, list style none,
      no horizontal overflow, `LOGIN` drawn bold (700).
- **The overview check found input tables behind the code of this branch.** `clearTabbable` was
  missing in thirteen base tables; the own inputs of the autocomplete, checkbox, input, select and
  radio group were missing too. All added; 106 overview pages match the inputs.
- **The review of the whole branch, by the owner's «ревью всей ветки, убедись что необходимое
  реализовано и нет регрессий» (14 October 2026).** Four reviewers by component group and the full
  `check:all`. Every request is in place; the faults found and fixed:
    - Regression: the applications stopped building. The input and select style sheets grew past
      the 8 kB a component sheet may weigh by Angular's default budget, which consumers keep too.
      The label-on-the-border rules moved to second sheets of the same components; the three
      applications build again, the select's main sheet is 7.78 kB.
    - Regression: under `rightMode="over"` a routed panel lost its full height — the new pane
      wrapper was a column. It is a row now; a block host measures the full 1259 px live.
    - Under the preset the label went inside every control in `rt-field`, the palette, list and
      file picker too. The base of the fields now carries `fieldLabelInside`, set by the input,
      textarea, number and select; the field puts `--label-inside`. A `size="sm"`/`"lg"` control
      gives its step to the field, so the small field's label is centred (16 of 32 px).
    - Under the preset `size="lg"` (48 px) stood below the default (56 px): the large step is now
      `max(48 px, md)`. Density lost to the preset on the same node — it lived in a layer; it is
      outside the layer now and wins on the root and on a theme island (56 → 48 → 36 live).
    - The select's tabbable cross was a button inside the trigger button. It is now a sibling
      button over its place, which a slot keeps; measured on the slot to the pixel in both looks.
      The trigger's name now carries the selected value after the floating label.
    - A nested panel in a grouped panel collapsed its parent, and a parent took a nested panel's
      header actions. The panels register with the group and hide it from their body.
    - Closing the active tab did not tell a host that holds `activeId`; now `activeIdChange` fires.
    - A radio inside a consumer wrapper was out of the Tab order; radios register with the group.
    - The autocomplete stopped asking for pages after a new query of the same first-page length.
    - A toast destroyed with its toaster left `afterDismissed()` hanging; it reports `destroyed`.
    - The badge bubble stood first in its host; the notch kept its width after the label went; the
      resize handle could stay dragging after a lost pointer capture; the drawer over the content
      let Tab out; the vertical stepper list carries `role="list"` for Safari.
    - Scenario coverage lines name their specs; SC-UKV-901 (hover border) stays measured only.
    - Not fixed, named: a small field with a cross is 34 px, not 32 — the 32 px cross plus borders;
      the same on main and in both looks. The right panel's handle has no `aria-valuenow` until the
      width is set. Two toasters on one page duplicate a toast, as before this branch.
    - Divergence to name in the changelog: a disabled tab is `aria-disabled`, not native `disabled`.
    - Specs: 252 suites, 3001 tests. Lint, types, styles, cascade, tokens, docs and coverage checks
      are green; the package and the three applications build.
- **2026-10-14, the owner's remark:** «в селекте с опциями цветые кружки видны в дропдауне но не
  отобрааются у выбранной опции». The select field now draws the chosen value by the same option
  template (`chosenOwn`); an empty field shows the placeholder. SC-UKV-905, its spec, the select
  overview section «Своя строка списка». Measured live on OptionTemplate: a 12 px circle in the
  field, its centre 1 px off the text's. The snapshot reference of that story waits for a re-take.
- **2026-10-14, the owner's remark:** «иконка звука когда выключен не хватает крстика». The
  `volume-off` drawing now has the speaker at the left, as in `volume-down`, and a cross on the
  right where the waves stand. Looked at live in the icon catalogue; 118 icon tests and the icon
  map check pass. The catalogue snapshot reference waits for a re-take.
- **6.1 done, 2026-10-14.** The input and select overviews name the cross on by default and how to
  turn it off. The output tables lagged behind the branch: the input lacked `iconLeftClick`,
  `iconRightClick` and `cleared`, the select `cleared`, the checkbox `checkedChange`, the
  autocomplete `scrolledToEnd`; all four pages are filled and opened live. Outside the branch the
  menu page lacks `openedChange` and the toast page lacks the inner outputs of the toast, as on main.
- **6.2 goes to the pipeline.** The kit's version and changelog are written by the release run after
  the merge (`chore(rt:ui-kit-v2): версия пакета поднята до …`); a `feat` commit makes it 0.24.0.
  A hand bump here would collide with that run. The archive built on 14 October for the owner's
  desktop carries 0.23.3 in its name for the same reason; its code is the branch's.
- **2026-10-14, request 6 of the application: the focus ring after a mouse press.** The browser
  marks focus from code after a pointer press as `:focus-visible`, so a side panel opened by a click
  drew the ring on its first button. `rtButton` takes `CdkMonitorFocus` as a host directive, the
  icon button puts it on its inner `<button>`, and the ring rule skips `.cdk-mouse-focused` and
  `.cdk-touch-focused`. The CDK's own directive is taken rather than a kit directive of the same
  job; its classes are the ones Material and the application already read. SC-UKV-906, specs of both
  buttons, story `Atoms/Buttons/Button` → FocusOrigin. Measured live in both looks: after a pointer
  press `:focus-visible` true, `cdk-mouse-focused`, shadow none; after Enter `cdk-keyboard-focused`
  and the ring. The 12% background the application measured is its own style, not the kit's; it
  keys on the same classes. Uncommitted: waits for the owner's look.
- **SC-UKV-856 was taken twice after the main merge.** RT-2793 issued the same number in the
  snapshots spec after this branch did. Main holds it, so the option-template scenario took the next
  free number, SC-UKV-907, and its spec title with it.

## Sessions

### 2026-10-13

- Task RT-2812 created, branch from main, the assignment row of the copy rewritten by the owner's word.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-2812-kit2-field-label-icon-actions

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 5 of 6 — The showcase and the owner's look, with stage 7 (requests 2 and 3) going component by component
- **Next step:** the owner's look at the showcase after the branch review; then the code commit
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2812-kit2-field-label-icon-actions/progress.md`; the plan lies next to it.

### Uncommitted

```
 M .claude/skills/browser-verification/SKILL.md
 M docs/specs/ui-kit-v2/proposed/field-label-icon-actions/scenarios.md
 M docs/specs/ui-kit-v2/proposed/field-label-icon-actions/spec.md
 M docs/tasks/RT-2812-kit2-field-label-icon-actions/grill.md
 M docs/tasks/RT-2812-kit2-field-label-icon-actions/progress.md
 M projects/ui-kit-v2/src/lib/components/autocomplete/Overview.mdx
 M projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete.component.html
 M projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete.component.scss
 M projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete.component.ts
 M projects/ui-kit-v2/src/lib/components/autocomplete/stories/autocomplete-matrix.stories.ts
 M projects/ui-kit-v2/src/lib/components/autocomplete/stories/component/test-autocomplete-matrix.component.ts
 M projects/ui-kit-v2/src/lib/components/checkbox/Overview.mdx
 M projects/ui-kit-v2/src/lib/components/checkbox/rt-checkbox.component.spec.ts
 M projects/ui-kit-v2/src/lib/components/checkbox/rt-checkbox.component.ts
 M projects/ui-kit-v2/src/lib/components/checkbox/stories/checkbox-matrix.stories.ts
 M projects/ui-kit-v2/src/lib/components/checkbox/stories/component/test-checkbox-matrix.component.ts
 M projects/ui-kit-v2/src/lib/components/color-palette/Overview.mdx
 M projects/ui-kit-v2/src/lib/components/container/CONTEXT.md
 M projects/ui-kit-v2/src/lib/components/container/Overview.mdx
 M projects/ui-kit-v2/src/lib/components/container/rt-container.component.html
```

### Commits over the main branch

```
75d2bff91 docs(rt:ui-kit-v2): договорённость и план RT-2812 о пяти дополнениях к полям
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
