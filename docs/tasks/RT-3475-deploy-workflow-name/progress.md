# Ход работы

## Где мы

- **State:** `задача-взята`
- **Stage:** 1 of 1 — The name
- **Done:** разбор и план; роли прочли план; одобрение владельца «Одобряю (Recommended)».
- **Next step:** этап 1.
- **Uncommitted:** папка задачи и строка назначения копии
- **PR:** not open yet

## Шаги

- [>] 1.1 The workflow carries the new name and parses
- [ ] 1.2 The production description names the rollout by the new name in both places
- [ ] 1.3 The rollout rule names the workflow by the new name

## Решения по ходу

- **Роли на план (21.11).** goal-critic и product-strategist: имя с «: » без кавычек не разбирается
  как YAML, и выкатка перестала бы запускаться; старое имя стоит в `docs/PROD.md` дважды и в
  надстройке правила выкатки; проверка доски ищет выкатку по файлу и имени не видит. План
  переписан до одобрения: шаг 1.1 — разбор YAML, шаг 1.3 — надстройка правила.

## Сессии

### 2026-11-21

- Замер до работы: `grep -c '^name: Deploy message-bus: приёмник и админка$' .github/workflows/deploy.yml`
  — 0; `grep -c 'Deploy message-bus: приёмник и админка' docs/PROD.md` — 0.
