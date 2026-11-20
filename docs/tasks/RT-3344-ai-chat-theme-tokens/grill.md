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

`AC` is `projects/ui-kit-v2/src/rich-editor/lib/components/ai-chat`, `LC` is
`projects/ui-kit-v2/src/lib/components`. The prompt input, the conversation list, the suggestion card,
the icon button and the menu are separate kit components under `LC`.

1. **Font.** The feed sets `font-size: var(--rt-text-sm)` and no family (`AC/rt-ai-chat.component.scss:95`);
   the question inherits it. The answer is `rt-markdown-text`, which sets its own family and
   `--rt-text-xs` (`LC/markdown-text/rt-markdown-text.component.scss:13-14`): a feed size never reaches it.
2. **Primary colour.** Send and Stop are `rt-icon-button variant="primary"` in the prompt input; the
   colour is `--rt-color-action-primary` through `--rt-icon-button-bg-variant`, with the public handles
   `--rt-icon-button-bg` and `--rt-icon-button-bg-hover`. The focus ring of the field is
   `--rt-input-color-border-focus` and `--rt-input-focus-shadow` on `__box:focus-within`
   (`LC/ai-prompt-input/rt-ai-prompt-input.component.scss:24-27`). The active rating is the hover fill
   of the icon button (`rt-icon-button--active`), not a primary colour.
3. **Header.** `__header` has padding and gap, no height and no border (`AC/rt-ai-chat.component.scss:51-57`):
   there is no divider today.
4. **Search width.** The 400px cap is already gone: `rt-thread-list__search` is `flex: 1 1 auto`
   since commit b60105a60.
5. **Suggestion cards.** The card is `inline-size: 100%` with `--rt-prompt-suggestion-radius`
   (`LC/prompt-suggestion/rt-prompt-suggestion.component.scss:9,19,28`); the width has no handle.
6. **Author label.** `<span rtElem="author">` is always drawn (`AC/rt-ai-chat.component.html:103`).
7. **Backgrounds.** The panel and the prompt box both use `--rt-color-bg-surface`
   (`AC/rt-ai-chat.component.scss:17`, `LC/ai-prompt-input/rt-ai-prompt-input.component.scss:19`).
8. **Row menu.** The trigger is a ghost `rt-icon-button` of `rt-menu` with `--rt-icon-button-radius`;
   the row actions are an absolute overlay at the row end with `--rt-color-bg-subtle`, covering the
   time on purpose (`LC/thread-list/rt-thread-list.component.scss:133-148`).

Existing chat handles: eight on the root (`--rt-ai-chat-bubble-radius`, `-column-width`,
`-content-max-width` and others) and per-block ones; they are listed in `AC/Overview.mdx` «Оформление».
The kit names handles `--rt-<блок>-<что>` (`projects/ui-kit-v2/README.md`, «Настройка компонента
снаружи»); the README says spacing, type size and dimensions stay on scale steps. The closest
precedent of handles for background, padding and font size is the subdomain
`docs/specs/ui-kit-v2/scroll-area-action-bar-tokens/`, and the showcase sample is the story
`Foundation/Design Tokens/Component Props`.

## Questions and answers

The owner was asked only whether the task is needed and answered «Делать RT-3344». The rest of the
six questions are closed by assumption from the card and the tree, below.

## Decisions

- **Behaviour changes: a product agreement is written** — new public handles of the chat and its
  parts, a new input, a story with changed handles.
- **No edit of a law or a rule**; the README line about scale steps gets an exception named by this
  task, as the action bar already has.
- **One task** — the card lists eight items of one need.
- **Without a handle set, everything draws as before.** Every handle defaults to what the code uses
  now; no reference snapshot changes.
- **No Figma mockup:** the default look does not change, and the new look exists only as values the
  application sets. The story with changed handles goes to the owner as the showcase, by the rule
  `kit-approval`.
- **Handles live on the component that draws the part; the chat passes its own `--rt-ai-chat-*`
  down to them.** The answer size goes through a new handle of `rt-markdown-text`, the field ring and
  background through new handles of `rt-ai-prompt-input`, the row actions through new handles of
  `rt-thread-list`.
- **The author label is hidden by an input of the chat**, not by a handle: a handle cannot remove a
  node from a screen reader.
- **Item 4 is already done by the tree** (the cap is gone); the agreement records it and adds no
  handle for it.
- **Sample:** the subdomain `scroll-area-action-bar-tokens` and the story `Component Props`.
- **Out of the task:** handles for parts the card does not name; a theme preset of the chat.
- **Done:** the card's sign — each item set by a handle or an input, a story with changed handles,
  and the showcase approved by the owner.
