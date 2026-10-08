# Grill

Записи приёмника, которые закрывает эта задача:

- предложение `rules/doc-style.md`, дерево b101ab1c9908, ключ `4d3397a93054a694262630d9cc6da9eb73840a47034a875811cf7ff8f9e43a78`

## The owner request

> бери замечания и предложения из приёмника - заводи задачи, разбивай их по эписка и бери в работу по очереди

## What the tree already has

- `checks/check-prose-style.mjs` несёт часть левого столбца словаря в `GLOSSARY_BANS` и запреты
  дерева из настройки; он зовётся при правке `.md` и при отправке груза.
- `checks/check-glossary.mjs` читает раздел словаря «Not written here» целиком и стоит в наборе
  перед push (`defaults/project.sh`), а при правке не зовётся.
- Тело коммита не читает ни одна из двух проверок.

## What the rules already say

`rules/doc-style.md`, раздел «What of the law is not here», говорит, где зовётся проверка слога, и
молчит о проверке словаря и о теле коммита.

## Questions and answers

Вопросов владельцу нет: предложение описывает то, что уже делают проверки, и не меняет их.

## Decisions

- **Абзац в «What of the law is not here»** — это описание того, что проверки не видят, а не
  новое требование. Отвергнуто: статья в «How the law applies here».

## What is left unclear

- Нет.
