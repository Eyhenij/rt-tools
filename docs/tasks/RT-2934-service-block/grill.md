# Grill

## The owner request

> делай эталонный макет в design system для асайда интеграций/оплат/мессенджеров

Asked where the block is made, the owner chose the answer «Компонент кита», and then handed the
rest over: «делай сам».

## What the tree already has

- `rt-service-logo` draws the marks of outside services in light round plates, one or several
  overlapping. It is the left part of the block and is taken as is, at the size `md`.
- The design system file holds the component «Service Block» (`7200:419`) on the page `7200:417`,
  next to the sample panels of the card payment (`7202:849`), of a messenger (`7202:1402`) and of
  the phone width (`7202:1149`, `7202:1657`). Its description names it the first block of the body
  of a connection panel: the mark, the name of the service and one line of description, with a line
  under it that parts it from the content.
- The block reads only assignments the kit already has: the heading step `xl`, the body step `sm`,
  the primary and muted text colours, the subtle border colour, the spacing steps 2, 16 and 20.

## What the rules already say

- A new kit part comes with its spec, a unit spec, a visual snapshot, a story and an overview page:
  rules `ui-component-tests`, `rt-tools-storybook`.
- Sizes, colours and fonts go through tokens, not raw values: rule `styling-bem`.
- A width limit is declared together with the fate of what did not fit: the description wraps.
- A family whose styles read a name the material preset rewrites shows both halves of the pair.

## Questions and answers

**Where is the block made?**
«Компонент кита».

**Anything else to decide before the work?**
«делай сам».

## Decisions

- **The block is a kit part, `rt-service-block`.** One markup serves the panels of integrations,
  payments and messengers. Rejected: the block written in each application panel — three copies of
  one layout drift apart at the first edit.
- **The mark is `rt-service-logo` at the size `md`, given the same items.** Rejected: an input of
  the size — the component in the design system carries the size `md` only.
- **The block carries no text of its own.** The name and the description come from the consumer.
- **The numbers are taken from the component.** Gap 16 between the mark and the text, 2 between the
  name and the description, 20 under the text to the line, the line 1 thick in the subtle border
  colour; the name is the heading step `xl` semibold, the description the body step `sm` muted.

## What is left unclear

- A block without a description. The component always draws one; the part draws none when the
  consumer gives an empty line, and the name then stands alone at the centre of the mark.
