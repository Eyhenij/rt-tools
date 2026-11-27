# План

**Task:** RT-3715 · **Branch:** RT-3715-kit-weight-outside-bytes
**Путь:** лёгкий · 45 строк · API и вид не меняются
**Behaviour:** unchanged — значок по-прежнему скачивается один раз, отказ запоминается

## Точки

- **A:** приложение с восемью частями кита и кнопкой тяжелее 0.51.0 на 14257 байт, gzip по файлам 157260.
- **Эта задача доводит до:** приложение тяжелее 0.51.0 не больше чем на 13000 байт.
- **Признак:** сборка того же приложения на ветке задачи даёт не больше 545644 байт; тесты кита проходят.
- **Цена:** в проверке веса кита часть icon растёт примерно на 121 байт. Эта проверка не считает `rxjs`, а убранные из
  приложения байты лежат в нём.

## След задачи

| Что | Где |
| --- | --- |
| Code (правится) | `projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.ts` |
| Порог веса (правится) | `tools/kit-weight-threshold.json` |
| План эпика (правится) | `docs/plans/kit-weight-remainder.md` |

## Решение

Решения нет: в одном классе меняются кеш и подписка в конструкторе, новых файлов, наборов и открытых имён нет. Запрос
идёт подпиской из конструктора по субъекту: так велит линтер дерева.

## Этапы

### 1. Кеш значка без shareReplay

- **Steps:**
    1. Кеш файла значка пишется на AsyncSubject, импорт shareReplay убран
       Check: `! grep -q 'shareReplay' projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.ts` → exit 0
    2. Тесты значка проходят без правок
       Check: `! grep -q 'shareReplay' projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.ts && pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-icon.registry.spec.ts` → exit 0
    3. Порог веса кита переписан и сходится со сборкой
       Check: `node -e "process.exit(require('./tools/kit-weight-threshold.json').total!==185800?0:1)" && pnpm run check:kit-weight` → exit 0
- **Readiness sign:** кеш работает как прежде.
- **Verified by:** `grep -c 'AsyncSubject' projects/ui-kit-v2/src/lib/components/icon/rt-icon.registry.ts` → >= 1

### 2. Замер приложения

- **Steps:**
    1. Байты и gzip по файлам приложения после правки записаны в плане эпика и сравнены с остатком 13000
       Check: `grep -cE '^Приложение после замены кеша значка: [0-9]+ байт' docs/plans/kit-weight-remainder.md` → >= 1
- **Readiness sign:** названо, уложилось ли приложение в остаток.
- **Verified by:** `grep -c 'Приложение после замены кеша значка' docs/plans/kit-weight-remainder.md` → >= 1

## Чего эта работа не делает

- Не откатывает ленивые загрузки листа и диалога подтверждения.
- Не выпускает пакет: выпуск и замер из `npm pack` — задача RT-3716.
