# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 6 of 6 — Docs, version and the check suite
- **Done:** stages 1–5 and 7; 6.1; the review of the whole branch and its fixes; the owner's remarks of 14 October (chosen value by the option template, the muted sound icon); main merged in on 14 October
- **Next step:** 6.3 — the agreement merged into the domain specs, and the snapshot references re-taken, when the owner says to open the PR
- **Done on 20 October:** main merged in and references re-taken (d0b5e8e72); the application's requests 17–19 on tabs — motion of the bar and the panel (5f2fa9815), `preserveContent` (dff71d705), smooth list scroll with `scrollStep` (336e14823) and the scroll duration freed from `animationDuration` (8d0e58945). The package lies on the Desktop as `rt-tools-ui-kit-v2-0.26.0.tgz`, built 13:57
- **Blocks the push, for 6.3:** the scenarios file of the agreement is 777 lines against the 500 limit — it is split when it merges into the domain specs; the two PDF viewer frames diverge the same way on main (the «По ширине» button highlighted) and wait for the owner's decision
- **Committed on 16 October by the owner's word «комит по правилам, подтяни мейн потом проверь всю ветку на регресси»:** requests 9 (the clearing cross), 10 (points after the Material comparison) and 11 (the chips appearance of the toggle button group); then main is merged in and the whole branch is checked for the kit's own look
- **Done on 22 October:** main merged in (d676f2dcb); requests 26 and 26b on the expansion panel body;
  the owner's review — the tabs arrow step and four defects (3e2176d72, with request 20 on the
  drawer); request 21 — tooltip defaults in `provideRtKit` (4ae6e16f4); request 22 — the kit reads
  no `--mat-*`, theme roles `--rt-sys-*`. Each package went to the Desktop as
  `rt-tools-ui-kit-v2-0.30.0.tgz`
- **Snapshot run of 22 October (`node tools/visual-gate.mjs ui-kit-v2`, the image browser):** 946 of
  948 frames match. Two diverge, both only in the material half: `organisms-navigation-sidemenu--search`
  (1.66%) and `organisms-layout-container--place` (1.79%). Both stories and their references came from
  main after the branch re-took its references (d0b5e8e72), and they draw the material field without
  this branch's field look (2acc951d9) — the branch's own `sidemenu--presets` reference holds the
  same outlined field. The kit's own half matches in both. They are re-taken at 6.3 with the rest
- **Scenario numbers moved on 22 October:** main's service block (RT-2934) took SC-UKV-904–907 first,
  so this branch's four took SC-UKV-1008–1011 (904→1008, 905→1009, 906→1010, 907→1011) in the
  agreement and the test titles. The plan and the step names above keep the old numbers: the plan is
  not edited after it is written
- **`pnpm install` with main's lockfile:** done on 22 October after the release-age term; types, the
  suite and the package build pass on it
- **Waiting for the owner:** «пр не открывай» — no PR, no push
- **PR:** not open yet

## Steps

- [x] 1.1 `clearTabbable` and `cleared` in the shared base of the fields
- [x] 1.2 the input and the select take `clearTabbable` into the cross
- [x] 1.3 tests for SC-UKV-906 and SC-UKV-907
- [x] 2.1 the icon inputs, outputs and tooltips of the input
- [x] 2.2 the template draws an actionable icon as a button with the tooltip
- [x] 2.3 tests for SC-UKV-862, SC-UKV-904, SC-UKV-905
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
  panel; one line each, scenario SC-UKV-912. Affected stage: 7.
- **7.1 done.** Checkbox: `checked` input and `checkedChange` output, as the radio button has.
  `rt-radio-group`: `role=radiogroup`, `ariaLabel`, `orientation`; arrows choose and focus the next
  enabled radio button, wrapping around; the group hands out one Tab stop after render
  (`afterRenderEffect`), because radio buttons drawn by `@for` get their values one by one and an
  earlier read threw NG0950. Stories: `Atoms/Forms/Checkbox` → Standalone, `Atoms/Forms/RadioButton` → Group.

- **7.2 done.** Autocomplete: `loading` (spinner row instead of the empty result, or under the list),
  `scrolledToEnd` (once per list length, never while loading), `emptyText` and `emptyTemplate` (the
  typed query in its context). SC-UKV-913…874. Stories `Molecules/Forms/Autocomplete` → PanelLoading,
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
  as the input's own `floatingLabel` does, so the field height stays. Scenarios SC-UKV-916…877
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
  option and whether it is pressed. The `layout` input takes `row`, `wrap` or `column`. SC-UKV-919…880;
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
  A tab without a label is named by its tooltip. SC-UKV-922…885; specs: additions 13, tabs 23. Stories
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
  `visibility: hidden`, `inert`). SC-UKV-927…888; specs: additions 10, panel 7. Stories
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
  coverage list names the five new markers shown inside a neighbour's story. SC-UKV-930…891; specs:
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
  a live share does not recreate it. SC-UKV-933…894; specs: toast 55 (13 new), copy-value 6. Stories
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
    - Scenarios SC-UKV-936…899.
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
    - Scenarios SC-UKV-941…901. Specs: density styles 5; the field controls' specs stay green
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
    - Scenarios SC-UKV-943…904. Specs: vertical 6, stepper total 26. Stories
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
    - Scenario coverage lines name their specs; SC-UKV-942 (hover border) stays measured only.
    - Not fixed, named: a small field with a cross is 34 px, not 32 — the 32 px cross plus borders;
      the same on main and in both looks. The right panel's handle has no `aria-valuenow` until the
      width is set. Two toasters on one page duplicate a toast, as before this branch.
    - Divergence to name in the changelog: a disabled tab is `aria-disabled`, not native `disabled`.
    - Specs: 252 suites, 3001 tests. Lint, types, styles, cascade, tokens, docs and coverage checks
      are green; the package and the three applications build.
- **2026-10-14, the owner's remark:** «в селекте с опциями цветые кружки видны в дропдауне но не
  отобрааются у выбранной опции». The select field now draws the chosen value by the same option
  template (`chosenOwn`); an empty field shows the placeholder. SC-UKV-946, its spec, the select
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
  job; its classes are the ones Material and the application already read. SC-UKV-947, specs of both
  buttons, story `Atoms/Buttons/Button` → FocusOrigin. Measured live in both looks: after a pointer
  press `:focus-visible` true, `cdk-mouse-focused`, shadow none; after Enter `cdk-keyboard-focused`
  and the ring. The 12% background the application measured is its own style, not the kit's; it
  keys on the same classes. Uncommitted: waits for the owner's look.
- **SC-UKV-856 was taken twice after the main merge.** RT-2793 issued the same number in the
  snapshots spec after this branch did. Main holds it, so the option-template scenario took the next
  free number, SC-UKV-948, and its spec title with it.
- **2026-10-14, request 7 of the application: the field under the preset against Material.** The
  application measured the field at density −1 against Material 3 and listed the divergences.
  Done:
    - the preset sign on `rt-field` itself puts the label inside;
    - the density step is an inherited registered property, and the preset counts the height from it
      on its own node, so a step on the root reaches a field with its own preset sign;
    - `--rt-input-height-app` is the application's own height;
    - the filled field: value at `h/2 − 4` with a 24 px line, the risen label at `h/2 − 20`, label
      16 px from the edge, only the bottom line, focus thickens it;
    - the message under the field starts at the text, right under it;
    - the required mark has no gap under the preset;
    - Material muted colour for the placeholder, the resting label, the icons and the arrow;
    - brand caret; left icon 24 px, 12 px from the edge, 16 px from the text;
    - `iconLeftDisabled` and `iconRightDisabled`;
    - `--rt-input-min-width`;
    - an icon button inside a field is capped by the field height, which also cures the small field
      with a cross at 34 px.

    Not done on purpose: the outlined rounding stays the first kit's (the application sets `radius`),
    and the least width is no preset default. Scenarios SC-UKV-949…915, spec
    `rt-field-material-metrics.spec.ts`, story Molecules/Forms/Field → Material and the disabled case
    in FieldExtras → IconActions. Measured live: 18 fields of the story match Material. The kit look of
    the input appearance story is unchanged. The first full run failed three application builds: the
    field sheet grew to 11.8 KB and the select sheet to 8.7 KB over the 8 KB budget. The label-inside
    rules moved to `rt-field-label-inside.scss` under one `:is()` selector, the select's cross size
    and filled focus moved to its two sibling sheets; the sheets are now 1.8 + 7.4 KB and 7.95 KB.
    Committed as `2acc951d9`, package 0.23.4 on the desktop.

- **2026-10-14, request 7 follow-up: the preset sign on the control's own tag.** `<rt-select
data-preset="material" floatingLabel>` drew the border through the risen label: every preset rule
  of the input, select, number and text controls looked for the sign on an ancestor only. They now
  take one `:is()`/`:where()` of the sign on an ancestor or on the node itself, so the specificity
  stays and the sheets do not double. The select's triangle arrow moved to its second sheet to keep
  the main sheet under 8 KB. Measured live in a new row of the Material story: the outlined select
  and input have the cut under the label, the empty select hides the placeholder, the filled ones
  raise the label inside. The 1 px of the risen label against Material is left as it is.

- **2026-10-14, request 8: four more preset deltas after the 16:56 package.**
    - An icon stands 4 px from the text, not 16: after a left icon the text and the resting label
      start at 40 px. The right icon got the same 12 px from the edge and 4 px to its neighbour.
    - The filled number field takes the input's filled look: only the bottom line, value at 22 px
      in a 24 px line, label 16 px from the edge.
    - The text starts 16 px from the outer edge under the preset in the input, number, select and
      text area; the kit look keeps 17 px.
    - A disabled field under the preset is not faded: its own handle
      `--rt-input-disabled-field-opacity` is 1 there. The shared `--rt-input-disabled-opacity` was
      left alone, because eleven components read it. The border, text, placeholder and label take
      Material's 12% and 38%, and the disabled text area lost its grey fill.
    - The text area and the autocomplete have no filled look, so the filled-field request does not
      apply to them. Scenarios SC-UKV-957 and SC-UKV-958. Measured live in the Material story and in
      the input States story: the kit look is unchanged.
    - The disabled select's arrow under the preset is on-surface 38% too, as the application asked.
    - Before the commit: the full suite 358 of 358 and the showcase snapshots in the image. 234 of
      929 frames diverge, all in the preset halves or in stories whose references carry old titles;
      a count of the red pixels by half shows the kit look unchanged in every field story. The
      references are re-taken at 6.3, as planned.

- **2026-10-14, request 9: the clearing cross under the preset is the first kit's cross.** The
  0.23.4 package drew a 32 px button with a 16 px icon 16 px from the edge; the application asked
  for the first kit's 19 px button, a grey 12 px icon and 8 px from the edge. Four handles of the
  input — `--rt-input-clear-size`, `-clear-icon-size`, `-clear-color`, `-clear-offset-end` — carry
  the old values in the kit look and the first kit's under the preset. The select takes the same
  size, icon and colour; its cross stands before the arrow, so the 8 px applies to the input only.
  The button's public `--rt-icon-button-size` was not used: the token graph refuses a fallback at
  a token the kit declares. Scenario SC-UKV-959, two rows in the Material story.

- **2026-10-15, request 10: five points after the application's comparison with Material.**
  Uncommitted next to request 9. The owner added: «важно чтобы изменения в этой ветке не афектили
  базовый вид компонентов кита».
    - F1: under the preset the line under a field is Material's subscript — 16 px with 4 px above
      it, `--rt-field-messages-line-height` and `-padding-top`; a reserved line makes 52 + 20 = 72.
    - F2: `rt-textarea` takes `appearance` — `outline` or `fill`; the filled look copies the filled
      input, and under the preset its label lies inside the field. Story Textarea → Appearance.
    - F5: under the preset the cross lies on the first kit's round grey ground —
      `--rt-input-clear-bg`, `-bg-hover`, `-radius`; a new primitive `--rt-mat-neutral-70` carries
      the first kit's dark ground #3f3e43. The kit look keeps the cross without a ground.
    - F6: under the preset an icon button stands where a plain icon stands: icon at 12 px, text
      from 40 px, the button overhangs the icon equally on both sides. SC-UKV-960 to 922.
    - F7: not done — the input renders no cross and no slot without a value; the empty field's
      input is as wide as without `clearable`. The application was asked for its markup.
    - The kit look checked against the last commit: computed styles of 640 nodes in 36 stories of
      the input, select, number, textarea and field; 34 stories identical, the two textarea stories
      identical except the new filled cells.
    - The input's main sheet passed 8 KB, the size an application build refuses: the icons and the
      cross moved to a sheet of their own, `rt-input-icons.scss`; the filled textarea's rule in a
      field lives in the textarea's sheet. The full suite 358 of 358, the 11:23 package went to the
      application.
    - Second round from the application's measurement. F2 and F6 matched Material.
    - F1 gave 68 in the application: its own `box-sizing: border-box` on every node is outside the
      layers and beats the kit. The line now counts in `border-box`, and its least height includes
      the 4 px: 72 with and without that rule.
    - F7 done: under the preset a clearable input without a right icon keeps 4 px on the right, and
      the cross stands 4 px after the text and 8 px from the edge — `--rt-input-clear-offset-start`
      and the class `rt-input--clearable`. SC-UKV-964.
    - F8: under the preset a disabled filled input, select, number and textarea are filled with
      on-surface 4 % — `--rt-input-fill-color-bg-disabled`. SC-UKV-965.
    - The kit look checked against the last commit again on a restarted showcase: 632 nodes in 36
      stories match, apart from the computed `box-sizing` of the message line, whose size did not
      move.
    - Third round: F1, F5, F7 and F8 matched Material in the application. Two new points.
    - F9: under the preset a select whose value is drawn by an option template grew to 57 px — the
      template's inline row sat on the baseline. It now sits at the top: 52 px. SC-UKV-966.
    - F10: under the preset a filled textarea of 4 rows was 127 px and the field 150. It now takes
      6 px under the last line with the underline and stands at the top of its line: 124 and 144.
      SC-UKV-967. The kit look keeps the baseline and 8 px — measured on the textarea and field
      stories.
    - The Material story wrapper passed 500 lines: its cases moved to `field-material-cases.ts`.
    - The 13:12 package: F9 and F10 matched Material in the application. It has no open requests
      left for this stage.
- **Request 11 — the chips appearance of the toggle button group (the application's request 6, stage 5).**
  The application keeps Material chips in eight places because the segmented look differs from them.
    - New inputs `appearance: 'segmented' | 'chips'` and `checkmark`; the segmented look stays the
      default. Chips: separate items 8 px apart, no track, each item outlined by an inset shadow.
    - Colours are five root properties `--rt-toggle-chip-*` with base, dark and material values; the
      hover layer and the unavailable outline are counted from the item's own text, 8 % and 32 % of
      the faded text, as Material counts them. The first variant had eight colour names: every name
      repeats about twenty times in the token CSS, and the sample page's first bundle went 3.17 KB
      over its 1 MB budget. Five names fit it. Sizes follow the group's size steps. Under the preset: 28 px in the small
      size, paddings 12 px, 14 px / 500, outline of the theme's outline colour, the chosen item
      filled with secondary-container without outline, the check slot 36 px as in Material's sources.
    - An unavailable chip fades its text and outline in both presets. An unavailable segment fades
      its text only under the preset: the application asked for every appearance, but the owner's
      rule keeps the kit's own look as it was. Named to the application.
    - The rules live in a sheet of their own, `rt-toggle-button-group-chips.scss`, 3.6 KB compiled:
      the main sheet was already over 5 KB.
    - New stories Appearance and ChipsStates; chips cells in Presets and Themes; Playground controls.
      SC-UKV-968 to 930.
    - The kit look checked against the last commit: 396 nodes in 10 stories of the group, 0 differ —
      measured again after the sheet was rewritten.
    - Second round from the application's measurement on its pages: colours, 28 px, radius, font,
      check offset and the disabled look matched. Three divergences fixed, all for chips only:
      a column of chips now stretches its items to the width of the place, and `fullWidth` no longer
      collapses their height; under the preset the group keeps 4 px above the first row and below
      the last, as Material's chip margins give, and the label is tracked 0.1 px. Under the preset
      chips are 28 px in every size: Material has one chip size, and the separate rule for the small
      size pushed the sheet over the 4 KB warning. SC-UKV-972.
    - Third round: the application measured Material's chip margins directly — 8 px above and below
      every chip and 8 px before it, and they do not collapse. Under the preset the group now keeps
      8 px above the first row and below the last, and rows stand 16 px apart; items in a row stay
      8 px apart. A column of chips also takes the free width of a row flex parent itself. Measured
      live: a one-row group is 44 px, wrapped rows step 44 px, a column of 7 days is 308 px with a
      44 px step, and in a 476 px flex row the group and every chip are 476 px. The kit look against
      the last commit: 396 nodes, 0 differ. `check:all` 358/358.
    - The application re-measured the third-round package on its pages: no divergences left, every
      chip position and size matches Material, and the keyboard behaves the same. Request 11 is
      closed from its side.
- **2026-10-16, main merged in after the commit of requests 9–11.** Two things broke only in the
  merged tree:
    - main's profile menu took SC-UKV-857…862, which this branch had issued too. Main holds them, so
      the six scenarios of this branch moved to SC-UKV-973…937, their test titles with them; plan
      steps 2.3, 3.3 and 4.4 keep the old numbers as written.
    - the sample application's initial bundle went 878 bytes over its 1 MB budget: main's profile
      menu tokens and this branch's tokens together. `--rt-toggle-chip-color-border-selected` is
      gone — in the kit look it repeated the plain outline, and under the preset the chips sheet now
      clears the outline of a chosen, available chip itself. After the preset-only cap below the
      bundle went 474 bytes over again, so `--rt-toggle-chip-color-text-selected` is gone too: the kit
      look reads `--rt-color-action-primary-on-surface` directly, and under the preset the chips sheet
      takes on-secondary-container of the theme with the primary text colour as the fallback. With a
      Material theme on the page that is the same colour; without one the dark fallback is
      `--rt-neutral-50` instead of white. Measured live: kit chosen chip #155dfc with the grey outline,
      preset chosen chip #181818 without one, as before. The bundle is 998.83 kB, about 1.2 kB under the
      budget; the chips sheet is 4.26 kB, over the 4 KB warning but far from the 8 KB error.
- **2026-10-16, the whole branch checked against main for the kit's own look.** The showcase
  snapshots of main, shot in a second working copy by the same image browser, match main's references
  886 of 886, so the references are main's look. The branch against them: 693 of 935 match; 47 stories
  are new in the branch and have no reference; 194 frames diverge. Each was sorted by where the red
  lies: the material half, new rows of a story with the rows under them shifted, a frame height
  strip, or anti-aliasing of at most 15 per channel. One divergence was the kit's own look: request 7
  capped an icon button and the clearing cross by the field height everywhere, so a small field with
  a cross went 34 → 32 px — the side menu's search shows it. The cap now applies under the preset
  only; the kit look is 34 px with a 32 px cross again, as on main, and the preset keeps the 19 px
  cross at every density step. SC-UKV-956 says so, its test title with it.
- **2026-10-16, request 12 (the application's request 7): a filled field without a label.** Under
  the preset the field kept the room for a raised label even with no label: the value stood at 22 px
  in a 52 px field, and an empty control hid its placeholder. Now the value padding and the hidden
  placeholder apply only when the field draws its label row; without one the input, number and
  select value stands in the middle, the placeholder shows, and the filled text area has equal room
  above its first line and below its last. The hint row stays. SC-UKV-979, a new row in the
  Material story. Measured live: field 72 with the hint row, control 52, value middle 0.5 px off
  centre, text area first line at 14 px; labelled filled fields keep 22/5 px with a 24 px line.
    - Not fixed: `fullWidth` with `layout="column"` collapses the segments' height in the segmented
      appearance too. A fix there changes the kit's own look, so it waits for the owner's word.
- **2026-10-19, request 13 (the application's session): NG01354 on every pencil press.** An
  editable dynamic selector inside the host's `[formGroup]` warned once per press: the row edit
  field, the new-row field and the popup search bound `ngModel` and looked for the host's form
  container. All four now carry `[ngModelOptions]="{ standalone: true }"`, as the tree, the table
  and the pagination already do — the drafts are the list's own state. SC-UKV-980; the spec is red
  without the edit and green with it. Checked live on :6007: story StringList — the pencil opens
  the field with the row value, Enter replaces `north@example.test` by the typed text, the new-row
  field opens; story Popup — the search narrows 5 rows to 0 and back. No console warning or error.
- **2026-10-19, request 14 (the owner's word through the application's session): the other seven.**
  The select filter, the tree selector search, the profile menu locale, the filter control, the
  theme toggle, the workspace details (agent select and toggles) and the dynamic list header now
  carry `[ngModelOptions]="{ standalone: true }"` too. SC-UKV-981 hosts each inside a
  `[formGroup]`: 8 cases red without the edit, green with it.
- **2026-10-19, request 15 (the application's session): an emptied input stays empty.** The host
  set the control back to the value drawn before the typing, in the same call stack as the input
  event. The signal then equalled the last drawn value, the `[value]` binding did not fire, and
  the field kept the typed text while the control held the old one. `writeValue` of the input now
  writes the value into the field whenever the two differ. SC-UKV-982 is red without the edit and
  green with it.
- **2026-10-19, request 16 (the application's session): tabs keys and scroll arrows.** Four
  points measured against the material tab group in a side panel with eight tabs. New input
  `activation` (`auto` by default, `manual` moves focus only, Enter and Space open) — SC-UKV-983.
  A short press on a scroll arrow now pages the list by its visible width; a hold over 300 ms
  scrolls on as before — SC-UKV-984. New input `scrollArrows` (`overlay` by default, `inline`
  puts both arrows beside the list, the idle one pale) — SC-UKV-985, story ScrollArrows. The
  selected tab bar is offset by `translate`, so a zero border width keeps it at the bottom —
  SC-UKV-986. 10 cases red without the edit, green with it. Not checked live: the owner stopped
  the showcase on :6007 in the same hour.
- **2026-10-20, the owner: main merged in, the kit's own look unchanged.** Main 0.26.0 merged
  without conflicts. The own half of every diverged story was compared node by node against a
  showcase built from main: position, size, colour, font, borders, padding and shadow match. The
  one shift is the required star, 0.24 px to the right, invisible in the frame. Every diverged
  frame differs in the material half or by added rows.
    - The kit's global styles grew by 31 kB and its scripts by 49 kB. The conversations page went
      1.65 kB past its 1 MB initial budget; the owner raised the budget to 1.5 MB.
    - 211 references re-taken and 50 taken new, each looked at first. Two story defects found that
      way: the ScrollArrows tabs ran past their half and now sit in a 24rem box; RightSide had no
      showing root and is now shot as a full page.
    - A second raising: 940 of 942. The two PDF viewer frames diverge on main the same way, with the
      «По ширине» button highlighted, and are left for the owner.
    - Admin end-to-end 146 of 146, sign-in stand 10 of 10.
    - The tabs Edges story overflows its half the same way; it comes from main and is left as is.
- **2026-10-20, request 17 (the application's session): tabs move on a switch.** Measured against
  the material tab group: the bar slides to the new tab, the old panel leaves and the new one
  slides in, both about 500 ms. The selected bar is now one element of the list, placed by
  measuring the tab with fractional sizes; the tab keeps its own bar until the first measurement
  and under an invalid state. The leaving panel is the same view kept by `track`, lifted out of the
  flow at the point it stood. New tokens for the bar and the panel, the input
  `animationDuration` for both, `prefers-reduced-motion` drops both — SC-UKV-987 to 949.
    - The kit's own look keeps the panel in place: its duration token is `0ms`, so screens already
      on the kit do not start sliding; the bar slides in 200 ms. The material preset sets both to
      500 ms with the Material tab curve.
    - The motion moved into a file of its own next to the component: the component went past 500
      lines. The material field tokens moved into a file of their own for the same reason.
    - Snapshots 940 of 942, the two known PDF viewer frames. Measured in the built showcase: the bar
      stands at the tab's left edge and width to the pixel, 1 px below its bottom as before, in
      both halves and in the vertical layout. Live on Playground at 500 ms: the old panel leaves to
      the left, the new one comes from the right, mirrored back; reduced motion switches at once.
- **2026-10-20, request 18 (the application's session): tab bodies kept alive.** New input
  `preserveContent`, as on the material tab group: a tab body is created on its first opening
  and then lives hidden (`hidden`, `inert`, `aria-hidden`, out of the tab order, anchor
  `tabs-panel-idle`); a tab never opened is not created. With preserved bodies they stand in tab
  order, and the live previous body leaves on a switch and stays hidden after — SC-UKV-991, 951.
  The panel's own `display` beats the browser rule for `hidden`, so the idle panel gets
  `display: none` by a modifier. Snapshots 940 of 942, the two known PDF frames. Live on Playground:
  the same body comes back with its mark, the never-opened tab has no body, without the input the
  body is created anew as before.
- **2026-10-20, request 19 (the application's session): the tab list scrolls smoothly.** The
  material tab group slides its list by a transform over 500 ms and an arrow press moves a third of
  the visible width. Here the list's own scroll moves instead, frame by frame along the curve from
  the tokens `--rt-tabs-scroll-duration` and `--rt-tabs-scroll-easing`: a transform would take
  the wheel and touch scrolling away from the browser. New input `scrollStep` (`page` by
  default, `third`). The selected half-hidden tab scrolls in the same way, and focusing a tab no
  longer scrolls the list by itself. `animationDuration` sets this duration too, reduced motion
  scrolls at once; a hold tick stops the smooth scroll and moves at once — SC-UKV-993, 953.
    - Own look 200 ms ease-out, the material preset 500 ms with the Material curve.
    - The scroll lives in a file of its own next to the component, the hold step moved there too.
    - Snapshots 940 of 942, the two known PDF frames. Live on ScrollArrows: the own half reaches
      the target in 200 ms, the material half by 23, 175, 331 and 384 px at 60, 150, 300 and
      600 ms; reduced motion jumps at once.
    - Follow-up of the same session: `animationDuration` no longer writes the scroll duration. On
      the material tab group it governs the body and the bar only, and three side panels with
      `animationDuration="0"` would have had their list jump. The scroll takes its duration from
      the token alone; reduced motion still turns it off.
- **2026-10-20, request 20 (the application's session): the close cross gets a tooltip and its
  look by properties.** The page headers of the application move to `rt-tabs`, and their own
  close button cannot stay inside a tab that is a button. New tab inputs `closeTooltip` and
  `closeTooltipPlacement`; while the pointer is on the cross the tab's own tooltip is empty, so
  only the cross's shows — SC-UKV-995. The cross takes its background, colour, icon size and
  inline margins from `--rt-tab-item-close-*` on `.rt-tab-item` — SC-UKV-996, measured, not
  covered by a spec. The icon size goes through the icon's own `xs` step: the icon sets its width
  by an inline style, and a rule could not beat it.
    - The defaults equal the former look: measured in the showcase before and after, a 20 px
      circle, a 12 px icon, 8 px from the label and to the edge, the same colours at rest and on hover.
    - With the application's values the cross is 19.2 px, the icon 16 px, the background 224 grey,
      12 px from the label and 24 px to the tab edge — what was measured in the application.
    - The material preset sets none of these: the material tab group has no cross.
- **2026-10-21, request 21 (the application's session): the side menu search as in the
  application's former menu.** Taken by the owner's word «делай просьбу в этой ветке как сделаеш
  проверь живьем закомить и собери пакет на рабочийстол уведоми апку». Two differences the
  application's end-to-end suite catches:
    - A folder matched by its name alone stands open during the search — SC-UKV-997. Its rows are
      still only those that matched themselves, so it stays without children (SC-UKV-431); only
      the folder's own open state changes.
    - A favourites block the person collapsed keeps its count in the title during the search, the
      count of the rows that matched — SC-UKV-998. The block still shows its matching rows open
      while the search lasts, and comes back collapsed when the search is cleared.
- **2026-10-21, request 22 (the application's session): the tab panel leaves the Tab order on
  request.** Taken the same way as request 21. The open panel always carried `tabindex="0"`, so
  Tab from the tab list stopped on the panel before its first field; the material tab group goes
  straight to the field. The new input `contentTabIndex` (default `0`, the former behaviour) takes
  `null`, and the panel then carries no `tabindex` — SC-UKV-999. Checked in the showcase: with the
  default, Tab from the active tab lands on the panel; with `null`, on a field placed in the panel.
- **2026-10-21, request 23 (the application's session): a toaster channel.** The application keeps
  pinned status toasts (offline, update available, token errors, job progress) apart from ordinary
  ones; with one toaster in `replace` mode an ordinary toast pushed a pinned one out. The toaster
  takes the input `channel` (default `'default'`), a toast the field `channel`; a toaster shows only
  its channel — SC-UKV-1000. A toast with `duration: null` in `stack` mode stays until `dismiss()`,
  and several of them stack. The showcase story of the toast handle now shows two toasters: in the
  centre «Сохранено» replaces the previous one, on the right the pinned toasts stay.
- **2026-10-21, request 24 (the application's session): a bare toast.** The application's status
  toasts are whole cards with their own background, shadow, rounding and close button; inside the
  toast shell they came out a card in a card with two close buttons. The toast field `bare` removes
  the shell — background, border, padding, shadow, rounding, icon, cross and timer bar — and keeps
  the place in the stack, the motion, the handle and the screen reader name — SC-UKV-1001. Measured
  in the showcase: the bare toast's box equals the card's box (57 px high, same top), the toast has
  no padding, border, background or shadow, and the card's own button closes it with `dismiss`.
- **2026-10-22, request 25 (the application's session): the drawer replaces the Material side
  panels.** The application shell and a builder toolbox still stood on Material side panels because
  the kit drawer clipped its content, had a fixed width, reported no end of motion, chose no focus
  target and said nothing about a backdrop press. New optional inputs and outputs, every default
  unchanged: `overflow` (`clip` / `visible`, the open panel stops clipping) and `width: null` (width
  by content, no handle) — SC-UKV-1002; `openedStart`, `closedStart`, `afterOpened`, `afterClosed`
  — SC-UKV-1003; `autoFocus` (`true` / `false` / `'first-tabbable'` / a selector) and
  `backdropClick` before the close, also with `disableClose` — SC-UKV-1004. Keeping both panels at
  window height needs no input: a container of window height clips its edges and scrolls its
  content. Measured in the showcase: the sub-panel reaches 410 px past the panel edge at 258 px and
  lies on top; the clipped default hides it; width by content 232.5 px against 240 px fixed, no
  handle, 0 when closed; the start of closing comes within 30 ms, the end after the 0.2 s motion;
  the selector and `first-tabbable` put the focus on the field beside the content, the default over
  the content focuses the panel and returns the focus to the button after a backdrop press.
- **2026-10-22, request 26 (the application's session): the expansion panel body takes the
  Material line height and box sizing.** Inside a panel under the Material preset the list rows
  stood 32.5 px high instead of 40 px and the radio circle 16 px instead of 20 px: the body had no
  property for the line height, and the panel had no property for box sizing. Two consumer handles
  `--rt-expansion-panel-body-line-height` and `--rt-expansion-panel-body-font-size` stay undeclared,
  so the body inherits both as before; `--rt-expansion-panel-box-sizing` defaults to `border-box` —
  SC-UKV-1005. Measured in the showcase: the body line height goes from `normal` to 24 px with
  `1.5rem`, a row with 8 px paddings from 35.5 px to 40 px; under a reset that inherits box sizing
  the circle grows from 16 px to 20 px with `content-box`, the panel width stays 352 px, and all
  values return when the properties are removed.
- **2026-10-22, request 26b (the application's session): box sizing for the body alone.** With
  `content-box` on the host the application's panel, 100% wide with a 1 px border, stood 2 px past
  its container. A third consumer handle `--rt-expansion-panel-body-box-sizing` sets the body
  alone; without it the body inherits the host's value — SC-UKV-1006. Measured in the showcase with
  a 1 px host border and an inheriting reset in a layer below the kit: the body set to
  `content-box` gives the circle 20 px, the panel 352 px against its 352 px container, 0 px past
  the edge, the host stays `border-box`; without the property the body is `border-box` from the
  host. An unlayered reset beats the kit rule on the body, and the property does nothing there.
- **2026-10-22, the owner's review: the arrow step and four defects in new code.**
    - Tabs: a short press on an arrow paged the whole visible width, while main moved about 80 px.
      `scrollStep` gains `fixed` (80 px) as the default; `page` and `third` stay opt-in — SC-UKV-984
      and SC-UKV-993 reworded under the same numbers. Measured in the showcase: strips 384 and 288 px
      wide move 80, then 160 px.
    - Drawer: the over panel and the backdrop stand on `--rt-drawer-over-z-index` and
      `--rt-drawer-backdrop-z-index`, and the container isolates them; a closed over panel leaves by
      its own edge right to left; a panel opened from the first render takes no focus. Measured: a
      content node with `z-index: 50` stays under the open over panel, the start panel translates
      −200 px left to right and +200 px right to left, focus stays on the page body.
    - Drawer, request 20 of the application's session: `--rt-drawer-z-index` (default `auto`) for the
      side panel, `--rt-drawer-side-shadow` (default none). Measured: set to `2`, the side panel reads
      `z-index: 2`, the side shadow draws.
    - Expansion panel: the lazy body and the header actions are found at any depth and only the
      panel's own are taken, by the owner token `RT_EXPANSION_PANEL_OWNER`; a template inside the
      owner's wrapper was an empty body before.
    - Badge: the bubble carries `data-rt-badge`, and the client takes a server-rendered bubble over
      instead of adding a second.
    - Button: `rtButton` watches focus through `FocusMonitor` itself instead of the
      `CdkMonitorFocus` host directive; `cdkMonitorElementFocus` on the same button no longer
      throws NG0309.
- **2026-10-22, request 21 (the application's session): tooltip defaults for the whole
  application.** Asked for a token of its own; done as a `tooltip` section of `provideRtKit`, where
  the kit already keeps its defaults — `hideOnClick`, `placement`, `showDelay`; an input on the
  element still wins — SC-UKV-1007. The side from the settings is read when the side is chosen, not
  as the input default: the tabs pass `null` for the close cross and would have beaten it.
  `rt-icon-button` takes its `tooltipHideOnClick` default from the same section, otherwise its own
  `true` would beat the setting. Checked by specs only: the showcase has no settings section to
  switch it on.
- **2026-10-22, request 22 (the application's session): the kit reads no `--mat-*` name.** The
  application drops Angular Material and wants no Material names in code. Every `--mat-sys-<role>`
  read became `--rt-sys-<role>` with the same role names; four component names became
  `--rt-field-filled-container-color`, `--rt-fab-small-container-color`,
  `--rt-option-selected-state-layer-color` and `--rt-menu-container-color`. All 25 are consumer
  handles, not declared by the kit, with the former fallbacks. The extra roles the application
  listed are not declared: the kit does not read them, and a declared unused name is a dead token;
  the application declares them itself. Breaking for an application that recoloured the kit by a
  Material theme: it now declares `--rt-sys-*` itself. Checked: the built CSS and code against the
  former build differ only by the names, the generated handle list and line wrapping; the
  showcase's violet theme on `--rt-sys-*` gives the list `#7d00fa` brand, `#fef8fc` surface and
  `#e8e0eb` fill; no `--mat-` string is left in the package outside the first kit's shared lint
  rule, which is not shipped.

## Sessions

### 2026-10-13

- Task RT-2812 created, branch from main, the assignment row of the copy rewritten by the owner's word.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-2812-kit2-field-label-icon-actions

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 6 of 6 — Docs, version and the check suite
- **Next step:** 6.3 — the agreement merged into the domain specs, and the snapshot references re-taken, when the owner says to open the PR
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2812-kit2-field-label-icon-actions/progress.md`; the plan lies next to it.

### Uncommitted

```
none
```

### Commits over the main branch

```
ce29dab08 feat(rt:ui-kit-v2): раскрывающаяся панель — box-sizing тела отдельно от панели
58027acde chore(rt:ui-kit-v2): совпадение значения default у канала тостера принято проверкой повторов
d676f2dcb Merge remote-tracking branch 'origin/main' into RT-2812-kit2-field-label-icon-actions
0a05bc2d6 feat(rt:ui-kit-v2): раскрывающаяся панель — высота строки, шрифт тела и box-sizing из свойств
e77a33fc0 feat(rt:ui-kit-v2): боковая панель — содержимое за краем, ширина по содержимому, события перехода и выбор фокуса
c2305b053 feat(rt:ui-kit-v2): тост — голый вид для своего компонента-карточки
40845c87f feat(rt:ui-kit-v2): тостер — свой канал для закреплённых тостов
5058d4c62 feat(rt:ui-kit-v2): вкладки — открытую панель можно убрать из обхода по Tab
32b67926e feat(rt:ui-kit-v2): боковое меню — поиск раскрывает папку, совпавшую по имени, свёрнутое избранное держит число
f5a118015 Merge remote-tracking branch 'origin/main' into RT-2812-kit2-field-label-icon-actions
b58674e7c Merge remote-tracking branch 'origin/main' into RT-2812-kit2-field-label-icon-actions
ca512a627 Merge remote-tracking branch 'origin/main' into RT-2812-kit2-field-label-icon-actions
3d570a9f0 Merge remote-tracking branch 'origin/main' into RT-2812-kit2-field-label-icon-actions
e47609e52 Merge remote-tracking branch 'origin/main' into RT-2812-kit2-field-label-icon-actions
5aafc6c7c Merge remote-tracking branch 'origin/main' into RT-2812-kit2-field-label-icon-actions
d2920fbe0 feat(rt:ui-kit-v2): вкладки — у крестика своя подсказка, вид крестика задаётся свойствами
b1418aca8 docs(rt:ui-kit-v2): прогресс RT-2812 после заявок о вкладках
8d0e58945 fix(rt:ui-kit-v2): вкладки — animationDuration больше не задаёт длительность прокрутки полосы
336e14823 feat(rt:ui-kit-v2): вкладки — полоса прокручивается плавно, шаг стрелки задаётся входом scrollStep
dff71d705 feat(rt:ui-kit-v2): вкладки — вход preserveContent сохраняет тело посещённой вкладки
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
