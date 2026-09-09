# Scenarios — an icon on demand

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain and do not change after the merge into the spec: the titles of the
tests refer to them.

What a scenario is covered by is said under it. Where the run does not cover a scenario, that is said
openly.

### SC-UKV-58 — the page loads only the icons it drew

Given the list of the names of the kit holds hundreds of icons, and the page draws three
When the page opens
Then three requests go away for the files of the icons, not the whole list

### SC-UKV-59 — a repeated request of the same name does not touch the network

Given the icon with this name has already arrived and lies in the sprite
When the same name is asked for by a second markup on the same page
Then no new request goes away, and the icon is drawn at once

### SC-UKV-60 — a refusal of one name puts out only its icon

Given one of the names that were asked for has no file on the server
When the page draws it together with two others
Then the two other icons are drawn, and the third stays an empty place of its own size

### SC-UKV-130 — a material drawing that did not arrive is closed by the own one

Given the page declared the material preset, and the application did not publish the material set
When the page draws an icon that has a material drawing in the tree
Then the request goes to the own set after the refusal, and the icon is drawn by the own drawing:
the material set is a layer of overrides, and a name it lacks the kit already draws by its own —
a file that did not arrive behaves the same. Without it the page shows an empty place where a
drawing was promised, and the markup is right at that

Covered: `projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.spec.ts`.

### SC-UKV-61 — an icon asked for by two markups at once goes by one request

Given the component of an icon and a button drawing an icon itself stand on the page with one and the
same name
When the page opens
Then one request goes away for that name, and both markups draw the icon

### SC-UKV-62 — a change of the name pulls the new one, and the former symbol stays

Given an icon is drawn by one name
When another name is passed to the markup
Then a request goes away for the new name, the former symbol stays in the sprite, and a repeated
return to it gives no request

### SC-UKV-63 — a symbol already lying in the sprite of the page gives no request

Given the sprite of the page already holds a symbol with this name — it was put there by a neighbouring
story of the showcase or by the page itself before the start of the application
When the markup asks for that name
Then no request goes away at all

### SC-UKV-64 — on the server the set is not loaded

Given the page is drawn on the server
When the markup asks for a name
Then no request goes away, and the icon appears after the hydration

### SC-UKV-65 — a frame of the showcase is shot after all the icons of the page have arrived

Given the sprite grows along the way, it does not arrive ready
When the run of the snapshots goes
Then the frame is taken when every visible icon is drawn, and two shootings in a row without edits
agree

Not covered: it cannot be closed by a test with an identifier — it is checked by the run of the
snapshots, and its tests are created by the stories of the showcase and carry no identifier. Checked on
the spot: the gate of the snapshots of the second kit passed on a growing sprite — 450 cases, 458
references agreed — while the probe of the markups diverged from the first pair.
