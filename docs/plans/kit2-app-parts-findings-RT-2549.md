# Findings of the epic RT-2542 — the part started by RT-2549

The rules review of RT-2549 came back after its branch had left, so its findings travel by the
branch of the next task, RT-2572, in a part of their own. The first part,
`kit2-app-parts-findings.md`, reaches the epic branch with RT-2549. Nothing below is applied: the
owner reads both parts when the epic is over.

## RT-2549 — `rt-draggable-tree`

1. **A part moved from a consumer into the kit is judged by its call sites, not its declaration.**
   The grill compared the consumer component's inputs and outputs; which of them the consumer
   really passes was read only after the showing, when the owner asked whether the application
   moves without workarounds. That pass found the open branches as a two-way state here and four
   modes of `rt-tree`, which became RT-2572. Address — the rules layer, a proposal to
   `reuse-first`, section «Pitfalls»:

    ```
    - **A part moved from a consumer into the kit is judged by its call sites, not its declaration.**
      The declaration lists what the part can do; the call sites show which inputs the consumer really
      passes and which outputs it listens to. The grill compared the declaration, the showing passed,
      and only the owner's question "does the application move without workarounds" found a missing
      two-way state and four modes of the neighbouring part. Every call site is read before the showing.
    ```

2. **A slot for the application's markup has a gap of its own.** In the frame of the application
   markup cell the tag stood glued to the label: the kit spaces its own children, and the content
   element taking the application's template had no gap. Caught by looking at the frame. Address —
   the rules layer, a proposal to the pattern `styling-bem-component`, section «Common misses»:

    ```
    - An element that takes the application's markup by a template or projection has no gap: the
      kit's own children are spaced, the application's ones glue to them. The slot element is a flex
      container with `gap: var(--<prefix>-space-*)` — the application cannot know the kit's spacing.
    ```

3. **The state of a neighbouring PR is read from the host before a decision names its branch.** The
   decision «edits of `rt-tree` go into the RT-2548 branch» was written while #2568 was already
   merged; it came out on the checkout. The rule texts already say so — `git-workflow-freshness`
   and `git-workflow-stack` — and were not loaded: the decision was an edit of a `.md`, which the
   gate map does not lead to them. Nothing to add to the texts.
