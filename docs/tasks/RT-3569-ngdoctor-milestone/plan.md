# Plan

**Task:** RT-3569 · **Branch:** RT-3569-ngdoctor-milestone
**Behaviour:** unchanged — слово владельца 23.11.2026: «не делай больших изменений в этом эпике!!! выноси это в новый эпик!!!»; правка только текстов плана эпика

## Points

- **A:** в плане эпика RT-3476 задачи RT-3486…RT-3490 стоят «впереди», веха G не называет их
  правил.
- **This task reaches:** владелец видит в плане эпика, что пять больших задач ушли в эпик RT-3568,
  а веха G называет их правила оговоркой; эпик можно сливать в главную.
- **Sign:** `node tools/check-ngdoctor.mjs` на ветке эпика зелёный; строки плана.
- **Milestone G of the epic:** ни одной находки, кроме оговорок вехи G.
- **Metric:** нет: правка текстов плана.

## Task footprint

| What  | Where                                          |
| ----- | ---------------------------------------------- |
| Plans | `docs/plans/angular-doctor.md`                 |
| Plans | `docs/plans/angular-doctor-review-findings.md` |

## What counts as done

- Пять строк задач плана эпика стоят «вынесено», веха G называет пятую оговорку, находки ревью правил
  по RT-3485 лежат рядом, `check:ngdoctor` зелёный.

## Stages

### 1. Веха эпика

- **Steps:**
    1. Строки RT-3486…RT-3490 отмечены вынесенными
       Check: `grep -c "вынесено" docs/plans/angular-doctor.md` → >= 6
    2. Пятая оговорка вехи G называет эпик RT-3568
       Check: `grep -c "RT-3568" docs/plans/angular-doctor.md` → >= 2
    3. Находки ревью правил по RT-3485 лежат рядом с планом
       Check: `grep -c "RT-3485 — the review" docs/plans/angular-doctor-review-findings.md` → >= 1
    4. Строка RT-3569 стоит в составе плана эпика
       Check: `grep -c "RT-3569" docs/plans/angular-doctor.md` → >= 1
- **Readiness sign:** план эпика и порог говорят одно: в пороге только оговорки G.
- **Verified by:** `node tools/check-ngdoctor.mjs` — «equal to the threshold».

## What this work does not do

- Не снимает находок: это эпик RT-3568.
