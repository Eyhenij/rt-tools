# Scenarios — the widget of the visitor

The identifier goes at the start of the test title, followed by a dash. The numbers continue the
numbering of the domain of the chat: they are issued once and are never reused.

### SC-CH-49 — the widget appears on a page that carries the tag with the key of the site

Given a page with the script of the widget and the tag with the key of a live site
When the page is opened
Then the bubble of the widget stands in the corner of the page

### SC-CH-50 — the greeting of the site and the hours of answer stand before the first remark

Given an unfolded widget of a site with a greeting and hours of answer
When the visitor has written nothing yet
Then the greeting and the hours stand above the field, and there is no thread

### SC-CH-51 — the first remark creates the conversation and the sign of the visitor

Given an unfolded widget and a visitor whose browser holds no sign
When the visitor sends the first remark
Then the remark stands in the thread, and the sign of the visitor lies in the storage of the browser

### SC-CH-52 — a returning visitor sees their earlier talk

Given a browser that holds the sign of the visitor of that site
When the page with the widget is opened again, and the visitor opens their talk from the list
Then the messages of that same conversation stand in the thread, oldest first

### SC-CH-53 — the answer of the operator arrives in the open widget

Given an open widget with a conversation of its own
When the operator answers in that conversation
Then the answer appears in the thread without a reload of the page

### SC-CH-54 — a remark past the limit is refused, and the limit comes from the answer

Given an open widget
When the visitor sends a remark longer than the limit of the service
Then the widget says the remark is longer than the service takes, and the text stays in the field

### SC-CH-55 — a remark without text is not sent at all

Given an open widget with an empty field
When the visitor presses the sending
Then nothing goes to the service and nothing appears in the thread

### SC-CH-56 — a page whose address is not in the list of the site gets no chat

Given a page with the widget of a site whose list of addresses does not carry that page
When the page is opened
Then the widget says the chat is unavailable and shows no field

### SC-CH-57 — an unknown or switched-off key of the site gives the same words

Given a page with the widget and a key of a site that does not exist or is switched off
When the page is opened
Then the widget says the chat is unavailable, and the two reasons are not told apart

### SC-CH-58 — outside the hours of answer the remark is taken in all the same

Given an open widget of a site whose hours of answer are over for today
When the visitor sends a remark
Then the remark stands in the thread, and the widget says the answer comes within the working hours

### SC-CH-59 — on a narrow screen the widget takes the whole screen

Given a page with the widget on a narrow screen
When the visitor unfolds the bubble
Then the widget takes the whole screen, and the field stands under the thread

### SC-CH-60 — the styles of the host page do not reach the widget

Given a page whose styles repaint every element of its kind
When the widget is drawn on it
Then the look of the widget stays its own

### SC-CH-61 — a long remark stays within the width of the widget

Given an open widget on a wide screen
When the visitor sends a remark of one long word
Then the remark is broken by the width of the thread and goes past no edge of the widget

### SC-CH-99 — the folded widget is a round button, and the open one is 380 px wide

Given a page with the widget on a wide screen
When the visitor unfolds the bubble
Then the bubble was a circle with an icon, and the window is 380 px wide under a head of the accent colour

Covered by the end-to-end spec of the widget.

### SC-CH-100 — the remarks of the two sides stand on the two sides of the thread

Given an open widget with a remark of the visitor and an answer of the support
When the thread is drawn
Then the visitor's bubble stands at the right edge, the support's at the left, and each names its time

Covered by the end-to-end spec of the widget and the spec of the widget logic.

### SC-CH-101 — the hours stand in the greeting card, and outside the hours above the thread

Given a site outside its hours
When the visitor opens the widget, then sends a remark
Then the hours stand in the greeting card first, and in a note above the thread after the remark

Covered by the end-to-end spec of the widget.

### SC-CH-102 — the field draws the ring of the fields in focus

Given an open widget
When the visitor puts the focus into the field
Then the capsule of the field draws the focus border and the ring

Covered by the end-to-end spec of the widget.

### SC-CH-107 — a visitor with talks opens the widget on the list of them

Given a visitor with two talks on the site, one of them closed by the operator
When the visitor unfolds the widget
Then the list "Ваши обращения" shows both, the latest first, the closed one with the mark
"Закрыто", and the button "Новое обращение" stands under the list

Covered by the end-to-end spec of the widget.

### SC-CH-108 — the new-talk button starts a second talk

Given a visitor with a talk on the site
When the visitor presses "Новое обращение" and sends a remark
Then the remark stands alone in a new talk, and the list shows two talks

Covered by the end-to-end spec of the widget.

### SC-CH-109 — the arrow of the head leads back to the list

Given a talk opened from the list
When the visitor presses the arrow of the head
Then the list of the talks stands in the widget again

Covered by the end-to-end spec of the widget.

### SC-CH-110 — an answer to a talk not opened carries the unread dot

Given a visitor looking at the list of their talks
When the operator answers one of them
Then the row of that talk carries the dot, and the dot is gone after the talk is opened

Covered by the end-to-end spec of the widget and the spec of the widget logic.

### SC-CH-111 — the head and the bubble name the operator who answered

Given a talk without an answer
When an operator answers it from the panel
Then the head showed "Поддержка" and the hours before, and after the answer shows the initials,
the name of the account and "Служба поддержки"; the bubble names the first word of the name

Covered by the end-to-end spec of the widget and the spec of the widget logic.

### SC-CH-112 — the closing reaches the open talk and ends its thread

Given an open widget with a talk the visitor wrote in
When the operator closes the talk in the panel
Then without a reload the thread ends with "Разговор завершён" and the time, and the field says
"Новый вопрос? Напишите нам"

Covered by the end-to-end spec of the widget.

### SC-CH-113 — the next remark from a closed talk starts a new one

Given an open widget with a talk the operator closed
When the visitor sends a remark
Then the remark stands alone in a new talk, and the list shows the old talk closed and the new one
live

Covered by the end-to-end spec of the widget.
