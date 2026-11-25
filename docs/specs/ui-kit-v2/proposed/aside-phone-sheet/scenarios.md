# Scenarios — the side panel as a full-height sheet on a phone

The prefix `SC-UKV` is shared across the domain; the numbers do not change after the merge.

### SC-UKV-1802 — on a phone a panel opened by the service rises as a full-height sheet

Given a window 375 points wide
When an application opens a side panel through the kit's service
Then the panel slides up as wide as the window and as high as it less the 12 px strip on top

### SC-UKV-1803 — at 481 points the panel stays at the side

Given a window 481 points wide
When an application opens a side panel through the kit's service
Then the panel slides in from its edge across the whole width, as before

### SC-UKV-1804 — the route panel of the frame over the page rises as a sheet on a phone

Given a window 375 points wide and a frame whose right panel stands over the page
When the address opens a record in the right panel
Then the record panel rises from the bottom as a full-height sheet

### SC-UKV-1805 — the route panel beside the content rises as a sheet on a phone

Given a window 375 points wide and a frame whose right panel stands beside the content
When the address opens a record in the right panel
Then the record panel rises from the bottom as a full-height sheet

### SC-UKV-1806 — the toolbar filters open as a sheet on a phone

Given a window 375 points wide and a toolbar with filters
When the person presses the filter button
Then the filters rise as a full-height sheet with «Применить» on the right of the header and
«Сбросить» in the footer

### SC-UKV-1807 — the details of the workspace open as a sheet on a phone

Given a phone and a workspace with a details template and its `singleColumnBreakpoint` set
When the details open
Then they rise as a full-height sheet titled by the title of the workspace

### SC-UKV-1808 — the table column settings open as a sheet on a phone

Given a window 375 points wide and a table with column settings
When the settings open
Then they rise as a full-height sheet with «Сохранить» on the right of the header

### SC-UKV-1809 — the data list settings open as a sheet on a phone

Given a window 375 points wide and a data list with settings
When the settings open
Then they rise as a full-height sheet with the save button on the right of the header

### SC-UKV-1810 — a panel with short content takes the full height

Given a window 375 points wide and a panel with one line of content
When the panel opens
Then the sheet stands at the full height, and its footer stands at the bottom of the screen

### SC-UKV-1811 — the header of the panel sheet

Given a window 375 points wide and a panel whose header has a title and a back arrow
When the panel opens
Then its header shows the handle, «×» on the left and the title in the centre, and no back arrow

### SC-UKV-1812 — the main action moves to the header

Given a window 375 points wide and a panel with «Сохранить» in the primary slot of its footer
When the person presses «Сохранить» on the right of the header
Then the panel does what its footer button did, and the footer shows no «Сохранить»

### SC-UKV-1813 — a panel without a main action keeps the title in the centre

Given a window 375 points wide and a panel with no button in the primary slot
When the panel opens
Then the right side of the header is empty and the title stands in its centre

### SC-UKV-1814 — a swipe down past the threshold closes a clean panel

Given an open panel sheet with no unsaved edits
When the person drags the handle down past the threshold of a sheet and lets go
Then the sheet slides down and the panel reports that it closed

### SC-UKV-1815 — a short swipe returns the sheet

Given an open panel sheet
When the person drags the handle down less than the threshold and lets go
Then the sheet returns to its place and stays open

### SC-UKV-1816 — «×» closes the panel the way the back arrow did

Given an open panel sheet with no unsaved edits
When the person presses «×»
Then the panel closes and its opener hears the same result the back arrow gave

### SC-UKV-1817 — a tap on the strip above closes the panel

Given an open panel sheet with no unsaved edits
When the person taps the strip above the sheet
Then the panel closes

### SC-UKV-1818 — a gesture switched off leaves the sheet open and reports the request

Given an open panel sheet opened with the tap on the dim switched off
When the person taps the strip above the sheet
Then the sheet stays open and the panel reports a close request

### SC-UKV-1819 — a panel held from closing refuses the swipe

Given an open panel sheet held from closing by its application
When the person swipes it down past the threshold
Then the sheet returns to its place and the panel reports a close request of the kind `backdrop`

### SC-UKV-1820 — a swipe of a panel with unsaved edits asks first

Given a window 375 points wide and a record panel with an edits guard and a changed form
When the person swipes the sheet down past the threshold
Then the question «Несохранённые правки» stands at the bottom of the screen, and the sheet stays
open under it

### SC-UKV-1821 — «Сохранить и закрыть» saves the record

Given the question about the unsaved edits at the bottom of a phone screen
When the person presses «Сохранить и закрыть»
Then the panel writes the record and closes after the write

### SC-UKV-1822 — «Закрыть без сохранения» drops the edits

Given the question about the unsaved edits at the bottom of a phone screen
When the person presses «Закрыть без сохранения»
Then the panel closes and the edits are not written

### SC-UKV-1823 — «Остаться» after a swipe gives the focus to the sheet

Given the question about the unsaved edits shown after a swipe
When the person presses «Остаться»
Then the question goes, the sheet stays open with the form as it was, and the focus stands on the
sheet, not on the page under it

### SC-UKV-1824 — from 481 points the question stays in the centre

Given a window 481 points wide and a record panel with an edits guard and a changed form
When the person presses the back arrow
Then the window about the unsaved edits opens in the centre of the screen

### SC-UKV-1825 — a close during a write is ignored

Given an open record panel sheet whose write goes right now
When the person swipes it down past the threshold
Then the sheet returns to its place, and no question is shown

### SC-UKV-1826 — Escape with the focus outside the sheet closes the panel sheet

Given an open panel sheet with no unsaved edits and the focus on the page under it
When the person presses Escape
Then the panel sheet closes

### SC-UKV-1827 — Escape on the second screen brings back the first one

Given an open panel sheet and the list of its select open in the same sheet
When the person presses Escape
Then the list leaves, the panel's own content and title come back, and the sheet stays open

### SC-UKV-1828 — the opened panel sheet puts the focus on «×»

Given a window 375 points wide
When a panel opens by a button of the page
Then the focus stands on «×» of the panel sheet

### SC-UKV-1829 — the closed panel sheet returns the focus to its opener

Given a panel sheet opened by a button of the page
When the panel closes by «×»
Then the focus returns to that button

### SC-UKV-1830 — a select in the panel sheet keeps the form

Given an open panel sheet with a text typed into one of its fields and a select
When the list of the select opens in the same sheet and the person picks a value
Then the panel's content is seen again with the typed text and the picked value

### SC-UKV-1831 — a date field opens in the same sheet with a back chevron

Given an open panel sheet with a date field
When the date field opens its sheet
Then the date picker takes the place of the panel's content in the same sheet at the same height,
the title names the field, the left of the header holds a back chevron instead of «×», and the
chevron brings the panel's content back

### SC-UKV-1832 — the tabs of a panel in the sheet

Given a window 375 points wide and a panel in the tabs layout
When the panel opens
Then the strip of tabs stands right under the header of the sheet, scrolls round with faded edges,
the selected tab stands in its centre, and the content of a tab scrolls under it

### SC-UKV-1833 — with reduced motion the panel sheet appears without sliding

Given a window 375 points wide and reduced motion asked by the system
When a panel opens
Then the panel sheet appears at its place without sliding

### SC-UKV-1834 — a panel sheet keeps its form when the window widens

Given a panel sheet open in a window 375 points wide
When the window becomes 667 points wide
Then the panel stays a full-height sheet until it closes

### SC-UKV-1835 — a close-only button is not drawn in the sheet

Given a window 375 points wide and the details of the workspace with «Закрыть» in the footer
When the details open
Then the sheet draws no «Закрыть» in its footer, and «×» closes the details

### SC-UKV-1836 — the header icon buttons stand left of the main action

Given a window 375 points wide and the table column settings with the reset icon in the header
When the settings open
Then the reset icon stands on the right side of the header to the left of «Сохранить»

### SC-UKV-1837 — with several primary buttons the last one moves

Given a window 375 points wide and a panel with «Удалить» and «Сохранить» in the primary slot
When the panel opens
Then «Сохранить» stands on the right of the header and «Удалить» stays in the footer at the size of
«Сохранить»

### SC-UKV-1838 — the panel's own first-focus node wins over «×»

Given a phone and a panel that keeps Tab inside and marks a field for the first focus
When the panel opens
Then the focus stands on the marked field

### SC-UKV-1839 — a header without the arrow draws no «×»

Given a window 375 points wide and a panel whose header switched the back arrow off
When the panel opens
Then the header of the sheet shows no «×», and a swipe past the threshold still closes it

### SC-UKV-1840 — a service panel with the unsaved sign asks at the bottom

Given a window 375 points wide and a panel opened by the service whose handle carries the unsaved
sign
When the person swipes the sheet down past the threshold
Then the question «Несохранённые правки» stands at the bottom of the screen, and the sheet stays
open under it

### SC-UKV-1841 — «Сохранить и закрыть» of a service panel reports a save request

Given the question about the unsaved edits of a service panel at the bottom of a phone screen
When the person presses «Сохранить и закрыть»
Then the handle reports a save request to the application, and the panel stays open until the
application closes it

### SC-UKV-1842 — a service panel without the sign closes without a question

Given a window 375 points wide and a panel opened by the service without the unsaved sign
When the person swipes the sheet down past the threshold
Then the panel closes and no question is shown

### SC-UKV-1843 — the toolbar filters with a change not applied ask

Given a window 375 points wide and the toolbar filters sheet with a value typed into a field
When the person presses «×»
Then the question «Применить изменения?» stands at the bottom of the screen

### SC-UKV-1844 — «Не применять» of the filters reports the drop and closes

Given the question of the toolbar filters sheet
When the person presses «Не применять»
Then the toolbar reports the drop to the application and the sheet closes without `filtersApply`

### SC-UKV-1845 — untouched filters close at once

Given a window 375 points wide and the toolbar filters sheet with no input since it opened
When the person swipes it down past the threshold
Then the sheet closes and no question is shown

### SC-UKV-1846 — the route panel without a dim dims the page as a sheet

Given a window 375 points wide and a frame whose right panel has its dim switched off
When the address opens a record in the right panel
Then the panel sheet dims the page under it

### SC-UKV-1847 — «×» runs the road of the arrow, not the hidden button

Given a phone and a panel whose close-only footer button differs in handler from its header dismiss
When the person presses «×»
Then the header's dismiss runs, and the handler of the hidden button does not

### SC-UKV-1848 — a close by code ignores the unsaved sign

Given a panel sheet opened by the service whose handle carries the unsaved sign
When the application closes the panel through its handle
Then the panel closes and no question is shown

### SC-UKV-1849 — the back button under a record panel with edits asks at the bottom

Given a window 375 points wide and a record panel sheet with an edits guard and a changed form
When the person presses the back button of the browser
Then the question «Несохранённые правки» stands at the bottom, and the address stays

### SC-UKV-1850 — the swipe obeys the switch of the tap on the dim

Given a panel sheet opened with the tap on the dim switched off
When the person swipes it down past the threshold
Then the sheet returns to its place and the panel reports a close request of the kind `backdrop`

### SC-UKV-1851 — the answers of the question stand in the sheet's order

Given a window 375 points wide and a record panel sheet with an edits guard and a changed form
When the person presses «×»
Then «Сохранить и закрыть» stands first with the focus, then «Закрыть без сохранения», «Остаться»

### SC-UKV-1852 — a filter typed and returned is no change

Given the toolbar filters sheet on a phone with a field whose value was changed and typed back
When the person presses «×»
Then the sheet closes and no question is shown

### SC-UKV-1853 — a move to another record keeps the form

Given a record panel sheet opened in a window 375 points wide that became 667 points wide
When the person follows a link to another record inside the panel
Then the panel stays a full-height sheet

### SC-UKV-1854 — a panel beside the content is judged at each opening

Given a frame panel beside the content, opened and closed at 667 points, and the window now 375
When the address opens a record in the right panel again
Then the record panel rises as a full-height sheet

### SC-UKV-1855 — a panel restored on a reload is judged anew

Given an address of a record panel and a window 375 points wide
When the page reloads
Then the record panel rises as a full-height sheet

### SC-UKV-1856 — the panel sheet stands above the screen keyboard

Given a panel sheet on a touch screen
When the person taps a text field and the screen keyboard shows
Then the sheet stands in the visible part above the keyboard, and «×» stays seen

### SC-UKV-1857 — a panel opened at the left edge rises from the bottom

Given a window 375 points wide
When an application opens a panel through the service at the left edge
Then the panel rises from the bottom as a full-height sheet

### SC-UKV-1858 — the width handle of the frame panel is not drawn in the sheet

Given a window 375 points wide and a frame whose right panel has the width handle switched on
When the address opens a record in the right panel
Then the panel sheet has no width handle and is as wide as the window

### SC-UKV-1859 — Escape inside the panel sheet goes no further

Given a panel sheet with the focus in one of its fields and a page that listens to Escape
When the person presses Escape
Then the panel sheet closes and the page does not hear the key

### SC-UKV-1860 — a second close request does not ask again

Given the question about the unsaved edits shown at the bottom of a phone screen
When the person presses Escape or swipes the sheet again
Then one question stays on the screen and nothing closes

### SC-UKV-1861 — a long title is cut by an ellipsis

Given a window 375 points wide and a panel whose title is longer than the header
When the panel opens
Then the title stands in one line in the centre and ends with an ellipsis

### SC-UKV-1862 — a panel without a name is announced by its title

Given a window 375 points wide and a panel with a title and no accessible name of its own
When the panel opens
Then the sheet is announced as a modal dialog named by the title
