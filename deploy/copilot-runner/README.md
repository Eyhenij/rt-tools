# Раннер ревью Copilot

Автоматическое ревью Copilot в PR идёт на машине владельца, а не на облачной машине GitHub.
Задание `copilot-setup-steps` в `.github/workflows/copilot-code-review.yml` просит метку
`rt-copilot-review`, и её несёт только этот раннер.

## Как устроено

- **Одноразовый контейнер Ubuntu x64.** Ревью Copilot идёт только на Ubuntu x64, а машина —
  Apple Silicon, поэтому образ `runner.Dockerfile` собирается под платформу linux/amd64 и идёт под
  эмуляцией. На каждое задание `runner-loop.sh` просит у GitHub новую регистрацию, раннер берёт
  одно задание и снимается с учёта, контейнер удаляется.
- **Закрытая сеть.** Контейнер стоит во внутренней сети `rt-copilot-internal` без выхода наружу.
  Единственный выход — прокси `rt-copilot-proxy` (`proxy.Dockerfile`, `tinyproxy.conf`). Он
  пускает только хосты из `allowlist`: GitHub, Actions и Copilot.
- **Служба launchd** `com.rt-tools.copilot-runner` крутит цикл регистраций. Её копия цикла
  лежит в `~/.local/share/rt-copilot-runner/`, лог — `~/Library/Logs/rt-copilot-runner.log`.
- **Без доступа к машине.** В контейнере нет сокета Docker, ключей и домашней папки владельца,
  все возможности ядра сняты, память, процессор и число процессов ограничены.

На машине стоят раннеры и других репозиториев. Все имена этого раннера — сборщик, сеть,
контейнеры, образы, служба, каталоги — с приставкой `rt-copilot-`. Раннер проверок
`~/actions-runner` не трогается.

## Установка и обновление

```bash
bash deploy/copilot-runner/setup.sh
```

Сценарий зовётся один раз и после правки любого файла этой папки: собирает оба образа своим
сборщиком `rt-copilot-builder` с пределом кэша 3 ГБ, поднимает сеть и прокси и ставит службу
заново.

Регистрацию раннера выдаёт только администратор репозитория. Цикл берёт её от входа владельца в
`gh`. Если служба не получает доступа к связке ключей, в логе появляется строка «регистрация не
выдана». Тогда владелец кладёт ключ с правом «Administration: write» на этот репозиторий в
`~/.config/rt-copilot-runner-token`.

## Проверка

```bash
/opt/homebrew/bin/gh api repos/Eyhenij/rt-tools/actions/runners --jq '.runners[]|[.name,.status]|@tsv'
```

Раннер `rt-copilot-review-<число>` стоит со статусом `online`. После задания его имя сменяется:
прежний снят с учёта, новый ждёт следующего задания.

Хост, которого нет в списке, прокси не пропускает и пишет в свой журнал:

```bash
docker logs rt-copilot-proxy 2>&1 | grep -i -E 'denied|filtered'
```

Задание, упавшее на загрузке или отправке журнала, ищется там же. Хост дописывается в `allowlist`
строкой регулярного выражения, затем снова зовётся `setup.sh`.

## Остановка

```bash
launchctl bootout "gui/$(id -u)/com.rt-tools.copilot-runner"
docker rm -f rt-copilot-proxy
```

Без раннера задание `copilot-setup-steps` ждёт машину с меткой, и ревью Copilot в PR не
приходит. Вернуть облачную машину — удалить `.github/workflows/copilot-code-review.yml`.
