# Гарды хода и гейт правил — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека рядом. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

Якорь здесь — слово, которое утверждение и держит. Сверка ищет его по всему файлу и любым словом
удовлетворяется, поэтому имя поля из чужой строки проходит её так же, как нужное предложение, — и
утверждение остаётся зелёным, когда сам текст роли переписан целиком.

| Правило                                                                                                      | Где исполняется                                                         |
| ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Ход, в котором владельцу задан вопрос, не заканчивается, пока за этот же ход не читались законы и правила.   | `projects/agent-kit/assets/hooks/grill-gate.sh:verdict`                 |
| Чтением считается любой из трёх путей, а не только загрузка правила.                                         | `projects/agent-kit/assets/hooks/grill-gate.sh:read_re`                 |
| Повторный заход по тому же ходу не судится.                                                                  | `projects/agent-kit/assets/hooks/grill-gate.sh:active`                  |
| Гард разговора пропускает работу при любой поломке.                                                          | `projects/agent-kit/assets/hooks/grill-gate.sh:transcript`              |
| Гард окна напоминает раньше, чем отбивает.                                                                   | `projects/agent-kit/assets/hooks/window-fill-guard.sh:warn_pct`         |
| Напоминание повторяется по ступеням, а не на каждом действии.                                                | `projects/agent-kit/assets/hooks/window-fill-guard.sh:step`             |
| После порога остановки проходят запись хода работы, передача и команды поставки.                             | `projects/agent-kit/assets/hooks/window-fill-guard.sh:allowed`          |
| Размер окна берётся из настройки дерева, а не из записи захода.                                              | `projects/agent-kit/assets/defaults/project.sh:RT_WINDOW_TOKENS`        |
| Гард окна пропускает работу при любой поломке.                                                               | `projects/agent-kit/assets/hooks/window-fill-guard.sh:transcript`       |
| Один файл гарда вправе объявить несколько событий.                                                           | `projects/agent-kit/src/lib/hooks-map.ts:bindingsOf`                    |
| Конфиг линтера требует правило под собой.                                                                    | `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`      |
| Проверка повторов требует правило, чьи признаки исполняет, и только его.                                     | `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`      |
| Хук, которому не хватает функции профиля, говорит об этом вместо молчания.                                   | `projects/agent-kit/assets/hooks/profile-check.sh:rt_needs`             |
| Сообщение о нехватке не превращает хук в отказ.                                                              | `projects/agent-kit/assets/hooks/profile-check.sh:rt_needs`             |
| Разбор состояния перечисляет функции профиля, которых ждут разложенные хуки, и те из них, что не определены. | `projects/agent-kit/src/lib/commands.ts:profileLines`                   |
| Признак кода приложения судится относительно корня дерева.                                                   | `projects/agent-kit/assets/defaults/project.sh:rt_is_app_code_default`  |
| Ход, в котором исполнитель признал промах, не закрывается, пока записи о происшествии нет.                   | `projects/agent-kit/assets/hooks/postmortem-guard.sh:postmortem-guard`  |
| Ход, в котором владелец сказал завести или отправить предложение, не закрывается, пока отправки не было.     | `projects/agent-kit/assets/hooks/proposal-guard.sh:proposal-guard`      |
| Просьба о предложении ловится глаголом рядом со словом о слое правил, а не словом самим по себе.             | `projects/agent-kit/assets/hooks/proposal-guard.sh:asked_re`            |
| Ход с вопросом владельцу проверяется на инструменте вопроса, а не на завершении хода.                        | `projects/agent-kit/assets/hooks/grill-gate.sh:grill-gate`              |
| Заведение рабочего дерева грузит правило поставки.                                                           | `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`      |
| Слои поверх доменного правила объявляются своим файлом, а не строками в гейте.                               | `projects/agent-kit/assets/hooks/skill-gate-layers.sh:rt_layer_add`     |
| Слой требует правило дополнительно, а не вместо доменного.                                                   | `projects/agent-kit/assets/hooks/skill-gate.sh:want`                    |
| Признак, невидимый по пути, судится по тексту правки.                                                        | `projects/agent-kit/assets/hooks/skill-gate-layers.sh:rt_layer_payload` |
| Слой, которому нечем прочитать текст правки, отпускает действие.                                             | `projects/agent-kit/assets/hooks/skill-gate-layers.sh:rt_layer_is_spec` |
| Файл слоёв гейт зовёт в своей оболочке, а не отдельным процессом.                                            | `projects/agent-kit/assets/hooks/skill-gate.sh:rt_hooks_dir`            |
| Карта гейта считает командой вызов, а не упоминание.                                                         | `projects/agent-kit/assets/defaults/gate-map.sh:rt_gate_invokes`        |
| Гард замысла судит объявленный переход, а не наличие файлов.                                                 | `projects/agent-kit/assets/hooks/task-flow-guard.sh:state`              |
| Отказ по состоянию называет обязательное действие того состояния, которое объявлено.                         | `projects/agent-kit/assets/hooks/task-flow-guard.sh:state_action`       |
| Именем состояния считается только слово из перечня.                                                          | `projects/agent-kit/assets/hooks/task-flow-guard.sh:state_action`       |
| Состояние судится раньше договорённости и её обхода.                                                         | `projects/agent-kit/assets/hooks/task-flow-guard.sh:progress`           |
