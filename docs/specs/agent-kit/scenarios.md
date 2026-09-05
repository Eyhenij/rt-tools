# Сценарии — пакет правил агента

Сценарии живут в поддоменах, каждый при своих правилах. Префикс общий на домен, и номера при
переезде между поддоменами не пересчитывались: номер связывает сценарий с заголовком теста, а
какие номера где лежат, отвечает сверка спеков, а не эта таблица.

| Поддомен                                                               | Файл сценариев             |
| ---------------------------------------------------------------------- | -------------------------- |
| [Гарды браузера](browser-guards/scenarios.md)                          | `browser-guards/`          |
| [Отметка состояния груза](cargo-mark/scenarios.md)                     | `cargo-mark/`              |
| [Чтение груза из приёма](cargo-read/scenarios.md)                      | `cargo-read/`              |
| [Проверки дерева](checks/scenarios.md)                                 | `checks/`                  |
| [Признаки единообразия](checks/reuse/scenarios.md)                     | `checks/reuse/`            |
| [Цена контекста считается командой](context-cost/scenarios.md)         | `context-cost/`            |
| [Конфликтующая своя заявка](delivery-conflict/scenarios.md)            | `delivery-conflict/`       |
| [Гарды поставки и гейт пуша](delivery-gate/scenarios.md)               | `delivery-gate/`           |
| [Личность вызова, открывающего заявку](delivery-identity/scenarios.md) | `delivery-identity/`       |
| [Диспетчер событий агента](dispatch/scenarios.md)                      | `dispatch/`                |
| [Место правки](edit-place/scenarios.md)                                | `edit-place/`              |
| [Экзамен по загруженным правилам](exam/scenarios.md)                   | `exam/`                    |
| [Гарды правки](guards/scenarios.md)                                    | `guards/`                  |
| [Расхождения внутри слоя правил](layer-drift/scenarios.md)             | `layer-drift/`             |
| [Раскладка ресурсов в дерево](layout/scenarios.md)                     | `layout/`                  |
| [Разбор состояния раскладки](layout-report/scenarios.md)               | `layout-report/`           |
| [Наблюдения](observations/scenarios.md)                                | `observations/`            |
| [Груз наружу](observations/cargo/scenarios.md)                         | `observations/cargo/`      |
| [Граница пакета правил](package-boundary/scenarios.md)                 | `package-boundary/`        |
| [Гард слога](prose-guard/scenarios.md)                                 | `prose-guard/`             |
| [Признак применимости у статьи правила](rule-article/scenarios.md)     | `rule-article/`            |
| [Гейт правил](rule-gate/scenarios.md)                                  | `rule-gate/`               |
| [Предел длины описания правила](skill-description-limit/scenarios.md)  | `skill-description-limit/` |
| [Граница состояния в текстах работы](state-boundary/scenarios.md)      | `state-boundary/`          |
| [Тексты слоя правил](texts/scenarios.md)                               | `texts/`                   |
| [Сверка спеков и адресов](texts/spec-checks/scenarios.md)              | `texts/spec-checks/`       |
| [Утверждения владельцу](turn-claims/scenarios.md)                      | `turn-claims/`             |
| [Передача захода и вход в новый заход](turn-entry/scenarios.md)        | `turn-entry/`              |
| [Гарды завершения хода](turn-guards/scenarios.md)                      | `turn-guards/`             |
| [Страж выходов хода](turn-guards/exit/scenarios.md)                    | `turn-guards/exit/`        |
| [Ведение работы командами](work/scenarios.md)                          | `work/`                    |
| [Гарды хода работы](work-guard/scenarios.md)                           | `work-guard/`              |
| [Сверка очереди работ](work/queue-check/scenarios.md)                  | `work/queue-check/`        |
