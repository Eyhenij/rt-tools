# The menu of the navigation: the second level stands by the setting of a person and is searched

The card of the epic is the task RT-1657.

The second level of the side menu is held open by the person themselves, and the needed item is
found by a substring of the label, not by the eyes over the list.

## Why

The second level opened only at a hovering and closed at the leaving of the pointer. Two things
came out of that, and both cost a person time.

- **The list of the second level is walked by the eyes.** In the sections where the items are
  dozens, the needed one is looked for by reading from the top down, and a list longer than the
  screen is not visible whole.
- **The submenu cannot be left open.** It lives exactly as long as the pointer lies on the item: to
  take it away means to lose the submenu, and one cannot work with the second level open.

The request of the owner named the second level static **by the setting of the user** — that is, the
decision is taken by the person, and it belongs to them, not to the screen.

## Decisions

- **The mode of the submenu is an input of the component, not its state.** The component only asks
  for a change by an output; that the mode is kept by the consumer follows straight from the words
  "by the setting of the user": the setting belongs to the person, and the kit does not know where
  the consumer keeps the settings of the person.
- **The pinning does not change what is visible.** A press of the switch moves only the way the
  submenu is held open; the items in it stay the same. Otherwise the person who pinned the submenu
  loses from sight the very thing they pinned it for.
- **The search goes over the open submenu, not over the whole tree of the menu.** The word of the
  owner: a person searches where they have already come.
- **On a narrow screen there is no switch, there is a search.** The word of the owner: there is
  nothing to pin there — the submenu takes the screen whole.
- **The labels are sewn in in English.** The word of the owner: the first kit has no vocabulary at
  all, and the epic does not undertake to create one for the sake of three labels.
- **The width of the panel is a setting of the person, on a par with the mode.** It is kept by the
  same way and by the same neighbouring key: one decision of the person about how their menu looks
  must not live in two different places.
- **The found substring is highlighted, not the whole label.** A label highlighted whole says only
  "this item matched" — the same as the fact of its presence in the selected list itself.
- **The sign of the pinning is taken by the colour of the icon, not by the drawing of the glyph.**
  There is nothing to show the state by with a filling of the glyph: the axis of a variable font is
  read by not every set registered by the consumer, and on a static one both states are drawn by one
  picture. The colour of the icon is given by the button of the kit by its input of the look, and it
  is visible on any set.
- **The found substring is marked by a yellow ground.** The word of the owner: that is how the
  browser shows it in its own search over the page. A muted ground of the brand did not read — three
  units of a channel set it apart from the white.
- **The field of the search and the switch are drawn by the ready-made of the kit.** A field of one's
  own markup and a button of one's own diverged from the look of the kit at the very first show; the
  kit carries both the field and the button with an icon, and both carry the look, the states and
  the accessibility.

## The order

Every line is created by a task of its own.

| №           | Task                                                                 | Why here                                                                                                                         |
| ----------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1 · RT-1648 | The submenu is pinned and searches over its own items                | The foundation: while there is no mode, there is nothing to keep, and the search lives inside the open submenu                   |
| 2 · RT-1658 | The choice of the mode outlives a reload                             | The setting belongs to the person; it stands on the first — before it there is nothing to choose                                 |
| 3 · RT-1661 | The width of the second level is pulled                              | The same setting of the person as the mode, and it is kept by the same way: it stands on the second                              |
| 4 · RT-1662 | The matched substring is highlighted in the label                    | A selection without a highlight leaves the same walk by the eyes the field was created to lift                                   |
| 5 · RT-1665 | The field of the search and the switch are the ready-made of the kit | A field of one's own and a button of one's own stand out from the look of the kit; it is fixed where both already stand in place |

## What this epic does not do

- A search over the whole tree of the menu instead of over the open submenu: rejected by the word of
  the owner.
- A vocabulary of the labels of the first kit: the labels are sewn in in English, by the same word.
- The second kit: `rt-page-header` is not touched by this work — it is all in `rtui-side-menu`.

## When the epic will be over

When all five tasks are closed and a person who pinned the submenu, pulled it out and reloaded the
page sees it still pinned and of the same width, and in the selected list — marked by yellow, what
the item matched by. The field and the switch look at that the same as the rest of the kit. The sign
is taken in the browser, not by a reading of the code.
