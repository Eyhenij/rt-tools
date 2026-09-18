# Scenarios — the shell of the admin application: the sections, the profile, the theme and the language

The identifier goes at the start of the test title, followed by a dash. The numbers continue the
shared numbering of the domain: the subdomain is numbered together with it, not anew.

### SC-MB-142 — the sections stand as a top row, and there is no left column

Given the owner entered and opened any section
When they look at the page
Then the sections stand as a strip above the content, and there is no column with them on the left of
the page

### SC-MB-143 — the current section is highlighted both after a transition and by a direct link

Given the owner opened a section by a direct link, and then went to a neighbouring one by an item of
the top row
When they look at the top row
Then exactly the item whose section is open is highlighted — in the first case and in the second

### SC-MB-144 — on a narrow screen the same sections open by a button

Given the width of the window is narrow
When the owner presses the button of the sections in the top row
Then a list of the same four sections opens, and a transition by it leads into a section

### SC-MB-145 — a press on the profile opens the popup, it does not exit

Given the owner entered
When they press their own name in the top row
Then a popup with the theme, the language and the exit opens, and the entry stays accepted

### SC-MB-146 — the exit goes from the popup and leads away to the screen of the entry

Given the popup of the profile is open
When the owner chooses the exit
Then the entry is broken off, and the owner finds themselves at the screen of the entry

### SC-MB-147 — the theme is switched in the popup and outlives a reload

Given the owner entered and the theme is light
When they switch the theme in the popup of the profile and reload the page
Then the screen stays dark, it does not come back to the light one

### SC-MB-148 — the theme is switched on the screen of the entry

Given the owner stands at the screen of the entry
When they switch the theme
Then the screen of the entry becomes dark, and after the entry the shell stays dark too

### SC-MB-149 — the choice made at the entry holds after it, and the shape of the dates does not depend on it

Given the owner chose the second language on the screen of the entry
When they enter and open a list
Then the labels the kit draws and the name of the section go in the chosen language, and the shape
of the dates stays the former one

### SC-MB-150 — the choice of the language is in the popup of the profile and outlives a reload

Given the owner entered
When they change the language in the popup of the profile and reload the page
Then the chosen language stayed the same, it did not come back to the initial one

### SC-MB-151 — the fields of the entry carry an icon and a placeholder

Given the owner stands at the screen of the entry
When they look at the fields of the account and of the password
Then each has an icon and a hint inside the field, not one label at the side

### SC-MB-152 — the heading of the tab names the application

Given any page of the admin application is open
When the owner looks at the heading of the tab of the browser
Then the name of the application stands there, not the name of the project of the build

### SC-MB-153 — the toast is shown once and in one place

Given the owner revokes an invitation
When the revocation succeeded
Then one toast in one place of the screen says about it, not two in two corners

### SC-MB-395 — after signing in without a single right the person lands on the address of the screen

Given an account whose rights hold not one read right of a section
When the person signs in and the admin panel comes up
Then the address in the browser line is the address of the screen, not an empty one

### SC-MB-396 — the screen survives a reload of its own address

Given a person to whom no section is open, standing on the screen
When the page is reloaded at that address
Then the same screen comes up: the reason, whom to ask, the name and the way out

### SC-MB-397 — a direct link to a closed section leads to the screen when no section is open

Given a person to whom no section is open
When they open the address of any section directly, on the first load of the page
Then the screen comes up instead of a blank page, and the address becomes the address of the screen

### SC-MB-398 — the address of the screen leads away whoever has a section open

Given a signed-in person with at least one open section
When they open the address of the screen by hand
Then the first section open to them opens instead

### SC-MB-399 — a right that arrives without a reload takes the person off the screen

Given a person standing on the screen, whose rights arrive anew with a section among them
When the admin panel receives the answer about the signed-in person
Then the item of the section is in the top row, and the screen is no longer shown

### SC-MB-400 — the way out from the screen leads to the sign-in

Given a person to whom no section is open, standing on the screen
When they press the way out
Then the sign-in screen comes up, and the sign-in is over

### SC-MB-401 — the screen is not shown while the answer about the signed-in person has not arrived

Given the answer about the signed-in person has not arrived yet
When the admin panel draws the page
Then the screen is not shown: the rights are unknown rather than absent

### SC-MB-402 — a label comes from the dictionary in the chosen language

Given a key that has both a Russian and an English text
When the screen asks the dictionary by that key at the choice `ru`, and then at the choice `en`
Then the first time the Russian text comes, the second time the English one

### SC-MB-403 — a key that is not in the set is visible rather than empty

Given a key the set does not hold
When the screen asks the dictionary by that key
Then a sign of the missing key comes instead of the label: an empty string would read as "there is no
label here" and would live until a person complains

### SC-MB-404 — the choice of the language changes both dictionaries without a reload

Given a screen of the shell is open, whose labels come from the dictionary of the admin application,
and the buttons of the kit stand next to them
When a person changes the language in the shell
Then the labels of the admin application and the labels of the kit change, the language sign of the
document goes with them, and the page is not reloaded

### SC-MB-405 — the choice of the language outlives a reload and does not go to the receiver

Given a person chose English
When the page is reloaded
Then the choice stayed English, and not one request to the receiver asked about the language

### SC-MB-406 — the screen of the entry holds no Russian word at the English choice

Given a person stands at the screen of the entry and chooses English
When they look at the card of the entry
Then not one word of it is Russian: the name of the application, the heading, the labels of the
fields, the hints inside them and the label of the button come from the dictionary

### SC-MB-414 — every key of the dictionary has a text in both sets

Given the set of the labels of the admin application
When every key of it is asked in Russian and in English
Then not one of them comes back by the sign of an unfound key or by an empty string

### SC-MB-415 — the screen of a section holds no Russian word at the English choice

Given a person stands at the screen of a section and chooses English
When they look at the labels of the screen
Then not one of them is Russian: the name of the section, its hint, the labels of the columns, the
words of the states, the buttons of the toolbar and the shell come from the dictionary. The names of
the projects and of the files in the cells are data and are not translated
