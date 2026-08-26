# Гарды хода и гейт правил — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека рядом. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

Якорь здесь — слово, которое утверждение и держит. Сверка ищет его по всему файлу и любым словом
удовлетворяется, поэтому имя поля из чужой строки проходит её так же, как нужное предложение, — и
утверждение остаётся зелёным, когда сам текст роли переписан целиком.

- **Хук, которому не хватает функции профиля, говорит об этом вместо молчания.** — `projects/agent-kit/assets/hooks/profile-check.sh:rt_needs`
- **Сообщение о нехватке не превращает хук в отказ.** — `projects/agent-kit/assets/hooks/profile-check.sh:rt_needs`
- **Разбор состояния перечисляет функции профиля, которых ждут разложенные хуки, и те из них, что не определены.** — `projects/agent-kit/src/lib/commands.ts:profileLines`
- **Признак интерпретатора читается у строки, открывшей тело, а не у всей команды.** — `projects/agent-kit/assets/defaults/project.sh:rt_shell_paths_default`
- **Признак кода приложения судится относительно корня дерева.** — `projects/agent-kit/assets/defaults/project.sh:rt_is_app_code_default`
- **Гард замысла судит объявленный переход, а не наличие файлов.** — `projects/agent-kit/assets/hooks/task-flow-guard.sh:state`
- **Отказ по состоянию называет обязательное действие того состояния, которое объявлено.** — `projects/agent-kit/assets/hooks/task-flow-guard.sh:state_action`
- **Именем состояния считается только слово из перечня.** — `projects/agent-kit/assets/hooks/task-flow-guard.sh:state_action`
- **Состояние судится раньше договорённости и её обхода.** — `projects/agent-kit/assets/hooks/task-flow-guard.sh:progress`
- **Заход, начатый с передачи, не правит файлов, пока не загружено правило ведения работы.** — `projects/agent-kit/assets/hooks/handoff-entry-guard.sh:verdict`
- **Передача узнаётся и по пути к ней, и по слову о ней.** — `projects/agent-kit/assets/hooks/handoff-entry-guard.sh:from_handoff`
- **Отказ гарда называет два законных хода.** — `projects/agent-kit/assets/hooks/deny-tail.sh:rt_deny_tail`
- **Законная форма обхода называется тем же хвостом, а её отсутствие — тоже.** — `projects/agent-kit/assets/hooks/deny-tail.sh:rt_deny_tail`
- **Хвост отказа собирает общая функция, а не каждый текст сам.** — `projects/agent-kit/assets/hooks/git-guard-main.sh:deny_tail_text`
- **Начало вызова считает присваивания переменных частью команды, и объявлено оно одним местом.** — `projects/agent-kit/assets/hooks/hook-input.sh:RT_CMD_BOUND` — образец приставки вызова; носители берут его оттуда, своих копий у них нет; сценарий `SC-AK-559`
