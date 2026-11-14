# The counters of the entry screens

**Status:** in force · **Revision:** 2026-11-14 · **Scenario prefix:** `SC-AUTH`
**Depends on:** `theme`
**Laws:** `verifiability`
**Procedures:** none

A subdomain of the entry module: the GA4 and Yandex Metrika counters on the pages of the Keycloak
theme `rt`. The theme loads them when the node gives the numbers of the realm, so the path of a
person from the application page through the entry to the admin is seen in the counters of their
product.

## Why

Without counters on the entry pages the path of a person breaks at the sign-in: the counters see
the application page and the admin, and nothing between them.

## Terminology

| Term             | What it is                                                                 |
| ---------------- | -------------------------------------------------------------------------- |
| A counter number | The GA4 measurement id `G-…` or the Metrika counter number                 |
| A theme property | A value Keycloak reads from its environment and puts on the page           |
| The page id      | The name of the page template without `.ftl`, for example `login`          |
| Webvisor         | The Metrika recording of a visit: the page markup and the person's actions |

### What it is called in the interface

Not applicable: the counters show nothing on the screen.

## Rules

- **Every page of the theme loads GA4 and Metrika after it is drawn, when their numbers are set.**
  The numbers come as a theme property from the environment of the Keycloak node; an empty or
  malformed number loads no tag of that counter. The pages the theme does not draw load them too.
- **Each realm reports to its own pair of numbers.** One Keycloak serves every product, and the
  property holds a pair per realm; a realm without an entry loads no counter, so no product
  reports to another's.
- **The page view goes to both counters with the page id.** The id is the template name without
  `.ftl` — `login`, `register`. GA4 sends the view from the tag config, and Metrika from the hit
  with the page address and title.
- **A form that leaves the page sends the event `auth_form_submit` with the page id.** A form the
  page holds as invalid sends nothing.
- **No value typed into a field reaches a counter.** The events carry the page id only, and
  Webvisor records no key pressed in a field: every field carries `ym-disable-keys`. The entry pages
  show no consent banner.
- **A typed value lives in a field property and never in the page markup.** The named fields that
  carry the values to Keycloak are hidden text and password fields, not `type="hidden"`: a hidden
  field writes its value into the markup Webvisor records.
- **The page address loses the action token and the login hint before a counter starts.** The
  token of a mail link holds the address, and the counters report the page address.
- **A link address in the markup carries neither the action token nor the login hint.** Webvisor
  records the markup with its attributes, and the «proceed» link of a mail page leads to the token.
  The link shows the address without them, and a click still goes to the full one.
- **A standard page is recorded with its whole text hidden.** A page the theme does not draw itself
  may name the person in any node, so its body carries `ym-hide-content`.
- **A field filled from the context keeps its value in the field property.** A standard page writes
  a default value, the login hint among others, into the `value` attribute; the attribute is taken
  off and the value stays in the property the form sends.
- **The inline script with the page context leaves the markup before a counter starts.** Its text
  holds the action address with the token and the person's name and address; it has already run.
- **The text that shows a person is hidden from Webvisor.** A Keycloak message may name the
  address, so the message, the title and the summary of a message page and the alert of a standard
  page carry `ym-hide-content`, together with the address on the confirmation page and the name the
  standard pages show above a form.

## What is out of scope

- A consent banner: the owner decided the entry pages show none.
- The goal in Metrika and the custom parameter `page_id` in GA4 — set in the counters themselves.
- The counter numbers of the login node — set in its environment, not in the tree.

## Contract

Not applicable: the counters serve no procedures.

### Refusal codes

Not applicable.

## Data

Not applicable: the theme keeps nothing. The numbers are the theme property `COUNTERS_BY_REALM`
from the environment of the Keycloak container: `realm=ga:metrika` per product, separated by
commas.

## Screens and states

Not applicable: the counters draw nothing. A page without numbers loads no tag.

## Cross-cutting requirements

### Locales

Not applicable: the events carry no text.

### SEO

Not applicable: the pages are not indexed.

### Mobile layout

Not applicable: the counters draw nothing.

### Several objects

A pair of numbers per realm, that is per product, in one property of the node; a realm without
an entry loads nothing. The owner's choice of 14.11.2026: «Пара на каждый продукт (Рекомендую)».

## Decisions

- **The submit event is sent from a listener on the document, for a submit not prevented.** The
  page holds an invalid form by preventing its submit. Rejected: a call in each page component —
  the standard pages would get none.
- **A malformed number counts as absent.** A typo in the environment loads no foreign tag.
- **`mc.yandex.ru` is not added to `frame-src` until a frame is asked for.** Under the Keycloak
  default policy `frame-src 'self'` the stand showed no refusal, but it ran with a made-up Metrika
  number: the tag takes its settings, Webvisor among them, by the number, so the absence of a
  refusal proves nothing yet. Rejected: adding the permission in advance — nothing has asked for it.
- **The page address is cleaned in the history, not only in the hit.** Webvisor records the address
  of the page itself, and a hit address alone would leave it there. The price: when the numbers are
  set, a reload of an action token page opens the address without its token, and Keycloak answers
  with an error.
- **The marks follow what the page draws later.** A standard page is drawn after its styles load,
  that is after the counters start, so a watch on the document marks every node it adds. Rejected:
  starting the counters after the first draw — a message drawn by a later action would still slip.
- **A link keeps the full address in a click handler.** A click, a middle click and a click with a
  modifier lead to it. «Open in a new tab» from the context menu takes the shown address without
  the token and opens an error page; rejected: hiding the whole link from Webvisor, which records
  its attributes anyway.

## Open questions

- Q-2 — whether Webvisor asks for a frame of `mc.yandex.ru` on the entry pages and whether its
  recording plays under the Keycloak `frame-ancestors 'self'`: checked only with a real Metrika
  counter with Webvisor on.

## History of changes

- 2026-11-14 — the counters on every page, task RT-3301.
