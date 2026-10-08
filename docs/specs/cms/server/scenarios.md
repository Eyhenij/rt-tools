# Scenarios — the server of the CMS

The identifier goes at the start of the test title, followed by a dash.

### SC-CMS-12 — a page address and a redirect source have their shape

Given addresses with capitals, double hyphens and nothing, and sources without the leading slash,
with two slashes and with a space
When each is checked
Then only lower-case words joined by single hyphens and site paths from the root pass

### SC-CMS-13 — the lock holder is told apart

Given a page held by nobody, by the caller and by another person
When the holder is asked
Then the answer is nobody, the caller and another person

### SC-CMS-14 — the publication time after an edit

Given a published page with a time, one published for the first time and a draft with a time
When each is saved
Then the first keeps its time, the second gets the moment, the draft keeps its former time

### SC-CMS-15 — what the site shows

Given a published page, a draft with a token and an archived page
When the site asks with no token, a wrong one and the right one
Then the published page shows always, the draft only by its token, the archived page never

### SC-CMS-16 — the scheduled publication

Given drafts with a date that has come, one in the future and a failing storage
When the pass runs
Then the due drafts are published and counted, and a failure is reported, not thrown

### SC-CMS-17 — the page edit is checked before the write

Given an empty edit, a malformed address, a locale the application does not name and a good edit
When each is checked
Then the first three are refused, and the good one gets its name, body and publication time

### SC-CMS-18 — the tags come as a tree

Given a root tag, its child and a tag whose parent is gone
When the tree is built
Then the child stands under the root, and the orphan stands at the root

### SC-CMS-19 — the content type settings are a JSON object

Given an empty string, an object, a broken string, an array and null
When each is read as settings
Then the first two read, and the rest are refused

### SC-CMS-20 — the contract shape of a page

Given a page with a main image, a gallery image, a tag, a connection and a preview token
When it is given to the admin and to the site
Then both carry the fields, and only the admin gets the token

### SC-CMS-21 — a missing record is not found

Given a lookup by an id that has no record
When it is checked
Then the call is refused as not found, and an empty contract id reads as none

### SC-CMS-22 — the admin service needs the caller

Given an admin call without the caller the interceptor accepts, and calls with one
When each is made
Then the first is refused as unauthenticated, and the rest read and edit the content types and
the list of pages

### SC-CMS-23 — a new page

Given a free address, a taken address and a missing content type
When a page is created with each
Then the first is written by the caller, the second and the third are refused

### SC-CMS-24 — a page edit

Given a page held by another person, an address another page holds and a free edit
When each is saved
Then the first two are refused, and the third is written by the caller

### SC-CMS-25 — the lock

Given a free page and a page another person holds
When the caller locks and unlocks both
Then the free page is locked and unlocked by the caller, and the other lock stays untouched

### SC-CMS-26 — tags and folders

Given a new tag, an edited tag, an empty name, a missing record and a parent that is itself or gone
When each is saved, and records are removed
Then the good ones are written, the rest refused, and a missing record is not found

### SC-CMS-27 — redirects

Given a new redirect, an edited one, a taken source, a source without the slash and an empty target
When each is saved
Then the good ones are written by the caller, and the rest are refused

### SC-CMS-28 — the site service

Given a published page, a draft with a token, an unknown address, redirects and tags
When a guest asks for each
Then the published page and the listed records come without a token, and the draft opens only by
its token

### SC-CMS-29 — the access maps

Given the rights the application names
When the access maps of the three services are built
Then every method declares one access, reading and editing ask for different rights, and the site
asks for none

### SC-CMS-30 — the pages store reads by one filter

Given a list filter and the site lookups
When the pages delegate is asked
Then the page and its count share one filter, and the site reads by address, type and locale

### SC-CMS-31 — the pages store writes the relations

Given a new page and an edited page with tags, connections and images
When they are written
Then the new one creates its relations, and the edit replaces them in one call with images in order

### SC-CMS-32 — the store publishes the due drafts

Given drafts with a scheduled date and without one
When the due drafts are published
Then each is published with its scheduled date, or with the moment when it has none

### SC-CMS-33 — the storage port over the delegates

Given the delegates of a database client
When every method of the port is called
Then each reaches its delegate, an empty id creates and a filled one edits, and a redirect row
reads with its kind

### SC-CMS-34 — a picture is recognised by its bytes

Given the headers of PNG, GIF, JPEG, three kinds of WebP and AVIF, and SVG, text and truncated headers
When each is recognised
Then the pictures give their type and size, and the rest are not pictures

### SC-CMS-35 — the copies of a picture

Given a wide picture, a middle one, a narrow one and a GIF
When their copies are planned and built
Then the wide one gets three widths, the middle one two, the narrow one and the GIF none

### SC-CMS-36 — an upload

Given a picture, a non-picture, an oversized file, no file store, a gone folder, a damaged picture
and a failing record
When each is uploaded
Then the picture and its copies are put and recorded, the rest are refused before the store, and a
failed record takes its files back out

### SC-CMS-37 — a removal

Given a used file, no file store, a free file and a missing file
When each is removed
Then the free file and its copies leave the store before the record, and the rest are refused

### SC-CMS-38 — the list of files

Given no folder, an empty folder and a folder id
When the files are listed
Then every file, the root and the folder are asked, and each file comes with its address and copies

### SC-CMS-39 — the copies backfill

Given files without copies, a narrow one, a GIF, a file with copies and an unreadable file
When the backfill runs twice
Then the copies are built once, the unreadable file is named, and the rest go on

### SC-CMS-40 — the media files store

Given a list filter, the backfill queue and a file use query
When the files delegate and the raw query are asked
Then the page and its count share one filter, the queue is the files without copies, and a file is
in use only when the query finds a reference
