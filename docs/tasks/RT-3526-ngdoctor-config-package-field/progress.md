# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — Поле angularDoctor судится как файл настройки
- **Done:** план одобрен словом «Одобряю plan.md RT-3526»; оба круга ревью; набор
  `check-ngdoctor` 97 ok в обеих локалях; разбор папки — в коммите 86c0b0b90
- **Next step:** перемер шагов после замены проверки шага 1.1, затем PR
- **Uncommitted:** нет
- **PR:** not open yet

## Steps

- [x] 1.1 Проверка судит поле angularDoctor корневого package.json; сценарии называют каждый случай
- [x] 1.2 Шапка проверки называет второе место настройки, проверка зелёная на дереве, наборы проверок дерева зелёные

## Decisions along the way

- **Признак шага 1.1 теперь даёт 12, а не 5.** Два круга ревью добавили семь сценариев с
  «angularDoctor» в имени. Пять сценариев плана среди них, полнота от этого не меньше. Ожидание
  «= 5» было записано неверно — должно было быть «>= 5».
- **Проверка шага 1.1 заменена:** `sh -c 'out=$(VERBOSE=1 bash tools/tests/check-ngdoctor.test.sh 2>&1); echo "$out" | grep -q " 0 failures" || { echo red; exit 0; }; echo "$out" | grep -ciE "^  ok   .*angularDoctor"'` → >= 5

Остальное — в архивной записи `docs/archive/RT-3526-ngdoctor-config-package-field.md`.
