# Grill

## The owner request

> подпись со стрелкой иконка должна менять направление в зависимости от того открыт оверлей или закрыт

## What the tree already has

- `projects/ui-kit-v2/src/lib/components/select/stories/component/test-select-trigger-more.component.ts` —
  обёртка второй страницы показа указателя, вид кнопки «подпись со стрелкой» среди пяти.
- Коммит `150dbf930` из слитой и удалённой ветки `RT-2152-universal-select-without-material` —
  сама правка; перенесён сюда как `03310a16c`.
- `.claude/skills/ui-component-tests/SKILL.md` — статья «If there is a pair of states, both must
  be in the frame».

## What the rules already say

- Правило проверки компонентов: «A state invisible in the frame is not checked by a snapshot» и
  «If there is a pair of states, both must be in the frame» — одна сторона пары про пару ничего
  не говорит.
- Оно же, статья от RT-2170: пересъёмка эталона подтверждается вторым поднятием.

## Questions and answers

**Что именно должно меняться у стрелки?**
«в зависимости от того открыт оверлей или закрыт» — направление, а не цвет и не размер.

## Decisions

- **Правка перенесена переносом коммита, а не написана заново** — она уже была написана и
  проверена в прежней ветке; правило слияния прямо называет перенос для отпавшей ветки.

## What is left unclear

- Нужен ли такой же показ второй семье выбора: владелец назвал страницу указателя, про множественный
  выбор не говорил. Работу не держит.
