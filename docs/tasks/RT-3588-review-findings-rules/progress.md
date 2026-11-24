# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 2 of 2 — Правила дерева и файл находок
- **Done:** оба этапа: 27 шагов измерены
- **Next step:** круги ревью
- **Uncommitted:** нет
- **PR:** not open yet

## Steps

- [x] 1.1 Статья слияния называет форму вызова
- [x] 1.2 Статья слияния признаёт разрешение, названное заранее
- [x] 1.3 Правило конца хода называет писателя разбора и отправку
- [x] 1.4 Судья хода требует отправку разбора в том же ходе
- [x] 1.5 Описание навыка пакета зовёт его при записи разбора
- [x] 1.6 Ловушка: файл зависимости называется по пакету
- [x] 1.7 План называет файл и строку установленной зависимости
- [x] 1.8 Эпик посреди задачи заводится второй рабочей копией
- [x] 1.9 Задача, перенесённая в другой эпик, привязывается к нему
- [x] 1.10 Статьи слияния двух других хостингов признают разрешение, названное заранее
- [x] 1.11 Холодная часть трёх хостингов не спорит со статьёй
- [x] 1.12 Старая статья «только по слову об этом PR» ушла из шести текстов
- [x] 1.13 Отклонённая запросом отправка разбора называется владельцу
- [x] 1.14 Записи хода: разбор не отправлен держится, отправленный отпускается
- [x] 1.15 Второй копии эпика — своя установка, а не ссылка
- [x] 2.1 Правило согласий кита приводит слово владельца о макетах
- [x] 2.2 Старая статья о невидимости как решении владельца ушла
- [x] 2.3 Ветка без своих правок кита не пишет строку согласий
- [x] 2.4 Строка «Без вида» цитирует одобрение плана
- [x] 2.5 Компаньон конца хода называет форму отправки
- [x] 2.6 Тяжёлый прогон идёт один
- [x] 2.7 Встроенный браузер — запасной для живой проверки
- [x] 2.8 Компаньон проверки в браузере называет запасной браузер
- [x] 2.9 Вызов PR проверяется на запрос разрешения до ухода владельца
- [x] 2.10 Файл находок называет, где исправлены пункты
- [x] 2.11 Вопрос о невидимости правки ушёл из правила, образца и компаньона
- [x] 2.12 План эпика называет слитую RT-3587

## Decisions along the way

- Проверка 2.11 нашла слова «owner is asked whether» в живой статье об ответе владельца. Заголовок
  статьи стал «The owner is asked for the approval…», смысл тот же.
- Вызов `node projects/agent-kit/tests/judge-replay.mjs` не дал ни одного вердикта: вход в `claude`
  на машине истёк. Две новые записи рассудили два отдельных исполнителя по тому же тексту
  (`promptOf`), без ожиданий: запись без отправки — block, с отправкой — allow. Обе сошлись.

## Live check

- Раскладка: `agent-kit:check` — сошлось с пакетом v0.39.0.
- Записи ходов: 116 ok, 0 провалов; проверка согласий кита: 50 ok, 0 failures.
- `check-specs`, `check-doc-paths`, `check-descriptions`, `check-file-size` — без находок.

## Sessions

### 24.11.2026

- Задача эпика RT-3586 заведена по слову владельца «Отправь разборы и исправь все что нашел».
  Стратег и критик цели прочли первый план: проверки зеленели без удаления спорящих статей, судья
  хода не требовал отправки разбора, компаньон браузера оставался против запасного. План переписан
  до одобрения.
- Задача перешла в эпик RT-3597 по слову владельца, план исправлен до работы: номер эпика, проверки
  с нулём, статьи слияния двух других хостингов — списание второго круга RT-3587.
- Стратег и критик цели прочли исправленный план: четыре проверки зеленели рядом со старой статьёй
  или без трёх отметок, судья правился без записи хода, кусок разбора о неотправке выпал. План
  исправлен до одобрения.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools
**Branch:** RT-3588-review-findings-rules

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 1 of 2 — Статьи пакета
- **Next step:** статьи пакета
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3588-review-findings-rules/progress.md`; the plan lies next to it.

### Uncommitted

```
 M .claude/hooks/turn-judge.md
 M .claude/skills/agent-kit/SKILL.md
 M .claude/skills/doc-style/pitfalls.md
 M .claude/skills/epic-flow-declare/SKILL.md
 M .claude/skills/git-workflow-hosting/SKILL.md
 M .claude/skills/git-workflow/pitfalls-2.md
 M .claude/skills/kit-approval-record/SKILL.md
 M .claude/skills/kit-approval/SKILL.md
 M .claude/skills/task-flow-plan/SKILL.md
 M .claude/skills/task-flow/pitfalls-2.md
 M .claude/skills/turn-conduct/SKILL.md
 M .claude/skills/turn-conduct/pitfalls.md
 M docs/plans/night-rules.md
 M docs/specs/agent-kit/turn-guards/flow-script/replay/implementation.md
 M docs/specs/agent-kit/turn-guards/flow-script/replay/scenarios.md
 M docs/specs/agent-kit/turn-guards/flow-script/replay/spec.md
 M docs/specs/agent-kit/turn-guards/spec.md
 M docs/tasks/RT-3588-review-findings-rules/progress.md
 M projects/agent-kit/assets/hooks/turn-judge.md
 M projects/agent-kit/assets/patterns/epic-flow-declare.md
```

### Commits over the main branch

```
4c7d7d4b7 docs(rt:agent-kit): разбор и план RT-3588 — статьи правил по находкам ревью (RT-3588)
d15957a47 [RT-3587] Ночью делается то, что владелец назвал, уходя, и защиты не открывают ему меню и окно согласий кита (#3606)
eefb8f7c4 docs(rt:agent-kit): папка задачи RT-3587 разобрана в архивную запись (RT-3587)
b3bf185ff chore(rt:agent-kit): ветка эпика с главной влита в ветку задачи (RT-3587)
0c8057592 chore(rt:agent-kit): главная влита в ветку эпика RT-3597 (RT-3597)
22137b34b fix(rt:agent-kit): правки после второго круга ревью (RT-3587)
60f710aaa fix(rt:agent-kit): правки после первого круга ревью (RT-3587)
d63f8c97f feat(rt:agent-kit): до границы ночи защиты дают умолчание вместо окна (RT-3587)
51b574726 docs(rt:agent-kit): задача уходит в новый эпик по слову владельца (RT-3587)
3ffef2156 docs(rt:agent-kit): ночью делается то, что владелец назвал, уходя (RT-3587)
2c84f96da docs(rt:agent-kit): разбор и план RT-3587 — правила ночной работы (RT-3587)
60fbe3b4e docs(rt:agent-kit): план эпика RT-3597 и назначение копии — ночная работа и находки 23.11 (RT-3597)
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
