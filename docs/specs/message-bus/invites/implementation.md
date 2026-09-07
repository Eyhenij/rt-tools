# The section of the invitations — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **The invitations are shown by a section of their own, not by a tab of a section of the trees.** — `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts:ADMIN_MENU`
- **The section of the invitations is put together by the same list screen as the sections of the cargo.** — `libs/message-bus-admin/invites/feature/list/src/lib/admin-invites-list.component.ts:AdminInvitesListComponent`
- **The code is visible once — in the panel that issued it.** — `libs/message-bus-admin/invites/feature/create-aside/src/lib/admin-invite-create-aside.component.ts:issued` — the code lives as a field of the panel and goes away together with it; the row of the list knows nothing of it: `libs/message-bus-common/src/lib/tree-invite-view.ts:ITreeInviteView`
- **The section has no filter by tree.** — **Not checked by a machine.** The promise is about an absence: there is no filter either in the markup of the screen or in the request of the store, and there is nothing for a machine to look for. A filter that appears is judged by the review of the change
- **An empty list names the button an invitation is issued by.** — `libs/message-bus-admin/invites/feature/list/src/lib/admin-invites-list.component.ts:emptyDescription`
- **The admin application has two edits over the records of the intake — the issuing of an invitation and its revocation.** — `libs/message-bus-admin/invites/util/src/lib/invite.logic.ts:inviteCanRevoke` — the revocation is available to one waiting invitation, and the issuing is given by `libs/message-bus-admin/invites/data-access/src/lib/invites.store.ts:issue`
- **The revocation asks for agreement and names the consequence.** — `libs/message-bus-admin/invites/util/src/lib/invite.logic.ts:inviteRevokeQuestion`
- **A revocation that succeeded rereads the list whole.** — `libs/message-bus-admin/invites/data-access/src/lib/invites.store.ts:revoke`
- **About the outcome of the revocation speaks the shared bus of the notifications.** — `libs/message-bus-admin/invites/data-access/src/lib/invites.store.ts:InvitesStore`
- **A created tree is named in the row by the sign, not by a link.** — `libs/message-bus-admin/invites/util/src/lib/invite.mapper.ts:InviteShortMapper`
- **The entry of creating stands in the toolbar of the section of the invitations.** — `libs/message-bus-admin/invites/feature/list/src/lib/admin-invites-list.component.ts:openCreate`
- **The panel of creating is a neighbour of the list in the outlet `ro`, like the panels of details.** — `libs/message-bus-admin/invites/shell/src/lib/invites.routes.ts:invitesRoutes`
- **The panel asks nothing except the name of the future tree.** — `libs/message-bus-admin/invites/feature/create-aside/src/lib/admin-invite-create-aside.component.ts:name`
- **The panel does not close by itself after the issuing.** — `libs/message-bus-admin/invites/feature/create-aside/src/lib/admin-invite-create-aside.component.ts:submit` — a success puts what was issued into a field of the panel and calls no closing
- **After the issuing the name is locked, and the issuing itself is switched off.** — `libs/message-bus-admin/invites/feature/create-aside/src/lib/admin-invite-create-aside.component.ts:issued` — the button of the issuing is locked by it in the template, and the field of the name is locked by `onSuccess` of the same call
- **The list is refreshed by the same movement as the issuing.** — `libs/message-bus-admin/invites/data-access/src/lib/invites.store.ts:issue`
- **A refusal of the issuing speaks by the word of the intake and leaves the entered name in the field.** — `libs/message-bus-admin/invites/util/src/lib/invite.fault.ts:inviteFaultOf`
