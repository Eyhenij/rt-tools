# Scenarios — the first record and the end of the account commands

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Не покрыто: <причина>" with a reason. The prefix is shared by the
domain.

### SC-MB-393 — the account commands are not in the tree

Given the launch line of the receiver
When an account command is called
Then the receiver answers with the list of the tree commands and does not know the account ones
