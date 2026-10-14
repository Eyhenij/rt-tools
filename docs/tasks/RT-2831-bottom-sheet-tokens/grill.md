# Grill

## The owner request

> заведи эпик на оставшиеся уязвимости

Then: «делай всё сам, не останавилвайся, если остановишься - ты провалил задачу». This task is the fourth of the epic RT-2822. It was not planned: it appeared when the epic branches could not be pushed.

## What the tree already has

- The footer change of the bottom sheet reached `main` with two violations that the push gate refuses: `--rt-bottom-sheet-max-height` is declared by no layer and is not named a handle, and the footer border is set as a ready value instead of the block's own property.
- The sibling block `rt-aside-section` declares its border width as an own property of the block root; that is the sample for the footer.
- The consumer handles are listed in `tools/tokens-handles.json` and in the table of `projects/ui-kit-v2/docs/Theming.mdx`; a check matches the two lists.

## Decisions

- **The panel height cap becomes a consumer handle.** The panel already reads it with the fallback `80vh` and the comment says it comes from an ancestor or the sheet tag, so the value belongs to the application. Rejected: declaring it in the kit with a fixed value, which would remove the application's control that the comment promises.
- **The footer border width becomes an own property of the block.** The same technique as in the aside section. Rejected: adding the call to the exceptions of the check, which would hide the same gap in future blocks.
- **The task is taken without a question to the owner.** The owner said «делай всё сам, не останавилвайся»; the fix is the only way to push any branch of the epic.
