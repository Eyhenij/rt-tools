# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 2 of 4 — Настройка набора снимков в каталоге витрины первого кита
- **Done:** этап 1 закрыт: `KITS['ui-kit']` в `tools/visual-gate.mjs` переведён на собранную
  витрину и браузер образа, шапка файла и довод у `judgesFrames` выправлены.
- **Next step:** завести `projects/ui-kit/.storybook/test-runner-jest.config.js` и убедиться, что
  съёмка доходит до сравнения эталонов.
- **Uncommitted:** правка `tools/visual-gate.mjs`, папка задачи.
- **Waiting for the owner:** нет. Слово о снятии запрета дано: «делать чтобы избежать постоянного
  рассинхрона».
- **PR:** not open yet

## Decisions along the way

- **Довод у `judgesFrames` переписан, а не удалён** — ветка без образа остаётся возможной, и
  проверка о ней говорит вслух. Affected stage of the plan: 1.

## Sessions

### 2026-09-17

- Замер до правки: `node tools/visual-gate.mjs ui-kit` поднимал витрину и печатал «The frames of
  ui-kit are matched in the pipeline only», до сравнения не доходя.
- Этап 1: правка `tools/visual-gate.mjs`, синтаксис цел.
