# Scenarios — the reading of what was taken in

The identifier goes at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason; one closed on the side of the intake but
not on the side of the screen carries the mark "Coverage: partial".

The scenarios whose "Then" names a person and what they see are closed by an end-to-end spec. Next
to them go measurements in the browser and a live pass on the node; a replacement of an end-to-end
spec they are not.

### SC-MB-46 — the address of a section outlives a reload

Given the owner entered and stands in the section of the analyses
When they reload the page
Then they see the same section, not the starting screen of the admin application

## The list of the incident analyses

### SC-MB-47 — the list shows the analyses by pages, the fresh ones on top

Given there are more analyses than fit onto a page
When the owner opens the section
Then they see the first page, the fresh analyses on top, and the number of the pages under the list

### SC-MB-48 — while the list is being read, the reading is visible in the place of the rows

Given the reading of the page has not answered yet
When the owner looks at the section
Then they see the sign of the reading in the place of the rows, not an empty area

### SC-MB-49 — an empty list explains why it is empty

Given not a single tree sent an analysis
When the owner opens the section
Then they read that there are no analyses at all, not see an empty table

### SC-MB-50 — a filter that gave no rows differs from an empty list

Given there are analyses, but not one at the chosen tree
When the owner sets the filter by that tree
Then they read that there are no records by the filter, not that there are none at all

### SC-MB-51 — a list that was not read says why and is repeated by one action

Given the storage did not answer
When the owner opens the section
Then they read the reason and repeat the reading by one action, without reloading the page

### SC-MB-52 — a press on a row opens the panel with the text of the analysis whole

Given the list is read
When the owner presses a row
Then they see the panel of details with the text of that analysis whole

### SC-MB-53 — a row of the list does not carry the text of the analysis whole

Given a tree has an analysis several screens long
When a page of the list arrives
Then the answer holds the properties of the row without the text of the analysis

### SC-MB-54 — the filter outlives a transition to another page

Given the owner set the filter by tree
When they go to the second page of the list
Then they see the second page of the same filter, and the filter stays named on the screen

### SC-MB-55 — a closed panel brings the list back in the same state

Given the owner opened the panel from the second page of a filtered list
When they close the panel
Then they see the same second page with the same filter and the same sorting

### SC-MB-62 — the size of a page has a default and a limit

Given there are more records in the list than fit onto a page
When the page is requested without a size, and then with a size above the limit
Then the first answer carries the default, the second the limit, and both name the total number

### SC-MB-63 — a page past the end of the list answers with an empty page

Given there are three pages in the list
When the fiftieth is requested
Then the answer is empty, carries the total number and is not a refusal

### SC-MB-64 — a number of a page that was not taken apart is refused with the boundaries

Given the number of the page in the request is not a number
When the request arrives at the list
Then it is refused, and the refusal names the parameter and its boundaries

### SC-MB-65 — records with equal time do not jump between the pages

Given two records have one and the same time of arrival
When the owner goes from the first page to the second
Then each of them is visible on exactly one page

### SC-MB-66 — the order is changed by the heading of a column and is named on the screen

Given the list is shown by the order by default
When the owner presses the heading of a sortable column
Then the order changes, and the screen names the applied one

### SC-MB-67 — the choice of the columns outlives a return into the section

Given the owner removed a column in the section of the analyses
When they leave for another section and come back
Then the column stays removed, and in the other section the composition of the columns is its own

### SC-MB-68 — the filter names the trees by names and filters by a sign

Given the cargo arrived from two trees
When the owner opens the filter by tree
Then they see the names of the trees, and the chosen one narrows the list by the sign

### SC-MB-69 — an answer that caught up with its list later is not shown

Given the owner changed the filter without waiting for the first answer
When the first answer comes after the second
Then the list shows the rows of the second filter

### SC-MB-71 — the panel of a record that does not exist says so

Given a link leads to a record that is not in the storage
When the owner opens it
Then the panel says there is no record, it does not show empty fields

### SC-MB-72 — a refusal of the service names the number of the request

Given the storage is unavailable
When the owner opens the section
Then they see a refusal with the number of the request, and the same number stands in the journal

### SC-MB-73 — the waiting for an answer is limited by a term

Given the service does not answer
When the term of the waiting is over
Then the screen says about the refusal and offers to repeat, it does not wait without a limit

### SC-MB-74 — the section of the proposals is put together by the same list screen

Given the proposals arrived from two trees
When the owner opens the section of the proposals
Then they see a table with a toolbar and a pagination, and a press on a row opens the panel

### SC-MB-75 — the section of the digests is put together by the same list screen

Given the records of the months arrived from two trees
When the owner opens the section of the digests
Then they see a table with a toolbar and a pagination, and a press on a row opens the panel

### SC-MB-76 — the time is shown in the zone of whoever is looking

Given a record arrived at the end of a day by universal time
When the owner looks at the list from their own zone
Then the time is shown as local, and the order "the fresh ones on top" does not contradict it

### SC-MB-77 — a row of the list on a narrow screen is shown as a card

Given the section is open on a narrow screen
When the list is read
Then every record is shown as a card of the table of the kit, not as a cut row

### SC-MB-78 — the labels of the kit come from the dictionary of the application

Given there is a pagination and an empty state on the screen
When the owner looks at their labels
Then they are in the language of the admin application, not in the English default of the kit

### SC-MB-96 — a section of the admin application opens by a direct link

Given the admin application is given out by the proxy by name
When a person comes by a direct link to the address of a section
Then the application opens, not a refusal of the proxy

Not covered: it is checked by a request to the live node.

### SC-MB-167 — an analysis that arrived stands in "new"

Given a tree sent an incident analysis the intake did not have
When the reading gives it back as a row of the list
Then the state of the analysis is new

### SC-MB-168 — the records that arrived before the creating of the field are read as new

Given records of the cargo lie in the storage from the former time, and they had no state
When the migration is rolled on and the reading gives them back by a page
Then each of them carries new, and not one has an empty state

### SC-MB-171 — the state is visible as a column in the list of the section

Given records in different states lie in the section of the analyses
When a person opened the section
Then at every row the column of the state is visible with the word of a person, not with the name of the value

## The single language of the lists

### SC-MB-129 — an empty section shows an empty state, not a table without rows

Given the section has not a single record
When the owner opens it
Then they see an empty state with a sign and a word about where the records come from, and see no
rows of the table at all

### SC-MB-130 — a reading that goes does not show an empty state

Given the reading of the list still goes
When the owner looks at the section
Then they see the skeletons of the table and see no empty state: the emptiness is not established yet

### SC-MB-131 — a refusal of the reading is told from an empty section

Given the reading of the list refused
When the owner looks at the section
Then they see the toast of the refusal, not an empty state: the emptiness and a breakage look different

### SC-MB-135 — four sections declare the table by one language

Given there are four sections with a list
When their markup is read one after another
Then each declares the table by an element of the kit, and not one declares it by an attribute on
its own markup

### SC-MB-136 — the ready code of the pattern of a list agrees with the markup of the sections

Given the pattern of the tree about the list screen carries the ready code of a table
When it is read next to the markup of any section
Then the language coincides: the pattern writes the table by the same element as the sections

Not covered: the ready code of a pattern is checked by nothing — the check of the specs reads the
statements of a rule and does not read the sample under them at all. A divergence is looked for by
reading the pattern next to the markup of a section.

### SC-MB-137 — the properties of a record are shown by a ready list of the kit, not by markup of one's own

Given the owner opened the panel of details of any of the three records
When its markup is read
Then the properties stand in a ready list of the kit, and there is no handwritten list of definitions
in the panel

### SC-MB-138 — the heading of a section of the panel is drawn by the kit

Given the panel has a section of the properties and a section of the text
When the owner looks at the panel
Then the heading of every section is drawn by a ready section of the kit, and there is no heading of
one's own in the panel

### SC-MB-139 — while the record is being read, skeletons are visible in the place of the values

Given the reading of the record still goes
When the owner looks at the open panel
Then the names of the properties are already in place, and in the place of the values there are
skeletons, not emptiness

### SC-MB-140 — the sign stands at the panel, at its header and at every row of a property

Given the panel is open
When an end-to-end spec looks for the panel itself, its header and a row of a property
Then it finds each of the three by a sign of its own, not only the value inside the row

### SC-MB-141 — three panels are put together by one language

Given there are three panels of details
When their markup is read one after another
Then each is put together by a section, a list and rows of the kit, and not one writes them by markup
of its own

### SC-MB-208 — a heading of the markup is visible as a heading, not as a stick

Given an incident analysis arrived with a heading of the first level
When the owner opens the panel of details
Then they see the heading as a node of its own, and there is no hash sign in the shown text

### SC-MB-209 — a line of a script stays visible text and is not executed

Given an incident analysis arrived with a line of a script inside
When the owner opens the panel of details
Then the line is visible as text as it is, and nothing out of it was executed

### SC-MB-210 — a paired tag stays visible text

Given an incident analysis arrived with a paired tag of the bold face
When the owner opens the panel of details
Then the angle brackets are visible in the text, and the face of the word did not change

### SC-MB-211 — a table of the markup is shown as a table

Given an incident analysis arrived with a table of two columns
When the owner opens the panel of details
Then they see a table with a row of the heading, not rows with sticks

### SC-MB-212 — a list is shown as a list

Given a proposal arrived with a list of three items
When the owner opens the panel of details
Then they see three items of a list, and there are no hyphens at the start of the lines

### SC-MB-213 — a block of code is shown monospaced and without colouring

Given an incident analysis arrived with a block of code whose fence names the language
When the owner opens the panel of details
Then the content of the block is shown in a monospaced font of one colour, and the word of the
language is not shown in the text

### SC-MB-214 — the digest of a month is shown by the same component, as a block of code

Given the digest of a month arrived as the body of a run, not as markup
When the owner opens the panel of details of the digest
Then they see the body as a monospaced block with the indents, drawn by the same component the text
of an incident analysis is shown by

### SC-MB-215 — a single line break stays a break

Given an incident analysis arrived with three lines in a row without an empty line between them
When the owner opens the panel of details
Then the three lines are shown as three lines, they are not glued into one

### SC-MB-216 — a picture does not get into the output

Given a proposal arrived with a link to an external picture
When the owner opens the panel of details
Then there is no node of a picture in what is shown, and the page made no request into a foreign network

### SC-MB-217 — an external link leads outward, and a link of a foreign scheme stays text

Given an incident analysis arrived with two links: to an external address and to an address of the
scheme of scripts
When the owner opens the panel of details
Then the first is shown as a link to the same address, and the second as visible text without a link

### SC-MB-218 — a text without markup is shown as it is

Given a proposal arrived as one line without a single sign of markup
When the owner opens the panel of details
Then they see the same line whole and without added nodes

### SC-MB-219 — there is no text — there is no section of the panel

Given an incident analysis arrived with a text of spaces alone
When the owner opens the panel of details
Then there is no section of the panel about the text on the screen at all

### SC-MB-220 — a row of the list still carries no text

Given the list of the incident analyses shows a page of records
When the owner looks at a row of the list
Then there is no text of the record in the row — neither raw nor marked up

### SC-MB-221 — a long line of code does not stretch the panel

Given an incident analysis arrived with a block of code whose line is longer than the panel
When the owner opens the panel of details
Then the block of code scrolls sideways itself, and the width of the panel stayed the former one

### SC-MB-189 — the panel of details shows the text, the list does not

Given a record of the cargo carries a text of the fix
When the owner opened its panel of details
Then the row «Чем исправлено» with that text stands in the panel, and there is no column with it in
the list of the section

### SC-MB-190 — at a record without a text there is no row in the panel at all

Given a record of the cargo carries no text of the fix
When the owner opened its panel of details
Then there is no row «Чем исправлено» in the panel — neither a label nor an empty value

### SC-MB-205 — the panel of details shows the version of the release

Given a record of the cargo carries a version of the release
When the panel of details of that record is open
Then the row «В какой версии» with that version stands in it

### SC-MB-206 — at a record without a version there is no row in the panel

Given a record of the cargo stands in "new" and carries no version of the release
When the panel of details of that record is open
Then there is no row «В какой версии» in it at all

### SC-MB-222 — the filter by state stands in the toolbar to the right of the filter by tree

Given the section of the incident analyses is open
When the owner looks at the strip above the list
Then on the left two filters stand in a row: by tree, and to the right of it by state

### SC-MB-359 — the filter by tree shows every option on one line

Given the section of the incident analyses is open and the stand carries several trees
When the owner opens the filter by tree
Then every option stands on one line and none is clipped. The trigger is no narrower than the longest label with the paddings of the trigger

### SC-MB-223 — a chosen state narrows the list and stands in the address

Given the list of the section is shown whole
When the owner chooses the state "in progress"
Then only the records of that state stay in the list, and the choice stands in the address of the section

### SC-MB-224 — "all the states" lifts the filter and removes the parameter from the address

Given the list is narrowed by a state
When the owner chooses "all the states"
Then the list shows the records of all the states, and there is no parameter of the filter in the
address at all

### SC-MB-225 — the filter by state adds up with the filter by tree

Given the list is narrowed by a tree
When the owner chooses a state
Then the records of that tree and that state stay in the list, and both filters stand in the address

### SC-MB-226 — the choice of a state brings the list back to the first page

Given the owner stands on the third page of the list
When they choose a state
Then the list shows the first page of the narrowed list, not the third

### SC-MB-227 — the filter by state outlives a transition to another page

Given the list is narrowed by a state and does not fit onto one page
When the owner goes to the second page
Then the list stays narrowed by the same state

### SC-MB-228 — a closed panel of a record brings the list back with the same filter

Given the list is narrowed by a state, and the owner opened a record by the panel
When they close the panel
Then the list stands on the same page with the same filter and the same order

### SC-MB-229 — a list that is empty by the filter of the state explains that by the filter

Given there is not a single record of the chosen state in the section
When the owner chooses that state
Then in the place of the rows stands an empty state about the filter, not about a tree that sent nothing

### SC-MB-230 — the heading of the column of the state changes the order of the list

Given the section of the incident analyses is open
When the owner presses the heading of the column of the state
Then the list is ordered by the state, and the applied order is visible on the heading itself

### SC-MB-231 — the order by state goes by the steps of the sorting out

Given there are records of every state in the list
When the owner orders the list by the state ascending
Then the records go new, then taken into the sorting out, then fixed, then released, and the
quarantine stands after them: it is not a step of the order and has no place among them

### SC-MB-232 — the intake refuses a word outside the set of the states

Given a person who entered requests a page of the analyses
When a word that is not in the set comes in the parameter of the state
Then the intake answers with a refusal with the name of the parameter, not with a page of records

### SC-MB-233 — an unreadable state in the address is read by the screen as a lifted filter

Given the owner opened the section by a link in which the state is written with a typo
When the screen takes the selection apart from the address
Then the list is shown not narrowed, and the filter stands at "all the states"

### SC-MB-234 — the section of the digests does not show the filter by state

Given the section of the digests is open
When the owner looks at the strip above the list
Then one filter by tree stands on the left, and there is no second one next to it

### SC-MB-235 — two filters on a narrow screen wrap, they are not cut

Given the section of the incident analyses is open on a narrow screen
When the owner looks at the strip above the list
Then both filters are visible whole, wrapped onto lines, and not one is cut

### SC-MB-236 — the state is named in the filter by the same words as in the column

Given there is a record in the state "ready" in the list
When the owner opens the list of the choice of the state
Then the item is named by the same word the state is labelled by in the column of that record
