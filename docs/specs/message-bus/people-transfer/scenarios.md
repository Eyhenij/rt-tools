# Scenarios — the transfer of the bus people to Keycloak

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Не покрыто: <причина>" with a reason. The prefix is shared by the
domain.

### SC-MB-418 — a person moves with the rights of their role and their edits

Given an account whose role gives two rights, an edit taking one of them and an edit giving a third
When the export builds the transfer file
Then the person carries their address and exactly the rights left, as client roles of the bus

### SC-MB-419 — a right that left the set does not move

Given an account whose role still names a right of the people section
When the export builds the transfer file
Then that right is not among the client roles of the person

### SC-MB-420 — a disabled account and the service account stay behind and are named

Given a disabled account and the account of the cargo triage
When the export builds the transfer file
Then neither is in the file, and the report names both

### SC-MB-421 — an account without an address refuses the export

Given an account the address book does not name
When the export runs
Then no file is written, and the refusal names the account

### SC-MB-422 — the operators get the Keycloak keys of their people

Given the key map and the Keycloak keys found by the addresses
When the rewrite builds its statement
Then every old key is replaced by the Keycloak key of the same address, in one transaction

### SC-MB-423 — a person the realm does not know refuses the rewrite

Given an address of the key map that the realm does not answer with a person
When the rewrite runs
Then nothing is changed, and the refusal names the address
