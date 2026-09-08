# Scenarios — the column, the filter and the order by the version of the release

The identifier goes at the start of the test title, followed by a dash. The numbers continue the shared
numbering of the domain and do not change at a merge into the spec of a subdomain.

While a scenario is not covered, it carries the mark "Not covered" with a reason. Scenarios whose
"Then" names a person and what they get on the screen are closed by an end-to-end spec; a measurement
in the browser goes next to it and does not count as a replacement of it. No marks are left here: all
eighteen are closed — the decisions by the specs of the common lib and of the intake, the way of a
person by the end-to-end set on the stand.

### SC-MB-237 — the version of the release is visible as a column after the state

Given the section of the incident analyses is open
When the owner looks at the rows of the list
Then after the column of the state stands the column "В какой версии" with the version of the released
records

### SC-MB-238 — at a record without a version the cell of the column is empty

Given there is a record in the list nobody released
When the owner looks at its row
Then the cell of the version is empty: neither a dash nor the word "no" stands in it

### SC-MB-239 — the filter by version stands third in the strip above the list

Given the section of the incident analyses is open
When the owner looks at the strip above the list
Then three filters stand in a row on the left: by tree, by state and by version

### SC-MB-240 — the filter lists the versions that met in the records

Given the records of the section carry two different versions of the release
When the owner opens the list of the choice of the version
Then both these versions stand in it and not a single one that is not in the records

### SC-MB-241 — a chosen version narrows the list and stands in the address

Given the list of the section is shown whole
When the owner chooses a version of the release
Then only the records of that version stay in the list, and the choice stands in the address of the
section

### SC-MB-242 — "все версии" lifts the filter and removes the parameter from the address

Given the list is narrowed by a version
When the owner chooses "все версии"
Then the list shows the records of all the versions, and there is no parameter of the filter in the
address at all

### SC-MB-243 — "без версии" narrows the list to the records that are not released

Given there are records with a version and records without one in the section
When the owner chooses "без версии"
Then only the records with an empty cell of the version stay in the list

### SC-MB-244 — the filter by version adds up with the two other filters

Given the list is narrowed by tree and by state
When the owner chooses a version
Then the records answering all three conditions stay in the list, and all three stand in the address

### SC-MB-245 — the choice of a version brings the list back to the first page

Given the owner stands at the second page of the list
When they choose a version
Then the list shows the first page of the narrowed list, not the second

### SC-MB-246 — the filter by version outlives a transition to another page and a return from the panel

Given the list is narrowed by a version and does not fit onto one page
When the owner goes to the second page, opens a record by a panel and closes it
Then the list stands at the second page with the same filter

### SC-MB-247 — a version that is not in the records gives back an empty list, not a refusal

Given the owner opened the section by a link with a version that no record has
When the screen asks for the page
Then the list is empty and explains that by the filter, and no refusal of the intake comes

### SC-MB-248 — the heading of the column of the version changes the order of the list

Given the section of the incident analyses is open
When the owner presses the heading of the column of the version
Then the list is ordered by the version, and the applied order is visible at the heading itself

### SC-MB-249 — the order by version goes by the numbers, not by the letters

Given there are records of the versions `0.9.0` and `0.10.0` in the list
When the owner orders the list by version ascending
Then `0.9.0` stands above `0.10.0`

### SC-MB-250 — a version outside the number form goes to the end of the order

Given there are records of the versions `0.10.0` and `hotfix-3` in the list
When the owner orders the list by version ascending
Then `hotfix-3` stands last, not between the number versions

### SC-MB-251 — the records without a version in the order by version go last

Given there are released records and records without a version in the list
When the owner orders the list by version ascending
Then the records without a version stand below all the released ones

### SC-MB-252 — the section of the digests shows no filter by version

Given the section of the digests is open
When the owner looks at the strip above the list
Then one filter by tree stands in it, and there is neither a filter by state nor a filter by version
next to it

### SC-MB-253 — the three filters on a narrow screen wrap, they are not cut

Given the section of the incident analyses is open on a narrow screen
When the owner looks at the strip above the list
Then all three filters are there whole, wrapped onto lines, and not one is cut

### SC-MB-254 — the operation gives back the versions that met by the kind of the cargo

Given a version met at the analyses that is not at the proposals
When the screen of the section of the proposals asks for the list of the versions
Then that version is not in the answer
