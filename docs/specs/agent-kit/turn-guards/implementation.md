# Привязка — гарды завершения хода

Утверждение спека и место, где оно исполняется. Связь идёт по тексту утверждения: снятое
утверждение снимается вместе со своей строкой.

- **Ход, в котором владельцу задан вопрос, не заканчивается, пока за этот же ход не читались законы и правила.** — `projects/agent-kit/assets/hooks/grill-gate.sh:verdict`
- **Чтением считается любой из трёх путей, а не только загрузка правила.** — `projects/agent-kit/assets/hooks/grill-gate.sh:read_re`
- **Повторный заход по тому же ходу не судится.** — `projects/agent-kit/assets/hooks/grill-gate.sh:active`
- **На вопрос, ответ на который уже дала реплика владельца, гард разговора отвечает отказом.** — `projects/agent-kit/assets/hooks/grill-gate.sh:seen`
- **Отказ по второму признаку велит продолжать работу, а не переспрашивать иначе.** — `projects/agent-kit/assets/hooks/grill-gate.sh:seen`
- **Гард разговора пропускает работу при любой поломке.** — `projects/agent-kit/assets/hooks/grill-gate.sh:transcript`
- **Гард окна напоминает раньше, чем отбивает.** — `projects/agent-kit/assets/hooks/window-fill-guard.sh:warn_pct`
- **Напоминание повторяется по ступеням, а не на каждом действии.** — `projects/agent-kit/assets/hooks/window-fill-guard.sh:step`
- **После порога остановки проходят запись хода работы, передача и команды поставки.** — `projects/agent-kit/assets/hooks/window-fill-guard.sh:allowed`
- **Гард окна пропускает работу при любой поломке.** — `projects/agent-kit/assets/hooks/window-fill-guard.sh:transcript`
- **Ход, в котором исполнитель признал промах, не закрывается, пока записи о происшествии нет.** — `projects/agent-kit/assets/hooks/postmortem-guard.sh:postmortem-guard`
- **Ход, в котором владелец сказал завести или отправить предложение, не закрывается, пока отправки не было.** — `projects/agent-kit/assets/hooks/proposal-guard.sh:proposal-guard`
- **Просьба о предложении ловится глаголом рядом со словом о слое правил, а не словом самим по себе.** — `projects/agent-kit/assets/hooks/proposal-guard.sh:asked_re`
- **Ход с вопросом владельцу проверяется на инструменте вопроса, а не на завершении хода.** — `projects/agent-kit/assets/hooks/grill-gate.sh:grill-gate`
- **Ход, в котором по работе не сделано ничего, не заканчивается.** — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:verdict`
- **Работой считаются правка файла и команда, меняющая дерево.** — `projects/agent-kit/assets/hooks/turn-exit-patterns.sh:work_re`
- **Слово об остановке судится по реплике владельца, а не по словам исполнителя.** — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:told_stop`
- **Ход, кончившийся словами об ожидании слова владельца, не отпускается без его слова или вопроса ему инструментом.** — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:awaits_word` — набор образцов фразы; ярус стоит до законных выходов; сценарий SC-AK-891
- **Отданная и влитая работа стражем не судится.** — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:state`
- **Ход, объявивший записанный замысел, не кончается вовсе.** — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:first_stage` — ветка отбивает ход до второго признака и берёт заголовок первого этапа из замысла; сценарии SC-AK-591…593
- **Снятая папка задачи снимает требование состояния, а ход не кончает.** — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:archived` — признак уводит суд на второй, а ход не отпускает; сценарии SC-AK-574…576
- **Ход, открывший заявку, не кончается, пока состояние отданной работы не спрошено командой.** — `projects/agent-kit/assets/hooks/waiting-turn-guard.sh:ready_re` — признак берётся из команд хода; сценарий SC-AK-583
- **Шаг закрытия работы взятием следующей задачи не считается.** — `projects/agent-kit/assets/hooks/waiting-turn-guard.sh:taken_re` — перечень того, чем взятие бывает; путь правки судится образцом `taken_path_re`; сценарий SC-AK-812
- **Этап, объявленный закрытым, подтверждается выводом команды.** — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:stage_was`
- **Приём, записанный прозой, страж не читает.** — `projects/agent-kit/assets/hooks/turn-exit-guard.sh:contract`
- **Размер окна берётся из настройки дерева, а не из записи захода.** — `projects/agent-kit/assets/defaults/project.sh:RT_WINDOW_TOKENS`
- **Порог сжатия задан деревом теми же числами, что и пороги стража.** — `projects/agent-kit/src/lib/thresholds.ts:readThresholds`
- **Пара стража сверяется с парой сжатия, и разошедшееся называется числами обеих сторон.** — `projects/agent-kit/src/lib/thresholds.ts:thresholdDrift`
- **Дерево, не объявившее порога сжатия, отказа не получает.** — `projects/agent-kit/src/lib/thresholds.ts:thresholdLines`
- **Один файл гарда вправе объявить несколько событий.** — `projects/agent-kit/src/lib/hooks-map.ts:bindingsOf`
- **Роль, выключенная деревом, гарда при ней не держит.** — `projects/agent-kit/assets/hooks/roles.sh:rt_role_off`
- **Настройка, которую не прочитать, роль не выключает.** — `projects/agent-kit/assets/hooks/roles.sh:rt_role_off`
- **Гард объявляет локаль исполнения, а не наследует её.** — `projects/agent-kit/assets/hooks/utf8.sh:rt_use_utf8_locale`
- **Страж после порога сжатия остаётся страховкой.** — `projects/agent-kit/assets/hooks/window-fill-guard.sh:compact_pct`
- **Сводка сжатия настоящей репликой владельца не бывает.** — `projects/agent-kit/assets/hooks/proposal-guard.sh:is_input`
- **Ход, в котором исполнитель просит владельца войти или ввести пароль, не заканчивается.** — `projects/agent-kit/assets/hooks/stand-login-guard.sh:asked_re` — набор образцов просьбы; сценарий SC-AK-840
- **Просьба переключить режим работы разрешена.** — `projects/agent-kit/assets/hooks/stand-login-guard.sh:asked_re` — слово о режиме в набор не входит; сценарий SC-AK-841
- **Граница набора образцов названа.** — `projects/agent-kit/assets/hooks/stand-login-guard.sh:Граница` — сказано в шапке гарда; не проверяется: чего гард не распознаёт, то и не проверяет
