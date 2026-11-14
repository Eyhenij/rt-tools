# Grill

## The owner request

> Да, отдельной задачей

> возьми RT-3309 в работу

The question it answers: whether to let the `mc.yandex.ru` frame into `frame-src` of a product
realm — asked after the check of the counters on the login node on 14.11.2026.

## What the tree already has

- The counters of the entry pages, spec `docs/specs/auth/counters/`: its decision held
  `mc.yandex.ru` out of `frame-src` until a frame is asked for, and Q-2 stayed open.
- The login node, 14.11.2026, a realm with a real Metrika number: the page console showed
  «Framing 'https://mc.yandex.ru/' violates the following Content Security Policy directive:
  "frame-src 'self' https://www.google.com"». The hits and `watch` went through; the frame is
  `metrika/match.html`.
- The realm `rt` declares no security headers in `deploy/auth/realm/rt.json`; the stand answers
  with the Keycloak default — `frame-src 'self'; frame-ancestors 'self'; object-src 'none';` and
  six more headers, read from the admin API of the stand.
- A realm of a product lives in that product's own tree; this tree reaches it only through the
  connection guide `docs/auth-integration.md`.

## What the rules already say

- `spec-driven`: a closed open question leaves the spec; a decision changed by a measurement is
  rewritten.
- `testing`: a promise about what the page answers is closed by an end-to-end test on the stand.

## Questions and answers

None: the request names the change, and the tree names where it lives.

## Decisions

- **The realm `rt` declares all its security headers, not only the policy.** A map given by the
  realm file replaces the default one whole, and a header missing from it would stop being sent.
  Rejected: the policy key alone.
- **Only `https://mc.yandex.ru` is added.** That is the frame the node asked for. Rejected: the
  other Metrika hosts — nothing has asked for them.
- **The product realm is reached by the guide.** Its file is not in this tree.

## What is left unclear

- Whether the Webvisor recording plays after the edit — seen only in the counter cabinet of a
  realm with a real number, after the product edits its own realm file.
