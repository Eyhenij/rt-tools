# Находки RT-3419 — ожидание долгой задачи вместо «стоп»

Продолжение файла `docs/plans/checks-rework-4-findings.md`: он дошёл до предела длины. Здесь —
находки ревью RT-3419, которые лежат вне следа её одобренного плана. Каждая ждёт решения владельца:
отдельная задача или нет.

## RT-3419 — a wait of the session's own long task instead of a stop word

- **An agent that handed its report back ends with no event the record reads.** The host writes
  its end as an `attachment` of the kind `task_status` with the status `completed`; the session
  source reads only `<task-notification>`. On 18.11 one such role stood open for 391 stops. RT-3419
  leaves agents out of the hung tasks, so past the bound such an agent counts as no task.
  **Address:** `projects/agent-kit/assets/task-flow/source/session.mjs:taskOver` reads a
  `task_status` with a final status as the end of the task, with a scenario.
  **Metric:** stops with an agent open past its report, from 391 over 14–22.11 down to 0.
- **A tree whose override names the removed release case loses the exit guard with no message.**
  The word keys `stop`, `stopExcept` and `holdAfter` are retired in RT-3419 itself: the model reads
  them as nothing and the engine names them. The release case `stopWord` is not: an override that
  removes it by `null` is refused by `flow-override.mjs` (outside the footprint), «null removes
  nothing», and one that sets it names the gone measurer `measure.owner.saidStop`. Then the exit
  guard fails open. This tree has no such override. **Address:**
  `projects/agent-kit/assets/checks/flow-override.mjs:mergeOverride` drops a retired release key
  with a line, as `flow-data.mjs:retiredLines` does for the words. **Metric:** trees on the new
  edition whose exit guard fails open, down to 0.
- **The bindings of two model-check cases name common words.** `ask-judge.md:bare` and
  `turn-judge.md:notice` pass the anchor check while the case they bind is gone. **Address:**
  an anchor the check finds only in the case itself, or a marker comment next to the case.

## Разбор правил после RT-3419 — skill-curator, 22.11

Пять предложений роли; каждое ждёт решения владельца.

- **Сделанные шаги перемеряются до разбора папки.** Правка второго круга нарочно назвала снятые
  ключи слов, и проверка шага 2.2 дала 4 вместо 0. Это выяснилось только на отказе открытия PR и
  стоило отката разбора, замены проверки и повторного разбора — три коммита. **Address:** пакет,
  `projects/agent-kit/assets/patterns/task-flow-archive.md` и холодная часть
  `projects/agent-kit/assets/pitfalls/task-flow-archive.md`, состояние `разбор-кончился`: вход —
  ещё и `task-flow-script.mjs step --done` по всем сделанным шагам; дерево — строка
  `node tools/task-flow-script.mjs step --done` в блоке 11–12 правила
  `.claude/skills/task-delivery-loop-run/SKILL.md`. **Metric:** отказы открытия PR по перемеру
  шагов, вниз до 0.
- **Переопределённая задача сохраняет `[RT-N]` в заголовке.** Заголовок карточки переписан при
  переопределении, номер пропал; проверка доставки назвала это только на открытии PR. **Address:**
  пакет, «Common misses» в `projects/agent-kit/assets/pitfalls/task-flow-start.md`. **Metric:**
  отказы `task_title_numbered` при открытии PR, вниз.
- **Тело PR читается проверкой по заголовкам профиля.** Таблица критика стояла под заголовком,
  скопированным из прошлого PR цепочки, и не засчиталась под «Цель». Абзац «тело машиной не
  проверяется» в `projects/agent-kit/assets/pitfalls/git-workflow-pr-body.github.md` устарел.
  **Address:** заменить абзац правилом о `RT_PULL_BODY_SECTION`, `RT_PULL_POINTS_SECTION` и
  `RT_PULL_GOAL_SECTION`; по желанию отказ `git-guard-delivery-body.sh` называет заголовок цели.
  **Metric:** отказы `pr_create_thin_body`, вниз.
- **Правило цикла расходится с проверкой шагов.** Статья «A finding about the diff is never parked
  in a file», а `flow-step-guard` запрещает правку файла вне следа плана, и находка ушла в файл
  находок. **Address:** дерево, `.claude/skills/task-delivery-loop/SKILL.md` и строка его
  `implementation.md`: правка, которую запрещает проверка шагов, идёт в файл находок эпика с
  адресом и метрикой и называется в теле PR. **Metric:** расхождений правила и проверки, 1 → 0.
- **Находка о поведении хоста считается по записям до правки.** Первый круг добавил правило
  доставки Esc за 5 секунд по рассуждению; второй сосчитал 17 отметок и снял его. **Address:**
  дерево, статья «A finding is checked against the code before it is fixed» правила
  `task-delivery-loop`: находка о том, что хост шлёт или пишет, сверяется с записями машины, число
  идёт в коммит круга. **Metric:** правки круга, снятые следующим кругом, вниз.
- **Без правки:** вызов набора с хвостом после него — правило `task-delivery-loop-run` это уже
  запрещает, проверка сработала как задумано.
