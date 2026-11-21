# Панели выбора кита в нижней шторке на телефоне и замечания приложения к киту

RT-3399 · PR #<номер> · 20 ноября 2026

## Просьба владельца

> найди тикет для селекторов и меню на мобилке открываются ботом шит, но это опционально

> бери в работу тикет асайни на меня, на каких компонентах это уже реализовано?

## Что было в дереве

- `rt-bottom-sheet` — нижняя шторка второго кита.
- `rt-date-picker` и `rt-date-range` уже открывали шторку на узком экране, но выключить её было
  нечем.
- `rt-page-bar` в `rt-page-header` открывал фильтры страницы в шторке.
- `rt-select`, `rt-multiselect`, `rt-menu` шторки не имели: список открывался у поля на любой
  ширине.
- Сама карточка RT-3399 называла только `rt-select` и `rt-multiselect`.

## Ответы владельца

- **Меню и остальные панели — в этой же задаче.** Сначала меню вынесли в отдельную задачу, владелец
  это отменил: «все в этом тикете делать, везде где можно прикрутить ботомшит вид на мобилке».
- **Что значит «опционально».** Выбрано «1 А»: шторка по умолчанию на узком экране, вход её
  выключает.
- **Пять мест сверх списка.** «Да, все пять»: сворачивание группы переключателей в поле, меню
  действий `rt-action-bar`, панель фильтров `rt-thread-list`, меню пользователя, панель «ещё» и
  подменю `rt-page-header`, выбор оператора в фильтре таблицы.
- **Поле даты и иконки на одной линии.** «включи в задачу поправить дейт пикер пример селектора» и
  «проверить у всех селектов и пиркеров иконки на одном и том же месте».
- **Быстрые периоды в шторке.** «добавь в тикет» — ряд «Сегодня · Вчера · Последние 7 дней · По…»
  обрезался краем шторки без знака, что он листается.
- **Закреплённый столбец таблицы.** «включи в задачу не прятать иконку драга а дизеблить».
- **Порог шторки.** «До 480 px»: шторка только на телефоне. Порог узкого экрана кита (1080 px)
  отдавал её планшету в альбомной ориентации и узкому окну ноутбука.
- **Замечания приложения к киту.** «посмотри что из описанных багов правится в ките и возьми в этот
  тикет в слаке отметь иконкой глазками» и затем «глянь все замечания которые относятся к киту и
  включи в эту задачу». Взяты: фон панели фильтров переписок, одна рамка фокуса на всех элементах,
  ровные шапки колонок переписок, без «назад» при видимом списке и «i» в строке действий, панель
  периода по краю поля, новая иконка календаря, постоянный текст до значения в `rt-input`
  (на регистрации адрес страницы вида «адрес-сайта/команда/» стоит в поле перед редактируемой
  частью). Остальные замечания канала — экраны самого приложения.
- **Подсказка у подписи поля.** «проверь и добавь в текущий тикет» под отчётом: подсказка `help`
  у `rt-field` рисовалась без фона и уходила за край окна. Выбрано «Подсказка кита (рекоменд.)».
  Подсказка кита в коде шире 240 (240 — это текст, плюс отступы) и держит 16 от края окна; на это
  владелец сказал «Поправить макет», а про закрытие подсказки при переводе указателя на текст и при
  щелчке после наведения — «Оставить, назвать в PR (рекоменд.)».

## Решения по ходу работы

- **Правила шторки — отдельный подраздел спецификации кита `popover-sheet`,** а не спецификация
  селекта, которую называл план: шторку даёт директива поповера, и служит она всему набору.
- **Прежнее поведение меню профиля на узком экране** (поверх подложки мобильного меню) осталось за
  выключенной шторкой; на телефоне действует одобренный макет.
- **Поиск в мультиселекте — в этой задаче.** Макет шторки его рисовал, а у `rt-multiselect` поиска
  не было вовсе. На вопрос владелец ответил «Да, в этой задаче»; вход `filter` взят у селекта, в
  шторке поле стоит по краю её содержимого без черты. Витрина: «Одобряю витрину».
- **Шторки не накладываются.** «ботомшиты не накладываются а подменяют, при закрытии верхнего
  показывается предыдущий» — порядок держит общая на страницу служба стопки шторок.
- **Отборы шапки шире телефона.** «Сделать в этой задаче»: до 480 — шторка, шире — панель у кнопки;
  селектор внутри шторки отборов открывает свою шторку на её месте.
- **Номера сценариев шторки перенесены при слиянии main** на SC-UKV-1672…1627: main успел занять
  1385…1389 и 1436…1505 своими сценариями.
- **Ещё три замечания приложения к киту.** «проверь и если проблемы включи в задачу». Подтвердились
  все три. Запасной порог по окну стоял под `:has()` от корня, и правка любой ячейки заставляла
  браузер пересчитывать стили всего документа. Теперь каркас ставит класс на корень. Окно
  подтверждения было жёстко шириной 280, теперь оно растёт по кнопкам. Значок «?» поднимал строку
  подписи на 2 px, теперь не поднимает. Замер пересчёта на 3000 узлах в витрине: 0,73–0,77 мс
  против 0,52–0,60 мс, в приложении 7,5 против 0,4.
- **Две проверки ревью ушли в код:** пароль утекал в скрытую копию, которая задаёт ширину поля с
  постоянным текстом; подпись на рамке ложилась поверх постоянного текста.

## Цена

- Задача выросла с двух компонентов до всех панелей выбора кита и семи замечаний приложения; каждое
  видимое изменение шло через макет и одобрение витрины.
- Снимки витрины для новых историй шторки сняты впервые, у рабочего стола и шторки пересняты.
- Первая съёмка шторок упала целиком: истории называли оверлеем узел `rt-popover-sheet`, а у него
  ширина 0 — коробка оверлея нулевой ширины, и для съёмки он невидим. Истории теперь называют
  открытый лист внутри него. По той же причине падало меню действий шапки на телефоне: его класс
  стоит на той же коробке.
- Четыре прежних эталона сменились по одобренным правкам: «Ещё» вкладок на телефоне — шторкой,
  кадр 768 отборов шапки — без шторки (шире телефона она закрывается, панель показывает своя
  история), рабочий стол при видимом списке — без «назад».

## Одобрения владельца

- **Макет:** «это ок» — https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=6068-811 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=6068-895 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=6068-1250
- **Макет:** «макеты ок» — https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8293-2474 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8292-1058 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8292-1122 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8292-1522 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8292-1756 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8292-2360 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8292-2593 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8293-3667 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8293-3691
- **Макет:** «Одобряю» — https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8310-652 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8310-769 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8310-837 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8310-1013 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8310-2735 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8310-3067 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8310-17232 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8310-17301 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8310-17374
- **Макет:** «Б — перенос» — https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8371-1292
- **Макет:** «Одобряю» — https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8405-752
- **Витрина:** «Одобряю» — http://localhost:6017/?path=/story/molecules-forms-selectsheet--sheet , http://localhost:6017/?path=/story/molecules-forms-multiselectsheet--toggles-sheet , http://localhost:6017/?path=/story/molecules-navigation-menusheet--sheet , http://localhost:6017/?path=/story/molecules-navigation-pageheadersheet--user-menu-sheet , http://localhost:6017/?path=/story/molecules-forms-daterangepanel--sheet , http://localhost:6017/?path=/story/organisms-table-tablesettingspanel--playground
- **Совпадение:** 21 из 21 чисел
- **Макет:** «outline/calendar-2» — https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8423-1981
- **Макет:** «Одобряю» — https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8423-1981 (маска `--.--.----` в пустом поле даты, периода и даты со временем)
- **Макет:** «Одобряю все» — https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8437-2659 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8437-5765 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8437-9117 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8437-4466 (поверхность панели фильтров, одна рамка фокуса, рабочий стол без «назад» при видимом списке, панель даты и периода по краю поля)
- **Совпадение:** 29 из 29 чисел
- **Витрина:** «Одобряю витрину» — http://localhost:6017/?path=/story/organisms-chat-threadlistsheet--sheet-off , http://localhost:6017/?path=/story/molecules-forms-daterange--playground , http://localhost:6017/?path=/story/molecules-forms-datepicker--playground , http://localhost:6017/?path=/story/organisms-workspace-breakpoint--tablet-columns , http://localhost:6017/?path=/story/molecules-navigation-tabs--playground
- **Макет:** «Одобряю макет» — https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8449-1560 (постоянный текст до и после значения в `rt-input`)
- **Совпадение:** 23 из 23 чисел
- **Витрина:** «Approve showcase» — http://localhost:6017/?path=/story/molecules-forms-fieldextras--affixes
- **Макет:** «Одобряю макет» — https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8477-2372 (подсказка у подписи поля — подсказка кита)
- **Макет:** «Одобряю макет» — https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8477-2372 (кадр поправлен под подсказку кита: ширина 256, от края окна 16)
- **Совпадение:** 19 из 19 чисел
- **Витрина:** «Одобряю витрину» — http://localhost:6017/?path=/story/molecules-forms-field--anatomy
- **Макет:** «Одобряю макеты» — https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8497-17962 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8499-16968 , https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL?node-id=8495-16640 (шторка из шторки подменяет её и возвращает при закрытии; отборы шапки шире 480 — панелью у кнопки)
- **Совпадение:** 23 из 23 чисел (панель отборов, 8495:16640); 45 из 45 чисел (шторка списка, 8497:17962)
- **Витрина:** «одобряю если матчится с макетами» — http://localhost:6017/?path=/story/molecules-navigation-pageheadervertical--narrow-filters-panel , http://localhost:6017/?path=/story/molecules-navigation-pageheadervertical--phone-filter-select
- **Совпадение:** 14 из 14 чисел (поиск мультиселекта в шторке, 6068:1250)
- **Витрина:** «Одобряю витрину» — http://localhost:6017/?path=/story/molecules-forms-multiselectsheet--sheet
- **Витрина:** «Я видел макеты стои матчатся с ними тогда ок» — http://localhost:6017/?path=/story/molecules-dialog-confirmpopover--playground , http://localhost:6017/?path=/story/molecules-forms-field--anatomy , http://localhost:6017/?path=/story/molecules-forms-togglebuttongroupfold--folded-one (окно подтверждения, «?» у подписи поля, свёрнутая группа переключателей)
- **Совпадение:** 12 из 12 чисел (окно подтверждения; «Отмена» 103 против 102 — от кнопки кита); строка подписи 14, значок и кнопка «?» 16 по центру; свёрнутое поле 343 × 40 от края 16. Зазор подписи и «?» 4 против 2 в макете — токен `--rt-field-label-help-gap`, в задаче не менялся
