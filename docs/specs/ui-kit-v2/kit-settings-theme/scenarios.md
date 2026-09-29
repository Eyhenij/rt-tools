# Scenarios — the settings of the kit and the theme

The numbers continue the numbering of the second kit and do not change after the merge. The first
number of the subdomain is 330: the numbers below it up to 323 are taken by the neighbouring
branches of the epic that have not been merged yet.

While a scenario is not closed by a test, it carries the mark "Not covered" with a reason. The
settings, the theme and the local piece are closed by tests; the frame of the showcase is not, and
it names why.

## The settings

### SC-UKV-330 — a kit given no settings draws by its own defaults

Given the application handed the kit no settings at all and the keeping of the device is empty
When the first painting goes
Then the page is light, the roles are coloured by the steps of the kit, and the button and the
curtain look exactly as they looked before the settings appeared

### SC-UKV-331 — an input at the place wins over the default of the node

Given the settings name the large size of a button
When the markup asks for a button of the middle size at one place
Then that button is drawn of the middle size, and the rest of the buttons stay large

### SC-UKV-332 — the default of the node reaches the button where the markup is silent

Given the settings name the outlined look of a button
When the markup asks for a button and says nothing about its look
Then the button is drawn outlined, not filled

### SC-UKV-333 — a settings object given in part leaves the rest at the defaults of the kit

Given the settings name the size of a button and say nothing about its look or its roundedness, and
say nothing about the curtain at all
When the kit draws a button and opens a curtain
Then the size of the button comes from the settings, its look and its roundedness come from the kit,
and the curtain behaves the way the kit draws it

### SC-UKV-334 — settings replaced after the first painting do not repaint what is drawn

Given a page with buttons already drawn by the settings of the start
When the application puts another object of settings in place of the former one
Then the drawn buttons keep their look: the settings are the snapshot of the start

### SC-UKV-335 — the curtain takes the key of closing from the settings

Given the settings say that Escape does not close a curtain
When a curtain is opened without a word about that key at the place of the call, and Escape is
pressed
Then the curtain stays open

## The theme

### SC-UKV-336 — the settings name the theme of the start for whoever has chosen nothing

Given the settings name the dark theme and the keeping of the device is empty
When the first painting goes
Then the page is dark from the first painting, without a light flash before it

### SC-UKV-337 — a choice already kept wins over the settings

Given the keeping of the device holds the dark theme and the settings name the light one
When the first painting goes
Then the page is dark: the choice of the person wins over the default of the application

### SC-UKV-338 — a kept word the kit does not know is ignored

Given the keeping of the device holds a word that is not a theme of the kit, and the settings name
the dark theme
When the first painting goes
Then the page is dark, and the unknown word decides nothing

### SC-UKV-339 — the choice outlives a reload

Given the person has chosen the dark theme
When the page is reloaded
Then it is drawn dark, and nothing is asked of the settings

### SC-UKV-340 — "follow the machine" is kept as chosen, not as resolved

Given the person has chosen "follow the machine" and the machine prefers the dark look
When the page is reloaded
Then the page is dark and the kept choice is still "follow the machine"

### SC-UKV-341 — the look follows the machine while the page is open

Given the chosen theme is "follow the machine" and the page is drawn light
When the setting of the machine changes to the dark look
Then the page becomes dark without a reload, and the kept choice does not change

### SC-UKV-342 — where there is no window the kit touches neither the keeping nor the root

Given the settings name "follow the machine" and the painting goes on the server, where there is no
window
When the kit draws the page
Then the output is light, no sign of the theme stands at its root, and nothing is read from the
keeping or written to it

### SC-UKV-350 — a window that cannot ask the machine does not fell the kit

Given the window says it is a browser one, and it has no way of asking the machine about the dark
look — such a window is given by the environment of the tests of a consumer
When the kit raises the service of the theme with the choice "follow the machine"
Then the choice stays as it was, the output is light, the page is drawn, and nothing falls

## The local piece of the theme

### SC-UKV-343 — a dark node inside a light page draws its subtree dark

Given the page is drawn light and one node carries the mark of the dark theme
When the kit draws the same component inside that node and outside it
Then inside the node it is dark whole — the grounds, the text, the borders and the shadows — outside
it is light, and the sign at the root of the page does not change

### SC-UKV-344 — a light node inside a dark page draws its subtree light

Given the page is drawn dark and one node carries the mark of the light theme
When the kit draws the same component inside that node and outside it
Then inside the node it is light whole, outside it is dark, and the sign at the root of the page
does not change

### SC-UKV-345 — the opposite mark inside a marked node returns the set back

Given a node carries the mark of the dark theme and inside it another node carries the mark of the
light one
When the kit draws a component inside the inner node
Then it is drawn light whole, exactly as it is drawn on a light page

### SC-UKV-346 — a mark repeated inside a node of the same mark changes nothing

Given a node carries the mark of the dark theme and inside it another node carries the same mark
When the kit draws a component inside the inner node
Then it is drawn the same as inside the outer node alone

### SC-UKV-347 — a mark taken off returns the subtree to the theme of the page

Given a node carries the mark of the dark theme inside a light page
When the mark is emptied on the live page
Then the subtree is drawn in the theme of the page and no sign is left on the node

### SC-UKV-348 — the local piece touches neither the choice nor the keeping

Given the page is drawn light and a node carries the mark of the dark theme
When the page is reloaded
Then the page is light again, and the keeping of the device holds the light theme as before

## The showcase

### SC-UKV-349 — the frame of the showcase shows the local piece in every look it has

Given the showcase shows a node with a theme of its own inside a page of another: a dark card on a
light page, a light card inside a dark one, the same mark inside the same one and a mark taken off
When the frame of that story is taken
Then it is compared with the reference of the second kit alone — the showcase of the first kit shows
this family in no story, and there is no second frame to hold it against

Not covered: a frame is held by a reference of the showcase rather than by a test whose title
carries the number — the reference is
`projects/ui-kit-v2/.storybook/__snapshots__/foundation-design-tokens-theme-scope--theme-scope.png`.
