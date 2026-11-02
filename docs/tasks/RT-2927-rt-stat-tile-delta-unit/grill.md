# Grill

## The owner request

> давай по порядку, только убедись что никто не взял в работу и когда возьме заасайни на меня и тащи тикет в работу

RT-2927 stood second in the list the owner got that day, after RT-2907. The task body: the tile
`rt-stat-tile` appends «%» to the delta itself and colours it by the sign of the number. A delta in
percentage points cannot be written, and a growth that is bad for the owner (cancellations, lost
revenue) is painted as good. Wanted: a delta unit (percent by default, or points with a kit label in
all languages), a sign «growth is worse», and a new version of the kit in the registry.

## What the tree already has

- `projects/ui-kit-v2/src/lib/components/stat-tile/`: the component, its model `IRtStatTile`, a spec
  file, two stories (`stat-tile.stories.ts`, `stat-tile-matrix.stories.ts`) and `Overview.mdx`.
- The tile draws two delta rows: the primary one next to the value and the year one as a chip. Both
  take their direction from the sign of `percent` and paint `up` with the success colour and `down`
  with the danger colour.
- `percentText` appends « %» to the number; the zero base is drawn as «—».
- The kit labels live in `rt-kit-labels.en.ts` (`uiBaseline`, `uiYearOverYear`); the other languages
  come through the translator of the application.
- No domain spec of the second kit speaks of the stat tile yet.

## What the rules already say

- kit-approval: a visible kit edit starts with a Figma mockup and the owner's approval; the showcase
  then matches the mockup and is approved too.
- rt-tools-storybook: every input axis is shown at every value in the showcase.

## How the application that asked does it now

The owner sent to read it: «смотри как реализовано в проекте … оттуда и был запрос на расширение».
The application keeps a copy of the tile body and extends the kit delta model:

- `unit` on the delta object: percent (the default), points, and a third value «amount» of its own,
  where the number is written ready and gets no unit;
- `worseWhenUp` on the delta object: the colour swaps, the arrow keeps the sign of the number;
- points are written «+10 п.п.» through a label with a `{{value}}` parameter;
- an empty base keeps the dash next to the value, the year chip disappears, as in the kit.

## Questions and answers

**Where is the delta unit set?**
«смотри как реализовано в проекте … оттуда и был запрос на расширение» — on the delta object, as
the application does it.

**Where is the sign «growth is worse» set?**
«На плитке (Recommended)»

**How are points written in Russian?**
««+10 п.п.» (Recommended)»

**Release a new version of the second kit after the merge?**
«Да, сразу (Recommended)»

## Decisions

- **The unit is a field of the delta object, percent by default** — the owner pointed at the
  application, which does exactly that; old calls keep their look. Rejected: a tile input, which
  would not let the two rows differ.
- **«Growth is worse» is a tile input and paints both rows** — the owner's answer; it is a property of
  the metric. The arrow keeps the sign of the number. The application sets it once per tile instead
  of per row, and the PR names that difference.
- **Points are a kit label with a value parameter, «+10 п.п.» in Russian, «+10 pp» in English.**
- **The version goes to the registry right after the merge** — the owner's answer.

## What is left unclear

- The third unit of the application, «amount», is not in the task. It is not added: the task names
  percent and points, and the PR names the difference so the owner decides about it there.
