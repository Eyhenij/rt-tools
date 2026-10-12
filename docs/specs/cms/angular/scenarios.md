# Scenarios — the Angular client of the CMS

The identifier goes at the start of the test title, followed by a dash.

### SC-CMS-41 — a text style is applied once

Given a selection with no style and one already bold, italic, struck or underlined
When the style is pressed
Then the first is wrapped in the style, and the second loses it rather than getting a second one

### SC-CMS-42 — a link reads back with its settings

Given a link to a page with its settings and an empty link
When the link is read from the text
Then the first gives the same settings, and the second reads as not set

### SC-CMS-43 — the link settings leave foreign values alone

Given a link with `nofollow` and foreign `rel` values
When `nofollow` is removed
Then the foreign values stay

### SC-CMS-44 — pasted markup loses code

Given pasted markup with a script, an image and a handler
When it is cleaned
Then they are gone and the text stays

### SC-CMS-45 — pasted markup becomes blocks

Given a paragraph, lists, a heading, a loose span and an empty list
When they are pasted
Then each becomes a block of its own, the span a paragraph, and the empty list no block

### SC-CMS-46 — text is pasted into a block with text

Given text copied from the editor and plain text
When it is pasted into a block with text
Then the editor text is wrapped, and the plain text replaces the selection

### SC-CMS-47 — a pasted link and pasted styles

Given a pasted link, a loose link repeated by its text, and pasted styles
When they are pasted
Then the link is external with a new tab and `nofollow`, the repeat is dropped, and only bold,
italic and the line stay

### SC-CMS-48 — items of one list are joined

Given pasted items carrying one list number
When they are pasted
Then they become one list

### SC-CMS-49 — the type settings are read

Given empty settings, settings hiding a required field and ids with non-strings
When they are read
Then the page, the tags, the media and the editor are on, the required field is visible, and only
string ids stay

### SC-CMS-50 — the form sections follow the settings

Given type settings with sections and fields
When a section or a required field is toggled
Then the sections go in a fixed order, the main fields always stay, and a required field is
visible

### SC-CMS-51 — the page form follows its draft

Given a draft with images, connections, tags and a publication date
When images, connections and tags are added and the date is edited
Then the first image is the main one and stays, a connection is set once and not to the page
itself, the allowed tags come with their parents, and the date goes back without loss

### SC-CMS-52 — when saving is open

Given a form without edits, invalid, under a foreign lock, during a save and a new page
When saving is asked
Then it is closed in the first four, and the description of the new page repeats the title until
edited

### SC-CMS-53 — the preview address

Given a draft, an archived and a published page
When the preview address is built
Then the first two carry the token and the third does not

### SC-CMS-54 — the block menu

Given the block menu
When a block is added or converted
Then every kind is offered under its label, a new block is empty with an id of its own, and a
converted one keeps its id

### SC-CMS-55 — the labels

Given no settings, application labels with a blank key, and a language change
When a label is read
Then every key gives its English default, the application labels win, a blank stays English, and
the labels recompute on the change

### SC-CMS-56 — the list address

Given an address with a page and a search, an empty one and one not understood
When it is read and written back
Then the page and the search read, the defaults read as the first page and are erased, and the rest
reads back the same

### SC-CMS-57 — the list paging

Given a list on a page with a size and a search
When the page, the size or the search changes
Then a page change keeps the rest, a page below the first reads as the first, and a new size or
search goes back to the first page

### SC-CMS-58 — the server answers read in the CMS notions

Given a saved page, a bare page, a list row, a tag tree, a redirect and a filter status
When they are read
Then each reads with its images, lock and connections, a bare page with empty fields, and a draft
goes back to the contract whole

### SC-CMS-59 — an answer without a page

Given an answer to a page request without the page
When it is read
Then it is thrown as a broken contract

### SC-CMS-60 — refusals keep the screen

Given refusals of a list, an opening, a save, a deletion, a mark, tags, redirects and types
When each comes
Then the screen keeps its state, says what failed, names a missing right and a taken source apart

### SC-CMS-61 — the pages of a type

Given a type with pages
When the list loads, a page is deleted or featured, and connections are searched
Then the list loads by type, status, language, page and search, changes follow, and the search asks
the first page with any status

### SC-CMS-62 — the page lock

Given a new page, an opened page and a page another person holds
When each is saved and left
Then the new page is created and locked, the opened one locked, saved and released, and the held
one refused with the lock named

### SC-CMS-63 — types, tags and redirects

Given the types, the tag tree and the redirects
When each is saved or deleted
Then the list or the tree is read again, or the row is removed

### SC-CMS-64 — one call sets the client

Given an application with and without a translator
When the client is set
Then it gets the transport, the site address, the languages and the labels, English without a
translator

### SC-CMS-65 — the folder tree

Given folders with parents, a loop and an unknown folder
When the tree and a path are built
Then the root holds the folders without a parent, a folder its children by name, and the path
reaches the root without breaking

### SC-CMS-66 — the picture preview

Given a file with copies and one without
When its preview is taken
Then the narrowest copy is taken, or the original

### SC-CMS-67 — the media library

Given a folder with files
When it opens, files are uploaded or deleted, and folders are saved or deleted
Then files read from the first page with a preview and size, uploads go first in order, and changes
follow

### SC-CMS-68 — media refusals

Given refused uploads and folders
When each comes
Then the cause is named by the code, an upload refusal names the file, and a missing right is
named

### SC-CMS-69 — the form body as blocks

Given a form body
When it is drawn and a block is added
Then it is drawn as blocks and goes back to the form as a string

### SC-CMS-70 — the video frame takes listed providers

Given video addresses of listed providers, of another provider, a smuggled id and an arbitrary site
When the frame address is built
Then only the listed providers get a player address

### SC-CMS-71 — the site page model

Given server pages with and without an image, meta fields, tags and blocks of an unknown kind
When the site page is built
Then empty meta fields come from the title and description, the rubric is the root tag of the first
tag, an unknown block is skipped and the contents follow the H2

### SC-CMS-72 — the sitemap

Given published pages
When the sitemap is built
Then each is named once with its date and its address escaped

### SC-CMS-73 — the site page travels in the page state

Given a page read on the server, a draft by a token, a missing page and a silent server
When the browser opens the page
Then the carried page is taken once, the draft is not carried, and a missing page or silent server
reads as no page

### SC-CMS-74 — the body draws blocks by renderers

Given blocks of a kind with a renderer and of a kind without one
When the body is drawn
Then the first are drawn by their renderer and the second are skipped

### SC-CMS-75 — the site server answers by redirects

Given a CMS redirect and a silent CMS server
When a request comes on the redirected path
Then it is redirected with its query, and without an answer the page is drawn as usual

### SC-CMS-76 — the page head

Given a page with and without an image
When its head is set
Then the title, the description and the card follow the page, without a card image for the second

### SC-CMS-77 — a draft is closed from indexing

Given a draft opened by a preview token
When its head is set and the page is left
Then `robots` closes it, and leaving lifts the ban

### SC-CMS-78 — hreflang by the published languages

Given a page published in some languages of the site
When its head is set and the page is left
Then only the sites of those languages stay, and leaving brings the rest back
