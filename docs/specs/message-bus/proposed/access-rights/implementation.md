# A right, a role and the check that reads them — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the
code, or the code holds what the spec is silent about.

The agreement is proposed, and the code under it is not written yet. The lines below name the place
each rule is to be carried out in; they are filled with the symbols by the stages of the task
RT-1897 and are read a second time when the agreement is merged into the spec of the domain.

- **A right is the pair "resource and action", and the set of rights is closed.** — `libs/message-bus-api/access/util/` — not carried out yet: the set of rights is created by stage 3 of the task RT-1897
- **A role is a named set of rights, and a person has one role.** — `prisma/schema.prisma` — not carried out yet: the storage gains the role by stage 2
- **The rights of a person are the rights of their role with their pointed edits applied over them.** — `libs/message-bus-api/access/util/` — not carried out yet: the addition is created by stage 3
- **A right the role says nothing about counts as not given.** — `libs/message-bus-api/access/util/` — not carried out yet: created by stage 3
- **A person without a role has no rights at all.** — `libs/message-bus-api/access/util/` — not carried out yet: created by stage 3
- **An operation declares its access by one mark, and a fourth kind of mark appears — by a right.** — `libs/message-bus-api/access/util/src/lib/operation-access.ts` — not carried out yet: the fourth kind is created by stage 3
- **The rights are read on every call rather than taken from the issued sign-in.** — `libs/message-bus-api/access/feature/src/lib/access.guard.ts` — not carried out yet: created by stage 3
- **A request without a sign-in is refused as unauthenticated, and a sign-in without a right as permission denied.** — `libs/message-bus-api/access/feature/src/lib/access.guard.ts` — not carried out yet: created by stage 3
- **A refusal by a right does not name which right was missing.** — `libs/message-bus-api/access/feature/src/lib/access.guard.ts` — not carried out yet: created by stage 3
- **A token of a tree carries no rights and opens no operation declared by a right.** — `libs/message-bus-api/access/feature/src/lib/access.guard.ts` — not carried out yet: created by stage 3
- **The answer about the signed-in person carries their rights whole.** — `libs/message-bus-api/accounts/feature/src/lib/auth.controller.ts` — not carried out yet: created by stage 4
- **Until the rights are received the admin panel hides nothing.** — `libs/message-bus-admin/auth/data-access/src/lib/auth.store.ts` — not carried out yet: created by stage 4
