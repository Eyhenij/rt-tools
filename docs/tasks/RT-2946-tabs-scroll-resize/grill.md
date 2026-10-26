# Grill

## The owner request

> Отправь сессии кита

Relayed by the session that works on the application side, together with the defect report:

> В ките 0.34.1 у rt-tabs остался дефект, его нужно починить и выпустить следующую версию.

## What the tree already has

- `rt-tabs` scrolls the strip to the selected tab once per selected id: `#scrolledId` skips a
  second scroll to the same id.
- The application opens on the last of eleven tabs. After its data loads, badges appear on the
  tabs and the tabs grow wider: the selected tab moves from about 967 to 1101 and stands 134
  points past the right edge at 375 and at 768.
- `RtTabsArrowPress` moves the strip by the arrows; wheel and touch scroll it natively.

## Questions and answers

**Is the work taken into this copy, and is the next version released after the merge?**
Asked in this session from a menu of three: «Да, бери и выпускай 0.34.2», «Бери, но без
выпуска», «Не брать». The owner chose «Да, бери и выпускай 0.34.2». A search of the laws, rules
and plans found no assignment of this copy before that answer.

The other questions close by assumption: the behaviour changes (the strip follows the tab); no
law or rule edit; one task; not part of it — the vertical strip and the `--invalid` modifier the
application already handled; done when the component test shows the selected last tab still
seen whole after the tabs grow, and a manual scroll is not overridden.

## Decisions

- **The strip follows the selected tab while the tab sizes change, until a person scrolls it.** A
  `ResizeObserver` on the tab items puts the strip back to the selected tab. Wheel, touch and the
  arrows stop the following until the next selection.
