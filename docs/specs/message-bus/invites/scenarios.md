# Scenarios — the section of the invitations

The identifier goes at the start of the test title, followed by a dash. The numbers continue the
shared numbering of the domain: the prefix belongs to the domain together with its subdomains, and at
the splitting off of a subdomain they are not recounted.

While a scenario is not covered, it carries the mark "Not covered" with a reason, and one closed from
the side of the intake but not from the side of the screen carries the mark "Coverage: partial".
Scenarios whose "Then" names a person and what they get on the screen are closed by an end-to-end
spec; a measurement in the browser goes next to it and does not count as a replacement of it.

### SC-MB-128 — an issued code is printed once

Given the owner issued an invitation
When they call the list of the invitations
Then the name, the state and the terms are there, and the code itself is neither in the list nor in
the storage

### SC-MB-154 — the entry of creating stands in the toolbar of the section of the invitations

Given the section of the invitations is open
When the owner looks at the strip above the list
Then the button "Пригласить проект" stands there, and the rest of the sections have no entry of
creating

### SC-MB-155 — the panel of creating opens by an address of its own

Given the section of the invitations is open
When the owner presses "Пригласить проект"
Then a panel slides out on the right, its address stands in the line of the browser, and a reload of
the page leaves the panel open

### SC-MB-156 — the issuing gives the code back once and shows it in the panel

Given a free name of a future tree is entered in the panel
When the owner presses to issue
Then the code, the button "Скопировать" and the term of validity appear in the panel, and the panel
itself stays open

### SC-MB-157 — an issued invitation is at once in the list as a waiting one

Given an invitation was just issued by the panel
When the owner looks at the list behind the panel
Then a new row with the same name, the state "ждёт" and the same term stands in it

### SC-MB-158 — a closed panel shows the code no more

Given the invitation is issued and the panel is closed
When the owner opens the panel of creating again
Then it is empty, and the former code is neither in it nor in the row of the list

### SC-MB-159 — a taken name is refused with a named reason

Given a valid invitation on this name already exists
When the owner tries to issue one more
Then the panel says that a valid invitation on this name already exists, and the entered name stays
in the field

### SC-MB-160 — the name of a created tree is refused by a reason of its own

Given a tree with this name is already created
When the owner tries to issue an invitation on it
Then the panel says that a project with such a name is already created

Coverage: partial — the refusal of the intake was checked by a call, and the showing of its word to a
person is closed by the end-to-end spec only for a taken invitation: there is no created tree with a
name free of an invitation on the stand.

### SC-MB-161 — the issuing opens neither without an entry nor by a token of a tree

Given the request of the issuing came without an entry or with a token of a tree
When the intake takes it apart
Then it answers with the same refusal as to the rest of the operations of the admin application, and
creates no invitations

Coverage: partial — the declaration of the access at the operation itself was checked by a call; that
it is refused by the check of the intake is closed by the specs of the check of the access.

### SC-MB-162 — an empty section names the button, not the command of the node

Given not a single invitation was issued yet
When the owner opens the section
Then the empty state names the button "Пригласить проект", not a command of the launch line

Coverage: partial — checked by a call on a raised screen of the section; it is not closed by the
end-to-end spec, because the stand seeds an invitation per state and an empty section never happens
on it.
