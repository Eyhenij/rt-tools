# Grill

## The owner request

> бери в работу эпик 2370, перетяни тикет на борде в колонку in progress, создавай ветку и выполняй
> задачи друг за другом, ветки делай каскадом чтобы при слиянии веток по очереди не было
> мерж-конфликтов

The task itself, as written in the queue:

> Правило макета: у поля поиска всегда лупа слева. Поля с выбором могут нести иконку слева, как
> обычное поле.
>
> - в поле поиска `rt-select` поставить `iconLeft` с лупой;
> - добавить `iconLeft` в `rt-multiselect` так же, как в `rt-select`;
> - обновить истории в витрине и снимки.

## What the tree already has

- The select filter is a plain `rt-input` inside the panel, with a placeholder and no icon.
- `rt-input`, `rt-select` and `rt-autocomplete` carry `iconLeft: IRtIcon.Name | null`. The select
  draws it as `rt-icon rtElem="icon-left" size="sm" color="muted"` before the label and puts the
  host class `rt-select--with-icon-left`.
- `rt-multiselect` has no `iconLeft`. Its trigger holds the placeholder or the chips, the clear
  button and the chevron.
- The search icon of the kit is `ico-search`; the select matrix already shows `iconLeft` with it.
- The subdomain `docs/specs/ui-kit-v2/select/` describes the trigger of both families; its
  out-of-scope list says the filter line does not change there.

## What the rules already say

- `reuse-first`: one thing — one input shape across the kit. The multiselect takes the select's
  input as it is.
- `rt-tools-storybook`: every input axis is shown at every value.

## Questions and answers

The owner answered the recommended option in every menu of this epic and ordered the tasks to be
done one after another. The six questions are closed by assumption:

- **Does the task change the behaviour** — question closed by assumption: yes, a new public input
  and a new icon in the panel; the agreement goes straight into the select subdomain.
- **Does it need an edit of a law or a rule** — question closed by assumption: no.
- **One task or several** — question closed by assumption: one, as the epic plan names it.
- **What is not part of the task** — question closed by assumption: the tree of options (the next
  task) and the autocomplete, which already has the input.
- **What will show that the task is closed** — question closed by assumption: the filter of the
  select shows the magnifier on the left, the multiselect takes `iconLeft` and draws it like the
  select, stories and snapshots show both.
- **Is there a sample the approach is taken from** — question closed by assumption: the select's
  own `iconLeft`.

## Decisions

- **The filter's magnifier is fixed, not an input** — the mockup rule says a search field always has
  it; an input would let the rule be broken.
- **The multiselect copies the select's markup and styles for the icon** — the same element name,
  size, colour and host class.

## What is left unclear

- none that blocks the work
