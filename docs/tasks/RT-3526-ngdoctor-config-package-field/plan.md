# План

**Task:** RT-3526 · **Branch:** RT-3526-ngdoctor-config-package-field
**Behaviour:** unchanged — «Да, завести обе»: правка касается только проверки дерева
`check:ngdoctor`, приложение и кит не меняются.

После написания этот файл не правится. Пересмотр этапа идёт в `progress.md` решением по ходу.

## Точки

- **A:** `check:ngdoctor` судит `angular-doctor.config.json` и допускает в нём только `reportPath`.
  Поле `angularDoctor` корневого `package.json` инструмент кладёт поверх файла, а проверка его не
  читает: правило, выключенное там, или исключённый путь проверка не заметит.
- **Эта задача доводит до:** поле `angularDoctor` с любым значением, кроме объекта с одним
  `reportPath`, краснит `check:ngdoctor` с именем `package.json`; на нынешнем дереве проверка
  зелёная.
- **Признак:** сценарии набора `check-ngdoctor` о поле `angularDoctor`; `check:ngdoctor` на дереве.
- **Точка B эпика:** порог не обходится настройкой. Задача закрывает второе место настройки;
  находок не снимает.
- **Metric:** файлов, из которых инструмент берёт настройку, а проверка её не судит, — 1 → 0.

## След задачи

| Что   | Где                                   |
| ----- | ------------------------------------- |
| Specs | нет: поведение приложения не меняется |
| Laws  | `docs/constitution/verifiability.md`  |
| Rules | `.claude/skills/testing/`             |
| Code  | `tools/check-ngdoctor.mjs`            |
| Tests | `tools/tests/check-ngdoctor.test.sh`  |

## Как идёт работа

- `configProblem` судит и поле `angularDoctor` корневого `package.json` теми же словами, что файл:
  допускается только `reportPath`. Поле есть — значит, оно судится: любое значение, кроме объекта
  с одним `reportPath`, — отказ, ложное (`false`, `null`) тоже, как велит признак карточки «с любым
  значением, кроме разрешённого».
- Без флага проверка читает `package.json` корня дерева — тот же файл, что инструмент.
- Отказ называет место: «package.json#angularDoctor», как его называет сам инструмент.
- Флаг `--package <путь>` подменяет корневой `package.json` для сценариев, как `--config` подменяет
  файл настройки.
- Шапка `tools/check-ngdoctor.mjs` называет второе место настройки.
- Сценарии пишутся раньше кода и падают на нём: без кода флаг `--package` проверка отвергает как
  неизвестный.

## Что считается сделанным

Пять новых сценариев набора `check-ngdoctor`:

- поле только с `reportPath` — проверка зелёная;
- поле с `rules` — отказ с «package.json#angularDoctor» и «rules»;
- поле с `ignore` — отказ с «ignore»;
- поле-строка — отказ «is not an object»;
- поле `false` — отказ «is not an object».

На дереве `check:ngdoctor` зелёный, порог прежний, наборы проверок дерева зелёные.

## Этапы

### 1. Поле angularDoctor судится как файл настройки

- **Steps:**
    1. Проверка судит поле angularDoctor корневого package.json; сценарии называют каждый случай
       Check: `sh -c 'out=$(VERBOSE=1 bash tools/tests/check-ngdoctor.test.sh 2>&1); echo "$out" | grep -q " 0 failures" || { echo red; exit 0; }; echo "$out" | grep -ciE "^  ok   .*angularDoctor"'` → = 5
    2. Шапка проверки называет второе место настройки, проверка зелёная на дереве, наборы проверок дерева зелёные
       Check: `sh -c 'bash tools/tests/run.sh >/dev/null 2>&1 || { echo red; exit 0; }; pnpm run -s check:ngdoctor 2>&1 | grep -q "equal to the threshold" || { echo red; exit 0; }; grep -c "package.json#angularDoctor" tools/check-ngdoctor.mjs'` → >= 2
- **Readiness sign:** набор `check-ngdoctor` зелёный с пятью новыми сценариями, `check:ngdoctor` на
  дереве зелёный.
- **Verified by:** набор `check-ngdoctor` в обеих локалях; живая проверка обязательна, команда и
  вывод — в прогресс: копия дерева, где в корневом `package.json` поле `angularDoctor` выключает
  правило, `node tools/check-ngdoctor.mjs` без флагов даёт отказ «package.json#angularDoctor». Она
  одна показывает, что без флага судится настоящий `package.json`.

## Что эта работа не делает

- Находки правил инструмента не снимает и порог не меняет.
- `angular-doctor.config.ts` не судит: инструмент его не читает и пишет об этом в `skippedChecks`,
  и прогон уже краснеет неполным.
- Отключающие комментарии в исходниках (`eslint-disable` и подобные) не судит. oxlint и шаблонный
  линтер инструмента их учитывают, и новый комментарий может скрыть находку от порога; в дереве их
  125 файлов. Это большое изменение — отдельная задача, она заводится в этой же работе.
