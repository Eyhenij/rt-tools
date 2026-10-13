# Scenarios — the quick menu

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
as the next free ones in the domain and do not change after the merge into the spec.

### SC-UKV-798 — the trigger opens and closes the actions

Given a quick menu with three actions
When the trigger is pressed, and pressed again
Then the actions open and the trigger shows a cross and says it is expanded; the second press closes
them and the trigger shows its icon again

### SC-UKV-799 — the actions stand on the side of the direction

Given a quick menu opening up, down, to the start and to the end
When it opens
Then the panel stands on that side of the trigger with the opposite side as the fallback, the actions
form a column or a row, and they keep the given order

### SC-UKV-800 — the actions are named and an unavailable one is not pressed

Given a quick menu with a named trigger, one without a name, and an unavailable action
When it opens and the unavailable action is pressed
Then every action carries its name as the accessible name and the tooltip, the trigger without a name
is called «Actions», and the unavailable action sends nothing

### SC-UKV-801 — a chosen action goes out and the menu follows its input

Given a quick menu that stays open, and one that closes on a choice
When an action is pressed in each
Then each sends the action value once; the first stays open, the second closes and puts the focus
back on the trigger

### SC-UKV-802 — Escape and a press outside close the menu

Given an open quick menu with the focus on an action
When Escape is pressed, and after a new opening the page outside is pressed
Then the first closes and puts the focus on the trigger, the second closes and leaves the focus alone

### SC-UKV-803 — the keyboard opens into the first action and walks the actions

Given a quick menu with an unavailable second action
When the trigger is pressed by the keyboard, and the arrows, Home, End and Tab are pressed
Then the focus goes to the first action, the arrows skip the unavailable one and go round, Home and
End take the first and the last, and Tab closes the menu with the focus on the trigger

### SC-UKV-804 — an unavailable or empty menu does not open

Given an unavailable quick menu, one without actions, and an open one that turns unavailable
When the first two are pressed, and the third turns unavailable
Then the first two stay closed, and the third closes

### SC-UKV-805 — the panel and the icon button without the new inputs stay as before

Given a floating panel without the positions input and an icon button without the expanded input
When the panel opens and the button is drawn
Then the panel takes the place below with the place above as the fallback, and the button writes no
expanded state
