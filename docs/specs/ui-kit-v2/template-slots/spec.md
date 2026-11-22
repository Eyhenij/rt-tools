# Template slots

**Status:** in force · **Revision:** 2026-11-22 · **Scenario prefix:** `SC-UKV`
**Depends on:** the families whose slots change — the expansion panel, the field, the detail row,
the page header, the chat, the side menu, the menu, the icon button, the breadcrumbs, the dynamic
selectors, the dynamic list, the side panel, the skeleton wrapper, the money row, the info item, the
table sort header; the list pages of the CMS client and of the admin libraries take the same form
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

A subdomain of the second kit about the slots a component draws only in some of its states: they
are given as templates and created only in the branch where they are seen. Written by task RT-3479,
the work that removed the projection under a condition from the kit and its consumers. The list
pages of `@rt-tools/cms-angular` and of the admin libraries follow the same rule, each in the spec of
its own domain: `docs/specs/cms/angular/` (`SC-CMS-81`) and `docs/specs/message-bus/admin-list-page/`
(`SC-MB-456`).

## Why

Content the consumer puts into a slot of a component is created by Angular always, even when the
slot stands in a branch of the component's template that is closed. A closed branch only keeps that
content out of the page: the components inside it are built, read their inputs, subscribe and send
their requests anyway. A menu that was never opened holds every one of its items alive; a side panel
showing its empty placeholder builds the form it hides; a vertical page header builds the bell of
the horizontal one.

A template slot removes that cost. The consumer gives the content of the slot as a template, and the
component draws it only where and when the branch is open. Closed, the content does not exist.

The price is the markup of every consumer: the form of the slot changes, and the next release of the
kit, of the CMS client and of the admin libraries breaks the code written for the former form.

## Terminology

| Term                    | What it is                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| **Slot**                | a named place in a component's template the consumer fills with markup of its own                   |
| **Element slot**        | the former form: the consumer marks an element by the slot attribute, and the component projects it |
| **Template slot**       | the new form: the consumer wraps the content into an `<ng-template>` carrying the slot attribute    |
| **Branch of a slot**    | the condition of the component's template under which the slot stands, an else branch included      |
| **Closed branch**       | the branch whose condition is false at the moment; its slot is not drawn                            |
| **Former default slot** | a slot without a name: everything the consumer put into the component without a mark                |

### What it is called in the interface

A person sees nothing of their own here: the screens look exactly as before. The word "slot" lives
in the component overviews of the showcase and in the release notes, where every slot is shown in
its new form.

## Rules

- **Every slot under a condition or inside a template of a component is a template slot.** Any
  branch counts — `@if` and its else branches, `@for`, `@switch`, an `ng-template` — whether Angular
  Doctor names it or not. The consumer gives it as `<ng-template>` with the slot attribute. A slot
  left as an element slot under a condition builds its content in a closed branch — the defect this
  work removes.
- **The content of a closed branch is not created.** No component of it is built, no input is read,
  no request is sent while the branch is closed.
- **The content of a slot is created when its branch opens and destroyed when it closes.** The state
  inside it — typed text, scroll, a choice — does not outlive the closing. The lazy body of the
  expansion panel with `preserveContent` stays after the first expanding, as now.
- **The body of an expansion panel stands under no condition.** `[rtExpansionPanelBody]` stays an
  element slot: its node is in the page from the start, hidden and inert while collapsed, and the
  form fields inside it stay in the outer form. The lazy body stays `rtExpansionPanelContent`. The
  height motion of expanding and collapsing stays as it is.
- **The content of a template slot is bound and injected from the place it is written.** A handler
  of the consumer fires as it fired, and a directive inside the content finds the same ancestors it
  found as an element slot — the panel owning the actions, the drag list owning the handle.
- **A slot keeps its name; only its form changes.** The attribute moves from the element onto the
  `<ng-template>` that wraps it: `[rtFieldHint]` becomes `<ng-template rtFieldHint>`. A consumer
  finds the new form by the name it already writes.
- **A former default slot gets a name: the component's name and `Content`.** `rt-menu` takes
  `rtMenuContent`, `rt-aside` — `rtAsideContent`, `th[rtSortHeader]` — `rtTableSortHeaderContent`;
  the full list is in "Contract". A template without a name has nothing to tell it from a template
  the consumer keeps for itself.
- **Several templates of one slot are all drawn, in the order they are written.** Two element slots
  under one mark were both projected, and the CMS items screen gives two filters on the left and two
  actions on the right. Every slot is read as a list: the expansion panel's own-actions lookup and
  the field's hint query change from one found item to all of them.
- **A kit component handing its own default slot to the skeleton keeps that content in the page.**
  `rt-field` and `rt-detail-row` put what the consumer gave them into `rt-skeleton-wrapper`; a
  template cannot carry a projection, so both keep the content unconditionally and hide it while
  loading. The control of a loading field stays in its form, as it does now.
- **A menu item's confirmed action reaches the consumer after the menu closes.** Closing the menu
  destroys its items, and an item waiting for its confirmation dialog would drop the answer. The
  confirmation outlives the item: a confirmed choice emits `selected` once, a cancelled one emits
  nothing.
- **A reordered favourite keeps the focus on its handle.** The handle stands in a template slot of the
  row; after an arrow key moves the row, the focus goes to the handle of the moved row, as now.
- **The former element form of a named slot prints a warning in development mode.** The warning names
  the component, the slot and the new form; the screen draws nothing in the slot and the look does not
  change. The menu warns the same way about a menu item written outside `rtMenuContent`. Other
  former default slots drop the content without a warning — Angular gives the component nothing to
  find it by.
- **The look of every screen stays as it was.** The kit changes the form of the slots, not their
  place, order, spacing or motion; a showcase snapshot that changed is a defect of this work.
- **The kit, the CMS client, the showcase and the admin libraries hold no projection under a
  condition or inside a template.** Angular Doctor finds nothing by `ng-content-in-control-flow`, and
  its threshold for that rule is zero; the else branches the doctor does not read are held by the
  same rule and checked by the unit tests of the families.
- **Every consumer in the tree is migrated by the same change.** The stories, the component
  overviews, the unit tests, the demo applications, the admin libraries, the CMS screens and the
  showcase templates take the new form together with the kit.
- **The next release of each changed package is a breaking minor one.** The packages are below
  `1.0.0`, and the kit numbered its last break the same way (`0.50.0`). Its notes carry the
  breaking-change section and name every changed slot with its former and its new form.

## What is out of scope

- **`effect-writes-state` and `prefer-control-flow` of the same task.** Both are code-only edits
  with no change of what a consumer writes or sees; they need no agreement.
- **The slots that stand under no condition.** `[rtExpansionPanelBody]`, `[appListAboveTable]` of the
  showcase list page, `[rtHeaderBell]` of `rt-header`, the slots of the rail inside the page header,
  the start slot of `rt-ai-prompt-input` and every other unconditional slot stay element slots.
- **A new look of any family.** Nothing is redrawn; a mockup is not needed.
- **Consumers outside the tree.** They migrate by the release notes, in their own repositories.

## Contract

Not applicable as procedures: the surface is the markup a consumer writes. Every changed slot, with
the branch it is drawn under.

Named slots — the attribute moves onto an `<ng-template>`:

- **Expansion panel.** `rtExpansionPanelActions` — in the header row outside the toggle while given;
  the chevron leaves the button as now. The panel takes only its own templates, nested panels keep
  theirs.
- **Field.** `rtFieldHint` — while the hint zone shows the hint: without an error, or under one with
  `reserveHintSpace`. The projected hint still wins over the string `hint`.
- **Page header.** `rtRailLogo`, `rtRailPage` — only with `layout="vertical"`, in the rail.
  `rtCompactLeft`, `rtCompactCenter`, `rtCompactRight`, `rtHeaderBell` — only with the horizontal
  layout; the compact strip is in the page through the whole horizontal layout.
- **Chat.** `rtChatHeaderActions` — while the header is shown; `rtChatComposerBar` — while a reply is
  allowed; `rtChatComposerTools` — while the reply field is the messenger one; `rtChatFooter` — while
  a thread is open and its reading has not failed, during loading too, as now.
- **Side menu row.** `rtSideMenuSubItemAction` — in the row at depth zero when that row is a link.
  A folder row and the rows of its children draw no action.
- **CMS list page.** `rtCmsListToolbarLeft`, `rtCmsListToolbarRight` — on their sides of the
  toolbar, before the search and before the reload.
- **Showcase list page.** `appListToolbarLeft`, `appListToolbarRight` — on their sides of the toolbar.

Former default slots — a named template:

- **Menu.** `rtMenuContent` — while the panel is open. The table's row actions keep their form: the
  table puts the consumer's `rtTableRowActions` template into `rtMenuContent` itself, in the row and
  in the card view.
- **Icon button.** `rtIconButtonContent` — while the button has neither an icon nor a glyph and is
  not loading.
- **Breadcrumbs.** `rtBreadcrumbsContent` — after the heading in the heading look with a current page.
- **Table sort header.** `rtTableSortHeaderContent` — drawn once: inside the sort button when the
  column sorts, as plain content otherwise.
- **Side panel.** `rtAsideContent` — while the panel is not empty.
- **Skeleton wrapper.** `rtSkeletonWrapperContent` — while not loading.
- **Dynamic list.** `rtDynamicListContent` — while the list is neither loading for the first time,
  nor failed, nor empty.
- **Money row.** `rtMoneyRowContent` — while not loading.
- **Info item.** `rtInfoItemContent` — while not loading.
- **Admin list page.** `adminListPageContent` — while the page shows no read fault.

The dynamic selector list is a deprecated inner part, and its default slot is the kit's own add
button: it takes the button as an input from the selector and the typed-rows field, drawn while the
action bar is shown. No consumer writes a new name for it.

Before and after, on a named and on a default slot:

```html
<!-- before -->
<rt-field label="Сумма">
    <rt-input-number />
    <span rtFieldHint>Без НДС</span>
</rt-field>
<rt-menu ariaLabel="Действия"><rt-menu-item label="Удалить" /></rt-menu>

<!-- after -->
<rt-field label="Сумма">
    <rt-input-number />
    <ng-template rtFieldHint>Без НДС</ng-template>
</rt-field>
<rt-menu ariaLabel="Действия">
    <ng-template rtMenuContent><rt-menu-item label="Удалить" /></ng-template>
</rt-menu>
```

A condition of the consumer moves inside the template: `@if (draft) { <span rtChatComposerBar> }`
becomes `<ng-template rtChatComposerBar>@if (draft) { <span> }</ng-template>`.

### Refusal codes

Not applicable: a slot answers by drawing or not drawing, not by a code.

## Data

Not applicable: slots keep nothing. The state of a slot's content lives in its own components and
leaves with them when the branch closes.

## Screens and states

No screen of its own; every family looks as before. What differs is visible in the page tree and in
the console of development mode, not on the screen.

| state                                     | what the page holds                                 |
| ----------------------------------------- | --------------------------------------------------- |
| branch of a slot closed                   | no node and no component of the slot's content      |
| branch of a slot opened                   | the content of every template of the slot, in order |
| branch closed again                       | the content gone; its state lost                    |
| expansion panel collapsed                 | the body node in the page, hidden and inert         |
| field or detail row loading               | the skeleton shown, the consumer's content hidden   |
| element marked by a named slot attribute  | nothing drawn; a warning in development mode        |
| menu item written outside `rtMenuContent` | nothing drawn; a warning in development mode        |

## Cross-cutting requirements

### Locales

Not applicable: the kit adds no text to the screen; the content arrives from the consumer in its
language. The development warning is a message to a developer, not a label.

### SEO

A slot in a closed branch was not in the page before either, so a search engine loses nothing. The
body node of the expansion panel is now in the page while collapsed, so the expansion panel's line
"an owner needing the text for a search engine gives the body by the marked node" becomes true.

### Mobile layout

The vertical page header is chosen by the `layout` input, not by the width, and the messenger field
of the chat by its own input; no slot here follows the width. Switching `layout` on a live page
destroys the content of the bell and compact templates and builds the rail templates, and back: the
state inside them does not survive the switch.

### Several objects

The slots of one component are independent: one branch opening does not create the content of
another. Nested panels keep their own actions and their own body, as now.

The list pages of the CMS client and of the admin libraries keep their rules in their own specs:
the toolbar of the CMS list page takes its filters and actions as templates (`SC-CMS-81`), and the
table of the admin list page is the template `adminListPageContent`, not built under a refusal
(`SC-MB-456`).

## Decisions

- **Slots under a condition become template slots.** The owner's answer to "how to take the slots
  out of the conditions": «Слоты через ng-template». Rejected: leaving the finding — the epic does not
  turn the doctor's rules off; keeping the element slot outside the condition and hiding it — the
  content would still be built.
- **Every slot under a condition, not only the ones the doctor finds.** The owner's answer: «Все
  слоты в условиях». The doctor does not read an else branch, and a count of its findings is not the
  boundary of the defect.
- **The expansion panel body is created at once.** The owner's answer: «Тело создаётся сразу». The
  form fields of a collapsed panel already stand in the outer form, and a template would take them
  out of it while collapsed.
- **The sort header label is a template.** The owner's answer: «Шаблон rtTableSortHeaderContent».
  Rejected: a string input of the label — lighter for the plain-text columns, but a second form of
  one slot.
- **Several templates of a slot are a list.** Taking the first would drop the second filter of the
  CMS items screen and the second bell of the header end without a trace.
- **The former form warns and is not kept working.** The owner chose templates; a selector of the
  former form left working would keep building the content of a closed branch.
- **A breaking minor release.** Below `1.0.0` a break moves the minor number, as the kit did at
  `0.50.0`; `1.0.0` is a decision about stability nobody asked for here.
- **The rail slots and the header bell keep their names in both forms.** `rt-page-rail` is not
  exported: its element slots `[rtRailLogo]` and `[rtRailPage]` are fed by the page header, and a
  consumer only ever writes the template form. `[rtHeaderBell]` stays an element slot of `rt-header`,
  under no condition, and is a template slot of `rt-page-header`; each component's overview and the
  bell's overview show the form of the component it is put into.
- **The field and the detail row keep their content under the skeleton.** A template cannot carry
  their own projection to `rt-skeleton-wrapper`, and the field's control has to stay in the form
  while loading.

- **The slot directives of the page header and of the showcase list live in their components'
  files, those of the chat next to its state templates.** A file of several directives would add a
  finding of a file named apart from its class, a file of one directive one of a missing neighbouring
  spec, and the threshold of the doctor lets no rule grow.
- **A menu item of the template is told by its place in the panel.** The content query of the menu
  sees the items of the template while the panel is open, so only an item outside the panel warns.
- **The CMS client runs its specs against the kit of the tree.** The kit it installs is a published
  version without template slots; the specs already ran against the contract of the tree the same
  way.

## Open questions

None.

## History of changes

- 2026-11-22 — the agreement written by the grill of task RT-3479, before the code; revised the same
  day by the owner's answers on the panel body, on the else branches and on the sort label.
- 2026-11-22 — merged into the spec of the second kit by the last commits of RT-3479, the bindings
  written by the code.
