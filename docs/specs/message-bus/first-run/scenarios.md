# Scenarios — the first record and the end of the account commands

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Не покрыто: <причина>" with a reason. The prefix is shared by the
domain.

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
