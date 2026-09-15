# Grill

Epic RT-1896, task 7 — added by the owner's word when the epic was taken up again.

## The owner request

> пукт меню переименуй в "Пользователи"

## What the tree already has

- **The title** — one dictionary key `sectionPeople: 'Люди'`; the menu item, the route title and the section heading all read it. The hint `hintPeople` stays.
- **The spec** — `docs/specs/message-bus/people-list/spec.md` names the section «Люди» in "What it is called in the interface".
- **The end-to-end suite** — `SECTION.people.title` in `support/admin.ts`; the frames of every section carry the header with the item.

## Questions and answers

None asked: the owner named the word.

## Decisions

- **The word changes in the dictionary and nowhere else in code.** The address `/people` and the right `accounts:read` stay: the owner spoke of the name, and the address is what links and the suite hold on to.
