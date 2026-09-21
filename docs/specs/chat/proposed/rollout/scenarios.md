# Scenarios — the rollout of the chat

The identifier goes at the start of the test title, followed by a dash. The numbers continue the
numbering of the domain of the chat: they are issued once and are never reused.

### SC-CH-74 — a page whose address is in the list of the site gets the permission to call

Given a site whose list of addresses holds the address of a page
When the widget of that page calls an operation of the visitor
Then the answer carries the permission for that very address, and the call goes through

### SC-CH-75 — a page whose address is not in the list gets no permission

Given a site whose list of addresses does not hold the address of a page
When a call comes from that page
Then the answer carries no permission, and the browser stops the call itself

### SC-CH-76 — the asking beforehand is answered by the same list

Given a site whose list of addresses holds the address of a page
When the browser asks beforehand about a call of the visitor
Then the answer carries the permission, the methods and the headers the call needs

### SC-CH-77 — the permission names one address, not any

Given two sites with different lists of addresses
When a call comes from a page of each
Then each answer names the address of its own page, and neither names any address at all

### SC-CH-78 — the file of the widget lies in the image of the road

Given the image of the road built from this tree
When the file of the widget is asked of it
Then the file lies at the named address inside the image

Не покрыто: the subject is the image, and the end-to-end suite raises the stand from the builds
themselves, never from the image. It is checked by building the image and one command inside it,
and both stand in the stage of the plan of RT-2184 that put the file there.

### SC-CH-79 — a foreign page talks to the service across the names

Given a page raised at an address of its own and a site whose list holds that address
When the visitor writes a remark from it
Then the remark reaches the service, and the widget shows it in the thread
