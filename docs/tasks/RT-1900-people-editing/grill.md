# Grill

Epic RT-1896, task 4 — the fourth of the epic plan `docs/plans/message-bus-access-rights.md`.

## The owner request

> бери в работу 1896 и доводи до конца

The card of the task, in the owner's words:

> Завести человека, отключить его или сменить ему пароль можно только с узла по ssh: команды
> `account add`, `account passwd`, `account disable`. Владелец, у которого под рукой нет доступа
> к узлу, не может дать доступ никому.
>
> Задача заводит эти три действия панелью рядом со списком: имя и первый пароль назначает
> заводящий, пароль передаётся человеку мимо приёмника. Отключение обрывает и прежние входы
> отключённого. Действия закрыты правом на правку людей.

## What the tree already has

- **The three actions on the receiver** — `account-commands.service.ts`: the launch-line commands
  `add`, `passwd`, `disable`, standing on `createAccount`, `replaceAccountPassword` and
  `disableAccount` of the data-access layer. Disabling already cuts the live sign-ins in one
  transaction. Removing the commands is task #1902, not this one.
- **The section of people** — `libs/message-bus-admin/accounts/`: the list, its store and its
  one route; the spec `docs/specs/message-bus/people-list/` says "the list only reads" and names
  this task as the next one.
- **The right** — `accounts:manage` stands in the closed set and in the owner role since task #1897;
  no operation is closed by it yet.
- **The sample of a panel next to a list** — the section of the invitations: the button in the
  right slot of the toolbar, the panel of creating in the outlet `ro` at `invites/new`, the row menu
  with a confirmed action, the receiver's own word shown on a refused request (`invite.fault.ts`).
- **The signed-in person's rights** — `AuthStore.allows(right)`; the container hides menu items by
  it, no screen hides an action by it yet.

## What the rules already say

- The law on access: the admin panel decides what to show by the rights it received, and hides
  nothing until they arrive. So the button and the row menu follow `accounts:manage` the same way
  the menu item follows `accounts:read`.
- The law on entity editing and the invites sample: a panel lives by an address in the outlet `ro`,
  the outcome is said by the shared notification bus, a refused request keeps the person in the
  panel with their input.
- The rule on verifiability: a scenario a person sees is closed by the end-to-end suite on the same
  path; decisions live in pure functions.

## Questions and answers

None asked: the card and the epic plan name the three actions, who names the password and what the
right is. The owner's order is to take the epic to the end.

## Decisions

- **Three operations of the receiver under one controller, closed by `accounts:manage`.** Creating
  answers with the row of the list; changing a password and disabling answer with the same row
  after the change. Rejected: reusing the command service — it answers with lines for a terminal,
  and task #1902 removes it.
- **Two panels: creating and a new password; disabling is an item of the row menu with a question.**
  Disabling has nothing to type, and a panel for one button would be a second click on the same
  question. Rejected: one panel with three modes — three states of one form read worse than two
  small panels.
- **The password is typed by the one creating, and the panel shows nothing after the success.** The
  card says who names it; the receiver stores a hash and has nothing to show back.
- **Your own record cannot be disabled from the screen, and the receiver refuses it too.** Disabling
  cuts every sign-in of the record, the current one included: the person would disable themselves
  and be thrown out in the same second. The item is not drawn for the own row, and a direct request
  is refused with a named reason.
- **A disabled record is not switched back on here.** The card names three actions and the launch
  line has no fourth; a record needed again is created anew under another name. Named in "what this
  work does not do".
- **The receiver's word on a refused request is shown as it is.** The technique of the invites
  panel lifts to the shared layer of the admin panel — both sections read the same field of the
  same refusal.

## What is left unclear

- Whether a password needs a length rule. The launch line accepts any non-empty one, and the card
  says nothing about a rule; the panel keeps the same boundary. A rule is a decision of the owner and
  costs one line in the pure function when it comes.
