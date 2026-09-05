# Гарды браузера — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека рядом. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

- **Признак закреплённого профиля берётся у переменной окружения, а при её отсутствии — у файла дерева.** — `projects/agent-kit/assets/hooks/browser-device-id.sh:file`
- **Ненастроенное дерево слышит о своей ненастроенности, но работу не теряет.** — `projects/agent-kit/assets/hooks/browser-device-id.sh:marker`
- **О ненастроенности говорится один раз за заход.** — `projects/agent-kit/assets/hooks/browser-device-id.sh:marker`
- **Вопрос владельцу о выборе браузера отбивается.** — `projects/agent-kit/assets/hooks/browser-guard-no-asking.sh:questions`
- **Слово «браузер» в имени правила или хука вопроса о выборе не делает.** — `projects/agent-kit/assets/hooks/browser-guard-no-asking.sh:questions`
- **Чужой признак устройства отбивается до вызова, а метка свежести ставится по его исходу.** — `projects/agent-kit/assets/hooks/browser-guard-device-id.sh:requested`
- **Запуск браузера своим драйвером отбивается, и отказ называет файл.** — `projects/agent-kit/assets/hooks/browser-guard-no-other-drivers.sh:launch`
- **Код, переданный интерпретатору доводом, судится тем же образцом, что и файл.** — `projects/agent-kit/assets/hooks/browser-guard-no-other-drivers.sh:launch`
- **Без закреплённого профиля гарды пропускают и вопрос, и свой драйвер.** — `projects/agent-kit/assets/hooks/browser-guard-no-other-drivers.sh:device_id`
- **Выбор браузера протухает, и вызов после перерыва требует выбрать заново.** — `projects/agent-kit/assets/hooks/browser-guard-require-select.sh:ttl`
- **Причина отказа по выбору приходит полем ответа.** — `projects/agent-kit/assets/hooks/browser-guard-require-select.sh:deny`
