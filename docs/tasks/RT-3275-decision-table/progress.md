# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 5 — таблица и сверка
- **Done:** опись, таблица 479 строк, покрытие 31 из 31; области поставки, браузера, хода сессии,
  хранилища и стенда без цепочек; шаги 4.3 и 5.1 измерены
- **Next step:** 2.2 — замер ждёт напечатанной фразы владельца для замены проверки; область
  хода работы правится, 60 цепочек
- **Uncommitted:** правки хуков области хода работы
- **PR:** not open yet

## Steps

- [x] 1.1 Прочитать все хуки пакета и записать в спеке подобласти строку на каждый: событие, факты дерева, которые он судит, действия, на которые отвечает
- [x] 1.2 Разбить факты по областям хуков и назвать число фактов и состояний каждой области
- [x] 2.1 Записать таблицу: строка на решение хука — факты, действие, решение, названный ход
- [x] 2.2 Покрыть таблицей все хуки пакета, помощники и хуки-модели пометкой
- [x] 2.3 Запустить каждый хук на фикстуре фактов его строки и сравнить решение со строкой
- [>] 3.1 Перебрать состояния каждой области и найти состояния без разрешённого хода, отказы без разрешённого названного хода и состояния «только спросить»
- [ ] 3.2 Править хук, где перебор нашёл тупик, вместе с его строкой таблицы и его набором проб
- [ ] 4.1 Выводить цепочки из таблицы и записать каждую сценарием подобласти
- [ ] 4.2 Написать набор `decision-table.test.sh`: сверка, перебор, покрытие, случай на каждую цепочку и на каждое состояние «только спросить», случай хука в `skip`
- [ ] 4.3 Выбирать набор `decision-table.test.sh` при правке любого хука
- [ ] 5.1 Записать описание и привязки подобласти
- [ ] 5.2 Проверить границу пакета, собрать, разложить и прогнать все наборы пакета

## Decisions along the way

- **Отказ сразу называет ход, разрешённый в том же состоянии, — строго уже в этой задаче.** Перебор
  области браузера нашёл цепочку: проверки браузера называют выбор профиля, а выбор запрещает
  `skill-gate`, пока правило не загружено. Владелец выбрал в меню «Строго уже здесь» вместо пути
  через два отказа. Хуки, чей названный ход запрещает соседняя проверка, правятся здесь так, чтобы
  в таком состоянии называть разрешённый ход; часть работы RT-3355 переезжает сюда. Затронутые
  этапы: 2 и 3.

- **Папка задачи RT-3355, созданная командой заведения в этой ветке, вынесена из дерева** — она
  принадлежит ветке RT-3355 и заводится там, когда задача начнётся. Затронутый этап: нет.

- **Пять проверок с выражением в кавычках заменены тем же выражением без кавычек.** Движок читает
  `` `/…/` `` как буквальную строку, и шаг 2.2 не совпал при верном выводе. Затронутые этапы: 2–4.

- **Проверка шага 2.2 заменена:** `node projects/agent-kit/assets/checks/decision-table.mjs --coverage | tail -1` → /^deciding (\d+) of \1, helpers \d+$/ · слово владельца: «Разрешаю замену пяти проверок»
- **Проверка шага 2.3 заменена:** `node projects/agent-kit/assets/checks/decision-table.mjs --conform | tail -1` → /^rows [1-9][0-9]*, mismatch 0$/ · слово владельца: «Разрешаю замену пяти проверок»
- **Проверка шага 3.2 заменена:** `node projects/agent-kit/assets/checks/decision-table.mjs --walk | tail -1` → /^dead 0, unnamed 0$/ · слово владельца: «Разрешаю замену пяти проверок»
- **Проверка шага 4.1 заменена:** `node projects/agent-kit/assets/checks/decision-table.mjs --chains | tail -1` → /^derived (\d+), scenarios \1, uncovered 0$/ · слово владельца: «Разрешаю замену пяти проверок»
- **Проверка шага 4.2 заменена:** `bash projects/agent-kit/tests/decision-table.test.sh 2>&1 | tail -1` → / 0 провалов$/ · слово владельца: «Разрешаю замену пяти проверок»

## Sessions

### 2026-11-16

- Разбор закрыт тремя ответами владельца в меню; задача RT-3355 заведена по слову «Две задачи».
- План разобран ролями product-strategist и goal-critic и переписан: сверка таблицы с хуками
  запуском, состояния «только спросить», цепочки из таблицы, выбор набора при правке хука.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3275-decision-table

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 of 5 — опись хуков и фактов
- **Next step:** строки описи по 84 хукам в спеке подобласти
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3275-decision-table/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/specs/agent-kit/decision-table/spec.md
 M docs/tasks/RT-3275-decision-table/progress.md
 M projects/agent-kit/assets/checks/decision-table.mjs
 M projects/agent-kit/assets/hooks/dev-server-guard.sh
 M projects/agent-kit/assets/hooks/git-guard-delivery-conflict.sh
 M projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh
 M projects/agent-kit/assets/hooks/git-guard-delivery-folder.sh
 M projects/agent-kit/assets/hooks/git-guard-delivery-merged.sh
 M projects/agent-kit/assets/hooks/git-guard-delivery-signature.sh
 M projects/agent-kit/assets/hooks/git-guard-delivery.sh
 M projects/agent-kit/assets/hooks/git-guard-main.sh
 M projects/agent-kit/assets/hooks/git-guard-no-verify.sh
 M projects/agent-kit/assets/hooks/turn-exit-guard.sh
 M projects/agent-kit/assets/hooks/window-fill-guard.sh
 M projects/agent-kit/tests/select-suites.sh
?? projects/agent-kit/assets/checks/decision-table.json
?? projects/agent-kit/tests/decision-table.test.sh
```

### Commits over the main branch

```
b2a06578a feat(rt:agent-kit): опись хуков, программа таблицы решений, отказы браузера называют загрузку правила
dbf901f5c docs(rt:agent-kit): план задачи RT-3275
2701941f2 docs(rt:agent-kit): разбор задачи RT-3275 и задача RT-3355 в плане эпика
766f1c554 docs(rt:agent-kit): задача RT-3271 влита, её находки в плане эпика
ec0e9fe02 Merge origin/main into RT-3302-checks-rework-3
bd528112d [RT-3271] Согласие владельца даётся в окне разрешения, а не угадывается по словам (#3354)
21abfedf4 docs(rt:agent-kit): папка задачи RT-3271 разобрана
7799b6c03 fix(rt:agent-kit): конец эпика и одобрение кита спрашивают владельца окном
e1a6ed4d7 docs(rt:agent-kit): план задачи RT-3271 и задача RT-3352 в плане эпика
f047c4cb0 docs(rt:agent-kit): разбор задачи RT-3271
1bf62bffe docs(rt:agent-kit): задача RT-3329 влита, находки её разбора правил
7d9cc1ac4 Merge remote-tracking branch 'origin/main' into RT-3302-checks-rework-3
459bdf5c3 [RT-3329] Агент не объявляет шаг сделанным без замера и не останавливается посреди задачи (#3351)
ff8c99f72 chore(rt:agent-kit): записи архива старше недели удалены по сроку
9cf555359 docs(rt:agent-kit): пути примера в сценарии SC-AK-1557 — не адреса
75c2d351a docs(rt:agent-kit): папка задачи RT-3329 разобрана
a976f0c9f fix(rt:agent-kit): след плана узнаёт голые имена, роль читается в копии сессии
263bc9555 fix(rt:agent-kit): проверка выхода мерит копию сессии, а не главную копию
a4ae1a3ed docs(rt:agent-kit): шаги 5.6–6.6 RT-3329 совпали, этапы кончились
cf961c3b6 fix(rt:agent-kit): пропуски считаются среди всех остановок на ветке с движком
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
