# Чем исполняется — разряды числового поля

Первая колонка — правило спека рядом дословно. Вторая — где оно исполняется в дереве; там же
назван сценарий, которым это проверяется, а чем именно покрыт каждый сценарий, сказано в
`scenarios.md`.

Правило без строки и строка без правила — расхождение: спек обещает то, чего в дереве нет, либо
в дереве стоит то, о чём спек молчит.

- **Числовое поле разделяет разряды, пока не сказано обратного.** — `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.ts:grouped`; сценарий `SC-UKV-113`
- **Поле, которому названо сплошное число, разделителей не ставит ни при наборе, ни после ухода фокуса.** — `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.ts:formatNumber`, набор — `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.ts:#groupDisplay`; сценарий `SC-UKV-114`
- **Разбор набранного от вида показа не зависит.** — `projects/ui-kit-v2/src/lib/components/input-number/rt-input-number.component.ts:parseNumber` — разбор снимает любые пробелы и знак разрядов локали; сценарий `SC-UKV-114`
