# Scenarios — the leaving of a route panel

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were not
changed at the move into the subdomain: the titles of the tests refer to them.

What a scenario is covered by is said under it. Where the run does not cover a scenario, that is said
openly.

### SC-UKV-21 — a successful write with a closing does not ask about the edits

Given a panel with the guard of the edits, the form is touched
When the write passed successfully and the panel closes itself
Then the window about the edits does not open, and the leaving of the address of the panel is allowed

### SC-UKV-22 — the permission works for one leaving

Given the panel has already left once by a permission it issued itself, and stands on the screen again
with a touched form
When the leaving is begun not by the panel
Then it is asked about the edits

### SC-UKV-23 — a leaving to a bound record after an agreement to save does not ask a second time

Given the user pressed a link to a bound record at a touched form and answered "close with a saving",
the write passed successfully
When the panel leaves to the bound record
Then the window about the edits does not open a second time, and the leaving is allowed

### SC-UKV-24 — the panel counted under the route of the leaving is asked

Given a panel with a touched form stands on the screen, and a component of a neighbouring outlet arrives
in the guard
When the leaving of the route of the panel goes
Then the panel is asked about the edits, and its answer decides the fate of the leaving

### SC-UKV-25 — a navigation the router rejected leaves no permission

Given the panel issued itself a permission and called the router, and the navigation did not take place
When the next leaving is begun not by the panel at a touched form
Then the window about the edits opens

### SC-UKV-26 — the leaving is allowed when there is nobody to answer about the edits

Given there is no panel in the count under the route of the leaving, and the component from the router
does not know how to answer about the edits
When the leaving of the address goes
Then the leaving is allowed, no refusal arises, and the next navigation goes the same way

### SC-UKV-27 — a panel that left does not ask about the edits

Given a panel with a touched form left the screen
When the next leaving of the address it occupied goes
Then it is not asked about the edits, and the leaving is allowed

### SC-UKV-28 — the panels of two frames do not answer for one another

Given there are two frames on the screen, each with a panel of its own with a touched form, the outlets
are named equally
When the leaving of the route of the first panel goes
Then the first panel is asked about the edits, the second is not asked once

### SC-UKV-29 — a leaving from the side asks about the edits

Given a panel with a touched form is on the screen, the leaving was begun not by it
When a navigation to another address goes
Then the window about the edits opens, and the leaving waits for the answer

### SC-UKV-30 — a panel of a consumer without inheriting the base is asked by the spare road

Given a panel of the application answers about the edits but does not inherit the base class of the kit
and does not get into the count
When the leaving of its route goes
Then it is asked about the edits, the leaving is not allowed silently

### SC-UKV-31 — an answer of a panel that refused cancels the leaving, it does not fell it

Given the answer of a counted panel about the edits refused
When the leaving of its route goes
Then the leaving is cancelled, no refusal of the navigation arises, the panel is taken off the count,
and the next leaving goes by the spare road

### SC-UKV-32 — a repeated leaving at an open window opens no second window

Given the window about the edits is already open by the first leaving
When a second leaving from the same route comes
Then a second window does not open, and both leavings are decided by one answer

### SC-UKV-33 — a leaving during a write is cancelled silently

Given a write goes right now, and the panel has already issued itself a permission to leave
When the leaving of the route of the panel goes
Then the leaving is cancelled, the window about the edits does not open and no message is shown

### SC-UKV-34 — a leaving from the side at a clean form passes without a window

Given a panel is on the screen, the form is not touched
When the leaving is begun not by the panel
Then the window about the edits does not open, and the leaving is allowed

### SC-UKV-52 — a closed panel brings back the screen with its parameters of the address

Given a panel is open over a screen whose page, order and filter lie in the parameters of the address
When the panel is closed by any of the four roads
Then the leaving carries the same parameters, and the screen is seen as it was left

### SC-UKV-66 — the success is put into the signal of the panel, not only into the toast

Given a mutation is started with a text of a message about the success
When it ended with a success
Then the text lies in the signal of the success, and the panel draws it inside itself

Covered: `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.spec.ts`.

### SC-UKV-67 — the toast stays at its own argument

Given a mutation is started with a text of the toast and without a text of a message
When it ended with a success
Then the toast is shown by the bus, and the signal of the success is empty: the argument of the toast
does not move into the panel

Covered: `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.spec.ts`.

### SC-UKV-68 — both signals go out at the start of every attempt

Given the outcome of the past mutation lies on the panel — a success or a refusal
When a new mutation is started
Then both signals are empty: otherwise "saved" would stay next to a fresh refusal

Covered: `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.spec.ts`.

### SC-UKV-69 — a refusal puts the success out, and a success puts the refusal out

Given the first mutation ended with a success, the second with a refusal
When the outcome of the second lay into the signal
Then the signal of the success is empty: these are answers to one question, and there are never two at
once

Covered: `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.spec.ts`.

### SC-UKV-70 — a panel of an edit stays open after a success

Given the panel is open with an identifier of a record in the address, the argument about the closing is
not named
When the mutation ended with a success
Then the panel does not close: it is closed by a person

Covered: `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.spec.ts`.

### SC-UKV-71 — a panel of creating closes after a success by the default

Given the panel is open without an identifier of a record, the argument about the closing is not named
When the mutation ended with a success
Then the panel closes: there is nothing to create in a closed panel

Covered: `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.spec.ts`.

### SC-UKV-72 — a named argument about the closing is above the mode of the panel

Given a panel of creating, and the mutation is named with the argument "not to close"
When it ended with a success
Then the panel stays open; the other way round — a panel of an edit with the argument "to close" closes

Covered: `projects/ui-kit-v2/src/lib/components/container/rt-route-aside.base.spec.ts`.
