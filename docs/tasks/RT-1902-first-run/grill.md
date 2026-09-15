# Grill

## The owner request

> бери в работу 1896 и доводи до конца, мержи последний main в рабочую ветку эпика и доводи до
> конца, пукт меню переименуй в "Пользователи"

Card #1902 «Команды учётных записей дублируют экраны, а первую запись из веба завести некому»:
after creating, a new password and disabling came to the screen, the same actions stay as
launch-line commands, and two ways to one action diverge in silence. The task removes the commands
`account add`, `account passwd`, `account disable` and `account list` and closes the hole they
held: nobody can create the first record from the web. How exactly is decided in this task; the
card proposes a first-run screen, open exactly while the storage holds not one account and closed
forever after the first one. Last in the epic: until it the commands are the only way in when the
admin panel does not come up.

## What the tree already has

- The commands: `AccountCommandsService` with its module in
  `libs/message-bus-api/accounts/feature/`, the parse `account-command.util.ts` and the report
  `account-report.util.ts` in the accounts util, the branch in `apps/message-bus/src/main.ts`
  and the import in `apps/message-bus/src/app/commands.module.ts`. The tree commands
  (`tree:add`, `tree:token`, `tree:invite`…) stay: they are not the subject of the card.
- The startup line of `AccountStartupService`: on an empty storage it names the command
  `account:add` — after the task it has to name the screen.
- The sign-in path to reuse: `AuthController.login` creates the session and sets the cookie;
  `createSession`, `issueSessionToken`, `sessionTokenHash`, `cookieOptions` live next to it.
  Creating a record with a hash: `AccountsManageController.create` with `person-edit.util.ts`.
- The owner role comes with the receiver by the migration
  `20260910100000_grant_rights_to_existing_accounts` (`ON CONFLICT DO NOTHING`), so the first
  record has a role to take.
- The admin sign-in: `authRoutes` with `sign-in`, `sessionGuard` sending to it,
  `AdminSignInComponent` on the `login` layout block, `AdminSignInFormComponent` in the auth ui,
  `AuthStore.signIn` and `restore`.
- The end-to-end stand seeds the account and the people by the commands
  (`apps/message-bus-admin-e2e/stand/seed-account.mjs`: `account:add`, `account:disable`); the
  trees and the invites — by the tree commands, which stay. The receiver is up before the seed
  runs, so the seed can call the operations over HTTP.
- Texts naming the commands: the domain `spec.md` (the surface table and a decision), the
  subdomain `admin-auth` (a rule, a decision, scenarios SC-MB-33, 42, 43, 58, 59), the intake
  refusal text in `tools/cargo-pull.mjs` with its scenario SC-AK-561 in
  `projects/agent-kit/tests/cargo-pull.test.sh`.

## What the rules already say

- `permissions`: a public operation is declared with a reason and, if it creates a record, is
  closed by a rate limiter as well — the first-run creation is public while the storage is empty
  and refuses afterwards; the refusal itself is the limiter's job here.
- `entity-conventions`: a save goes through a store answering with a stream; the screen is not a
  panel of a record, it is a screen of its own like the sign-in.
- `navigation`: the first-run screen is not a section and gets no menu item; it lives next to
  `sign-in` outside the shell.
- `testing`: the scenario a person sees is closed end-to-end; what the stand never has by design is
  a lawful skip with a reason. The stand always holds accounts after its seeding.
- `spec-driven`: a scenario deleted or reworded is edited together with its test in one change;
  a number is never reused — the next free one is `SC-MB-383`.
- `agent-kit-source`: the intake test in the package suite is edited under that rule.

## Questions and answers

No questions were asked: the owner's word «доводи до конца» stands, and the card names both the
removal and the proposed way to close the hole. The decisions below are the executor's defaults,
written so that the owner can reverse any of them by a word.

- **Does the task change the application's behaviour** — yes: the commands leave, the first-run
  screen and its two operations arrive. Closed by the card.
- **Does it need an edit of a law or a rule** — no law; the companion of `permissions` and the
  subdomain texts are edited. Closed by exploration.
- **One task or several** — one: the removal without the screen leaves a node with no way in, and
  the screen without the removal leaves the two diverging ways the card complains about. Closed by
  the card's own wording.
- **What is not part of the task** — see below. Closed by assumption.
- **What will show that the task is closed** — the commands are not in the tree, the stand seeds
  through the operations, the first record is created from the screen and the screen closes after
  it; the suite is green. Closed by the epic plan's "What the epic ends with".
- **Is there a sample** — the sign-in screen for the screen, `AuthController.login` for the
  sign-in after creation, `AccountsManageController.create` for the record. Closed by exploration.

## Decisions

- **The hole is closed by a first-run screen, as the card proposes.** Two public operations:
  `GET /api/setup` answers whether the first record is still to be created; `POST /api/setup`
  creates it with the owner role and signs the person in at once. Both are refused with a
  conflict the moment the storage holds a record. Rejected: a pair from the environment at
  startup — a password in the environment lives in the deploy files and the process list; a
  command kept for the first record only — the very duplication the card removes.
- **The first record takes the owner role that comes with the receiver.** A first person without
  a single right would sign in and see nothing, and there would be nobody to give them a role.
  Rejected: creating a role from the screen — the roles page already does that, once one is in.
- **The sign-in screen sends to the first-run screen while the storage is empty, and the first-run
  screen sends to the sign-in once it is not.** One address for a person to remember — the
  address of the admin panel; the receiver decides which screen stands behind it.
- **The stand seeds the account by the first-run operation and the people by the operations of
  the people section.** The seed goes the way a person goes; a hash computed by the seed itself
  would be a second copy of the receiver's way.
- **The scenarios about the commands are reworded to the screen, not renumbered.** SC-MB-42, 43,
  59 keep their numbers and are carried by the util tests and the people-editing suite; the
  command tests leave with the commands.

## What is left unclear

- Whether a person without a single right should see a "no sections" screen after the sign-in —
  an epic question, noted in the epic plan, not touched here.
- Whether the first-run screen should ask the password twice. Once, like the panel of creating a
  person: the person who types it is the one who will use it a minute later, and the screen says
  so. Not blocking.
