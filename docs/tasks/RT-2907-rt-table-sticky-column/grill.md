# Grill

## The owner request

> давай по порядку, только убедись что никто не взял в работу и когда возьме заасайни на меня и тащи тикет в работу

> разрешаю

The order «по порядку» points at the list given to the owner the same day, where RT-2907 stood
first. The body of the task:

> Таблица `rt-table` закрепляет колонку через `sticky` из `CdkTable`, но своих стилей у закреплённой
> ячейки нет. Фон ячейки прозрачный: колонки, уезжающие под неё при прокрутке вбок, просвечивают.
> Тени у края закреплённой колонки нет, и не видно, что справа есть ещё колонки. Приложение
> закрывает это своим правилом поверх кита.
>
> - Закреплённая ячейка шапки, тела и итога получает фон своей строки: обычной, чередующейся, при
>   наведении и выбранной.
> - У края закреплённой колонки тень, пока под ней есть прокрученное содержимое; без прокрутки тени нет.
> - Фон и тень задаются токенами `--rt-*`, чтобы приложение меняло их без своих правил.
> - Работает для закрепления слева и справа и в обеих темах.

## What the tree already has

- `rt-table` is built on `CdkTable`. A consumer pins a column by `sticky` or `stickyEnd` on its own
  `cdkColumnDef`. The CDK sets the sticky position and the offsets inline and adds the classes
  `cdk-table-sticky` and `cdk-table-sticky-border-elem-left` or `-right`. The kit styles none of
  them: no rule in the table styles names a pinned cell.
- The background lives on the row, not on the cell. The row gets the hover colour on hover and the
  danger colour with the danger modifier. Body cells are transparent, so a pinned body cell shows
  what scrolls under it. Header cells already carry the surface colour.
- `rt-table` has no striped rows and no selected rows. It has a footer row outlet, so a consumer
  can project a total row.
- The only sticky cell the kit styles is the row actions cell: zero width, pinned to the right
  edge of the consumer's scroll container.
- Horizontal scroll belongs to the consumer's container, not to `rt-table`. The table cannot see
  its own scroll position without looking at its ancestor.
- `rt-data-table` is a separate table with its own template and styles, not built on `rt-table`.
- The table specs live under `docs/specs/ui-kit-v2/`: `table-full-port`, `table-filter`,
  `table-selection`, `table-material-theme`. None names a pinned column.
- No story of `rt-table` pins a column.
- The first kit has no styles for pinned cells either: there is no sample to port.

## What the rules already say

- A visible kit edit goes through a Figma mockup and the owner's approval before code, then every
  state in the showcase (rule `kit-approval`).
- A request from an application is done the way that does not break the second kit, and the
  difference is named in the PR.
- The names of consuming applications are not written in the tree.

## Questions and answers

**Does the task change the application's behaviour?**
Question closed by assumption: yes, the look of `rt-table` changes. The body of the task says so.

**Does it need an edit of a law or a rule?**
Question closed by assumption: no. The edit covers styles and tokens of one component.

**One task or several?**
Question closed by assumption: one. `rt-data-table` is a separate table and stays outside.

**What is not part of the task?**
Question closed by assumption: `rt-data-table` stays outside. Striped and selected rows are outside
too, because `rt-table` does not have them. The pinned cell follows the row background, so it gets
them for free if they appear.

**What will show that the task is closed?**
Question closed by assumption: a story of `rt-table` with one column pinned left and one pinned
right, in both themes. A measurement shows a solid background of the pinned cell in the header,
body, hover and total rows. The shadow is there while content is scrolled under the edge and absent
at the start. Both come from `--rt-*` tokens.

**Is there a sample the approach is taken from?**
Question closed by assumption: none in the tree. The CDK sticky classes are the base.

## Decisions

- **The pinned cell inherits the row background, over the surface colour.** Then hover, danger and
  any future row state work with no rule per state. Rejected: a rule per state, which misses the
  next state added.
- **The shadow follows the consumer's scroll container.** `rt-table` watches the nearest ancestor
  that scrolls sideways and marks which edge has content under it. Rejected: a permanent shadow,
  because the task asks for none without scroll.

## What is left unclear

- The look of the shadow (depth, colour in the dark theme) is decided by the mockup the owner
  approves, not here.
