# Привязка — экзамен по загруженным правилам

Утверждение спека и место, где оно исполняется. Связь идёт по тексту утверждения: снятое
утверждение снимается вместе со своей строкой.

- **Правка не идёт, пока за сессию не сдан экзамен по загруженным правилам.** — `projects/agent-kit/assets/hooks/exam-guard.sh:verdict`
- **Сдачей считается только полный балл.** — `projects/agent-kit/assets/hooks/exam-guard.sh:verdict`
- **Судится последний вердикт роли, а не первый.** — `projects/agent-kit/assets/hooks/exam-guard.sh:verdict`
- **Экзамен спрашивается дважды: на старте сессии и перед снятием черновика.** — `projects/agent-kit/assets/hooks/exam-guard.sh:ready`
- **Второй экзамен спрашивается только там, где есть открытая заявка.** — `projects/agent-kit/assets/hooks/exam-guard.sh:ready`
- **Записи хода сводятся в один поток по порядку.** — `projects/agent-kit/assets/hooks/exam-guard.sh:after`
- **Прочие команды клиента хостинга гард не судит.** — `projects/agent-kit/assets/hooks/exam-guard.sh:ready`
- **Роль, выключенная деревом, гарда при ней не держит.** — `projects/agent-kit/assets/hooks/roles.sh:rt_role_off`
- **Настройка, которую не прочитать, роль не выключает.** — `projects/agent-kit/assets/hooks/roles.sh:rt_role_off`
- **Вердикт второго экзамена ищется во всех формах записи хода, как и вердикт первого.** — `projects/agent-kit/assets/hooks/exam-guard.sh:after` — сценарий SC-AK-318
- **У отказа есть выход, не требующий снимать защиту.** — `projects/agent-kit/assets/hooks/exam-guard.sh:rt_exam_declared_skip` — сценарий SC-AK-852
- **Оба отказа называют, что путь через список выключенных требует снять защиту.** — `projects/agent-kit/assets/hooks/exam-guard.sh:deny` — текст обоих отказов; сценарий SC-AK-852
- **Снятием черновика считается вызов клиента, а не вхождение слов.** — `projects/agent-kit/assets/hooks/exam-guard.sh:ready` — сценарий SC-AK-853
