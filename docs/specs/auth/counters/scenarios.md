# Scenarios — the counters of the entry screens

The identifier goes at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason.

### SC-AUTH-108 — an empty or malformed number loads no counter

Given a page whose theme properties hold no number, an empty one or a malformed one
When the page is drawn
Then no tag script and no counter queue is added to it

### SC-AUTH-109 — the GA4 queue holds the calls the tag reads

Given a page with the GA4 number set
When the page is drawn
Then the queue holds `arguments` objects, the config carries the page id — the template name
without `.ftl` — and the tag script is added once

### SC-AUTH-110 — Metrika starts with Webvisor and sends the hit of the page

Given a page with the Metrika number set
When the page is drawn
Then Metrika is started with Webvisor, the hit carries the page address, title and id, the tag
script is added once, and every field of the page carries `ym-disable-keys`

### SC-AUTH-111 — a form that leaves the page sends the event without a field value

Given a page with both numbers set and a filled form
When the form is submitted
Then both counters get `auth_form_submit` with the page id, and no field value is in any call

### SC-AUTH-112 — a form held as invalid sends no event

Given a page with a counter number set and a form the page holds as invalid
When the form is submitted
Then the counter gets no event

### SC-AUTH-113 — the address loses the action token and the login hint

Given a page opened by an address with `key` and `login_hint` in its query, or a page whose link
leads to such an address — the «proceed» link of a mail page
When a counter starts
Then the address in the history, in the hit and in the link markup has neither, the other
parameters stay, and a click on the link still goes to the full address

### SC-AUTH-114 — the nodes that show a person are hidden from Webvisor

Given a page that shows a person's address or name as text — the confirmation page, a message
page, a standard page with an alert
When a counter starts
Then every node with that text stands inside a node with `ym-hide-content`, and the others do not

### SC-AUTH-115 — the typed address and password stay out of the page markup

Given the login page
When the person types the address and the password
Then neither stands in the markup of the page
