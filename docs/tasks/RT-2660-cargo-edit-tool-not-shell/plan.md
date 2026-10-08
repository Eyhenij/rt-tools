# План — RT-2660: текст правят инструментом правки

**Behaviour:** unchanged — правятся тексты пакета правил и проверка слога, код приложений не трогается.

## След задачи

- `projects/agent-kit/assets/rules/doc-style.md`
- `projects/agent-kit/assets/pitfalls/doc-style.md`
- `projects/agent-kit/assets/rules/testing.md`
- `projects/agent-kit/assets/rules/component-structure.md`
- `projects/agent-kit/assets/checks/check-prose-style.mjs`
- `projects/agent-kit/tests/check-prose-style.test.sh`
- `docs/specs/agent-kit/prose-guard/scenarios.md`
- разложенные копии этих файлов после `agent-kit:sync`

## Этапы

### 1. Статьи

- 1.1 Статья в doc-style: файл дерева правится инструментом правки, проверка судит всё тело команды
- 1.2 Ловушка в pitfalls/doc-style: однострочник в оболочке — одно предложение
- 1.3 Статьи в testing и component-structure со ссылкой на doc-style

Готово, когда `wc -lc` трёх правил не выходит за пределы, которые печатает проверка размера.

### 2. Проверка слога

- 2.1 Точка перед `**` закрывает предложение в `longSentences`
- 2.2 Сценарий SC-AK-1191 и его тест

Готово, когда `bash projects/agent-kit/tests/check-prose-style.test.sh` зелёный.

### 3. Сдача

- 3.1 Сборка пакета, раскладка, проверки перед push
- 3.2 Папка задачи разобрана, PR в ветку эпика
