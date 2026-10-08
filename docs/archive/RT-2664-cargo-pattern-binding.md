# Grill

Записи приёмника, которые закрывает эта задача:

- предложение `patterns/spec-driven-rule.md`, дерево b101ab1c9908, ключ `651a7f140a847fa1230003edee37d35d51c1e7ace2d4968cf416f189c7b8e289`

## The owner request

> бери замечания и предложения из приёмника - заводи задачи, разбивай их по эписка и бери в работу по очереди

## What the tree already has

- `patterns/spec-driven-rule.md`, абзац о разделах образца: «A pattern has no binding: the check
  does not audit it». Слова «does not audit it» читаются как «ни один раздел не обязателен».
- `projects/agent-kit/tests/rules-review.test.sh`, сценарий SC-AK-211: набор пакета отказывает
  образцу без раздела о промахах (`missing_pitfalls`) и без разделов своего рода.

## What the rules already say

Описание `docs/specs/agent-kit/patterns/spec.md` говорит о наборе разделов образца; статья
образца расходится с ним в словах, а не в сути.

## Questions and answers

Вопросов владельцу нет: правка уточняет, что именно не проверяется.

## Decisions

- **Статья разводит привязку и набор разделов** — привязки нет, а разделы проверяются набором
  пакета. Отвергнуто: убрать фразу о проверке совсем.

## What is left unclear

- Нет.
