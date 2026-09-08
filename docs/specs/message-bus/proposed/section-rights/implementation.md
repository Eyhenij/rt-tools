# A section closed by a right — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the
code, or the code holds what the spec is silent about.

The agreement is proposed: not one of its rules is carried out yet, and every line names the stage
of the task RT-1898 that creates it.

- **A menu item carries the right that opens its section, and the address is closed by that same declaration.** — `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts` — not carried out yet: created by stage 3
- **An item whose right the signed-in person does not hold is not drawn.** — `libs/message-bus-admin/common/container/feature/src/lib/admin-container.component.ts` — not carried out yet: created by stage 3
- **The address of a closed section does not open by a direct link either.** — `libs/message-bus-admin/auth/shell/src/lib/session.guard.ts` — not carried out yet: created by stage 4
- **Until the answer about who signed in has arrived, nothing is hidden.** — `libs/message-bus-admin/auth/data-access/src/lib/auth.store.ts:allows` — carried out by the task RT-1897, read here by the item and by the guard
- **A person to whom no section is open sees the admin panel without sections, with their name and the way out.** — `libs/message-bus-admin/common/container/feature/src/lib/admin-container.component.ts` — not carried out yet: created by stage 3
- **The root of the admin panel leads into the first section open to the person, not into the first of the list.** — `apps/message-bus-admin/src/app/app.routes.ts` — not carried out yet: created by stage 4
- **The operations a section lives by are closed by the read right of that section.** — `libs/message-bus-api/` — not carried out yet: created by stage 5
- **The set of rights is declared once and read by both sides.** — `libs/message-bus-common/` — not carried out yet: created by stage 2
- **A right taken away closes the section on the next move, not on the next sign-in.** — `libs/message-bus-admin/auth/shell/src/lib/session.guard.ts` — not carried out yet: created by stage 4
