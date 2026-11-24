---
name: doc-style-human
kind: pattern
rule: doc-style
description: Pattern of rule doc-style. Load when writing a task in the work queue, a PR description and a chat reply to the owner. Samples and the words to replace; a status reply — rule status-report.
---
<!-- rt-kit v0.39.1 · patterns/doc-style-human.md · dd40b0bc8c0f · правится надстройкой, не здесь -->

# A task, a PR description and a reply to the owner

Pattern of rule `doc-style`, section "Texts for a person": the reader knows the product, not
the rules. Cold part: `pitfalls.md`.

## When to use

- A task, a PR description, a chat reply; a status reply — rule `status-report`.

## Words that get replaced

| Layer word | What to say to the owner |
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

> ✓ Раздел «Отчёты» не открывается у пользователя, и из-за этого не идёт выкатка.
> Красная проверка — сквозной набор, шаг «отчёты».

## PR description

First what changes for the person, then what confirms it; file names last.

> ✗ Ярус личности вызова получил второй признак

## Chat reply

The first sentence answers the question; a claim about the tree comes with its command and output.

> ✗ Работа отдана, красное въехало в главную

## The language of the text

The texts are in the language of the owner's chat and cards, English included. Addressee and
register are checked before the first line; the usual miss is a task in the words and language of
a rule just read, or with a rule article copied in.

> ✓ [RT-1849] Проверки слога, словаря и описаний считают только кириллицу

## A guide for an executor in another tree

Each step is done from the text alone before hand-over. Addresses, access and name-record state are
written in; a verified solution goes in as a recipe, "decide later" only where no way was
verified. Not naming another tree bans its name, not the infrastructure its reader needs.

> ✗ Адрес и доступ решим позже.

## Pitfalls

- **A promise about the behaviour of an outside service names what backs it.** A quote of its docs
  or a run; unchecked before the merge — said so.
- **What a text says about another record is read from that record in the same turn.** A release
  note: task titles from the tracker that minute, no commit without a task number.
- **Shorter does not mean clearer.** Layer words make a text shorter and useless to whoever judges
  urgency.
- **"Not X but Y" looks like an explanation and explains nothing.**
- **The word "done" without a number reads as a verified fact.** The number: run id,
  scenarios out of how many, time of the check.
