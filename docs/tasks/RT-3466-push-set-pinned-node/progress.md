# Ход работы

## Где мы

- **State:** `замысел-записан`
- **Stage:** 1 — The steps of the set run on the pinned node
- **Done:** план одобрен владельцем 23.11 («Одобряю план RT-3466»), plan-red: все шесть проверок
  красные; пробная отправка на текущем коде даёт 1 строку неверной node
- **Next step:** 1.1 — общая функция закреплённой node и случаи SC-AK-1846
- **Uncommitted:** nothing
- **Waiting for the owner:** nothing
- **PR:** not open yet

## Шаги

- [>] 1.1 A step of the set and of the run ahead sees the pinned node when another stands first in PATH
- [ ] 1.2 A pin of a major takes the highest installed match; an alias and a tree without a pin run as before
- [ ] 1.3 A pinned node not installed with another node in PATH refuses the push by one line in the guard and in the git hook
- [ ] 1.4 A pinned node not installed with the same node in PATH runs the steps as before
- [ ] 1.5 A real push from a clone with node 20 first goes through the git hook with no line of a wrong node
- [ ] 2.1 The scenarios stand in the description

## Решения по ходу

- **Ветка в цепочке от RT-3426.** Цепочка эпика: RT-3465 влита → RT-3426 (#3523) → RT-3466.
- **Номера сценариев SC-AK-1846, 1847.** 23.11 они свободны: 1849…1853 заняты, 1848 держит план
  RT-3461.
- **Роли на первый план.** Стратег и критик нашли одно и то же: набор вперёд гоняет шаги своим
  циклом и не получил бы закреплённую node; пустой набор проверка отправки пропускает, так что
  строка о версии без своей строки таблицы решений ослабила бы отправку; отказ по отсутствию
  каталога nvm ложен, когда node в `PATH` та же. План переписан под все три; живая отправка из
  клона — шаг 1.5, скрипт `live-push.sh` рядом с планом.
- **Ветка пересобрана 23.11 на вершине RT-3426.** Ночная ветка стояла на прежней ночной цепочке;
  разбор, план и ход работы перенесены, прежняя ветка лежит локально как
  `RT-3466-night-before-rebuild`. Скрипт живой отправки проверяет свой временный путь до git и до
  удаления, а пробный коммит несёт файл.
