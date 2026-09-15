---
name: doc-style-human
kind: pattern
rule: doc-style
description: Pattern of rule doc-style. Load when writing a task in the work queue, a PR description and a chat reply to the owner. Samples of "so" and "not so" for each of the three texts and the words that get replaced in them. The shape of a status reply is named by rule status-report.
---
<!-- rt-kit v0.28.0 · patterns/doc-style-human.md · 2f5ce74249bc · правится надстройкой, не здесь -->

# A task, a PR description and a reply to the owner

Pattern of the rule `doc-style`. Three texts are read by a person from outside: they remember
the product and have not read a single rule of the layer. Here — how they are written; what must
be true is said by the "Texts for a person" section of the rule itself.

## When to use

- A task is created in the work queue.
- A PR description is written.
- A chat reply to the owner is written — except a reply about the work state: its shape is
  named by the rule `status-report`.

## Words that get replaced

The left column holds the words of the rules layer. They are right inside the layer and empty to
whoever does not look into it.

| Layer word        | What to say to the owner                                   |
| ----------------- | ---------------------------------------------------------- |
| PR                | the change that waits for your word                        |
| run, suite        | checks; "the checks passed", "the checks are red"          |
| guard, gate       | what exactly did not let it through, and why               |
| agreement         | what was agreed about this screen                          |
| change size       | what changes on the screen and where                       |
| resource layout   | updating the rules on the machine                          |

## Task

The title names the subject, the body — what the person cannot do. The red check stands in the
body as the last line: it says where to look and does not say why to fix it.

```text
✗ Сквозная спека берёт пункт заглушкой, а прогон на вершине не доходит до выкатки
✓ Раздел «Отчёты» не открывается у пользователя, и из-за этого не идёт выкатка.
  Красная проверка — сквозной набор, шаг «отчёты».
```

## PR description

The first paragraph — what changes for the person. Then — what confirms it. File names belong at
the end, not in place of the first paragraph.

```text
✗ Ярус личности вызова получил второй признак, набор гейта зелёный
✓ Заявки от машинной записи больше не открываются от имени владельца: теперь перед открытием
  спрашивается, кто приходит по токену. Проверки прошли, 26 сценариев.
```

## Chat reply

Answers the question asked in the first sentence. A statement about the tree goes together with
the command and its output — the rule `status-report` requires it, and in chat it holds the same.

```text
✗ Работа отдана, красное въехало в главную, откат прикрыт гардом
✓ Правку я отправил, она ждёт вашего слова. В главной ветке сейчас красный шаг «сборка витрины»
  — упал не на этой правке, вывод: 76 из 76 сценариев не поднялись, витрина лежит.
```

## The language of the text

The rules layer is written in English, and the three texts for a person in the owner's language.
A session that has just read a rule writes the task in the rule's words and language; the
addressee is checked before the first line — together with the register.

```text
✗ [RT-1849] Prose, glossary and description checks only count Cyrillic
✓ [RT-1849] Проверки слога, словаря и описаний считают только кириллицу

✗ - **A path named in a document exists.** (a rule article written into the task body)
✓ Пути, названные в задаче, проверяет команда `npm run check:docs`; она красная на двух.
```

The owner's language is the one they write in chat and on cards. An owner writing in English
gets an English task, and that is no miss: the miss is a text in a language the addressee did
not choose.

## Pitfalls

- **Shorter does not mean clearer.** A text in the layer's words comes out a third shorter and
  is useless to whoever decides whether the work is urgent.
- **"Not X but Y" looks like an explanation and explains nothing.** The owner learns what was
  not there and does not learn what is.
- **The word "done" without a number reads as a verified fact.** The number is the run id, how
  many scenarios out of how many, the time of the check.
