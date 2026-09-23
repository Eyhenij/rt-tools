# Scenarios of the embedded page of the talks

The numbers are issued once and are never reused. The prefix is the one of the chat — `SC-CH`; the
numbers up to `SC-CH-82` are taken by the neighbouring subdomains.

### SC-CH-83 — a signature that adds up opens the page

The consumer signs the key of the site and the minute with the secret of the site. The service
answers with the sign of the page and the minute it expires at. Under that sign the page of the
talks of this site answers with rows.

Not covered: the code is written by the tasks RT-2312, RT-2313 and RT-2314.

### SC-CH-84 — a signature that does not add up is refused

The sign is made with a foreign secret. The service answers with a refusal about the signature and
gives out no sign of the page.

Not covered: the code is written by the tasks RT-2312, RT-2313 and RT-2314.

### SC-CH-85 — a minute outside the allowed spread is refused

The signature is right, the minute in it is an hour old. The service answers with a refusal about
the minute: a signature taken once from the answer of a server must not open the talks later.

Not covered: the code is written by the tasks RT-2312, RT-2313 and RT-2314.

### SC-CH-86 — an unknown key of the site is refused

The key belongs to no site. The service answers with a refusal about the key and says nothing about
whether such a site exists.

Not covered: the code is written by the tasks RT-2312, RT-2313 and RT-2314.

### SC-CH-87 — the sign of the page opens one site

Under the sign of the page of one site the talk of a neighbouring site of the same space is answered
as not found.

Not covered: the code is written by the tasks RT-2312, RT-2313 and RT-2314.

### SC-CH-88 — an expired sign of the page is refused, and the page takes a new one

The sign has expired. The operation answers with a refusal about the expiry; the page says «Вход
устарел, обновите страницу» and asks for a new sign by the same road, without the person typing
anything.

Not covered: the code is written by the tasks RT-2312, RT-2313 and RT-2314.

### SC-CH-89 — the page shows the list, the feed and the answer

Under a live sign the page draws the list of the talks of its site, the feed of the chosen talk and
the box of the answer. An answer sent from the page arrives into the feed as a remark of the
operator.

Not covered: the code is written by the tasks RT-2312, RT-2313 and RT-2314.

### SC-CH-90 — a talk is closed from the embedded page

The person of the consumer closes a talk. The row of the list changes its state, and the visitor of
that talk opens a new one by their next remark.

Not covered: the code is written by the tasks RT-2312, RT-2313 and RT-2314.

### SC-CH-91 — the page carries no choice of a site

The site is named by the key the page was embedded with: the page has no selector of sites, and the
list holds the talks of one site only.

Not covered: the code is written by the tasks RT-2312, RT-2313 and RT-2314.
