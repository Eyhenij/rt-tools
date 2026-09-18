# План

**Task:** RT-2242 · **Branch:** RT-2242-lib-check-family-list
**Spec:** `docs/specs/agent-kit/hooks/spec.md`
**Behaviour:** unchanged — правится проверка пакета правил, приложений не касается. Подтверждено владельцем.

## След задачи

| Что      | Где                                                                                     |
| -------- | --------------------------------------------------------------------------------------- |
| Описания | `docs/specs/agent-kit/hooks/` — spec, implementation, scenarios                         |
| Законы   | `docs/constitution/verifiability.md`                                                    |
| Правила  | `.claude/skills/testing/`, `.claude/skills/spec-driven-domain/`                         |
| Код      | `projects/agent-kit/assets/checks/` — lib-common, lib-domains, check-lib-layers, config |
| Тесты    | `projects/agent-kit/tests/checks-lib-layers.test.sh`                                    |

## Что считается сделанным

- Ключ `apiFamily` принимает список семей; строка читается как список из одного.
- Обход бэкенда идёт по каждой семье списка, итоговая строка называет семьи поимённо.
- Описание домена hooks получило утверждение, привязку и сценарий SC-AK-1131 с тестом.
- Копии в `tools/` совпадают с пакетом.

## Этапы

### 1. Список семей в коде проверки

- **Что делается:** `API_FAMILIES` вместо `API_FAMILY` в `lib-common.mjs`, обход по списку в
  `lib-domains.mjs`, семьи в итоговой строке `check-lib-layers.mjs`, описание ключа в конфиге.
- **Признак готовности:** проверка в этом дереве называет те же 36 либ бэкенда и семью по имени.
- **Verified by:** `node projects/agent-kit/assets/checks/check-lib-layers.mjs` — строка «36 of the backend» с именем `message-bus-api`.

### 2. Сценарий и описание домена

- **Что делается:** SC-AK-1131 в `checks-lib-layers.test.sh`: две семьи в списке — обход доходит
  до второй, пустой обход называет оба корня, строка читается как прежде. Утверждение в описании
  домена hooks, строка файла привязок, сценарий, история.
- **Признак готовности:** набор зелёный, проверка описаний без расхождений.
- **Verified by:** `bash projects/agent-kit/tests/checks-lib-layers.test.sh` — итоговая строка набора без «FAIL»; `npm run check:specs` — без расхождений.

### 3. Установка файлов из пакета и сдача

- **Что делается:** `pnpm run agent-kit:sync`, коммит, PR в ветку эпика, слияние в браузере,
  отметка груза «исправлено», папка задачи в архив.
- **Признак готовности:** PR влит, запись груза в состоянии fixed.
- **Verified by:** `pnpm run agent-kit:check` — без расхождений; `gh pr view --json state` — MERGED.

## Чего эта работа не делает

- Не меняет ключ `apiFamily` в `.claude/rt-kit/checks.json` этого дерева: вторая серверная семья
  придёт в main с эпиком чата и назовёт себя там.
- Не чинит сравнение номеров в `tools/spec-next-id.mjs`: отдельная находка для владельца.
- Не судит отказом объявленную серверную семью без каталога.
