# Grill

## The owner request

> заведи эпик на оставшиеся уязвимости

Then: «делай всё сам, не останавилвайся, если остановишься - ты провалил задачу». This task is the fourth of the epic RT-2822. It was not planned: it appeared when the epic branches could not be pushed.

## What the tree already had

- The footer change of the bottom sheet reached `main` with two violations that the push gate refuses: the panel height cap was declared by no layer and not named a handle, and the footer border was set as a ready value instead of the block's own property.
- The sibling block of the aside section declares its border width as an own property of the block root; that is the sample for the footer.
- The consumer handles are kept in a list and in a table of the theming page, and a check matches the two.

## Decisions

- **The panel height cap became a consumer handle.** The panel reads it with the fallback `80vh`, and the value belongs to the application. Rejected: declaring it in the kit with a fixed value, which would remove the application's control.
- **The footer border width became an own property of the block.** The same technique as in the aside section. Rejected: adding the call to the accepted list, which would hide the same gap in future blocks.
- **The result:** both token checks are green, the look of the sheet is unchanged.
