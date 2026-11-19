# Ход работы

## Где мы

- **State:** `замысел-записан`
- **Stage:** 1 из 3 — прогон судьи как хука; план одобрен владельцем: «Одобряю plan.md RT-3417 (Recommended)»
- **Done:** разбор, план; база — 188 запусков с длительностью, медиана 37,1 с, 12 таймаутов
- **Next step:** ключи `judge` для 1447 и 1461, режимы `--as-hook`, `--pad`, `--live` в `judge-replay.mjs`, сценарий в спеке
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Шаги

- [>] 1.1 The expected verdicts hold the promises with no work
- [ ] 1.2 The judge run as the hook gives the expected verdicts on the text as it stands
- [ ] 2.1 The edited judge gives the expected verdicts in front of a real session record
- [ ] 2.2 The edited judge stays within 20 s at the median with no divergence
- [ ] 3.1 The live runs on this branch after the edit stay within the bound

## Решения по ходу

- **Готовый прогон расширяется, а не пишется новый.** В дереве уже есть `judge-replay.mjs` и 27 записанных ходов; стратег нашёл это до одобрения плана, первая редакция плана писала дубль.
