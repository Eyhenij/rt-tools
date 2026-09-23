# The settings of the kit and the theme

**Status:** proposed · **Revision:** 2026-09-23 · **Scenario prefix:** `SC-UKV`
**Depends on:** the design of the kit — [the sign of the theme at the root of the page and the
scale of the colour](../../tokens/spec.md); the service of the platform and the storage of the
core package; the handing out of the labels of the kit as the sample of the form
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

## Why

An application sets the look of the kit at the start: in which theme the first painting goes, by
which palette the roles are coloured, what a button and a curtain look like where nobody said
otherwise. The second kit has half of that. It has a theme service with two states and a handing
out of the labels; it has no settings of its own at all, so an application that wants every curtain
to ignore Escape or every button to be large repeats that at every call and differs from itself in
the one place that was missed.

The theme of the second kit cannot do three things the first one can: follow the setting of the
machine, take a palette from the application at run time, and stand on one node apart from the
page — a dark card inside a light page. All three are the same subject as the settings: the theme
takes its start value from them.

The subdomain names what the application sets, in which order the answers are picked, what survives
a reload and where the kit is obliged to refuse loudly instead of drawing something nobody asked
for.

## Terminology

- **The settings of the kit** — one object the application hands the kit at the start: the common
  defaults and the defaults of the nodes. Every field of it is optional.
- **A common default** — a value that holds for the whole kit: the theme of the start and the name
  of the colour set.
- **A default of a node** — a value that holds for one family of the kit: the button, the curtain.
- **An input at the place** — what the markup of the application says at one call of a node.
- **The snapshot of the start** — the settings as the kit reads them: once, at the moment a node is
  created. The theme is not a snapshot; it is the second thing this subdomain is about.
- **The theme** — one of three: the light one, the dark one, and "follow the machine".
- **The sign of the theme** — `data-theme='dark'` at the root of the page and the class
  `rt-theme-dark` equal to it. The sign is declared by [the design of the
  kit](../../tokens/spec.md); this subdomain says who puts it and when.
- **The setting of the machine** — what the browser answers about the dark look being preferred.
- **A colour set, a palette** — the steps of the six roles of the kit, given by the application
  under a name of its own: the brand, success, the warning, the danger, the reference, the neutral.
- **A step of the scale** — a token carrying a value. An appointment refers to a step; the boundary
  between the two is drawn by [the design of the kit](../../tokens/spec.md).
- **A row of a role** — the steps the kit declares for that role. A number outside the row colours
  nothing: no appointment refers to it.
- **A local piece of the theme** — a subtree drawn in a theme of its own while the page around it
  stays in the theme of the page.

### What it is called in the interface

A person sees no settings, no palette and no name of a role. They see the page in the light or the
dark look, the colours of the palette their application registered, and the look of a button and a
curtain the application chose for the whole kit. The only handle they touch is the switch of the
theme.

## Rules

### The settings

- **The kit works when the application gives no settings at all.** Every field is optional, and a
  field nobody named is answered by the default of the kit. A handing out demanded before the first
  painting makes the kit unusable in a test, in a showcase and in an application that only wants one
  component of it.

- **The look of a node is resolved from the particular to the general: the input at the place, the
  default of the node, the common default, the default of the kit.** The first answer found wins,
  and the search stops there.

- **A field the settings do not name falls through to the next level, and an object given in part
  does not blank the rest.** The application that named the size of a button says nothing about its
  look by that, and the look stays what the kit draws.

- **The settings are read once, when a node is created.** They are the snapshot of the start: a
  replacement of the settings after the first painting does not repaint what is already drawn. An
  application that needs a look changed on a live page changes it at the place of the call, not in
  the settings.

- **A default of a node is promised only for a look the node already takes as an input.** The
  settings do not invent a handle the family has no answer for: the button of the second kit is set
  by its look, its size and its roundedness, and a field named by the first kit that the second has
  no input for is not carried over.

- **An input written in the markup wins over the settings, and the settings change nothing the
  markup already says.** Otherwise the application reads its own template and gets a look it does
  not see there.

- **Only the button and the curtain carry defaults of their own.** A third family gains a field when
  a consumer asks for it: a set of empty fields for families nobody set promises answers the kit
  does not give.

### The theme

- **The theme has three states: the light one, the dark one and "follow the machine".** The third is
  a choice on a par with the two, not the absence of a choice.

- **"Follow the machine" resolves into one of the two looks, and the kit puts no third sign at the
  root of the page.** The design of the kit knows the dark sign and its absence; a third sign would
  demand a third set of answers from every appointment.

- **What is kept is the choice, not the look it resolved to.** "Follow the machine" written down as
  the dark look stops following the machine at the first reload, and nothing on the screen says why.

- **A choice already kept wins over the common default of the settings.** The settings say where a
  person who has chosen nothing starts; a person who has chosen once does not have their choice
  taken away by a new release of the application.

- **A kept value the kit does not know is ignored, and the settings answer instead.** A word left by
  a previous edition of the kit or by a hand in the browser console is not a choice.

- **While "follow the machine" is chosen, a change of the setting of the machine reaches the page
  without a reload.** A setting read once at the start turns the third state into a fourth way of
  writing down the look of that minute.

- **Everything derived from the theme is recounted when the theme changes.** The theme is the one
  thing here that changes on a live page, and that is why it lives as a signal while the settings
  live as a snapshot.

- **Where there is no window, the kit neither reads the keeping, nor writes it, nor puts the
  sign.** A painting on the server has no machine to ask and no device to remember: it goes in the
  light look, and the choice arrives when the browser takes the page over.

### The colour set

- **A registered palette writes the steps of the scale and never the appointments.** The value lives
  in the step, the appointment refers to it — that is the boundary [the design of the
  kit](../../tokens/spec.md) stands on. A palette allowed to write an appointment would repaint one
  place and leave the dark answer of the same appointment as it was.

- **A palette names only the six roles of the kit and only the steps of their rows.** The roles are
  the brand, success, the warning, the danger, the reference and the neutral; the steps are the ones
  the kit declares for that role.

- **A palette that named something else is refused by name, and nothing of it reaches the
  document.** An unknown role and a step outside the row are named in the refusal together with the
  name of the palette. A palette accepted in part paints half the screen and leaves the other half
  on the former colours — and it is read as a defect of the design, not as a mistake in the call.

- **Registering a palette does not put it on.** An application registers what it may need and
  chooses what stands now by a separate word; a registration that paints at once takes from it the
  right to prepare two palettes and switch between them.

- **A palette registered a second time under one name replaces the first one, and one rule stands at
  the root.** Two rules of one name leave the outcome to the order of the two calls, and that order
  is decided by whichever module was loaded first.

- **The name of the chosen palette survives a reload; the palette itself does not.** The colours
  belong to the application, and it registers them at every start. A remembered name nobody
  registered this time leaves the kit on its own steps, and the name is not forgotten because the
  application may register it a moment later.

- **A registration where there is no window writes nothing and refuses nothing.** The palette
  reaches the page when the browser takes it over; a refusal here would fell the painting on the
  server for a reason that has nothing to do with the painting.

### The local piece of the theme

- **A node carrying a theme of its own draws its subtree in it, and the page around it stays as it
  was.** A dark card in a light page is one node, not a second page.

- **The piece works in both directions.** A dark card inside a light page and a light card inside a
  dark one are the same need: the showcase already draws the two halves side by side and hangs both
  sets on its own classes by hand for it. A piece that only darkens leaves the second half of that
  need to the markup of the consumer.

- **The mark at a node switches the whole set of the properties, not a part of it.** The grounds,
  the text, the borders, the shadows and the rest go over together. A piece that repaints the ground
  alone reads as a defect of the layout at the first shadow that stayed from the other theme.

- **The nearer mark wins over the farther one.** A light block inside a dark card is the same
  question asked twice, and the answer is the one standing closer to the node that asks. A mark
  repeated inside a node of the same mark changes nothing.

- **A mark taken off returns the subtree to the theme of the page.** An empty value of the mark is
  not a theme and puts no sign at all.

- **The local piece touches neither the choice of the person nor the keeping.** It is the markup of
  the application speaking about one place, and it must not be read as "the person switched the
  theme".

- **The sign at a node means the same as the sign at the root.** Which properties the sign switches
  is the word of [the design of the kit](../../tokens/spec.md); this subdomain only puts the sign at
  the node instead of the root.

## What is out of scope

- **The field choosing between Material and the own look.** The word of the owner of the 22nd of
  September: there must be no Material. Neither the common default nor the default of a node carries
  such a field, and the node that reads it in the first kit is not carried over with it.
- **The defaults of the dynamic selectors and of the side menu.** The first family has not arrived
  in the second kit at all, the second is work of its own; both go on the request of a consumer.
- **The switch showing three states.** The switch has two positions, and how it shows the third is
  decided when the owner says so; until then the third state is set by the settings alone.
- **A change of the settings on a live page.** The settings are the snapshot of the start; what has
  to change while the page is open changes at the place of the call or through the theme.
- **Which properties the sign of the theme switches.** That is the design of the kit, and this
  subdomain does not repeat its promises.
- **A move of the applications over to the new handles.** The handles appear; who uses them is
  decided by the applications themselves.
- **The default of the kit for the Escape of the curtain.** It stays what the second kit does today
  — the curtain closes — and the settings only give the application one place to change it.
- **The settings and the theme of the first kit.** It keeps its own settings, its own service, its
  own keys of the keeping and its own sign at the root; nothing is shared with it.
- **The half of the colour set that works at the build.** In the first kit a palette is a pair: the
  service that lays the rule at run time and a mixin of the styles that emits the same rule while
  the styles are built, and the two are held at parity by hand. The second kit has no such mixin and
  cannot have one in that shape: its design layer is not written by hand but put together by a
  generator from a source of its own. A palette known at the build is therefore an ability of that
  generator, and it is work of its own. Carried over here is the run-time half alone: the
  application names its palette at the start, and it lays down as a rule.
- **A frame of the showcase of the first kit for a comparison.** There is nothing to compare
  against: the showcase of the first kit shows neither its theme, nor its local piece, nor its
  colour sets — there is not a single story about that family in it. The second kit takes a frame of
  its own, and the pair of frames the card of the task asks for does not exist.

## Contract

The application hands the kit its settings by one environment handing out at the start, the same way
it hands over the labels. Every field is optional, and the handing out itself is optional.

The service of the theme gives outward: the chosen theme, the look it resolved to, the setting of
the choice, the switching between the two looks, the registration of a palette under a name, the
putting on of a palette and the clearing of it back to the steps of the kit. The local piece of the
theme is a mark the application puts on a node of its markup.

Nothing else leaves the subdomain. The sign at the root of the page, the keys of the keeping and the
names of the steps are not a surface to be set from outside: they are named here so that whoever
reads the design of the kit sees the same words.

### Refusal codes

Not applicable: the kit declares no named codes. The one place that refuses is the registration of a
palette — it refuses by an error naming the palette and the role or the step that was not
recognised.

## Data

The kit keeps two things, each on the device and each under a key of its own namespace: the chosen
theme — the light one, the dark one or "follow the machine" — and the name of the chosen palette.
Both outlive a reload, a sign-in and a sign-out: the theme belongs to the device, not to the person.

The palette itself is not kept: its colours belong to the application, and it registers them at
every start. The settings are not kept at all — they arrive from the code of the application.

A palette is the six roles, and a role is the steps of its row with a colour at each. A row that
names a step the kit does not declare is not a partial palette but a mistake in the call.

## Screens and states

| State                                                        | What is seen                                                                      |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| no settings, nothing kept                                    | the light look, the steps of the kit, the button and the curtain as the kit draws |
| the settings name the dark look, nothing kept                | the dark look from the first painting                                             |
| the dark look is kept, the settings name the light one       | the dark look: the choice of the person wins                                      |
| the kept value is a word the kit does not know               | the look named by the settings                                                    |
| "follow the machine" is chosen, the machine prefers the dark | the dark look; the kept choice stays "follow the machine"                         |
| the setting of the machine changes while the page is open    | the look changes with it, nothing else is asked                                   |
| there is no window                                           | no sign at the root, the light output                                             |
| a palette is registered and put on                           | the six roles are recoloured, the appointments and the dark answers stay          |
| a name of a palette is remembered, nobody registered it      | the steps of the kit; the name is kept                                            |
| a node carries a theme of its own                            | its subtree in that theme, the rest of the page as it was                         |

## Cross-cutting requirements

### Locales

Not applicable: neither the settings nor the theme carry labels. The switch of the theme takes its
words from the dictionary of the kit, as every other family does.

### SEO

Not applicable: the kit draws no public pages.

### Mobile layout

Not applicable: neither the settings nor the theme depend on the width of the window. The setting of
the machine about the dark look is not a width and is asked the same way on every screen.

### Several objects

The tree holds two kits at once, and an application has the right to hold both. They share no
settings, no service of the theme, no key of the keeping and no sign at the root: the first kit
writes its own class, the second its own attribute. An application holding both sets each of them
apart, and a choice made in one does not move the other.

## Decisions

- **The service of the theme of the second kit grows; a second service is not written next to it.**
  One sign of the theme lives at the root of the document, and two services would fight over it at
  every switch. Rejected: a family carried over apart, the way the table was carried over — there
  the road is lawful because the application chooses which table to put, and the service of the
  theme it does not choose.
- **The palette moves over to the names of the second kit.** The roles are the same six; the steps
  are named the way the second kit names them. Rejected: bringing the row of the first kit into the
  second — that is a second set of steps about one and the same thing.
- **The settings get common defaults and defaults of the nodes without the field of Material.** The
  word of the owner. Of the nodes, the button and the curtain stay.
- **A default of a node reaches the node through the value its input starts with, counted from the
  settings when the node is created.** Rejected: an input with no value of its own and a derived
  neighbour beside it, the way the first kit does it — that changes the public shape of the inputs
  of a family already released, and with it its tests and its description. The price of the chosen
  road is named aloud: the settings are read once, and a late replacement does not repaint what is
  drawn.
- **The theme lives as a signal, the settings as a snapshot.** A person switches the theme while the
  page is open; nobody changes the default size of a button while the page is open. Two things of
  one subdomain are arranged differently, and this is why.
- **What is kept is the choice, not the look.** Otherwise the third state degrades into the second
  or the first at the first reload.
- **The default of the kit for the Escape of the curtain is not touched.** The first kit keeps that
  key from closing a curtain by default; the second closes. Changing it here would change the
  behaviour of everyone who already uses the second kit, and the settings give a place to say so
  without that.

## Open questions

- **Which field of the settings stands at the common level and is read by a node.** The field of
  Material stood at both levels in the first kit, and it is not carried over. Today not a single
  field lives both at the level of a node and at the common level, so the middle step of the order
  of four is declared for a field that does not exist yet. Whether the size of the controls becomes
  such a field is asked of the owner; the order itself is not changed meanwhile.
- **Whether the painting on the server is obliged to give the dark output to an application whose
  common default is the dark look.** Today the sign is not put where there is no window, so such an
  application shows a light page until the browser takes it over. Asked of the owner: the answer
  costs an edit of the way the sign is put, not of the agreement.
- **How the switch of the theme shows three states.** Carried over from the grill: it has two
  positions, and there will be three states. It does not hold the work — until the answer, the third
  state is set by the settings alone.
- **Whether the registration of a palette at run time falls under the road [the design of the
  kit](../../tokens/spec.md) rejected.** That subdomain rejected "the setting of the design by code"
  — a handing out and an object of settings over the roles in the styles. A palette is not that: it
  writes the steps of the scale, the same layer the declaration of the brand writes by hand. The
  difference is named here, and the word is the owner's before the merge.
- **Which agreement carries the edit that makes the sign answer at a node, not at the root alone.**
  Today both sets of the properties answer the root of the page and nothing else, so the local piece
  has nothing to lean on until a rule answers the sign at an ordinary node. The price of that edit is
  known and small: both sets already exist whole as two mixins, and the rule is emitted by the same
  generator that puts the properties together. What is unclear is only the place — the edit lives in
  the layer [the design of the kit](../../tokens/spec.md) speaks for, while the promise stands here.

## History of changes

- 2026-09-23 — the agreement is created by the grill of the request of the owner, task RT-1882 of the
  epic RT-1870.
