# Grill

## The owner request

> бери в работу эпик 2370, перетяни тикет на борде в колонку in progress, создавай ветку и выполняй
> задачи друг за другом, ветки делай каскадом чтобы при слиянии веток по очереди не было
> мерж-конфликтов

The task itself was written from the owner's earlier word:

> в дизайн системе должны быть единая сетка значений для border radius которой будут следовать все
> компоненты, заведи нужные значения и расширь макеты всех компонентов чтобы все они поддерживали все
> возможные бордер радиусы в приложении

## What the tree already has

<filled in from the exploration below>

## What the rules already say

- `rt-tools-styling`: between a step and a place stands the component's own property
  `--rt-<block>-radius`, declared in the block root with the old step as its default; a modifier
  reassigns the property instead of repeating `border-radius`. Rounding is one of the four judged
  families. A part the browser takes out of the block (an overlay panel) declares the property on
  itself.
- `rt-tools-styling`: state outweighs styling; a rule of equal force is sorted out by the order in
  the file.
- `reuse-first`: one thing — one input shape across the kit.

## The mockup

The Figma file of the second kit holds the collection «RT / Shape»: one variable `shape/<component>`
per component, mode Default aliases the component's own rounding, modes none…full alias the steps.
67 variables. The defaults, as read from the file on 29 September 2026:

button control · icon-button md · checkbox sm · toggle-switch full · tag full · input, select,
textarea, input-number, date-picker, dropdown-panel, multiselect, autocomplete — the input rounding ·
message md · toast md · tooltip sm · skeleton sm · empty-state full · card xl · tab full · tabs none ·
pagination-page md · menu-item sm · menu md · dialog xl · split-button control · toggle-button-group
md · toggle-button-segment ms · table, table-cell none · stat-tile sm · bar-list sm · info-item xl ·
money-list md · note md · night-cell sm · counter-row none · file-card lg · markdown-text sm · logo ms
· calendar-day md · rich-editor md · file-drop lg · confirm-popover md · welcome-dialog xl · popover
md · bottom-sheet 2xl · aside, aside-section none · photo-viewer md · nav-item md · nav-panel-item md
· nav-panel md · notifications-bell md · page-header md · header lg · section-nav-tile xl ·
chat-bubble lg · chat xl · thread-row sm · thread-list none · workspace, workspace-details none ·
container none · message-composer full (2xl when multiline) · picker-day md.

## Questions and answers

The owner answered the recommended option in every menu of this epic and ordered the tasks to be
done one after another. The six questions are closed by assumption:

- **Does the task change the application's behaviour** — question closed by assumption: yes, a new
  public input on components and old shape inputs folded into it; a product agreement is written.
- **Does it need an edit of a law or a rule** — question closed by assumption: no; the rule
  `rt-tools-styling` already names the component's own property, the task uses it.
- **One task or several** — question closed by assumption: one, as the epic plan names it.
- **What is not part of the task** — question closed by assumption: new components (pickers, date
  range, the composer redesign) and the first kit.
- **What will show that the task is closed** — question closed by assumption: every component with a
  surface takes the one input with the whole scale; its default matches the mockup; the old shape
  inputs are gone or folded; the showcase shows the matrix; tests, lint, build and snapshots green.
- **Is there a sample the approach is taken from** — question closed by assumption: the mockup
  collection «RT / Shape» and the existing `--rt-<block>-radius` properties.

## Decisions

- **The work follows the mockup defaults** — the owner's order was to make the kit follow the mockup.

## What is left unclear

- none that blocks the work
