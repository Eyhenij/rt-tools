# Признаки единообразия — где это в дереве

Первая колонка — статья дословно, как она написана в разделе «Правила» спека поддомена.

- **Признак единообразия живёт данными, а не кодом проверки.** — `projects/agent-kit/assets/checks/signals.mjs:loadSignals`
- **Проверка, не получившая ни одного признака, отказывает, а не отвечает нулём.** — `projects/agent-kit/assets/checks/signals.mjs:loadSignals` — отказ бросается загрузчиком, а печатает его строкой `checks/check-reuse.mjs`; сценарий SC-AK-813
- **Признак, называющий глобаль, судит положение имени, а не подстроку.** — `projects/agent-kit/assets/checks/signals/core.json:raw-window` — строковые литералы снимаются полем `strip`, своё объявление гасит признак полем `cancel`, серверные корни отсекает `skipBackendRoots`; сценарии SC-AK-814 и SC-AK-815
- **Набор признаков режется по пакетам rt-tools.** — `projects/agent-kit/assets/checks/signals.mjs:BUNDLES_DIR`
- **Дерево получает признаки тех пакетов, которые назвало.** — `projects/agent-kit/assets/checks/signals.mjs:readBundle`
- **Дерево дописывает признаки, а не правит чужие.** — `projects/agent-kit/assets/checks/signals.mjs:byKey`
- **Директивы своей дизайн-системы дерева вырезаются из признаков нативных тегов.** — `projects/agent-kit/assets/checks/signals.mjs:withKitDirectives` — список приходит ключом `reuse.kitDirectives`, вырезание дописывается к полю `strip` признака; сценарий SC-AK-817
