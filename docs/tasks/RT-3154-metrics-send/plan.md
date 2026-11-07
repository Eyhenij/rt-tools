# Plan

**Task:** RT-3154 · **Branch:** RT-3154-metrics-send
**Draft:** `docs/specs/agent-kit/proposed/metrics/spec.md`
**Behaviour:** changes

## Points

- **A:** дерево записывает числа и хранит их у себя, а в приёмник они уходят только командой человека.
- **This task reaches:** на подключённом дереве строки дня приходят в приёмник без команды.
- **Sign:** сквозной тест: хук запускает отправку, в таблице стенда лежит строка дня, без адреса или токена запроса нет.
- **Milestone G of the epic:** пакет готов улучшаться по числам: эпик влит, приёмник выкачен, пакет выпущен, отчёт собирает числа.

## Task footprint

| What  | Where                                                                                      |
| ----- | ------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/agent-kit/proposed/metrics/`, `docs/specs/agent-kit/observations/`             |
| Laws  | `docs/constitution/verifiability.md`, `docs/constitution/delivery.md`                      |
| Rules | `.claude/skills/testing/`, `.claude/skills/agent-kit-source/`                              |
| Code  | `projects/agent-kit/src/lib/`, `projects/agent-kit/src/bin/`, `projects/agent-kit/assets/` |

## What counts as done

- `agent-kit send` собирает строки дня окна и шлёт только их.
- Проверка, начало и конец сессии запускают отправку сами, проверка сети не ждёт.
- Копия пробует раз в 15 минут, конец сессии шлёт всегда, вторая отправка выходит по замку.
- Без адреса или токена и при `send: false` запрос не уходит.
- Отказанный токен останавливает попытки до смены файла, `agent-kit doctor` называет сбой.
- Прямая правка каталога наблюдений отказана.
- Учёт итогов общий для копий одного дерева.

## Stages

### 1. Строка дня из наблюдений

- **Steps:**
    1. Собрать карту чисел дня из наблюдений
    2. Заменить чужие имена словом `own`
    3. Перенести учёт итогов в общий каталог git
- **Readiness sign:** карта любого дня проходит `isMetricKey`.
- **Verified by:** `pnpm exec nx test @rt-tools/agent-kit --skip-nx-cache --testFile=src/lib/metric-lines` — тесты прошли.

### 2. Команда отправки

- **Steps:**
    1. Добавить ключ `send` в конфиг
    2. Написать метку, замок и признак копии
    3. Написать команду `agent-kit send`
    4. Остановить попытки при отказанном токене
- **Readiness sign:** команда шлёт строки окна и пишет итог в метку.
- **Verified by:** `pnpm exec nx test @rt-tools/agent-kit --skip-nx-cache --testFile=src/lib/metric-send` — тесты прошли.

### 3. Запуск без команды

- **Steps:**
    1. Запускать отправку из записи наблюдения
    2. Запускать отправку в начале и конце сессии
    3. Назвать сбой в `agent-kit doctor` и в начале сессии
    4. Отказать прямую правку каталога наблюдений
- **Readiness sign:** проверка возвращается без ожидания при недоступном адресе.
- **Verified by:** `bash projects/agent-kit/tests/metric-send.test.sh` — все сценарии зелёные.

### 4. Тексты и проверка на стенде

- **Steps:**
    1. Обновить статьи спек пакета из договорённости
    2. Снять метки с покрытых сценариев
    3. Проверить отправку на настоящем стенде
- **Readiness sign:** строка дня лежит в таблице стенда.
- **Verified by:** `node tools/check-specs.mjs` — расхождений нет.
