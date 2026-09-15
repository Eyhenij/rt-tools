# Grill

## The owner request

> бери в работу 1896 и доводи до конца, мержи последний main в рабочую ветку эпика и доводи до
> конца, пукт меню переименуй в "Пользователи"

Card #1901 «Роли и права правятся только запросом к базе»: роль пока назначить нечем — набор прав у
роли лежит в хранилище, а править его можно только запросом к базе; точечную правку поверх роли —
тем же способом. Задача заводит страницу ролей и прав: роли перечислены, права у каждой отмечены, у
человека видно и роль, и что ей добавлено или отнято лично. Право, о котором роль молчит, считается
не данным — это видно на самой странице.

## What the tree already has

- The model whole: `Role` (key, name, rights[]) and `AccountPermission` (accountId, right, granted)
  in `prisma/schema.prisma`; the closed set `RIGHTS` with `rightsOf` and `hasRight` in
  `libs/message-bus-common/src/lib/rights.ts`; the right `roles:manage` is in the set and is
  granted to the owner role by the migration of 10 September.
- Roles that come with the receiver: `owner` and `cargo-triage` from the migration; the stand
  seeds `owner` and `watcher` by SQL in `apps/message-bus-admin-e2e/stand/seed-account.mjs`.
- The people section (`libs/message-bus-admin/accounts/`) with the list, the panel of creating
  and the panel of a password; `openDetails(id, ...tail)` in the list base; the row menu with a
  confirmed item; `spokenFaultText` for the receiver's word.
- The menu declaration with a right per item, the route guard by a right, `firstOpenSectionPath`.
- The manage controller of accounts as the sample of an operation closed by a right that answers
  with the row after the edit.
- The kit: `rt-checkbox` and `rt-select` are `ControlValueAccessor`s; the row menu, the aside
  base `RtRouteAsideComponent`.
- The subdomain `access-rights` leaves one open question to this task: whether the roles are
  created by the owner or come with the receiver.

## What the rules already say

- `lists`: the page is assembled by the shared list page and the list base; a row action lives in
  the row menu, an unavailable one is not drawn; an irreversible one asks by the ready-made
  confirmation fields.
- `entity-conventions`: a panel opens by a route in the outlet `ro`, saves through `runMutation`,
  reads the record by the id from the address as the full model.
- `navigation`: the item is declared once and closes both the menu and the route.
- `lib-layers`: a domain for a subject; the roles are a subject of their own — the domain `roles`;
  the access of a person is a side of the person and stays in the domain `accounts`.
- `spec-driven`: a new subdomain with the same mandatory sections; scenario numbers from the next
  free one — `SC-MB-371` (`SC-MB-370` was taken by the renumbering after the merge of main).

## Questions and answers

No questions were asked: the owner's word «доводи до конца» stands, and the card names the whole.
The decisions below are the executor's defaults and are written so that the owner can reverse any
of them by a word.

## Decisions

- **One right closes the whole subject — `roles:manage`.** The roles section, the operations over
  roles, and the role and the pointed edits of a person. Rejected: `accounts:manage` for assigning
  a role — then the person who manages records could give themself every right, and the right to
  edit people would be the right to edit rights.
- **The roles come both ways: two arrive with the receiver, the rest the owner creates.** The
  migration already creates the owner role and the triage role; the page lets the owner create,
  rename, recompose and delete roles. A role held by somebody is not deleted. Rejected: a fixed
  set that comes with the receiver — it goes stale with every new section and cannot express «one
  extra right to one person».
- **The role and the pointed edits of a person are edited from the people list, by the item
  «Права» of the row menu, in a panel at «people/<name>/access».** The people list is where the
  person is; the roles page is where the roles are. Rejected: a second table of people on the
  roles page — the same list twice.
- **A pointed edit is one of three words per right: «По роли», «Дано», «Отнято».** The panel
  shows next to each right what comes out — given or not — so that the silence of the role reads
  as «not given» on the page itself. Rejected: a checkbox per right with a mark of the override —
  a checkbox cannot say «taken away over the role».
- **The signed-in person cannot lock themself out.** An edit of a role, and an edit of the access
  of the own record, that would leave the signed-in person without `roles:manage` is refused with
  the reason. Rejected: allowing it — the next move after the save would be a refusal of the
  page the person is standing on.
- **The roles list answers as a page, like the people list.** The shared list base reads a page,
  and a list answering in another shape would be read bypassing it.
- **The rights column of the roles list names the rights in words, the panel marks them by
  checkboxes.** Rejected: a column per right — thirteen columns of one-word headings.

## What is left unclear

- Whether a role should be assignable at creating a person. The panel of creating stays as it is;
  the role is given a move later from the same row. Not blocking: the card names the page, not the
  panel of creating.
- Whether a person without a single right should see the "no sections" screen after the sign-in
  instead of staying on the sign-in screen — an epic question noted at RT-1900, not touched here.
