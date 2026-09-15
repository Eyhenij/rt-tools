# Scenarios — the first record and the end of the account commands

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Не покрыто: <причина>" with a reason. The prefix is shared by the
domain.

### SC-MB-383 — an empty storage answers that the first record is still to be created

Given a node whose storage holds not one account
When the operation of the first run is asked
Then it answers yes; with one record in the storage it answers no

### SC-MB-384 — the first record is created with the owner role and signed in at once

Given a node whose storage holds not one account
When the first-run operation is called with a name and a password
Then the record is created with the owner role and a hash in the storage, a session is created,
the cookie of the sign-in is set, and the answer names the person and every right of the set

### SC-MB-385 — with a record in the storage the first run is closed forever

Given a node whose storage holds a record
When the first-run operation is called with any pair
Then it refuses with a conflict naming that the first record is already created, and the storage
is not written

### SC-MB-386 — an empty name and an empty password are refused before the write

Given a node whose storage holds not one account
When the first-run operation is called with an empty name, or an empty password
Then it refuses as a bad request naming which of the two waits, and the storage is not written

### SC-MB-387 — a node without the owner role refuses the first record naming the role

Given a node whose storage holds not one account and not the owner role
When the first-run operation is called
Then it refuses naming the missing role, and no record is created

### SC-MB-388 — two first records at once give one record

Given a node whose storage holds not one account
When two first-run requests arrive at once
Then one record is created, and the other request is refused as a closed first run

### SC-MB-389 — the startup line about an empty storage names the screen

Given a node whose storage holds not one account
When the receiver comes up
Then it writes one warning naming the first-run screen, and not a command

### SC-MB-390 — the sign-in screen sends to the first-run screen while the storage is empty

Given a node whose storage holds not one account
When a person opens the address of the admin panel
Then they see the first-run screen — the name, the password and "Завести" — and not the sign-in
form

Покрытие: частичное — the stand always holds accounts after its seeding; the redirect is
checked by call on the screen, and the screen on an empty storage is walked by the seed of the
stand, not by a person.

### SC-MB-391 — the first record from the screen lands the person in the admin panel signed in

Given the first-run screen
When the person types a name and a password and presses "Завести"
Then the admin panel opens on the first open section, and the top row shows every section

Покрытие: частичное — the stand always holds accounts after its seeding; the landing is checked
by call on the screen, and the road on an empty storage is walked by the seed of the stand.

### SC-MB-392 — after the first record the first-run address shows the sign-in

Given a node whose storage holds a record
When a person opens the address of the first-run screen
Then they see the sign-in screen, and a direct first-run request is refused as a closed first run

### SC-MB-393 — the account commands are not in the tree

Given the launch line of the receiver
When an account command is called
Then the receiver answers with the list of the tree commands and does not know the account ones

### SC-MB-394 — the stand seeds the account and the people by the operations

Given the end-to-end stand
When it seeds its storage
Then the account is created by the first-run operation and the people by the operations of the
people section; the suite signs in by them as before
