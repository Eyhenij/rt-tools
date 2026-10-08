# Scenarios — the contract of the CMS

The identifier goes at the start of the test title, followed by a dash.

### SC-CMS-1 — the body reads back as it was written

Given a body of a heading and a paragraph with emphasis
When it is written to its string and read back
Then the same blocks come back

### SC-CMS-2 — a broken body is empty, an unknown block is dropped

Given a string that is not JSON, a JSON object, and an array with a block of an unknown kind and a
block without content
When each is read as a body
Then the first two give an empty body, and the third keeps only the known whole block

### SC-CMS-3 — the block kinds are fixed by their stored values

Given the list of block kinds
When it is read
Then it holds the fifteen stored values in their order

### SC-CMS-4 — a block content is read by its kind, and a broken one is empty

Given the contents of a button, a list, images, pros and cons, a note and a page link, some broken
When each is read by its kind
Then the known fields are read, the defaults stand in for the missing ones, and a broken content
reads as empty

### SC-CMS-5 — the state and the redirect kind go to the contract and back

Given every page state and both redirect kinds
When they go to the contract and back
Then every value has its pair, and an unknown contract redirect kind reads as permanent

### SC-CMS-6 — the contents are the H2 headings

Given a body with two H2 headings, an H3 heading, a paragraph and an empty H2 heading
When the contents are built
Then they hold the two H2 headings as text, in order

### SC-CMS-7 — the page path

Given a page without a link and with a section root, and pages with their own links
When the path is built
Then a page without a link lives under the root, and the others at their links from the site root

### SC-CMS-8 — a redirect answers with its code and carries the query

Given a permanent and a temporary redirect, one with its own query
When a path is asked with and without a query
Then the answer is 301 or 302, the query is carried unless the address has its own, and a path
without a redirect answers nothing

### SC-CMS-9 — the redirect list is reread at most once per its time

Given a list held for a minute
When paths are asked just before and right at the end of the minute
Then the list is read once before the end and once more after it

### SC-CMS-10 — no CMS server, no redirect

Given a CMS server that does not answer
When a path is asked
Then there is no redirect, and the answer does not fail

### SC-CMS-11 — the editor emphasis reaches the page as tags

Given HTML with styled spans for bold, italic, underline and strike-through, a span with a handler
and a broken tag
When it is prepared for the page
Then the styled spans become emphasis tags, the span with a handler leaves its text alone, and the
broken tag stays as text
