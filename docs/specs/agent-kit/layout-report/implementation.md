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
