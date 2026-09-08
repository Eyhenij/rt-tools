# The entry into the admin application — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **Not a single operation gives the cargo without an entry.** — `libs/message-bus-api/access/feature/src/lib/access.guard.ts:canActivate`
- **A person introduces themselves by the name of an account and a password.** — `libs/message-bus-api/accounts/feature/src/lib/auth.controller.ts:login`
- **The browser carries the entry by a cookie unavailable to scripts and sends it only to its own address.** — `libs/message-bus-api/accounts/feature/src/lib/auth.controller.ts:cookieOptions`
- **The intake holds only the hash of the password.** — `libs/message-bus-api/accounts/util/src/lib/password.util.ts:passwordHash`
- **A refusal of the entry does not name what exactly did not match, and answers in the same time.** — `libs/message-bus-api/accounts/util/src/lib/password.util.ts:burnAbsentAccountTime`
- **The password gets neither into the journal, nor into the answer, nor into the address.** — `libs/message-bus-api/accounts/feature/src/lib/auth.controller.ts:login`
- **An unsuccessful attempt of the entry is written into the journal with the name of the account.** — `libs/message-bus-api/accounts/feature/src/lib/auth.controller.ts:login`
- **Unsuccessful attempts in a row lengthen the answer.** — `libs/message-bus-api/accounts/feature/src/lib/auth.controller.ts:refusal`
- **The entry lives by a term and stops being accepted at its expiry.** — `libs/message-bus-api/accounts/util/src/lib/session-token.util.ts:sessionAlive`
- **One record has several entries, and the exit breaks off the one that was come by.** — `libs/message-bus-api/accounts/data-access/src/lib/account.queries.ts:revokeSession`
- **A token of a tree does not open the admin application, and the entry of a person does not open the intake of the cargo.** — `libs/message-bus-api/access/feature/src/lib/access.guard.ts:canActivate`
- **Every operation declares its way of access openly.** — `libs/message-bus-api/access/util/src/lib/operation-access.ts:OPERATION_ACCESS`
- **An account is created, changes its password and is switched off by a command of the launch line.** — `libs/message-bus-api/accounts/feature/src/lib/account-commands.service.ts:run`
- **The name of an account is taken by one person, and the case is not told apart in it.** — `libs/message-bus-api/accounts/util/src/lib/account-name.util.ts:accountNameKey`
- **A record that is switched off creates no entry, and its former entries stop being accepted.** — `libs/message-bus-api/accounts/data-access/src/lib/account.queries.ts:disableAccount`
- **The service says at the start that there is not a single account.** — `libs/message-bus-api/accounts/feature/src/lib/account-startup.service.ts:onApplicationBootstrap`
- **A person sent to the entry from the address of a section lands after the entry where they were going.** — `libs/message-bus-admin/auth/shell/src/lib/session.guard.ts:sessionGuard`
- **The name of an account is unique by the brought-to form.** — `prisma/schema.prisma:Account`
- **The password lies only as a hash.** — `prisma/schema.prisma:Account`
