# Чем исполняется — полоса прокрутки

Первая колонка — правило спека рядом дословно. Вторая — где оно исполняется в дереве; там же
назван сценарий, которым это проверяется, а чем именно покрыт каждый сценарий, сказано в
`scenarios.md`.

Правило без строки и строка без правила — расхождение: спек обещает то, чего в дереве нет, либо
в дереве стоит то, о чём спек молчит.

- **Место под полосу занято всегда, видимым становится только ползунок.** — `projects/ui-kit-v2/src/styles/_scrollbar.scss:webkit-scrollbar`; сценарий `SC-UKV-91`
- **Ползунок проявляется при наведении на зону, а не на сам ползунок.** — `projects/ui-kit-v2/src/styles/_scrollbar.scss:hover`; сценарий `SC-UKV-92`
- **Фокус внутри зоны показывает полосу наравне с наведением.** — `projects/ui-kit-v2/src/styles/_scrollbar.scss:focus-within`; сценарий `SC-UKV-93`
- **Там, где наведения не бывает, полоса видна всегда.** — `projects/ui-kit-v2/src/styles/_scrollbar.scss:hover-none`; сценарий `SC-UKV-94`
- **Стандартные свойства полосы объявлены рядом с псевдоэлементами.** — `projects/ui-kit-v2/src/styles/_scrollbar.scss:scrollbar-color`; сценарий `SC-UKV-92`
- **Цвет ползунка берётся токеном рамки, а не своим значением.** — `projects/ui-kit-v2/src/styles/_scrollbar.scss:rt-color-border-default`; сценарий `SC-UKV-92`

Сценарии этого поддомена снимаются замером на собранной витрине, а не спекой: полоса прокрутки —
часть браузера, и в среде спек её не рисует ничто. История витрины — `Foundation/Design
Tokens/Scrollbar`, обёртка — `projects/ui-kit-v2/src/showcase/stories/component/test-scrollbar.component.ts`.
