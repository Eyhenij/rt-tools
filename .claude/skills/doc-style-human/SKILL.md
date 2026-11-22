---
name: doc-style-human
kind: pattern
rule: doc-style
description: Pattern of rule doc-style. Load when writing a task in the work queue, a PR description and a chat reply to the owner. Samples of "so" and "not so" for each of the three texts and the words that get replaced in them. The shape of a status reply is named by rule status-report.
---
<!-- rt-kit v0.38.0 · patterns/doc-style-human.md · e23837e6ebe0 · правится надстройкой, не здесь -->

# A task, a PR description and a reply to the owner

Pattern of the rule `doc-style`, its section "Texts for a person". The reader knows the product,
not the rules. Cold part: `pitfalls.md`, every sample whole.

## When to use

- A task, a PR description, a chat reply to the owner; a reply about the work state — the rule
  `status-report`.

## Words that get replaced

| Layer word | To the owner |
| --- | --- |
| PR | the change that waits for your word |
| run, suite | checks; "the checks passed", "the checks are red" |
| guard, gate | what exactly did not let it through, and why |
| agreement | what was agreed about this screen |
| change size | what changes on the screen and where |
| resource layout | updating the rules on the machine |

## Task

The title names the subject, the body — what the person cannot do. The red check is the last line:
where to look, not why.

```text
✓ Раздел «Отчёты» не открывается у пользователя, и из-за этого не идёт выкатка.
  Красная проверка — сквозной набор, шаг «отчёты».
```

## PR description

First what changes for the person, then what confirms it; file names go at the end.

```text
✗ Ярус личности вызова получил второй признак, набор гейта зелёный
```

## Chat reply

The first sentence answers the question. A statement about the tree comes with its command and
output.

```text
✗ Работа отдана, красное въехало в главную, откат прикрыт гардом
```

## The language of the text

The rules layer is in English; the three texts are in the language of the owner's chat and cards,
English included. Addressee and register are checked before the first line.

```text
✓ [RT-1849] Проверки слога, словаря и описаний считают только кириллицу
```

## A guide for an executor in another tree

Each step is done from the text alone before handing over. Addresses, access and name records are
written in; a verified solution goes in as a recipe, "decide later" only where none was. The ban on
naming another tree covers its name, not the infrastructure its reader needs.

```text
✗ Шаг 1. Подготовьте узел. Адрес и доступ решим позже.
```

## Pitfalls

- **A promise about the behaviour of an outside service names what backs it.** A quote of its docs
  or a run; unchecked before the merge — said so.
- **What a text says about another record is read from that record in the same turn.**
- **Shorter does not mean clearer.**
- **"Not X but Y" looks like an explanation and explains nothing.**
- **The word "done" without a number reads as a verified fact.**
