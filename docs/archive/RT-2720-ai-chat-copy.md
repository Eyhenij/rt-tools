# Grill

## The owner request

> 1. Answer (`rt-ai-chat-answer`): a copy icon-button that copies the answer's text (`message().text`, the markdown source as-is) to the clipboard. Place it in the same action row as the thumbs (`feedback` row), first in the row, same size (`size="sm" iconSize="sm"`). Show it for a finished answer with text (not while streaming / no text); the row must render when copy is available even if the answer is not rated.
> 2. Question (user message in `rt-ai-chat`): the same copy icon-button in a new action row directly UNDER the question bubble (outside the bubble), aligned to the bubble's side (end), same size and look as the answer's row. It copies `message.text`.
> 3. After a successful copy, give brief feedback the way the kit already does in its copy components (`rt-copy-value` / copy-cell: icon swap to a check and/or tooltip/aria change for ~2s) — reuse the existing kit mechanism/service for clipboard writes, do not invent a new one.
> 4. Labels: add kit labels (e.g. `aiCopy` = 'Copy', `aiCopied` = 'Copied') in every language the kit ships (`rtKit` namespace, eight languages) following how `aiLike`/`aiDislike` are declared; aria-label and tooltip from them.
> 5. An input on `rt-ai-chat` to turn copy off is fine if the kit's API canon suggests it (default on); otherwise default on without an input.
> 6. Make sure the icon exists in the kit icon set (e.g. `copy`, `check`), verify.
> 7. Tests (spec cases for both buttons incl. clipboard write and feedback), showcase story/matrix updates and re-taken visual frames per repo rules, spec rule + implementation.md line + scenarios, CONTEXT.md / Overview.mdx.
> 8. Run the repo checks, build the ui-kit-v2 dist, report the absolute dist path. Commit, push (never `--no-verify`).

## What the tree already has

- `rt-copy-value`, `rt-copy-cell`, the data table cell and the aside error box copy through the CDK
  `Clipboard`, keep a `copied` signal for 2000 ms and swap the icon `copy` for `check`.
- The labels `uiCopy` = 'Copy' and `uiCopied` = 'Copied' exist in the English set and in the
  showcase Russian set; `rt-copy-value` and `rt-copy-cell` use them.
- The kit ships English labels only (`rt-kit-labels.en.ts`); `aiLike` and `aiDislike` live in the
  same two sets.
- `copy.svg` and `check.svg` lie in `projects/ui-kit-v2/src/assets/icons`.
- `rt-ai-chat-answer` draws the rating row when `isRated` — the text is there and not streaming.
- `rt-ai-chat` takes `closable` with `true` by default: a header control the consumer can turn off.

## What the rules already say

- Reuse first: a ready label and a ready technique are taken, not duplicated.
- The default look does not move without a reason; the new buttons are the order itself.
- The template of `rt-ai-chat` stays under the cyclomatic complexity limit.

## Questions and answers

The work came as a ready order with the owner's authorization; every question is closed by the
request or by assumption.

- **Does the task change the behaviour?** Yes: a copy button under the question and in the answer row.
- **Does it need an edit of a law or a rule?** No — question closed by assumption.
- **One task or several?** One.
- **What is not part of the task?** The merge and the publish of the kit.
- **What shows the task is closed?** The organism spec passes, the frames are re-taken, the kit builds, the branch is pushed.
- **Is there a sample?** `rt-copy-value`.

## Decisions

- **The labels are `uiCopy` and `uiCopied`, no new `ai*` keys.** — the kit already has both texts
  in every set it keeps, and a consumer that translates them translates the chat at once.
  Rejected: `aiCopy`, `aiCopied` — two keys with the same text.
- **One inner component `rt-ai-chat-copy` draws the button for both places.** — the copied state
  lives per message, and the question bubble is drawn by the organism's loop.
- **`copyable` on `rt-ai-chat` and on `rt-ai-chat-answer`, `true` by default.** — the same canon as
  `closable`.

## What is left unclear

- Nothing.

## Decisions along the way

- The labels are the kit's `uiCopy` and `uiCopied`: both texts already exist in the English set and the showcase Russian set, so no `ai*` keys were added.
- The owner's change: the answer copied its markdown source with `##`, `**` and list markers; now it copies the visible text. Decision: `markdownToPlainText` in the kit core, built on the same `parseMarkdown` tree that `rt-markdown-text` draws. Rejected: `innerText` of the rendered body — jsdom has no `innerText`, so the spec would test a stand-in rather than the real path. The question still copies its text as is.
