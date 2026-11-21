# Plan

**Task:** RT-3475 · **Branch:** RT-3475-deploy-workflow-name
**Behaviour:** unchanged — меняется только имя экшена выкатки в списке Actions и строки о нём в описании прода и в надстройке правила выкатки; код приложений не меняется. Слово владельца: «ты можешь переименовать этот экшен как-то иначе? сейчас непонятно что это за deploy».

## Points

- **A:** экшен выкатки сервера называется «Deploy». 21.11 владелец, запуская его перед выпуском
  пакета, не понял, выкатывает ли он сервер или выпускает agent-kit.
- **This task reaches:** в списке Actions экшен называется «Deploy message-bus: приёмник и
  админка», и по имени видно, что он выкатывает сервер приёмника с админкой.
- **Sign:** разбор YAML экшена отдаёт имя «Deploy message-bus: приёмник и админка»; после слияния
  `gh api repos/Eyhenij/rt-tools/actions/workflows/deploy.yml --jq .name` отдаёт его же — это имя
  владелец видит в списке Actions.
- **Milestone G of the epic:** нет эпика — работа вне эпика по слову владельца.
- **Metric:** нет: имя экшена не говорило, что он делает.

## Task footprint

| What  | Where                                                    |
| ----- | -------------------------------------------------------- |
| Code  | `.github/workflows/deploy.yml`                           |
| Docs  | `docs/PROD.md`                                           |
| Rules | `.claude/rt-kit/overrides/pitfalls/deploy-flow.github.md` |
| Rules | `.claude/skills/deploy-flow/` — читается                 |

## What counts as done

- Экшен выкатки называется «Deploy message-bus: приёмник и админка», и файл экшена разбирается как
  YAML: в имени есть «: », поэтому значение стоит в кавычках.
- Описание прода называет выкатку приёмника тем же именем в обоих местах.
- Надстройка правила выкатки называет экшен тем же именем.
- Проверка доски находит последнюю выкатку, как до правки.

## Stages

### 1. The name

- **Steps:**
    1. The workflow carries the new name and parses
       Check: `ruby -ryaml -e 'puts YAML.load_file(".github/workflows/deploy.yml")["name"]'` → `Deploy message-bus: приёмник и админка`
    2. The production description names the rollout by the new name in both places
       Check: `grep -c 'Deploy message-bus: приёмник и админка' docs/PROD.md` → = 2
    3. The rollout rule names the workflow by the new name
       Check: `grep -c 'Deploy message-bus: приёмник и админка' .claude/rt-kit/overrides/pitfalls/deploy-flow.github.md` → = 1
- **Readiness sign:** the three checks hold, and the board check names the last rollout.
- **Verified by:** `npm run -s check:board` — a line about the last rollout, as before the edit;
  `pnpm run agent-kit:check` — exit 0 after the override is laid out.

## What this work does not do

- It does not rename «Deploy Auth»: the owner named one workflow.
- It does not rename the workflow file: the board checks find the rollout by it.
