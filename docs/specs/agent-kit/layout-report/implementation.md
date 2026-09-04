# Привязка — разбор состояния раскладки

Утверждение спека и место, где оно исполняется. Связь идёт по тексту утверждения: снятое
утверждение снимается вместе со своей строкой.

- **Разбор называет замещённые надстройками разделы поимённо — ресурс и заголовок.** — `projects/agent-kit/src/lib/commands.ts:replacedLines`
- **Дерево без надстроек о замещённом молчит.** — `projects/agent-kit/src/lib/commands.ts:replacedLines`
- **Сводка называет местные значения, которых ждут взятые хуки.** — `projects/agent-kit/src/lib/commands.ts:localValueLines`
- **Надстройка, не подобранная ни к одному ресурсу, называется вместе с причиной.** — `projects/agent-kit/src/lib/snapshot.ts:overridesOf`
- **Файл вне рода ресурсов надстройкой не считается.** — `projects/agent-kit/src/lib/snapshot.ts:treeSnapshot`
- **Долг привязок считается по разложенному телу правила, а не по пакетной редакции.** — `projects/agent-kit/src/lib/sync.ts:mergedBody`
- **Незаданный порог сжатия разбор называет вместе с готовыми числами.** — `projects/agent-kit/src/lib/thresholds.ts:thresholdLines`
- **Надстройка, заведённая ради отправленного предложения, помечается в самой надстройке.** — `projects/agent-kit/src/lib/override-marks.ts:MARK` — форма пометки; сценарий `SC-AK-846`
- **Раскладка перечисляет помеченные разделы, чья статья в новой редакции уже есть.** — `projects/agent-kit/src/lib/commands.ts:staleOverrideLines` — сценарий `SC-AK-847`
- **Снимает раздел человек, а не команда.** — `projects/agent-kit/src/lib/override-marks.ts:staleOverrides` — функция только называет разделы и ничего не пишет; сценарий `SC-AK-847`
- **Раздел без пометки считается постоянным.** — `projects/agent-kit/src/lib/override-marks.ts:marksOfOverride` — сценарий `SC-AK-846`
- **Пометка на ресурс, которого в новой редакции нет, молчит.** — `projects/agent-kit/src/lib/override-marks.ts:staleOverrides` — сценарий `SC-AK-848`
- **Незаполненная дырка расхождением не считается и называется отдельным состоянием.** — `projects/agent-kit/src/lib/commands.ts:syncCheck` — счёт расхождений её не включает; сценарий `SC-AK-854`
- **Дырка называется на любом исходе сверки, вместе с ходом.** — `projects/agent-kit/src/lib/commands.ts:holeWarningLines` — блок стоит в предупреждениях, а они печатаются и на сошедшемся дереве; сценарий `SC-AK-854`
