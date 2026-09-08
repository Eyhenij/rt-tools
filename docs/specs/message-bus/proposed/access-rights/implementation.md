# A right, a role and the check that reads them — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the
code, or the code holds what the spec is silent about.

The agreement is proposed. Ten rules of it are carried out by stages two and three of the task
RT-1897 and carry a symbol; the two about what the admin panel is given are filled by stage four
and until then name the place alone.

- **A right is the pair "resource and action", and the set of rights is closed.** — `libs/message-bus-api/access/util/src/lib/rights.ts:RIGHTS`
- **A role is a named set of rights, and a person has one role.** — `prisma/schema.prisma:Role`
- **The rights of a person are the rights of their role with their pointed edits applied over them.** — `libs/message-bus-api/access/util/src/lib/rights.ts:rightsOf`
- **A right the role says nothing about counts as not given.** — `libs/message-bus-api/access/util/src/lib/rights.ts:hasRight`
- **A person without a role has no rights at all.** — `libs/message-bus-api/access/util/src/lib/rights.ts:rightsOf`
- **An operation declares its access by one mark, and a fourth kind of mark appears — by a right.** — `libs/message-bus-api/access/util/src/lib/operation-access.ts:RequiresRight`
- **The rights are read on every call rather than taken from the issued sign-in.** — `libs/message-bus-api/accounts/data-access/src/lib/account.queries.ts:findAccountRights`
- **A request without a sign-in is refused as unauthenticated, and a sign-in without a right as permission denied.** — `libs/message-bus-api/access/feature/src/lib/access.guard.ts:AccessGuard`
- **A refusal by a right does not name which right was missing.** — `libs/message-bus-api/access/feature/src/lib/access.guard.ts:AccessGuard`
- **A token of a tree carries no rights and opens no operation declared by a right.** — `libs/message-bus-api/access/feature/src/lib/access.guard.ts:AccessGuard`
- **The answer about the signed-in person carries their rights whole.** — `libs/message-bus-api/accounts/feature/src/lib/auth.controller.ts` — not carried out yet: created by stage 4
- **Until the rights are received the admin panel hides nothing.** — `libs/message-bus-admin/auth/data-access/src/lib/auth.store.ts` — not carried out yet: created by stage 4
