# План — RT-2661: предел длины называет строки и символы

**Behaviour:** unchanged — правятся тексты пакета правил, код приложений не трогается.

## След задачи

- `projects/agent-kit/assets/rules/doc-style.md`
- `projects/agent-kit/assets/patterns/spec-driven-rule.md`
- разложенные копии после `agent-kit:sync`

## Этапы

### 1. Статьи

- 1.1 Статья о пределе длины в doc-style называет предел в символах
- 1.2 Ловушка о длине строки привязки в spec-driven-rule

Готово, когда `node tools/check-file-size.mjs` не находит новых превышений.

### 2. Сдача

- 2.1 Сборка пакета, раскладка, проверки перед push
- 2.2 Папка задачи разобрана, PR в ветку RT-2660
