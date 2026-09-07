# The leaving of a route panel

**Status:** in force · **Revision:** 2026-08-17 · **Scenario prefix:** `SC-UKV`
**Depends on:** the window about the unsaved edits and its three outcomes; the frame `rt-container` and
its right panel; the ro-routes of the application-consumer
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

## Why

The panel of the kit lives in an ro-outlet, and it can be left by four different roads: by the closing
from inside, by a transition to a bound record, by an item of the menu and by the button "back" in the
browser. The window about the unsaved edits at that is obliged to open exactly where the edits may
disappear — and not to open where the leaving was begun by the panel itself.

The subdomain names whom the router guard asks about the edits, what a permission to leave differs from
silence by and in which place a leaving is cancelled instead of carrying a touched form away.

## Terminology

- **The leaving of a panel** — a navigation lifting the ro-outlet of the panel: the closing, the
  transition to a bound record, an item of the menu, the button "back" in the browser.
- **The router guard** — the check the router calls at a leaving of the route of the panel.
- **The guard of the buttons** — the road of the closing inside the panel itself: its two buttons, a
  press past it and Esc.
- **The count of the panels** — the list of the panels standing on the screen kept by the kit; every
  record is marked by the route of its panel, and from it the router guard learns whom to ask.
- **The route of the leaving** — the route the router is leading away from now and for the sake of which
  it calls the guard.
- **The permission to leave** — the sign that the leaving was begun by the panel itself and there is no
  need to ask about the edits.
- **A level without a component** — a route declared for the sake of the common dependencies of a branch
  and having no component of its own.
- **A bound record** — another record the panel leads to by a link inside itself.
- **A panel on the screen** — a panel from the moment it stood into the outlet until the moment it left
  it or was destroyed. A live object of a component does not by itself make a panel on the screen: a
  panel whose overlay has not stood yet, and a panel playing out its leaving, do not stand on the screen.

- **A mutation** — a write started by the panel: a saving, a deleting, a change of the state.
- **The outcome of a mutation** — the answer to the question "did it work out": a success or a refusal.
  Exactly one of them is true at a time.
- **The mode of creating** — a panel opened without an identifier of a record in the address.

### What it is called in the interface

A person sees only the window "unsaved edits" with three answers — it stays the former one. Neither the
count of the panels nor the permission to leave is shown in the interface and neither has a name.

## Rules

- **A panel that began a leaving itself does not ask about the edits.** The question would be asked about
  edits that are not there any more: the panel begins the leaving after the write has passed, or after
  the user has already answered what to do with the edits.

- **The permission is issued at one point — before the panel calls the router.** Issued earlier, it lives
  all the time the panel is playing out its leaving from the screen, and falls to a foreign leaving that
  comes into that window — a touched form would go away without a question. One point of the issuing
  covers at the same time all the leavings begun by the panel: the closing after a write, the transition
  to a bound record, the leaving at a record that was not found and the leaving after an unsuccessful
  refreshing.

- **The permission works for exactly one leaving and does not outlive a navigation that did not take
  place.** The router rejects a navigation silently, and another guard can cancel it; a permission left
  issued would take the question about the edits off the next leaving, which the panel did not begin. That
  is quieter and worse than the original defect: the user would lose the edits without a single signal.

- **About the edits the panel counted under the route of the leaving is asked.** The component the router
  put into the guard is not a panel when the ro-route lies under a level without a component, and the
  answer of such a component has nothing to do with the edits. The count is marked by the route, not by
  the order of the putting: the guard stands at every ro-route, and one navigation calls it for every
  leaving route separately — without the mark one panel would answer for a foreign leaving, and two calls
  would open two windows in a row.

- **A panel that is not in the count but that knows how to answer about the edits is asked all the same.**
  The router guard is taken outside the kit, and a panel of a consumer can answer about the edits without
  inheriting the base class of the kit; such a panel never gets into the count. Without this rule the
  question about the edits would disappear at it silently — a quiet loss of the edits at an already
  released surface.

- **The answer about the edits does not depend on whether an intermediate route has a component.** The
  layout of the routes of an application is no ground to ask the question about the edits or not to ask it.

- **A component that does not know how to answer about the edits does not fell the leaving.** A fallen
  navigation leaves the address the former one and locks the application on the panel: the next leaving
  refuses the same way.

- **An answer of a panel that refused cancels the leaving and takes the panel off the count.** To allow
  the leaving would mean carrying away edits it was not possible to ask about; to cancel and leave
  everything as it is would mean locking the application on the panel forever. The taking off the count
  leaves a spare road open: the next leaving will go by the component from the router or will be allowed.

- **A panel answers about the edits while it is on the screen and stops answering after it has left.** A
  panel that left and stayed in the count asks about edits that are not on the screen any more.

- **A leaving the panel did not begin asks about the edits — wherever it came from.** An item of the menu
  and the button "back" carry a touched form away the same as a neighbouring panel.

- **A leaving that came a second time while the window about the edits is open opens no second window.** A
  double press of "back" is an ordinary thing, and there is nobody to remove a second window over the
  first: the road of the closing inside the panel is guarded from that, the road of the router is not.

- **A leaving during a write is cancelled silently.** The write has already gone to the server, and its
  outcome will decide the fate of the panel itself; the question about the edits here would be asked about
  what is about to stop being edits. The sign of a write that goes is older than the permission to leave:
  a panel that issued itself a permission and did not wait for the answer of the server must not leave.

- **The outcome of a mutation the panel shows inside itself.** The answer to a question asked in the panel
  arrives where the question was asked: a person working in the panel looks into the panel, not at the
  screen past its edge.
- **The success has a signal of its own, symmetrical to the signal of a refusal.** The panel reads both in
  the same way and draws both in one place.
- **The signal of the success is filled by an argument of the mutation of its own, not by the argument of
  the toast.** The toast stays with whoever wanted it: the consumer showing the outcome at the edge of the
  screen otherwise has nothing to say that by.
- **Both signals go out at the start of every attempt.** Otherwise "saved" stays on the panel next to a
  fresh refusal.
- **The outcomes put each other out.** A success lifts the former refusal, a refusal lifts the former
  success: these are answers to one question, and there are never two answers at once.
- **A panel of an edit stays open after a successful write.** It is closed by a person — it is they who
  decide whether they edit further.
- **A panel of creating closes after a successful write, while the mutation has not said the opposite.**
  The default is the former one: there is nothing to create in a closed panel.
- **The argument about the closing is above the mode of the panel.** Named openly, it decides in both
  directions: a panel of creating stays open, a panel of an edit closes. Not named — the default is counted
  by the mode.

## What is out of scope

- **The window about the unsaved edits and its three outcomes:** they stay as they are. Only the conditions
  under which the window opens are edited.
- **A message that the leaving is cancelled because of a write that goes:** it would demand a new label in
  all eight locales. The behaviour stays silent.
- **The guard of the buttons:** the road of the closing inside the panel does not change — it asks about
  the edits where it is needed today too.
- **A sign of untouchedness set by the consumer:** the lifting of the question by a mark of the form demands
  work from every consumer and stays silent at whoever did not do it.

## Contract

The surface is three things the kit gives outward: the base class of a panel, the router guard for an
ro-route and the declaration that a panel knows how to answer the question about the leaving. The
application puts the guard on the ro-route and inherits the panel from the base class; nothing more is
demanded of it — neither a registration of the panel by hand nor marks of the form. A panel answering about
the edits without inheriting the base class does not lose the surface: the guard asks it by a spare road.
The count of the panels is not taken outward — it is the inner arrangement of the kit.

The guard answers by one of two: the leaving is allowed or the leaving is cancelled. It has no third answer,
and it never answers by a refusal of the navigation — including when the answer of a panel refused.

### Refusal codes

Not applicable: the guard answers by a permission or a cancel, not by named codes.

## Data

The count of the panels lives in the memory of the application exactly as long as a panel stands on the
screen, and there is no need for it to outlive a reload of the page: after a reload there are no edits in a
form. The count is a service of the application, not a variable of the level of a module: a variable of a
module would outlive a request at the giving out of a page by the server and would turn out to be shared by
two applications raised on one page. One count per application is enough even at two frames on the screen,
because the records are marked by the routes, and the routes of two frames are different even at an equal
name of the outlet.

## Screens and states

The leaving of a panel has no screen of its own; the states are those of one leaving:

| state                                                                           | what happens                                                     |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| the leaving was begun by the panel                                              | the window about the edits does not open, the address changes    |
| the leaving came from the side, the form is touched                             | the window about the edits opens, further the answer decides     |
| the leaving came from the side, the form is clean                               | the window does not open, the address changes                    |
| there is no panel under the route of the leaving, and a component answers       | the component that came from the router is asked                 |
| there is no panel under the route of the leaving, and there is nobody to answer | the leaving is allowed                                           |
| the answer of the panel refused                                                 | the leaving is cancelled, the panel is taken off the count       |
| the window about the edits is already open                                      | a second window does not open, both leavings wait for one answer |
| a write goes right now                                                          | the leaving is cancelled silently, the panel stays on the screen |

## Cross-cutting requirements

### Locales

The labels of the window about the edits are taken from the dictionary of the kit in eight languages and are
not touched by this work. There is no message about the cancel of a leaving during a write on purpose: it
would demand a new label in all eight.

### SEO

Not applicable.

### Mobile layout

Not applicable: the panel and the window about the edits do not change the layout.

### Several objects

There are two owning entities, and both are inside one application: two frames `rt-container` on the screen
and two panels standing at the same time. The count is one per application, but the records are marked by
the routes, so the panel of one frame does not answer for a leaving of the route of the other, even when the
outlets of both are named equally.

## Decisions

- **The guard asks the counted panel, and the component from the router stays a spare road.** A guarding of
  the call at a foreign component removes the fall, but the question about the edits in a layout with a
  level without a component is not asked at all, and a navigation from the side carries a touched form away
  silently. The spare road is kept for the sake of a panel of a consumer that does not inherit the base
  class.
- **The count is marked by the route, not by the order of the putting.** The order would answer the question
  "who stood last", while the guard needs the answer to another one — "who stands at the route that is being
  left". At a leaving of a branch the router calls the guard for every leaving route, and the order would
  give two windows in a row and the answer of the wrong panel.
- **The permission to leave lives on the side of the panel and is issued before the call of the router.** The
  kit closes the case itself, without the participation of the consumer. The point of the issuing was chosen
  after the animation of the leaving of the overlay: earlier — and the permission falls to a foreign leaving
  that came during the animation.
- **The count is a root service of the kit, not an existing service of the frame.** The service of the state
  of the frame is supplied at the level of the component, and the router guard lives in the injector of the
  route and would not reach it at all.
- **The leaving of a panel is checked by unit specs of the count, of the guard and of the base class, not by
  a reproducing of the layout of the routes.** After the move to the count the answer of the guard does not
  depend on which component the router put in — a spec on a layout would check the walk of the router, not
  the kit. The price is named: an early warning about a change of that walk in Angular is lost, and losing it
  is possible exactly because the kit does not lean on it any more.

- **The argument of the signal of the success is set apart from the argument of the toast.** A move of the
  former argument out of the toast into the signal would break every consumer who wanted the toast, and after
  that they would have nothing to say "I need the toast" by.
- **The closing of a panel of creating became governable, it did not stop being the default.** The sign was
  derived from the address and was governed by nothing; the default at that is right, and the task did not
  ask for it to be changed.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## History of changes

- 29 August 2026 — the agreement about the outcome of a mutation was merged, the task RT-985.

- 2026-08-17 — the subdomain was split out of the spec of the domain, which had outgrown the length limit.
  The rules, the scenarios and the bindings of the leaving of a panel moved here as they were: the scenario
  numbers were not recounted.
