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

### SC-MB-149 — the choice of the language changes the labels of the kit, and only them

Given the owner chose the second language on the screen of the entry
When they enter and open a list
Then the labels the kit draws go in the chosen language, and the headings of the sections and the
shape of the dates stay the former ones

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
