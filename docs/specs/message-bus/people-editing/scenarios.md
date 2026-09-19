# Scenarios — creating, disabling and a new password

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Не покрыто: <причина>" with a reason. The prefix is shared by the
domain.

### SC-MB-361 — a record is created from the panel and the list carries it at once

Given a signed-in person with the right `accounts:manage`
When they open the panel by the button above the list, type a name and a password and press "Завести"
Then the panel closes, one notification says the record is created, and the list shows a live row
with the name, no role and no sign-in yet

### SC-MB-362 — a taken name is refused with the named reason, and the input stays

Given a record with the name already exists
When the panel of creating is sent with that name
Then the panel stays open with the text of the dictionary for the code of the refusal above the
fields, the name stays in the field, and the list has no second row with that name

### SC-MB-363 — an empty password is refused by the receiver

Given a request to creating or to a new password
When the password is empty
Then the request is refused with a code of a bad request that says the record needs a password, and
the storage is not written

### SC-MB-364 — a new password signs in, and the old one does not

Given a record created from the panel
When a person with the right gives it a new password from the row menu and the panel of a password
Then a sign-in with the new password succeeds and one with the old one is refused

### SC-MB-365 — disabling asks a question, cuts the sign-ins and the record signs in nowhere

Given a live record with a live sign-in
When "Отключить" is chosen in its row menu and the question is confirmed
Then the row says "Отключена", the live sign-in of the record is refused on the next request, and a
sign-in with the record's password is refused

### SC-MB-366 — the own record has no disabling, and the receiver refuses it by name

Given a signed-in person with the right
When they open the row menu of their own record and send a direct request to disable it
Then the menu has no "Отключить", and the direct request is refused with the named reason

### SC-MB-367 — a disabled record is not disabled twice, and a missing name is not found

Given a disabled record and a name nobody has
When disabling is requested for each
Then the first is refused as already disabled and the second as not found

### SC-MB-368 — without the right the button and the row menu are not drawn

Given a signed-in person with `accounts:read` and without `accounts:manage`
When they open the section
Then the list is shown, the button above it is not, and no row has a menu

Покрытие: частичное — the stand has no record with the read right alone; the screen is checked by
the component with a substituted answer about the rights, not by the suite on the stand

### SC-MB-369 — the three operations are refused by the right, not by the sign-in

Given a request to any of the three operations
When it comes without a sign-in and when it comes signed in without `accounts:manage`
Then the first is refused as unauthenticated and the second as permission denied
