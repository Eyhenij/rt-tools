# Чем исполняется — словарь формы панели

Первая колонка — правило спека рядом дословно. Вторая — где оно исполняется в дереве; там же
назван сценарий, которым это проверяется, а чем именно покрыт каждый сценарий, сказано в
`scenarios.md`.

Правило без строки и строка без правила — расхождение: спек обещает то, чего в дереве нет, либо
в дереве стоит то, о чём спек молчит.

- **Иерархия формы объявлена в ките, и приложение своих правил раскладки для панели не пишет.** — `projects/ui-kit-v2/src/styles/_form.scss:rt-form`; показ с пустым файлом стилей — `projects/ui-kit-v2/src/showcase/stories/component/test-form-dictionary.component.ts:TestRtFormDictionaryComponent`; сценарий `SC-UKV-103`
- **Блок формы объявляется ровно один раз на панель и стоит над полосой вкладок.** — `projects/ui-kit-v2/src/showcase/stories/component/test-form-dictionary.component.html:rtBlock` — единственное объявление блока на весь показ. **Прогоном не проверяется:** вкладки панель объявляет входом, и что блок стоит над полосой, видно только чтением разметки — открытый вопрос `Q-1` спека
- **Носителем блока формы бывает и тег формы, и обычный узел.** — `projects/ui-kit-v2/src/showcase/stories/component/test-form-dictionary.component.html:div` — показ объявляет блок обычным узлом, без привязки формы. **Прогоном не проверяется:** это разрешение, а не запрет, и отсутствие второго носителя ничем не отличается от его ненадобности
- **Промежуток задаёт контейнер своим зазором, а своего отступа нет ни у одного элемента.** — `projects/ui-kit-v2/src/styles/_form.scss:gap`; сценарии `SC-UKV-99`, `SC-UKV-100`
- **Зазор действует на проецируемое содержимое наравне со своей разметкой.** — `projects/ui-kit-v2/src/lib/components/aside-section/rt-aside-section.component.html:controls` — проекция раздела приходит внутрь колонки контролов; сценарий `SC-UKV-105`
- **Значение промежутка берётся ступенью шкалы отступов.** — `projects/ui-kit-v2/src/styles/_form.scss:rt-space-xl`; сценарий `SC-UKV-101`
- **Правила словаря лежат в подслое оформления кита.** — `projects/ui-kit-v2/src/styles/_form.scss:rt-kit.components`, порядок подслоёв — `projects/ui-kit-v2/src/styles/_layers.scss:rt-kit`; сценарий `SC-UKV-102`
- **Словарь доезжает до потребителя агрегатором стилей.** — `projects/ui-kit-v2/src/styles/_index.scss:form`; сценарий `SC-UKV-103`
- **На узком экране ритм разделов сжимается, и порог тот же, что у самой панели.** — `projects/ui-kit-v2/src/styles/_form.scss:rt-bp-md`, порог панели — `projects/ui-kit-v2/src/lib/components/aside/rt-aside.component.scss:media`; сценарий `SC-UKV-104`
- **Раздел вкладывается в себя, и третьего имени под вложенный раздел нет.** — `projects/ui-kit-v2/src/styles/_form.scss:__item`, вложенный раздел в показе — `projects/ui-kit-v2/src/showcase/stories/component/test-form-dictionary.component.html:form-item-meals`; сценарий `SC-UKV-100`
- **Раздел панели берёт словарь сам.** — `projects/ui-kit-v2/src/lib/components/aside-section/rt-aside-section.component.html:rt-form`, своих правил раскладки у раздела не осталось — `projects/ui-kit-v2/src/lib/components/aside-section/rt-aside-section.component.scss:rt-aside-section`; сценарий `SC-UKV-105`
- **Виды строки и элемента объявлены словарём, а не потребителем.** — `projects/ui-kit-v2/src/styles/_form.scss:__control-item--split`; сценарии `SC-UKV-106`, `SC-UKV-107`
- **Элемент в ряду умеет сжиматься.** — `projects/ui-kit-v2/src/styles/_form.scss:min-width`; сценарий `SC-UKV-108`
- **Зона содержимого вкладки внутри формы отбивает разделы ритмом формы.** — `projects/ui-kit-v2/src/styles/_form.scss:rt-tabs__content`; сценарий `SC-UKV-109`
- **Поле, стоящее в строке контрола одно, занимает её целиком.** — `projects/ui-kit-v2/src/styles/_form.scss:rt-field`; сценарий `SC-UKV-110`
- **Поле внутри элемента ряда занимает элемент целиком.** — `projects/ui-kit-v2/src/styles/_form.scss:__control-sub-item`; сценарий `SC-UKV-112`
- **Запись внутри общей рамки несёт свой внутренний отступ.** — `projects/ui-kit-v2/src/styles/_form.scss:__framed-item`; сценарий `SC-UKV-111`
