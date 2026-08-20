# Гарды хода и гейт правил — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека рядом. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

Якорь здесь — слово, которое утверждение и держит. Сверка ищет его по всему файлу и любым словом
удовлетворяется, поэтому имя поля из чужой строки проходит её так же, как нужное предложение, — и
утверждение остаётся зелёным, когда сам текст роли переписан целиком.

| Правило                                                                                                      | Где исполняется                                                         |
| ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Конфиг линтера требует правило под собой.                                                                    | `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`      |
| Проверка повторов требует правило, чьи признаки исполняет, и только его.                                     | `projects/agent-kit/assets/defaults/gate-map.sh:skill_for_default`      |
| Хук, которому не хватает функции профиля, говорит об этом вместо молчания.                                   | `projects/agent-kit/assets/hooks/profile-check.sh:rt_needs`             |
| Сообщение о нехватке не превращает хук в отказ.                                                              | `projects/agent-kit/assets/hooks/profile-check.sh:rt_needs`             |
| Разбор состояния перечисляет функции профиля, которых ждут разложенные хуки, и те из них, что не определены. | `projects/agent-kit/src/lib/commands.ts:profileLines`                   |
| Признак кода приложения судится относительно корня дерева.                                                   | `projects/agent-kit/assets/defaults/project.sh:rt_is_app_code_default`  |
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
| Правка не идёт, пока за сессию не сдан экзамен по загруженным правилам.                                      | `projects/agent-kit/assets/hooks/exam-guard.sh:verdict`                 |
| Сдачей считается только полный балл.                                                                         | `projects/agent-kit/assets/hooks/exam-guard.sh:verdict`                 |
| Судится последний вердикт роли, а не первый.                                                                 | `projects/agent-kit/assets/hooks/exam-guard.sh:verdict`                 |
| Экзамен спрашивается дважды: на старте сессии и перед снятием черновика.                                     | `projects/agent-kit/assets/hooks/exam-guard.sh:ready`                   |
| Записи хода сводятся в один поток по порядку.                                                                | `projects/agent-kit/assets/hooks/exam-guard.sh:after`                   |
