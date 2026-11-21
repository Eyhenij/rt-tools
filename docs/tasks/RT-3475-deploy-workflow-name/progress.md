# Ход работы

## Где мы

- **State:** `задача-взята`
- **Stage:** 1 of 1 — The name
- **Done:** разбор и план; роли прочли план; одобрение владельца «Одобряю (Recommended)».
- **Next step:** два круга ревью, затем папка в архив, набор перед push и PR в main.
- **Uncommitted:** none
- **PR:** not open yet

## Шаги

- [x] 1.1 The workflow carries the new name and parses
- [x] 1.2 The production description names the rollout by the new name in both places
- [x] 1.3 The rollout rule names the workflow by the new name

## Решения по ходу

- **Роли на план (21.11).** goal-critic и product-strategist: имя с «: » без кавычек не разбирается
  как YAML, и выкатка перестала бы запускаться; старое имя стоит в `docs/PROD.md` дважды и в
  надстройке правила выкатки; проверка доски ищет выкатку по файлу и имени не видит. План
  переписан до одобрения: шаг 1.1 — разбор YAML, шаг 1.3 — надстройка правила.

## Сессии

### 2026-11-21

- Замер до работы: `grep -c '^name: Deploy message-bus: приёмник и админка$' .github/workflows/deploy.yml`
  — 0; `grep -c 'Deploy message-bus: приёмник и админка' docs/PROD.md` — 0.
- Живая проверка: разбор YAML экшена отдаёт «Deploy message-bus: приёмник и админка» (шаг 1.1);
  в `docs/PROD.md` новое имя 2 раза (1.2), в надстройке правила выкатки 1 раз и после раскладки в
  `.claude/skills/deploy-flow/pitfalls.md` тоже 1 (1.3); `check:board` называет последнюю выкатку
  819535a1, как до правки; `agent-kit:check` и `check-doc-paths` — 0. Новое имя в списке Actions
  видно только после слияния в main: хостинг берёт имя из главной ветки.
- Первый круг ревью (qa-engineer, product-strategist, goal-critic): дефектов нет. Исправлено:
  абзацы в `docs/PROD.md` и в надстройке правила выкатки перенесены по ширине соседних. Снято с
  причиной: имя «Deploy Auth» — владелец назвал один экшен. Шаги 1.1–1.3 после правки совпали
  снова; `prettier --check` и `agent-kit:check` — 0.
