# План

**Task:** RT-3012 · **Branch:** RT-3012-copilot-review-runner
**Behaviour:** unchanged — меняется машина, на которой идёт ревью Copilot, код приложений и пакетов не трогается. Слово владельца: «напиши локальный раннер для github copilot».

## След задачи

| Что     | Где                                                                   |
| ------- | --------------------------------------------------------------------- |
| Спеки   | нет: файлы раннера не входят ни в пакет, ни в приложение              |
| Законы  | `docs/constitution/delivery.md`                                       |
| Правила | `.claude/skills/git-workflow/`                                        |
| Код     | `deploy/copilot-runner/`, `.github/workflows/copilot-code-review.yml` |

## Что считается сделанным

- Раннер с меткой `rt-copilot-review` на связи и одноразовый: после задания он снят с учёта.
- Задание `copilot-setup-steps` из PR прошло на этом раннере.
- Прокси не пускает хост вне списка и пускает хосты GitHub и Copilot.

## Этапы

### 1. Файлы раннера

- **Steps:**
    1. Образ раннера, образ прокси, список хостов и настройки прокси в `deploy/copilot-runner/`
    2. Цикл регистраций, сценарий установки и служба launchd в `deploy/copilot-runner/`
    3. Файл `.github/workflows/copilot-code-review.yml` с заданием `copilot-setup-steps`
    4. Описание раннера в `deploy/copilot-runner/README.md`
- **Readiness sign:** оба сценария проходят разбор оболочкой, оба образа собираются.
- **Verified by:** `bash -n deploy/copilot-runner/runner-loop.sh deploy/copilot-runner/setup.sh` — пустой вывод и код 0.

### 2. Раннер на машине

- **Steps:**
    1. Сценарий установки собирает образы, поднимает сеть, прокси и службу
    2. Раннер регистрируется и стоит на связи
    3. Прокси проверен хостом из списка и хостом вне списка
- **Readiness sign:** раннер `rt-copilot-review-…` в списке раннеров репозитория со статусом `online`.
- **Verified by:** `/opt/homebrew/bin/gh api repos/Eyhenij/rt-tools/actions/runners --jq '.runners[]|[.name,.status]|@tsv'` — строка `rt-copilot-review-<число>	online`.

### 3. Задание на раннере

- **Steps:**
    1. Ветка отправлена, PR открыт, запуск `copilot-code-review.yml` по PR прошёл на своём раннере
    2. После задания раннер снят с учёта, контейнер удалён, следующий раннер на связи
- **Readiness sign:** задание `copilot-setup-steps` зелёное, в нём имя раннера `rt-copilot-review-…`.
- **Verified by:** `/opt/homebrew/bin/gh run list --repo Eyhenij/rt-tools --workflow copilot-code-review.yml --limit 1 --json conclusion,databaseId` — `conclusion: success`.

## Чего эта работа не делает

- Раннер проверок `~/actions-runner`, `ci.yml`, `deploy.yml` не трогаются.
- Биллинг и настройки учётной записи GitHub.
- ARC в кластере Kubernetes: страница GitHub называет его единственным поддерживаемым путём,
  но кластера на машине нет, и владелец просил раннер по образцу.
