# Grill

## The owner request

> в первом ките пагинация (футер) динамик листа не скролится и всеглда доступна как и скроллбар во
> втором ките всю скролится!!! сука у тебя есть пример блядь в чем проблема?

## What the tree already has

- The first kit's story host is `height: 100vh`: the list takes the window, only the table
  scrolls, the page strip stands at the bottom.
- The second kit's `rt-data-list` is `height: 100%` and scrolls the table inside itself; its
  first-kit story gives the list no height, so the list grows to all its rows.

## What the rules already say

- `rt-tools-storybook`: a component that takes its size from its parent is given one by a box of
  the showing; a component whose height comes from the window is shown inside a box that clips.

## Questions and answers

No questions: the first kit's story is the sample.

## Decisions

- **The box of the first-kit story takes the height of the window** — as the first kit's story
  host. Rejected: a height inside the kit, because the list already takes its parent's height.

## What is left unclear

- None.
