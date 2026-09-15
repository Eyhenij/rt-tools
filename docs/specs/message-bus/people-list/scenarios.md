# Scenarios — the list of people

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Не покрыто: <причина>" with a reason. The prefix is shared by the
domain.

### SC-MB-360 — the section shows the name, the role, the state and the last sign-in

Given accounts of the receiver, among them a disabled one, one without a role and one that never
signed in
When a person with the read right opens the section
Then every account is a row with four values: the name, the role or the words that there is no role,
the state in words, and the date of the last sign-in or a dash

### SC-MB-325 — without the read right the section is neither seen nor opened

Given a signed-in person without the right `accounts:read`
When they look at the menu and go to the address of the section
Then the item is not in the menu and the address does not open, and a direct request to the read
operation is refused by a right

### SC-MB-326 — the read operation is refused without a sign-in and without a right apart

Given a request to the read operation
When it comes without a sign-in and when it comes signed in but without the right
Then the first is refused as unauthenticated and the second as permission denied: the first is cured
by signing in, the second is not
