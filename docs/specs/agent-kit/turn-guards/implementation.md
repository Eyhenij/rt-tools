# Привязка — гарды завершения хода

Утверждение спека и место, где оно исполняется. Связь идёт по тексту утверждения: снятое
утверждение снимается вместе со своей строкой.

| Правило                                                                                                    | Где исполняется                                                        |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Ход, в котором владельцу задан вопрос, не заканчивается, пока за этот же ход не читались законы и правила. | `projects/agent-kit/assets/hooks/grill-gate.sh:verdict`                |
| Чтением считается любой из трёх путей, а не только загрузка правила.                                       | `projects/agent-kit/assets/hooks/grill-gate.sh:read_re`                |
| Повторный заход по тому же ходу не судится.                                                                | `projects/agent-kit/assets/hooks/grill-gate.sh:active`                 |
| Гард разговора пропускает работу при любой поломке.                                                        | `projects/agent-kit/assets/hooks/grill-gate.sh:transcript`             |
| Гард окна напоминает раньше, чем отбивает.                                                                 | `projects/agent-kit/assets/hooks/window-fill-guard.sh:warn_pct`        |
| Напоминание повторяется по ступеням, а не на каждом действии.                                              | `projects/agent-kit/assets/hooks/window-fill-guard.sh:step`            |
| После порога остановки проходят запись хода работы, передача и команды поставки.                           | `projects/agent-kit/assets/hooks/window-fill-guard.sh:allowed`         |
| Гард окна пропускает работу при любой поломке.                                                             | `projects/agent-kit/assets/hooks/window-fill-guard.sh:transcript`      |
| Ход, в котором исполнитель признал промах, не закрывается, пока записи о происшествии нет.                 | `projects/agent-kit/assets/hooks/postmortem-guard.sh:postmortem-guard` |
| Ход, в котором владелец сказал завести или отправить предложение, не закрывается, пока отправки не было.   | `projects/agent-kit/assets/hooks/proposal-guard.sh:proposal-guard`     |
| Просьба о предложении ловится глаголом рядом со словом о слое правил, а не словом самим по себе.           | `projects/agent-kit/assets/hooks/proposal-guard.sh:asked_re`           |
| Ход с вопросом владельцу проверяется на инструменте вопроса, а не на завершении хода.                      | `projects/agent-kit/assets/hooks/grill-gate.sh:grill-gate`             |
| Ход, в котором по работе не сделано ничего, не заканчивается.                                              | `projects/agent-kit/assets/hooks/turn-exit-guard.sh:verdict`           |
| Работой считаются правка файла и команда, меняющая дерево.                                                 | `projects/agent-kit/assets/hooks/turn-exit-guard.sh:work_re`           |
| Слово об остановке судится по реплике владельца, а не по словам исполнителя.                               | `projects/agent-kit/assets/hooks/turn-exit-guard.sh:told_stop`         |
| Отданная и влитая работа стражем не судится.                                                               | `projects/agent-kit/assets/hooks/turn-exit-guard.sh:state`             |
| Этап, объявленный закрытым, подтверждается выводом команды.                                                | `projects/agent-kit/assets/hooks/turn-exit-guard.sh:stage_was`         |
| Приём, записанный прозой, страж не читает.                                                                 | `projects/agent-kit/assets/hooks/turn-exit-guard.sh:contract`          |
| Размер окна берётся из настройки дерева, а не из записи захода.                                            | `projects/agent-kit/assets/defaults/project.sh:RT_WINDOW_TOKENS`       |
| Один файл гарда вправе объявить несколько событий.                                                         | `projects/agent-kit/src/lib/hooks-map.ts:bindingsOf`                   |
| Ход, в котором совесть нашла повтор разобранного промаха, не заканчивается.                                | `projects/agent-kit/assets/hooks/conscience-guard.sh:verdict`          |
| Находку снимает действие, а не слова о ней.                                                                | `projects/agent-kit/assets/hooks/conscience-guard.sh:verdict`          |
| Верность находки гард не судит.                                                                            | `projects/agent-kit/assets/hooks/conscience-guard.sh:reason`           |
