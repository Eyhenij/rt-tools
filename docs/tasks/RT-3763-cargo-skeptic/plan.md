# План

**Task:** RT-3763 · **Branch:** RT-3763-cargo-skeptic
**Behaviour:** unchanged — правится текст правила разбора груза этого дерева, кода приложения нет

## Точки

- **A:** правило разбора груза `.claude/skills/cargo-triage/SKILL.md` принимает запись приёмника на веру: оно
  сверяет предложение со спекой ресурса, но не спрашивает, не выдаёт ли запись промах самого исполнителя за
  недостаток пакета, и не сверяет правку с миссией пакета. Разбор 28.11 пометил «в работе» двенадцать записей
  первого куска без вердикта — их список даёт `npm run cargo:pull -- --kind proposal --state in_work`, а
полные ключи стоят в `docs/tasks/RT-3762-turn-tail-whole/grill.md`. Воспроизведение потом показало: семь
  из них описывают хуки, которых в 0.42.1 нет.
- **Эта задача доводит до:** до любой работы у каждой записи стоит один из четырёх вердиктов с доказательством из
  правила, кода или записи хода, и запись сверена с миссией пакета. Правка, которая миссии не служит или ослабляет
  проверку ради обхода одного исполнителя, не берётся.
- **Признак:** семь статей нового раздела стоят в правиле и построчно в сопутствующем файле; паттерн
  `cargo-triage-validate` лежит рядом; новый порядок прогнан на двенадцати записях первого куска, и вердикт каждой
  записан в ходе работы.
- **Веха G эпика:** правка влита в main вместе с эпиком RT-3753. В выпуск пакета она не входит: правило разбора
  груза — правило этого дерева.
- **Метрика:** доля записей, взятых в работу без вердикта, — с 12 из 12 на разборе 28.11 до 0; считает её следующий
  разбор груза по ходу работы своей задачи.

## Статьи нового раздела

Раздел «A record is validated before any work» правила разбора груза:

1. **Every record is a claim of an interested party, not a fact.** Its author is the model whose miss it
   describes, and the record has to prove the package is at fault.
2. **A record gets one verdict of four before any work: the executor's miss, a documentation miss, a package code
   miss, no longer reproduced.** Only the two package verdicts go on to the comparison with the spec.
3. **The executor's miss is set when the rule or check covering the case stood at the record's edition and the
   record shows it unread, bypassed or argued with.** The record closes with no edit of the package.
4. **A package verdict needs evidence from the package, not the complaint's words.** The silent or wrong text, or
   the guard and the input that refuse a lawful move, reproduced on the current edition.
5. **Every record is compared with the mission of the package.** An edit that brings no person closer to a
   working result without watching over the agent goes to quarantine with the reason.
6. **A proposal that drifts the package is refused.** It loosens a check, adds an exception for one workaround or
   adds text nobody acts on.
7. **The verdict and its evidence are written with the record.** One line in the progress of the task, which
   leaves for the archive with the grill, or in the quarantine note: the verdict, the mission, the file and line.

Строка вердикта в ходе работы:
`- **Запись <ключ>** — <промах исполнителя | промах документации | промах кода пакета | не воспроизводится> · миссия: <служит | не служит> · `<файл>:<строка>` — <доказательство>`.

## Решение

Решения нет: правятся тексты правила, паттерна и указателя правил, новых символов кода нет.

## След задачи

| Что                          | Где                                         |
| ---------------------------- | ------------------------------------------- |
| Правило разбора (правится)   | `.claude/skills/cargo-triage/SKILL.md`      |
| Привязки правила (правится)  | `.claude/skills/cargo-triage/implementation.md` |
| Холодная часть (правится)    | `.claude/skills/cargo-triage/pitfalls.md`   |
| Новый паттерн (правится)     | `.claude/skills/cargo-triage-validate/SKILL.md` |
| Указатель правил (правится)  | `CLAUDE.md`                                 |
| Карта правил (правится)      | `.claude/rt-kit/gate-map.sh`                |
| Миссия пакета                | `docs/product/missions.md`                  |
| Законы                       | `docs/constitution/work-conduct.md`         |

## Что считается готовым

- Семь статей стоят в правиле, в сопутствующем файле и с доводами в холодной части.
- Паттерн `cargo-triage-validate` с порядком проверки и признаками маскировки лежит рядом и назван в правиле и в
  указателе правил.
- Двенадцать записей первого куска прошли новый порядок, вердикт каждой записан в ходе работы.

## Этапы

### 1. Правило, паттерн и прогон

- **Шаги:**
    1. Семь статей проверки записи записаны в правиле разбора груза
       Проверка: `grep -cE "^- \*\*(Every record is a claim|A record gets one verdict|The executor's miss is set|A package verdict needs|Every record is compared with the mission|A proposal that drifts|The verdict and its evidence)" .claude/skills/cargo-triage/SKILL.md` → = 7
    2. Сопутствующий файл называет, чем держится каждая статья
       Проверка: `grep -cE "^- \*\*(Every record is a claim|A record gets one verdict|The executor's miss is set|A package verdict needs|Every record is compared with the mission|A proposal that drifts|The verdict and its evidence)" .claude/skills/cargo-triage/implementation.md` → = 7
    3. Холодная часть несёт доводы раздела
       Проверка: `grep -c "^## A record is validated before any work" .claude/skills/cargo-triage/pitfalls.md` → = 1
    4. Паттерн проверки записи лежит рядом с правилом
       Проверка: `grep -c "^rule: cargo-triage$" .claude/skills/cargo-triage-validate/SKILL.md` → = 1
    5. Указатель правил называет паттерн
       Проверка: `grep -c "cargo-triage-validate" CLAUDE.md` → >= 1
    6. Карта правил требует паттерн проверки при чтении и пометке груза
       Проверка: `grep -c "cargo-triage-validate" .claude/rt-kit/gate-map.sh` → >= 1
    7. Двенадцать записей первого куска прошли новый порядок
       Проверка: `grep -cE "^- \*\*Запись [^*]+\*\* — (промах исполнителя|промах документации|промах кода пакета|не воспроизводится) · миссия: (служит|не служит) · .+:[0-9]+" docs/tasks/RT-3763-cargo-skeptic/progress.md` → = 12
- **Признак готовности:** правило, паттерн, холодная часть, указатель и карта правил согласованы; у двенадцати
  записей строка вердикта с миссией и доказательством.
- **Чем проверяется:** проверка шага 7 — число 12.

## Чего задача не делает

- Вердикты двенадцати записей пишутся здесь; шаг вердиктов RT-3762 ссылается на них и своих не пишет.
- Не перепроверяет записи кусков 2…9: это делает каждая задача эпиков RT-3754…RT-3761 для своих записей.
- Не правит пакет: правило разбора груза — правило этого дерева.
