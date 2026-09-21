# The findings of the review of the closed works of the epic RT-2177

The findings accumulate here while the epic "The chat with the visitors" goes: the owner reads them
when the epic is over and says what of them is right. What they name is made into a proposal and
leaves for the package; outward without that word goes only the digest of the observations.

The file lies next to the plan of the epic — `docs/plans/chat-service.md` — and not inside it: over
an epic more findings accumulate than the plan itself, and the plan would stop reading as a decision
about the order of the works.

## RT-2182 — the widget of the visitor, the review of 21 September 2026

Loaded over the task: `task-flow`, `git-workflow`, `doc-style`, `doc-style-human`, `spec-driven`,
`testing`, `browser-verification`, `ui-component-tests`, `typescript-conventions`, `lib-layers`,
`reuse-first`, `angular-patterns`, `entity-conventions`, `entity-models`. The conduct rules and the
delivery rule carried the work without a gap; six findings are about the rest.

1. **A BEM attribute without the declared directive is an ordinary attribute** — the rule
   `styling-bem` does not say it, and neither the build, nor the linter, nor the styles check sees
   it: all three read the text of the markup and never open the component file. It cost the unstyled
   rows of the chat section in RT-2181, found by a screen frame one task later. A second-order
   consequence: such an attribute also silences the reinvention guard on the same line, because a
   native tag carrying a kit directive is cut out of its signs.

2. **The ready-made that does not travel to the place of showing is not the ready-made** — the rule
   `reuse-first` names the public site with a design system of its own, but not the case where the
   showing place is not an application of this tree at all. The widget is written by hand because
   the kit would carry a framework into every page of every consumer, and that had to be argued
   from scratch.

3. **A page the service admits by its address is served by the stand itself** — neither
   `browser-verification` nor `ui-component-tests` names a host page belonging to nobody. Both the
   serving of the page by the stand and the fallback to the address of the referring page were
   derived from refusals seen in probes: a request from the service's own address carries no header
   of the origin at all.

4. **The replacement table of `doc-style-human` is an excerpt, and the two lists run in opposite
   directions** — the whole list of the banned words lies with the prose check, each ban with its
   own replacement, while the six-row table of the pattern reads as the whole of it. The word "PR"
   stands in both lists: banned by one and offered by the other.

5. **The runtime layer sign of the gate misses `localStorage` and a bare `document.`** — the rule
   `platform-access` names both, and the sign of the gate catches neither: in any screen file of
   this tree such a call passes in silence, and the rule that forbids it is never loaded. The widget
   itself is the lawful exception — a web component without an injector.

6. **Two entries of the gate map** — a spec of pure functions of the widget demanded the whole rule
   about snapshots and showcases, and the styles of the widget, held as a string in a `.ts` file,
   demanded no styles rule at all.

The first four belong to the package — they name no value of this tree; the last two are this
tree's own, the gate sign and the gate map. Ready wordings are written out for whatever the owner
names as right: written out beforehand, they read as edits already agreed.
