# Ход работы

## Где мы

- **State:** `задача-взята`
- **Stage:** 1 of 4 — A model check declares itself
- **Done:** разведка, разбор, план; роли `product-strategist` и `goal-critic` прочли план, замечания внесены до коммита плана
- **Next step:** одобрение плана владельцем, затем шаг 1.1 — объявление в файлах обеих проверок
- **Uncommitted:** nothing
- **Waiting for the owner:** одобрение plan.md RT-3421 меню после ролей
- **PR:** not open yet

## Шаги

- [>] 1.1 Both model checks carry the declaration
- [ ] 1.2 The records built from the real files equal the records of this tree
- [ ] 1.3 The words of the first round are compared with the declaration
- [ ] 1.4 This tree is laid out, and its copies carry the declaration
- [ ] 2.1 A layout into an empty tree with the real catalogue leaves both records, and the check right after is green
- [ ] 2.2 A standing record is neither doubled nor rewritten
- [ ] 2.3 A tree without the dispatcher gets both records
- [ ] 2.4 A check in the `skip` list gets no record, the other one does
- [ ] 2.5 A moved directory of hooks is named in the record
- [ ] 3.1 A record that differs from the declaration is named, and the check refuses
- [ ] 3.2 A file with no record is named, and the check refuses
- [ ] 3.3 Settings that do not parse get the ready records printed
- [ ] 4.1 Q-8 is closed in the mission
- [ ] 4.2 The description carries the nine scenarios

## Решения по ходу

- **Ночью готовятся разбор и черновик плана, кода нет.** Движок не даёт начать этап без одобрения плана владельцем.
- **Замер медианы секунд убран из признака готовности этапа 1.** Объявление — один комментарий разметки; признак — повтор записанных ходов без расхождений. Порядок этапов оставлен: покрытие сценариев проверяет набор перед отправкой, а не коммит.
- **Модель в объявлении оставлена.** Судья мерился на этой модели; цена ошибки — одно поле объявления. Записано в «Чего задача не делает».
