# Scenarios — the bar of mass actions

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

The numbering here starts at 199 rather than at the next free number of this branch: 181…198 are
already issued by RT-1879, which stands in a request and is not merged into the epic branch yet.

### SC-UKV-199 — the bar appears as soon as something is picked

Given a holder whose config says nothing is picked
When the config says one row is picked
Then the bar is in the markup

Not covered: the family is written by stage 2 of RT-1880 and its tests by stage 3. The
mark leaves together with the test that closes the scenario, by the same change.

### SC-UKV-200 — nothing picked, no node at all

Given a holder whose config says nothing is picked
When it is drawn
Then there is no bar in the markup

Not covered: the family is written by stage 2 of RT-1880 and its tests by stage 3. The
mark leaves together with the test that closes the scenario, by the same change.

### SC-UKV-201 — zero is shown as a number

Given a bar whose config says zero is picked out of a hundred and twenty-eight
When it is drawn
Then the count stands with both numbers, and the counter is not hidden

Not covered: the family is written by stage 2 of RT-1880 and its tests by stage 3. The
mark leaves together with the test that closes the scenario, by the same change.

### SC-UKV-202 — a plain action does what it carries and closes the bar

Given a bar with an action that carries something to do
When the action is pressed
Then what it carries has run, and the press on the cross has been reported outward

Not covered: the family is written by stage 2 of RT-1880 and its tests by stage 3. The
mark leaves together with the test that closes the scenario, by the same change.

### SC-UKV-203 — an action with a nested list opens it and does nothing else

Given a bar with an action carrying a nested list
When the action is pressed
Then the nested list is drawn, and nothing of the action itself has run

Not covered: the family is written by stage 2 of RT-1880 and its tests by stage 3. The
mark leaves together with the test that closes the scenario, by the same change.

### SC-UKV-204 — an action of the nested list closes the bar the same

Given a bar with an open nested list
When an action of that list is pressed
Then what it carries has run, and the closing has been reported outward

Not covered: the family is written by stage 2 of RT-1880 and its tests by stage 3. The
mark leaves together with the test that closes the scenario, by the same change.

### SC-UKV-205 — the cross reports and closes nothing itself

Given a bar with something picked
When the cross is pressed
Then the closing has been reported outward, and the config is untouched

Not covered: the family is written by stage 2 of RT-1880 and its tests by stage 3. The
mark leaves together with the test that closes the scenario, by the same change.

### SC-UKV-206 — the bar stays in the markup while it leaves

Given a holder with an open bar
When the config says nothing is picked any more
Then the bar is still in the markup and carries the sign of leaving, and it is gone after the
leaving lasts out

Not covered: the family is written by stage 2 of RT-1880 and its tests by stage 3. The
mark leaves together with the test that closes the scenario, by the same change.

### SC-UKV-207 — an action with an icon says so by a modifier

Given a bar with an action that has both an icon and a label
When it is drawn
Then the action carries the modifier the media query of the coarse pointer reaches its label by

Not covered: the family is written by stage 2 of RT-1880 and its tests by stage 3. The
mark leaves together with the test that closes the scenario, by the same change.

### SC-UKV-208 — an action without an icon carries no such modifier

Given a bar with an action that has a label and no icon
When it is drawn
Then the action carries no such modifier, and its label is never taken away

Not covered: the family is written by stage 2 of RT-1880 and its tests by stage 3. The
mark leaves together with the test that closes the scenario, by the same change.

### SC-UKV-209 — the labels come from the dictionary of the kit

Given a bar raised with the label set of the kit
When it is drawn
Then the count and the name of the cross come from the dictionary, and not one word of them stands
in the template

Not covered: the family is written by stage 2 of RT-1880 and its tests by stage 3. The
mark leaves together with the test that closes the scenario, by the same change.

### SC-UKV-210 — the row of actions that did not fit the width wraps

Given a bar whose actions are wider than its limit of the width
When it is drawn
Then the row of actions wraps, and nothing of it stands outside the bar

Not covered: the family is written by stage 2 of RT-1880 and its tests by stage 3. The
mark leaves together with the test that closes the scenario, by the same change.

### SC-UKV-212 — the styles of the bar live in the cascade layer

Given the styles file of the bar and of the holder
When the cascade layer audit runs
Then both are wrapped in the sublayer of the kit's components whole

Not covered: a test has nothing to look at here — the wrapper of the layer is read from the
styles file by `npm run check:cascade-layer`, and that audit is what closes the scenario.
