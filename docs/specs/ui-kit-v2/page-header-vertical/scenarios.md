# Scenarios: the vertical menu and the tabs «More» mode

### SC-UKV-1183 — tabs that do not fit leave for the menu

Given a strip in the «More» mode is narrower than its tabs
When the strip is measured
Then the row holds the tabs that fit and the rest stand in the menu in their order

### SC-UKV-1184 — no «More» when everything fits

Given a strip in the «More» mode is wider than its tabs
When the strip is measured
Then the trigger is not drawn

### SC-UKV-1185 — the selected tab chosen in the menu stands last in the row

Given the selected tab stood in the menu
When the row is fitted
Then that tab stands last in the row and its neighbour stands in the menu

### SC-UKV-1186 — a pinned tab never leaves the row

Given a pinned tab and a width that fits only one tab
When the row is fitted
Then the pinned tab stands first in the row

### SC-UKV-1208 — the row holds no more tabs than its limit

Given a strip in the «More» mode with room for every tab and a limit lower than their count
When the row is fitted
Then the row holds as many tabs as the limit, and a tab picked in the menu takes the last place

### SC-UKV-1209 — a menu row shows its cross only under the pointer

Given the «More» menu is open and its tabs are closable
When the pointer rests on one row
Then only that row shows its close cross

### SC-UKV-1210 — the scroll arrows are compact buttons

Given a strip in the scroll mode is narrower than its tabs
When the arrows are drawn over the tabs or beside them
Then each arrow is a 24 button whose rounding and colours the application may set

### SC-UKV-1187 — a strip without a mode still scrolls

Given a strip names no overflow mode
When it is narrower than its tabs
Then the scroll arrows show and no «More» trigger exists

### SC-UKV-1188 — an error in the menu marks the trigger

Given a tab with an error stands in the menu
When the strip is drawn
Then the trigger carries the error dot

### SC-UKV-1189 — closing from the menu asks the owner of the tabs

Given a closable tab stands in the menu
When its cross is pressed
Then `tabClose` names that tab and the tab is not selected

### SC-UKV-1199 — a right click opens the menu the application declares

Given a tab declares its menu
When the tab gets a right click
Then the menu opens with the items of the application and the browser menu does not open

### SC-UKV-1190 — the header stays horizontal by default

Given a header names no layout
When it is drawn
Then the sections stand in a row and no rail exists

### SC-UKV-1191 — the rail takes the same sections

Given a header in the vertical layout with a list of sections
When it is drawn
Then every section stands in the rail in the order of the list

### SC-UKV-1192 — the section panel lies over the page

Given a header in the vertical layout
When a section with a panel opens
Then the panel stands beside the rail and the width of the page does not change

### SC-UKV-1193 — a rail without a foot

Given a page with a tab strip turns the rail foot off
When the header is drawn
Then the rail holds no assistant, notifications or profile item

### SC-UKV-1194 — the compact page header follows the page

Given the page narrows while the window keeps its width
When the bar is measured
Then the bar moves its filters by the width of the page

### SC-UKV-1195 — filters that do not fit go under a button

Given the second row of the bar cannot hold all filters
When the bar is measured
Then the extra filters stand under «More filters» with their count and no third row exists

### SC-UKV-1196 — the phone header stays on the screen

Given a window 375 wide and a long page title
When the header is drawn
Then every button stands inside the screen and the title truncates

Not covered: a test has no layout at all. The places of the buttons are seen by a frame of the
showcase at the phone width, by the story `PhonePage`.

### SC-UKV-1197 — phone filters open in a bottom sheet

Given a phone width
When the filters button is pressed
Then the bottom sheet opens with the filters

### SC-UKV-1200 — the apply button closes the bottom sheet

Given the phone bottom sheet with filters is open
When the apply button is pressed
Then the bar reports it and the sheet closes

### SC-UKV-1201 — the close button only on the selected tab

Given tabs with `closeOn="selected"` and several closable tabs
When the strip is drawn
Then only the selected tab has a close button in the row, and menu rows keep theirs

### SC-UKV-1205 — a pinned tab draws the pin itself and may be closed

Given a pinned tab without an icon of its own that is also closable
When the strip is drawn
Then the tab shows the pin icon and its close button

### SC-UKV-1202 — the phone menu lists the sections without a logo

Given a header in the vertical layout at a phone width
When the burger is pressed
Then a column lists every section in order, marks the active one and holds no logo

### SC-UKV-1203 — a section with a panel opens in place

Given the phone menu is open
When a section with a panel is pressed
Then its items replace the list, and «Back» returns to the sections

### SC-UKV-1204 — choosing an item closes the phone menu

Given the phone menu is open
When an item is chosen
Then the choice is reported and the column closes, and a disabled item does neither

### SC-UKV-1206 — the open «More» trigger shows its state

Given a strip in the «More» mode with tabs in the menu
When the trigger is pressed
Then the trigger carries its open look

### SC-UKV-1207 — a switched-on foot button shows it

Given a foot button whose item is marked active, such as the open assistant
When the rail or the tab row draws it
Then it carries the active look and says that it is pressed, and its neighbours do not

### SC-UKV-1198 — the assistant narrows the page

Given a window wider than 768
When the assistant opens
Then it stands to the right of the page and the page narrows by 420

Not covered: a test has no layout at all. The widths are seen by a frame of the showcase, by the
stories `Assistant` and `TabsAssistant`. That the bar follows the narrowed width is SC-UKV-1194.
