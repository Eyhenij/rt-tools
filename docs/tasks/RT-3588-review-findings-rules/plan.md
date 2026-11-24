# Plan

**Task:** RT-3588 · **Branch:** RT-3588-review-findings-rules
**Behaviour:** unchanged — слово владельца 24.11.2026: «исправь все что нашел»; правка статей правил и судьи хода, приложения не меняются

## Points

- **A:** находки ревью задач RT-3484 и RT-3485 лежат в файле находок и ни в одном правиле; правило
  согласий кита спорит со словом владельца о макетах; судья хода не требует отправки разбора.
- **This task reaches:** каждая из тринадцати находок этих двух ревью стоит статьёй в правиле,
  образце, ловушке или судье, и файл находок говорит, где.
- **Sign:** `pnpm run agent-kit:check` сходится; в разделах RT-3484 и RT-3485 файла находок отмечены
  все тринадцать пунктов.
- **Milestone G of the epic:** RT-3597 — каждая находка названа там, где исправлена.
- **Metric:** нет: исправление того, что ночью сломалось.

## Task footprint

| What  | Where                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------ |
| Rules | `projects/agent-kit/assets/rules/git-workflow-hosting.github.md`                                       |
| Rules | `projects/agent-kit/assets/rules/git-workflow-hosting.azure.md`                                        |
| Rules | `projects/agent-kit/assets/rules/git-workflow-hosting.gitlab.md`                                       |
| Rules | `projects/agent-kit/assets/pitfalls/git-workflow.2.github.md`                                          |
| Rules | `projects/agent-kit/assets/pitfalls/git-workflow.2.azure.md`                                           |
| Rules | `projects/agent-kit/assets/pitfalls/git-workflow.2.gitlab.md`                                          |
| Rules | `.claude/skills/git-workflow-hosting/implementation.md`                                                |
| Rules | `.claude/skills/kit-approval/implementation.md`, `.claude/skills/task-flow-plan/implementation.md`     |
| Rules | `projects/agent-kit/assets/rules/turn-conduct.md`, `.claude/skills/turn-conduct/implementation.md`     |
| Rules | `projects/agent-kit/assets/hooks/turn-judge.md`, `projects/agent-kit/assets/skills/agent-kit.md`       |
| Rules | `projects/agent-kit/assets/pitfalls/doc-style.md`, `projects/agent-kit/assets/rules/task-flow-plan.md` |
| Rules | `projects/agent-kit/assets/patterns/epic-flow-declare.md`                                              |
| Rules | `.claude/skills/kit-approval/SKILL.md`, `.claude/skills/kit-approval-record/SKILL.md`                  |
| Rules | `.claude/skills/task-delivery-loop-run/SKILL.md`                                                       |
| Rules | `.claude/skills/browser-verification/implementation.md`                                                |
| Specs | `docs/specs/agent-kit/turn-guards/`                                                                    |
| Tests | `projects/agent-kit/tests/fixtures/turn-replay/`, `projects/agent-kit/tests/turn-replay.expected.json` |
| Plans | `docs/plans/angular-doctor-review-findings.md`, `docs/plans/night-rules.md`                            |

## What counts as done

- Статьи пакета стоят в источнике и разложены в дерево; судья хода требует отправку разбора.
- Правила дерева о согласиях кита судят невидимость словом владельца, образец цикла задачи и
  компаньон проверки в браузере несут свои статьи.
- Файл находок называет у тринадцати пунктов RT-3484 и RT-3485, где они исправлены.

## Stages

### 1. Статьи пакета

- **Steps:**
    1. Статья слияния называет форму вызова
       Check: `grep -c -- "--merge" projects/agent-kit/assets/rules/git-workflow-hosting.github.md` → >= 1
    2. Статья слияния признаёт разрешение, названное заранее
       Check: `grep -c "named allowance" projects/agent-kit/assets/rules/git-workflow-hosting.github.md` → >= 1
    3. Правило конца хода называет писателя разбора и отправку
       Check: `grep -c "cargo-writer" projects/agent-kit/assets/rules/turn-conduct.md` → >= 1
    4. Судья хода требует отправку разбора в том же ходе
       Check: `grep -c "incident record and the turn did not run" projects/agent-kit/assets/hooks/turn-judge.md` → >= 1
    5. Описание навыка пакета зовёт его при записи разбора
       Check: `grep -c "^description:.*incident analysis" projects/agent-kit/assets/skills/agent-kit.md` → >= 1
    6. Ловушка: файл зависимости называется по пакету
       Check: `grep -c "named by its package" projects/agent-kit/assets/pitfalls/doc-style.md` → >= 1
    7. План называет файл и строку установленной зависимости
       Check: `grep -c "installed code" projects/agent-kit/assets/rules/task-flow-plan.md` → >= 1
    8. Эпик посреди задачи заводится второй рабочей копией
       Check: `grep -c "second working tree" projects/agent-kit/assets/patterns/epic-flow-declare.md` → >= 1
    9. Задача, перенесённая в другой эпик, привязывается к нему
       Check: `grep -c "moved to another epic" projects/agent-kit/assets/patterns/epic-flow-declare.md` → >= 1
    10. Статьи слияния двух других хостингов признают разрешение, названное заранее
        Check: `grep -l "named allowance" projects/agent-kit/assets/rules/git-workflow-hosting.azure.md projects/agent-kit/assets/rules/git-workflow-hosting.gitlab.md | wc -l` → >= 2
    11. Холодная часть трёх хостингов не спорит со статьёй
        Check: `grep -l "named allowance" projects/agent-kit/assets/pitfalls/git-workflow.2.github.md projects/agent-kit/assets/pitfalls/git-workflow.2.azure.md projects/agent-kit/assets/pitfalls/git-workflow.2.gitlab.md | wc -l` → >= 3
    12. Старая статья «только по слову об этом PR» ушла из шести текстов
        Check: `grep -rlE "word about this very|said so about this (PR|MR)" projects/agent-kit/assets/rules projects/agent-kit/assets/pitfalls | wc -l` → = 0
    13. Отклонённая запросом отправка разбора называется владельцу
        Check: `cat projects/agent-kit/assets/rules/turn-conduct.md projects/agent-kit/assets/pitfalls/turn-conduct.md | grep -c "refused the send"` → >= 1
    14. Записи хода: разбор не отправлен держится, отправленный отпускается
        Check: `ls projects/agent-kit/tests/fixtures/turn-replay | grep -cE "incident-(not-)?sent"` → >= 2
    15. Второй копии эпика — своя установка, а не ссылка
        Check: `grep -c "own install" projects/agent-kit/assets/patterns/epic-flow-declare.md` → >= 1
- **Readiness sign:** пакет собран и разложен, разложенное сходится.
- **Verified by:** `pnpm run agent-kit:sync`, затем `pnpm run agent-kit:check` — без расхождений;
  `node projects/agent-kit/tests/judge-replay.mjs` — обе новые записи сошлись с ожиданием.

### 2. Правила дерева и файл находок

- **Steps:**
    1. Правило согласий кита приводит слово владельца о макетах
       Check: `grep -c "ты сам должен понимать" .claude/skills/kit-approval/SKILL.md` → >= 1
    2. Старая статья о невидимости как решении владельца ушла
       Check: `grep -c "owner's call, not the executor's" .claude/skills/kit-approval/SKILL.md || true` → = 0
    3. Ветка без своих правок кита не пишет строку согласий
       Check: `grep -c "no kit edits of its own" .claude/skills/kit-approval/SKILL.md` → >= 1
    4. Строка «Без вида» цитирует одобрение плана
       Check: `grep -c "approval of the plan" .claude/skills/kit-approval-record/SKILL.md` → >= 1
    5. Компаньон конца хода называет форму отправки
       Check: `grep -c "dist/agent-kit/bin/agent-kit.js propose" .claude/skills/turn-conduct/implementation.md` → >= 1
    6. Тяжёлый прогон идёт один
       Check: `grep -c "goes alone" .claude/skills/task-delivery-loop-run/SKILL.md` → >= 1
    7. Встроенный браузер — запасной для живой проверки
       Check: `grep -c "built-in browser" .claude/skills/task-delivery-loop-run/SKILL.md` → >= 1
    8. Компаньон проверки в браузере называет запасной браузер
       Check: `grep -c "there is no other way in" .claude/skills/browser-verification/implementation.md || true` → = 0
    9. Вызов PR проверяется на запрос разрешения до ухода владельца
       Check: `grep -c "permission prompt" .claude/skills/task-delivery-loop-run/SKILL.md` → >= 1
    10. Файл находок называет, где исправлены пункты
        Check: `sed -n '/^## RT-3484/,$p' docs/plans/angular-doctor-review-findings.md | grep -E "^[0-9]+\. \*\*" | grep -cE "Исправлено|Списано"` → = 13
    11. Вопрос о невидимости правки ушёл из правила, образца и компаньона
        Check: `cat .claude/skills/kit-approval/SKILL.md .claude/skills/kit-approval-record/SKILL.md .claude/skills/kit-approval/implementation.md | grep -cE "owner is asked whether|no-look question goes|the owner called invisible|by the owner.s word that nothing visible|Вид не меняется" || true` → = 0
    12. План эпика называет слитую RT-3587
        Check: `grep -cE "RT-3587.*влито" docs/plans/night-rules.md` → >= 1
- **Readiness sign:** проверка согласий и пути документов зелёные.
- **Verified by:** `bash tools/tests/check-kit-approval.test.sh` без FAIL; `node tools/check-doc-paths.mjs` — 0 находок.

## What this work does not do

- Находки ревью задач RT-3478, RT-3508, RT-3480, RT-3481, RT-3514, RT-3518, RT-3483, RT-3525,
  RT-3526 и дневных разборов 23.11 — задача RT-3589 того же эпика.
- Форму вызова PR машинным аккаунтом (RT-3485.6): её узнаёт защита доставки по подстановке токена;
  пункт отмечается исправленным в части проверки до ухода владельца и списанным в части формы.
- Находки RT-3477 и RT-3492, разбор 22.11 и ревью правил RT-3587 — отдельная задача эпика.
- Правила ночной работы и защиты ночью — RT-3587; проверки дерева и временные каталоги — RT-3585.
