# Scenarios — the design of the kit

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were not
changed at the move into the subdomain: the titles of the tests refer to them.

What a scenario is covered by is said under it. Where the run does not cover a scenario, that is said
openly.

### SC-UKV-35 — the mark of the consumer repaints the kit without an edit of the kit

Given the consumer plugged in the file of the tokens of the kit and declared their own steps of the brand
after it
When the page is drawn
Then the action, the link and the border at a focus are taken by the colour of the mark, and the files of
the kit did not change

Not covered: the substitution of the custom properties is counted by the browser, and the specs of the kit
go in jsdom — there `var()` is not resolved at all. Confirmed by a measurement in the browser on the
showcase: the line of a green mark is declared over the file of the tokens, the action, the hovering and
the link took its steps.

### SC-UKV-36 — the transparent shades of the mark and the ring of the focus go after the brand in both themes

Given the consumer declared the steps of the brand by a colour different from blue
When the same page is shown in the light theme and in the dark one
Then the backing of the action and the ring of the focus in both themes are taken from the mark of the
consumer, and not a single blue shade from the kit is left on them

Not covered: for the same reason as `SC-UKV-35`. Confirmed by a measurement: at a green mark the backing of
the action and the ring of the focus took its shares of 24% in the light theme and 32% in the dark one, and
there was no blue left in the kit at all — the palette is lifted.

### SC-UKV-37 — a switched-off button is painted by the palette and answers the dark theme

Given a switched-off button of the kit stands on the page
When the page is shown in the dark theme
Then the ground and the label of the button are taken by the appointments of the dark theme, not by a value
sewn in at the place of the reference

Not covered: it cannot be closed by a test — it is judged by the run of the references of the showcase and
`pnpm run check:tokens-theme`: the switched-off button is painted by an appointment that has an answer of
the dark theme. Both runs are green.

### SC-UKV-38 — a reference to a token that is not declared and not named a handle fells the check

Given there is an address in the styles of the kit to a token that is declared by no layer of the design and
that is not in the list of the handles of the consumer
When the check of the design goes
Then the check names the name of the token and the place of the address and refuses

Not covered: it cannot be closed by a test — it is judged by `pnpm run check:tokens-graph`, which sets a name
apart into a declared one, a handle and a dead reference. The run is green.

### SC-UKV-39 — a handle of the consumer keeps the spare value

Given a token is named a handle of the consumer and is listed in the contract of the kit
When the check of the design goes
Then an address to it with a spare value is not counted a refusal, and the same address to a name outside the
list is counted one

Not covered: it cannot be closed by a test — it is judged by the same `pnpm run check:tokens-graph` by the
list `tools/tokens-handles.json`. The run is green.

### SC-UKV-40 — a common token declared by the styles of a component fells the check

Given the styles of one component declare a token with a common name at the root of the page
When the check of the design goes
Then the check names the file and the name of the token, and the same declaration in the layer of the design
and a declaration of a property of the component itself pass

Not covered: it cannot be closed by a test — it is judged by the same `pnpm run check:tokens-graph`: a common
name at the root of the page from the styles of a component it refuses, the name of its own block it lets
through. The run is green.

### SC-UKV-41 — a literal in the layer of the appointments fells the check

Given an appointment is declared by a value at the place, not by a step of a scale
When the check of the design goes
Then the check names the name of the appointment and refuses, and the same value in a scale passes

Not covered: the set of the check of the literals is the styles of the components, and the layer of the design
is not in it. The literals from the appointments are lifted, but nothing hinders them from coming back: six
transparent shades repeating the codes of the colour of their own steps were found by the eyes, not by the
run. A widening of the set is a task of its own.

### SC-UKV-42 — a colour appointment without an answer of the dark theme fells the check

Given the light theme appoints a colour, the dark one does not override it and the reason why the colour is
common is not named
When the check of the completeness of the dark theme goes
Then the check names the name of the appointment and refuses; a named reason lifts the refusal

Not covered: it cannot be closed by a test — it is judged by `pnpm run check:tokens-theme`, which reads the
mixin of the dark theme, not the root of the page. The run is green.

### SC-UKV-43 — a new literal in the styles of a component fells the linter

Given a code of a colour or a size as a number appeared in the styles of a component of the second kit
When the linter of the styles goes
Then it names the file, the line and the property and refuses

Not covered: it cannot be closed by a test — it is judged by `pnpm run check:tokens-styles` by its own config
of stylelint. The run is green.

### SC-UKV-44 — an accumulated literal is skipped while it stands in the list of what is accepted

Given a place with a literal is entered into the list of what is accepted at the switching on of the check
When the linter of the styles goes
Then the run is green, and the number of the accepted places is named in the summary

Not covered: it cannot be closed by a test — it is judged by the same `pnpm run check:tokens-styles` by the
list `tools/tokens-styles-allowlist.json`. The run is green.

### SC-UKV-45 — a record of the list of what is accepted that nothing answers to any more fells the check

Given a place with a literal is fixed, and the record about it stayed in the list of what is accepted
When the check of the styles goes
Then it names the extra record and refuses — the list only shrinks

Not covered: it cannot be closed by a test — it is judged by the same check: a record that nothing answers to
any more fells the run. The run is green.

### SC-UKV-46 — the look of the kit is kept, apart from the named exception

Given the work on the design is finished
When the checking of the frames of the showcase against the references goes
Then only the frames of the switched-off button diverge, and their references are reshot by a separate change
with a named reason

Not covered: it cannot be closed by a test — it is judged by the run of the references of the showcase. 447
frames are green, there are no orphaned references.

### SC-UKV-47 — a pair "a text and a ground" that does not take the threshold fells the check

Given a pair of a colour of a text and its ground with a contrast below 4.5:1 is created in the appointments
When the run of the counter of the contrast goes
Then the run is red, the names of both appointments, the counted ratio and the theme it was counted in are
named

Not covered: it cannot be closed by a test — it is counted by `pnpm run check:tokens-theme` by the list of the
pairs `tools/tokens-contrast-pairs.json`; the completeness of the list is not judged by a machine, it is judged
by the owner at the taking apart.

### SC-UKV-48 — the controls of one size coincide in height

Given a button and a field of input of one size stand in one row
When the height of both is taken by a measurement in the browser
Then the numbers coincide, and both are taken from one scale of the heights

Not covered: the height is counted by the browser, and there is nothing to take it by apart from a measurement
on the showcase. Confirmed by a measurement in both themes with the transition lifted: at `sm`, `md` and `lg`
the button, the icon button, the field and the number field give 32, 40 and 48 pixels, the button and the icon
button take also 56 and 64 at `xl` and `2xl`, and not one of the numbers diverges between the themes.

### SC-UKV-49 — a component set from outside consumes only its own properties

Given a component that has a set of properties of its own created
When the consumer declares one of them over the kit
Then exactly what is named by that property changes, and not a single place of the component is left on an
appointment past the set

Not covered: it cannot be closed by a test with an identifier — it is judged by a check and a measurement, not
by a spec. The second half of the promise is closed by `pnpm run check:tokens-styles`: a step of the rounding,
of the shadow, of the thickness of a border or of the length taken in the styles of a component directly fells
the run, and at a violation laid under it it is red. There is nothing to take the first half by with a run —
it is closed by a measurement on the showcase, the page `Foundation / Design Tokens / Component Props`: at the
button under `--rt-btn-radius` the rounding goes 10, 0 and 9999 pixels at an unchanged height of 40, and under
`--rt-btn-height` the height goes 40 and 56 at an unchanged rounding of 10.

### SC-UKV-50 — a rule of the application overrides a rule of the kit without a count of the specificity

Given the application declares a rule of the same specificity as a rule of the kit, and outside the layer of the
cascade
When the page is drawn
Then the rule of the application works, and a walk of a foreign layout was not needed for that

Not covered: it cannot be closed by a test — it is judged by `pnpm run check:cascade-layer`: a file of styles
outside a sublayer fells the run. At a consumer it is held by the note about the transition.

### SC-UKV-51 — a typo in the name of a token fells the build of the layer of the design

Given the source of the design refers to a name of a token that is not in it
When the layer of the design is put together
Then the build is red and names the name, and the put-together files are not rewritten

Not covered: it cannot be closed by a test — the checks of the tree have no tests, and they are accepted by a
violation laid under them. Confirmed twice. The name `--rt-neutral-50` in the source was replaced by
`--rt-neutrl-50`: `node tools/build-tokens-v2.mjs` gave back one, named the referring appointment and did not
touch the put-together file. A value edited by hand in the put-together file `pnpm run check:tokens-build`
named by the file and gave back one; after the rolling back both commands are green.

### SC-UKV-129 — a transition whose ends come out one paint fells the check

Given the styles of the kit hold a gradient written with two or more different ends
When the ends are resolved in each of the four looks
Then a look in which they all come out one paint fells the run, and the refusal names the file, the line, the
look and the paint

Covered: `tools/tests/check-gradient-stops.test.sh` — twenty-two cases, called by `pnpm run test:checks`.
