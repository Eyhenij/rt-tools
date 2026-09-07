# Привязка — граница состояния в текстах работы

Утверждение спека и место, где оно исполняется. Связь идёт по тексту утверждения: снятое
утверждение снимается вместе со своей строкой.

- **Раздел состояния называет следующее движение.** — `projects/agent-kit/assets/checks/check-state-next.mjs:MARKER`
- **Строка стоит в каждом разделе состояния, а не по одной на состояние.** — `projects/agent-kit/assets/checks/check-state-next.mjs:sectionsOf`
- **Хвост у каждой строки свой, и две дословно совпавшие строки — расхождение.** — `projects/agent-kit/assets/checks/check-state-next.mjs:tails`
- **Строку находит зачин, общий для всех разделов.** — `projects/agent-kit/assets/checks/check-state-next.mjs:MIN_TAIL`
- **Правило ведения работы называет переход между состояниями среди того, чем ход не кончается.** — `projects/agent-kit/assets/checks/check-state-next.mjs:BOUNDARY`
- **Проверка пропускает дерево, где правила ведения работы нет.** — `projects/agent-kit/assets/checks/check-state-next.mjs:RULE`
- **Отказ называет состояние, ведущий паттерн и заголовок раздела.** — `projects/agent-kit/assets/checks/check-state-next.mjs:problems`
- **Проверка заводится своя, со своей командой и своей строкой в наборе гейта пуша.** — `projects/agent-kit/assets/defaults/project.sh:rt_push_checks_default`
- **Формулировка у каждого раздела своя.** — `projects/agent-kit/assets/checks/check-state-next.mjs:twin`
- **Карта хода говорит то же самое теми же словами по смыслу.** — `projects/agent-kit/assets/checks/check-state-next.mjs:MAP`
- **Закон о ведении работы называет это статьёй.** — `projects/agent-kit/assets/checks/check-state-next.mjs:LAW`
- **Раздел про состояние вне перечня эта проверка не судит.** — `projects/agent-kit/assets/checks/check-states.mjs:known`
- **Заголовок раздела состояния и зачин строки читаются под двумя именами, английским и русским.** — `projects/agent-kit/assets/checks/check-state-next.mjs:MARKERS`
