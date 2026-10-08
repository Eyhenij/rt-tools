# План — RT-2663: `sed -i` узнаётся как флаг, модули аудита очереди — в карте правил

**Behaviour:** unchanged — правятся признаки проверок пакета правил, код приложений не трогается.

## След задачи

- `projects/agent-kit/assets/defaults/shell.sh`
- `projects/agent-kit/assets/defaults/gate-map.sh`
- `projects/agent-kit/tests/defaults.test.sh`
- `docs/specs/agent-kit/guards/scenarios.md`
- разложенные копии после `agent-kit:sync`

## Этапы

### 1. Признаки

- 1.1 Флаг `-i` у sed и perl узнаётся словом в обоих образцах shell.sh
- 1.2 Модули `board-*.mjs` в ветке git-workflow карты правил

### 2. Сценарии и тесты

- 2.1 Сценарии SC-AK-1192 и SC-AK-1193 и их тесты в defaults.test.sh

Готово, когда `bash projects/agent-kit/tests/defaults.test.sh` зелёный, а новые тесты без правки
признаков падают.

### 3. Сдача

- 3.1 Сборка пакета, раскладка, проверки перед push
- 3.2 Папка задачи разобрана, PR в ветку эпика
