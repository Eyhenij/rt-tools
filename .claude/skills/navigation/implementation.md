# navigation — what is this tree's own

The names and bindings of this tree, next to the rule `SKILL.md`.

The admin panel menu here is flat: one list of items, one level, no second-level panels. There
are four sections — incident reviews, proposals, tree summaries and invitations — and each is
declared by one declaration entry and by routes of its own. They stand in the page's top row,
drawn by the kit; there is no left column with tiles in the shell. There are no rights in the
admin panel at all — neither roles nor presets — so of the rule's two-layer gating only one layer
works here: signed in or not.

## What it is called here

- **In the rule** — Here
- **the item declaration** — `ADMIN_MENU` in `menu.declaration.ts`, the item type — `IAdminMenuItem`
- **a menu item** — the record `{ title, path, icon }`; `icon` is `IRtIcon.Name` from the kit
- **a section with a panel** — there is no such thing here: the menu has one level
- **a second-level panel** — there is no such thing here: in the kit's row it is opened by an item with columns, and no item has columns
- **the unseen sign** — there is no such thing here
- **the flag "the screen does not exist yet" (`disabled`)** — there is no such thing here: an item is started together with its screen
- **the admin panel shell** — `AdminContainerComponent` over `rt-container` from the kit
- **the application header** — `AdminHeaderComponent`: the application name as a word and the kit's row next to it
- **the menu rendering** — `rt-page-header` in the frame's header zone, not tiles in the left column
- **highlighting the current section** — `routerLinkActive` inside the kit's row: an item carries an address, and the one whose address is open lights up
- **the profile popup** — the header template drawn by the kit's row: the signed-in person's name, the theme, the language, signing out

## Where it lives

- **the menu declaration** — `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts`
- **the shell with the menu** — `libs/message-bus-admin/common/container/feature/src/lib/admin-container.component.ts`
- **the addresses of the cargo sections** — `libs/message-bus-admin/postmortems/shell/src/lib/postmortems.routes.ts`, `.../proposals/shell/src/lib/proposals.routes.ts`, `.../summaries/shell/src/lib/summaries.routes.ts`
- **the addresses of the invitations section** — `libs/message-bus-admin/invites/shell/src/lib/invites.routes.ts` — the list and the creation panel in the `ro` outlet
- **the application addresses** — `apps/message-bus-admin/src/app/app.routes.ts`
- **the addresses of the sign-in domain** — `libs/message-bus-admin/auth/shell/src/lib/auth.routes.ts`
- **the page frame from the kit** — `projects/ui-kit-v2/src/lib/components/container/rt-container.component.ts` and its directives
- **the admin panel header** — `libs/message-bus-admin/common/container/ui/src/lib/header/admin-header.component.ts`
- **the end-to-end address specs** — `apps/message-bus-admin-e2e/src/sign-in.spec.ts`, `apps/message-bus-admin-e2e/src/shell.spec.ts`, `apps/message-bus-admin-e2e/src/shell.narrow.spec.ts`
- **the top row from the kit** — `projects/ui-kit-v2/src/lib/components/page-header/`

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section "How the law applies
here" (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **An item is declared once and serves as the source of both the menu and route gating.** — `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts:ADMIN_MENU` — the source of both: the header draws the items open to the person, and `libs/message-bus-admin/auth/shell/src/lib/section-access.ts:sectionRightGuard` reads the right of the section from the same record. The address is declared once as well and read by both sides: `libs/message-bus-admin/postmortems/shell/src/lib/postmortems.routes.ts:POSTMORTEMS_ROUTE` — the route constant, and the menu item takes that same one.
- **The declaration imports no `shell`.** — `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts:IAdminMenuItem` — there is exactly one import in the file, `IRtIcon` from the kit. It is held by the boundaries: `common/container/util` is marked `type:util` and has no edge to `type:shell` — `eslint/boundaries/`.
- **Gating has two layers: the user right and the section flag.** — There are two layers here as well, and the second is another: `apps/message-bus-admin/src/app/app.routes.ts:appRoutes` closes everything except the sign-in screen by a sign-in, and inside that closed branch every section is closed by the right of its item. The flag "the screen does not exist yet" the tree has not got: an item without a screen is not started at all. Checked by a click: `apps/message-bus-admin-e2e/src/sign-in.spec.ts` — a direct section address without sign-in leads to the sign-in, and after signing in a person lands where they were going.
- **Domain data comes into the header by a token, not by an import.** — Here it is otherwise: `libs/message-bus-admin/common/container/feature/src/lib/admin-container.component.ts:AdminContainerComponent` takes the signed-in person by a direct import of the sign-in domain store. There is no token for this — the domain that gives the header its data is exactly one, and a second answer to "who signed in" would diverge from the first. A token is started when the header needs a second domain.

## What else is worth knowing when reading the code

- The sign-in screen stands outside the shell rather than as a section inside it: there is
  nothing to show the menu and the header to someone not signed in. Hence the order in
  `app.routes.ts` — first `authRoutes`, then the closed branch.
- The empty section that stood in the menu before the first real one is removed together with
  it: an item without a subject lived in the shell's shared domain, because a domain of six
  layers under an empty screen would have given six libs with nothing to fill them with.
- The column settings panel is the fourth address in the `ro` outlet, and it has no section: the
  kit panel takes the configurable table from its own registry rather than from the address. It
  is taken from the shell lib
  (`libs/message-bus-admin/common/container/feature/src/lib/admin-columns-aside.ts`) rather than
  imported by the routes directly: a dynamic import of the kit from the first build drags the
  whole kit into it, and the build is refused by the weight limit.
- An item and its screen are started by one edit. An item started ahead of its screen differs
  from a removed one only in that a person lands in emptiness — the kit draws no unavailable
  items for the admin panel.
- The shell does not compute the highlighting of the current section at all: it used to hold a
  derived value over the router events, and that was a second answer to the question about the
  address. The item hands the kit's row an address, and the one whose address is open lights up —
  that is decided by the router inside the kit.
- The row's narrow layout is started by the kit: on a narrow screen the inline row hides whole,
  and the same four items open by a button. The admin panel header writes no narrow layout of its
  own.

## What this is checked by

- `pnpm exec nx build message-bus-admin` — the deferred loading of sections breaks on a wrong
  barrel earlier than on a wrong address.
- `pnpm exec nx lint message-bus-admin` — the boundary rules catch an import of `shell` into the
  declaration.
- `pnpm exec nx run message-bus-admin-e2e:e2e` — the end-to-end suite: a section opens by a
  direct link, survives a reload and comes back the same after a closed panel; the item
  highlighting, the profile popup and the row's narrow layout are checked there too.
- The rule gate demands this rule on the menu declaration, on the shell and on any address file
  of the admin panel — a branch in `.claude/rt-kit/gate-map.sh`.
