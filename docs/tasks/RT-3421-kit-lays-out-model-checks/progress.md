# Ход работы

## Где мы

- **State:** `этапы-кончились`
- **Stage:** 4 of 4 — The description
- **Done:** все четыре этапа: объявления в обоих судьях, раскладка пишет записи и называет расхождения, описание диспетчера и миссия; 14 шагов измерены
- **Next step:** живая проверка раскладки в чистое дерево, два круга ревью
- **Uncommitted:** nothing
- **PR:** not open yet

## Шаги

- [x] 1.1 Both model checks carry the declaration
- [x] 1.2 The records built from the real files equal the records of this tree
- [x] 1.3 The words of the first round are compared with the declaration
- [x] 1.4 This tree is laid out, and its copies carry the declaration
- [x] 2.1 A layout into an empty tree with the real catalogue leaves both records, and the check right after is green
- [x] 2.2 A standing record is neither doubled nor rewritten
- [x] 2.3 A tree without the dispatcher gets both records
- [x] 2.4 A check in the `skip` list gets no record, the other one does
- [x] 2.5 A moved directory of hooks is named in the record
- [x] 3.1 A record that differs from the declaration is named, and the check refuses
- [x] 3.2 A file with no record is named, and the check refuses
- [x] 3.3 Settings that do not parse get the ready records printed
- [x] 4.1 Q-8 is closed in the mission
- [x] 4.2 The description carries the nine scenarios

## Решения по ходу

- **Ночью готовятся разбор и черновик плана, кода нет.** Движок не даёт начать этап без одобрения плана владельцем.
- **Замер медианы секунд убран из признака готовности этапа 1.** Объявление — один комментарий разметки; признак — повтор записанных ходов без расхождений. Порядок этапов оставлен: покрытие сценариев проверяет набор перед отправкой, а не коммит.
- **Код записи вынесен в новый файл `agent-checks.ts`.** В `hooks-map.ts` уже 405 строк, линтер держит 500 и лимиты сложности. Для файла из плана остались общие помощники `readSettings` и `indentOf`, теперь экспортируемые. Тесты остались в файлах плана.
- **Этапы 1–3 вошли в один коммит.** Их код и тесты стоят в одних и тех же файлах, и разделить их по коммитам без правки смысла нельзя.
- **Живая проверка 20.11.** Раскладка настоящего пакета в пустое дерево дала обе записи вида `agent` с первого раза; вторая раскладка ничего не дописала; проверка о модельных проверках молчала.
- **Первый круг ревью.** Принято: отказ по словам называет обе стороны и выход; путь в записи — целое слово; при неразбираемой настройке запись ищется по форме вызова; предел — целое больше нуля; список события не массив — настройка читается как неразбираемая; пять случаев в наборе. Не принято: записи в `settings.local.json` и старая запись после переноса каталога хуков — вне плана, названы в «Чего задача не делает».
- **Модель в объявлении оставлена.** Судья мерился на этой модели; цена ошибки — одно поле объявления. Записано в «Чего задача не делает».
