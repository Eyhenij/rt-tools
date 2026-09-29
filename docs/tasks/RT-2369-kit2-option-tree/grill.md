# Grill

## The owner request

> бери в работу эпик 2370, перетяни тикет на борде в колонку in progress, создавай ветку и выполняй
> задачи друг за другом, ветки делай каскадом чтобы при слиянии веток по очереди не было
> мерж-конфликтов

The task itself, as written in the queue:

> В макете нарисован список-дерево: у строки есть уровень вложенности, шаг отступа 24 — стрелка
> дочерней строки стоит под подписью родителя; у ветки стрелка: свёрнута (вправо) или раскрыта
> (вниз); у листа на месте стрелки пусто; клик по стрелке раскрывает ветку, клик по подписи
> выбирает вариант; в multiselect у строки флажок; у родителя, у которого выбрана часть детей,
> флажок в промежуточном состоянии; если выбраны все дети — флажок включён.
>
> Что сделать: описать в спеке кита, как опции получают детей, что выбирается при клике по
> родителю, как ведут себя поиск и клавиатура в дереве; потом сделать это в `rt-select` и
> `rt-multiselect`, историях витрины и снимках.

## What the tree already has

- `IRtSelect.Option<TValue>` is `{ label, value, disabled? }`; both families draw a flat list.
- The select filters by a label substring; the multiselect has no filter.
- Keys: the focus stays on the trigger, the highlight moves by `aria-activedescendant`, ArrowUp
  and ArrowDown skip disabled options, Enter chooses, Escape closes.
- The multiselect row holds a native checkbox; chips take their label by a pipe that looks the
  value up in the flat list.
- The spacing step of 24px is `--rt-space-lg`.

## What the rules already say

- `reuse-first`: one input shape across the kit — both families take the same option type.
- `rt-tools-styling`: the indent is the component's own property with a step as default.
- `rt-tools-storybook`: every input axis is shown at every value.

## Questions and answers

The owner answered the recommended option in every menu of this epic and ordered the tasks to be
done one after another. The questions are closed by assumption, each by the option a menu would
have recommended:

- **How an option gets children** — closed by assumption: an optional `children` array of the
  same option type. A list with no children draws exactly as before.
- **What a click on a parent's label chooses in the select** — closed by assumption: the parent's
  own value, as the mockup says «клик по подписи выбирает вариант».
- **What a click on a parent chooses in the multiselect** — closed by assumption: every enabled
  leaf below it, or clears them when all are already chosen. The parent's own value is never
  written; its checkbox is derived from its leaves.
- **Which branches are open when the list opens** — closed by assumption: those holding a chosen
  value; the rest are folded.
- **How the filter works in a tree** — closed by assumption: a row stays when its label or a
  descendant's label matches; the path to a match is shown open.
- **How the keys work in a tree** — closed by assumption: the tree-view pattern — ArrowRight opens
  a branch or moves to its first child, ArrowLeft folds it or moves to the parent.
- **Does it need an edit of a law or a rule** — closed by assumption: no.
- **What will show that the task is closed** — closed by assumption: both families draw a tree with
  indents and arrows, the multiselect parent shows the partial checkbox, keys and filter work as
  above, specs, stories and snapshots cover it.

## Decisions

- **The tree logic lives in one pure module shared by both families** — they flatten, look up and
  count the same way. Rejected: a copy in each family — two copies drift.
- **A tree is recognised by the options themselves** — no input switches it on.

## What is left unclear

- none that blocks the work
