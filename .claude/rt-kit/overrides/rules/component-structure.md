## Content that arrived from outside is built as nodes

Text that arrived from outside is shown as a tree of nodes built by a parser, not as a string
glued into the markup. There is no way around this: a string handed to the page is the execution
of what arrived in the browser of whoever is looking.

- **Parsing the arrived text lives as a pure function, and the component draws its nodes.** The
  decision about what in the text is markup and what is visible characters is checked by a call;
  the component stays thin and starts no branching of its own.
- **The list of understood markup is closed and nailed inside the component.** Such a component
  has one input — the text itself: there is nothing to configure, so there is nothing to weaken
  either. A forgotten input would silently open more than intended.
- **What the parser does not know stays visible text and is not cleaned away.** Cleaning is a
  promise held by a setting; a node the parser does not build never reaches the page without one
  anyway. Raw HTML, images and addresses of foreign schemes are therefore visible as characters,
  as they arrived.
- **A link leads outward only by a known scheme.** The address of a scheme that executes code
  looks like a link and fires on a click: schemes are chosen by a list, not sifted by danger.
- **The display of arrived text is assembled once for every section that shows it.** Assembled
  apart, they drift in appearance one by one, and it is the reader who notices, not a check.
