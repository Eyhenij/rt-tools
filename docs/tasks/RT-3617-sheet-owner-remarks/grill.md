# Grill

## The owner request

> что-то с отступами

> при переключении не должна прыгаьт высота ботомшита, сейчас дата больше высота

> по дефолту чипы в одну строку та что не влазит затеняется и все это горизонтально скролится по кругу карусель (выбранная становится по центру)

> календарь меняет высоту на разных месяцах, этого нужно избежать задай нужную высоту и показывай календарь по центру

> на телефоне, клавиатура появляется когда тыкаю в серч инпут, а ботом шит сразу сдвинут вверх, нужно только когда клавиатура оттображается двигать на всю высоту, ну или если полей много то на всю высоту

After PR #3599 was merged without these fixes: «Своей задачей»; «доганяй и продолжай»;
«делай правку и продолжай работу!».

## What the tree already has

The fixes were made and checked in the branch of RT-3531 after its PR had been handed over: five
commits, not pushed when the owner merged PR #3599. The spec `docs/specs/ui-kit-v2/sheet-header-cards/`
already carries the rewritten rule of the keyboard height (SC-UKV-1783).

The main branch merged into the epic branch took the scenario numbers SC-MB-457 and
SC-UKV-1772…1779 for its own work; the sheet scenarios move to free numbers.

## What the rules already say

The loop rule: work merged before the remaining fixes is carried by a task of its own; the owner
chose that by the menu.

## Questions and answers

**Куда нести пять правок после слияния PR #3599 без них?**
«Своей задачей»

## Decisions

- **Ветка задачи берётся от ветки эпика с влитой главной** — без главной сторож не даёт взять
  ветку, а правка номеров сценариев в самой ветке эпика запрещена. Rejected: правка в ветке
  эпика — она несёт только план и слияния.

## What is left unclear

- Ничего: вид каждой правки владелец видел в витрине и на телефоне.
