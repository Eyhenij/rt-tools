# Grill

## The owner request

> Делать RT-3344

Asked before the work, after RT-3343 was dropped by the owner: «я вообще не понимаю что это за фича…
я тебе такое задание не давал». The question named what the task gives: the application changes the
look of the chat through internal classes of the kit, every kit edit breaks that, and the task gives
tokens `--rt-ai-chat-*` for those places. The options were «Не делать, закрыть (Recommended)» and
«Делать RT-3344»; the owner chose the second.

The task card RT-3344, in substance: the application fits the look of `rt-ai-chat` by overriding
internal classes of the kit, and every layout edit of the kit breaks those overrides without warning.
The kit needs inputs or tokens `--rt-ai-chat-*` for what is overridden now:

- the feed font and the text size of an answer and a question;
- the primary colour of the `Send` / `Stop` buttons, of the focus ring of the field and of the active
  rating;
- the header height and the divider under it;
- the search width in the conversation list without the 400px cap;
- the width and the radius of the suggestion cards on the start screen;
- hiding the author label in the question bubble;
- the panel background apart from the background of the prompt field;
- the menu button of a conversation row: a square highlight, no background, in the place of the row
  time.

Done when every item is set by an input or a token, with no selector of an internal class, and the
showcase has a story with changed tokens.

## What the tree already has

Filled from the exploration of this task.
