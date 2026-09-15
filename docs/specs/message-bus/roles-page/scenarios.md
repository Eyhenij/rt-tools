# Scenarios — roles and rights on a screen

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Не покрыто: <причина>" with a reason. The prefix is shared by the
domain.

### SC-MB-371 — the section of roles lists every role with its rights and its people

Given a signed-in person with the right `roles:manage`, and the stand with the owner role and the
watcher role
When they open the section "Роли"
Then every role stands as a row with its name, its rights named in words and the number of people
holding it; the owner role counts the signed-in person among its people

### SC-MB-372 — without `roles:manage` the item is absent and the address does not open

Given a signed-in person without the right `roles:manage`
When they look at the top row and open the address of the section by hand
Then the item "Роли" is not drawn, and the address leads to a section open to them

### SC-MB-373 — a role is created from the panel and the list carries it at once

Given the section of roles with the right
When they open the panel by the button, type a name, tick one right and press "Завести"
Then the panel closes, one notification says the role is created, and the list shows the row with
the name, the one right in words and no people

### SC-MB-374 — a role is recomposed from its panel, and the row follows

Given a role created from the panel
When they open its panel from the row menu, tick a second right and press "Сохранить"
Then the row names both rights

### SC-MB-375 — a taken name is refused with the named reason, and the input stays

Given a role with the name already exists, by the key rather than by the letters
When the panel of creating is sent with that name in another letter case
Then the panel stays open with the word of the receiver above the fields, and the list has no
second row with that name

### SC-MB-376 — a role held by somebody is not deleted, and one nobody holds is

Given the owner role held by the signed-in person, and a role nobody holds
When the row menu is opened on both, and "Удалить" is confirmed on the second
Then the first row has no item "Удалить"; the second row leaves the list after the question, and
one notification says the role is deleted. The receiver refuses a direct deletion of a held role
with a conflict naming how many hold it

### SC-MB-377 — the access of a person shows the role, the three words and the outcome

Given a person without a role
When "Права" is opened from their row of the people list
Then the panel names "Без роли", every right of the set stands with the word "По роли" and the
outcome "нет"

### SC-MB-378 — a role and pointed edits given from the panel open exactly those sections

Given a person without a role, and a role that opens two sections
When the panel of access gives them that role, takes one of its rights away and gives one right
the role does not have, and "Сохранить" is pressed
Then the outcome next to each right follows the choice before the save; after it the panel closes,
the people list names the role in the row, and that person, signed in, sees in the top row exactly
the sections their rights name

### SC-MB-379 — the receiver refuses what would lock the signed-in person out

Given the signed-in person holds `roles:manage` by their role
When their role is recomposed without `roles:manage`, or the access of their own record takes
`roles:manage` away
Then both requests are refused with a conflict naming the lock-out, and the storage is not written

### SC-MB-380 — a right outside the set and an empty name are refused before the write

Given a request to create or edit a role, or to replace the access of a person
When the name is empty, or a right is not in the closed set, or one right is named twice
Then the request is refused as a bad request naming what is wrong, and the storage is not written

### SC-MB-381 — the access of a person is replaced whole, in one transaction

Given a person with a role and two pointed edits
When the access is replaced with another role and one different pointed edit
Then the storage holds the new role and exactly the one edit; the former edits are gone, and the
answer carries the rights that come out of the new role and the new edit

### SC-MB-382 — every operation of the subject is closed by `roles:manage`

Given the operations over roles and over the access of a person
When their declarations are read
Then each is declared by the right `roles:manage`, none by the right of editing people
