# Scenarios — the settings of the kit and the theme

The numbers continue the numbering of the second kit and do not change after the merge. The first
number of the subdomain is 330: the numbers below it up to 323 are taken by the neighbouring
branches of the epic that have not been merged yet.

While a scenario is not closed by a test, it carries the mark "Not covered" with a reason. Nothing
here is covered yet: there is no code at all — neither the settings, nor the third state of the
theme, nor the palettes, nor the local piece.

## The settings

### SC-UKV-330 — a kit given no settings draws by its own defaults

Given the application handed the kit no settings at all and the keeping of the device is empty
When the first painting goes
Then the page is light, the roles are coloured by the steps of the kit, and the button and the
curtain look exactly as they looked before the settings appeared

Not covered: there are no settings yet.

### SC-UKV-331 — an input at the place wins over the default of the node

Given the settings name the large size of a button
When the markup asks for a button of the middle size at one place
Then that button is drawn of the middle size, and the rest of the buttons stay large

Not covered: there are no settings yet.

### SC-UKV-332 — the default of the node reaches the button where the markup is silent

Given the settings name the outlined look of a button
When the markup asks for a button and says nothing about its look
Then the button is drawn outlined, not filled

Not covered: there are no settings yet.

### SC-UKV-333 — a settings object given in part leaves the rest at the defaults of the kit

Given the settings name the size of a button and say nothing about its look or its roundedness, and
say nothing about the curtain at all
When the kit draws a button and opens a curtain
Then the size of the button comes from the settings, its look and its roundedness come from the kit,
and the curtain behaves the way the kit draws it

Not covered: there are no settings yet.

### SC-UKV-334 — settings replaced after the first painting do not repaint what is drawn

Given a page with buttons already drawn by the settings of the start
When the application puts another object of settings in place of the former one
Then the drawn buttons keep their look: the settings are the snapshot of the start

Not covered: there are no settings yet.

### SC-UKV-335 — the curtain takes the key of closing from the settings

Given the settings say that Escape does not close a curtain
When a curtain is opened without a word about that key at the place of the call, and Escape is
pressed
Then the curtain stays open

Not covered: there are no settings yet.

## The theme

### SC-UKV-336 — the settings name the theme of the start for whoever has chosen nothing

Given the settings name the dark theme and the keeping of the device is empty
When the first painting goes
Then the page is dark from the first painting, without a light flash before it

Not covered: the settings do not reach the service of the theme yet.

### SC-UKV-337 — a choice already kept wins over the settings

Given the keeping of the device holds the dark theme and the settings name the light one
When the first painting goes
Then the page is dark: the choice of the person wins over the default of the application

Not covered: the settings do not reach the service of the theme yet.

### SC-UKV-338 — a kept word the kit does not know is ignored

Given the keeping of the device holds a word that is not a theme of the kit, and the settings name
the dark theme
When the first painting goes
Then the page is dark, and the unknown word decides nothing

Not covered: the third state and the settings are not in the kit yet.

### SC-UKV-339 — the choice outlives a reload

Given the person has chosen the dark theme
When the page is reloaded
Then it is drawn dark, and nothing is asked of the settings

Not covered: the scenario of the reload is not written for the three states yet.

### SC-UKV-340 — "follow the machine" is kept as chosen, not as resolved

Given the person has chosen "follow the machine" and the machine prefers the dark look
When the page is reloaded
Then the page is dark and the kept choice is still "follow the machine"

Not covered: there is no third state yet.

### SC-UKV-341 — the look follows the machine while the page is open

Given the chosen theme is "follow the machine" and the page is drawn light
When the setting of the machine changes to the dark look
Then the page becomes dark without a reload, and the kept choice does not change

Not covered: there is no third state yet.

### SC-UKV-342 — where there is no window the kit touches neither the keeping nor the root

Given the settings name "follow the machine" and the painting goes on the server, where there is no
window
When the kit draws the page
Then the output is light, no sign of the theme stands at its root, and nothing is read from the
keeping or written to it

Not covered: the behaviour without a window is not checked for the third state yet.

## The colour set

### SC-UKV-343 — a registered palette put on recolours the roles

Given the application has registered a palette of its own by the six roles of the kit and put it on
When the kit draws an action, a link and the ring of the focus
Then all three take their colour from the steps of that palette

Not covered: there are no palettes in the second kit yet.

### SC-UKV-344 — a palette writes the steps and does not touch the appointments

Given a palette is registered and put on
When the page is looked at in both themes
Then the appointments and the answers of the dark theme stay the ones the kit declares, and only the
steps of the six roles carry the colours of the palette

Not covered: there are no palettes in the second kit yet.

### SC-UKV-345 — a palette with a role the kit does not know is refused by name

Given a palette names a role that is not among the six of the kit
When the application registers it
Then the registration refuses, naming the palette and that role, and not a line of it reaches the
document

Not covered: there are no palettes in the second kit yet.

### SC-UKV-346 — a step outside the row of the role is refused by name

Given a palette names a step the kit does not declare for that role
When the application registers it
Then the registration refuses, naming the palette, the role and the step, and not a line of it
reaches the document

Not covered: there are no palettes in the second kit yet.

### SC-UKV-347 — a registration does not put the palette on

Given the kit draws by its own steps
When the application registers a palette and says nothing more
Then the page keeps the colours of the kit until the palette is put on by a separate word

Not covered: there are no palettes in the second kit yet.

### SC-UKV-348 — a second registration under one name replaces the first

Given a palette has been registered under a name and put on
When the application registers another palette under the same name
Then the page takes the colours of the second one, and one rule of that name stands at the root

Not covered: there are no palettes in the second kit yet.

### SC-UKV-349 — the name of the chosen palette outlives a reload

Given the application has registered a palette and put it on
When the page is reloaded and the application registers the same palette again at the start
Then the page is drawn in the colours of that palette without anyone choosing it a second time

Not covered: there are no palettes in the second kit yet.

### SC-UKV-350 — a remembered name nobody registered leaves the kit on its own steps

Given the keeping of the device holds the name of a palette, and this time the application has
registered nothing
When the first painting goes
Then the kit draws by its own steps, and the remembered name is not forgotten

Not covered: there are no palettes in the second kit yet.

### SC-UKV-351 — clearing returns the steps of the kit and forgets the name

Given a palette is put on
When the application clears the choice of the palette
Then the page returns to the steps of the kit and the remembered name is removed from the keeping

Not covered: there are no palettes in the second kit yet.

### SC-UKV-352 — a registration without a window writes nothing and refuses nothing

Given the painting goes on the server, where there is no window
When the application registers a palette
Then nothing is written to the document and the painting is not interrupted

Not covered: there are no palettes in the second kit yet.

## The local piece of the theme

### SC-UKV-353 — a dark node inside a light page draws its subtree dark

Given the page is drawn light and one node carries the mark of the dark theme
When the kit draws the same component inside that node and outside it
Then inside the node it is dark whole — the grounds, the text, the borders and the shadows — outside
it is light, and the sign at the root of the page does not change

Not covered: there is no local piece of the theme yet.

### SC-UKV-354 — a light node inside a dark page draws its subtree light

Given the page is drawn dark and one node carries the mark of the light theme
When the kit draws the same component inside that node and outside it
Then inside the node it is light whole, outside it is dark, and the sign at the root of the page
does not change

Not covered: there is no local piece of the theme yet.

### SC-UKV-355 — the opposite mark inside a marked node returns the set back

Given a node carries the mark of the dark theme and inside it another node carries the mark of the
light one
When the kit draws a component inside the inner node
Then it is drawn light whole, exactly as it is drawn on a light page

Not covered: there is no local piece of the theme yet.

### SC-UKV-356 — a mark repeated inside a node of the same mark changes nothing

Given a node carries the mark of the dark theme and inside it another node carries the same mark
When the kit draws a component inside the inner node
Then it is drawn the same as inside the outer node alone

Not covered: there is no local piece of the theme yet.

### SC-UKV-357 — a mark taken off returns the subtree to the theme of the page

Given a node carries the mark of the dark theme inside a light page
When the mark is emptied on the live page
Then the subtree is drawn in the theme of the page and no sign is left on the node

Not covered: there is no local piece of the theme yet.

### SC-UKV-358 — the local piece touches neither the choice nor the keeping

Given the page is drawn light and a node carries the mark of the dark theme
When the page is reloaded
Then the page is light again, and the keeping of the device holds the light theme as before

Not covered: there is no local piece of the theme yet.

## The showcase

### SC-UKV-359 — the frame of the showcase shows the node in both themes and under a palette

Given the showcase shows one node of the kit three times: in the light half, in the dark half and
under a registered palette
When the frame of that story is taken
Then it is compared with the reference of the second kit alone — the showcase of the first kit shows
this family in no story, and there is no second frame to hold it against

Not covered: there is no story of the theme and the palettes yet.
