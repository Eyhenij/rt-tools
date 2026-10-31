#!/usr/bin/env bash
#
# Цикл одноразового раннера ревью Copilot: регистрация на одно задание, контейнер, удаление.
#
# Каждый оборот просит у GitHub одноразовую регистрацию и поднимает с ней контейнер раннера.
# Раннер берёт одно задание и снимается с учёта сам, контейнер удаляется. Следующее задание
# получает чистый контейнер, и ревью не оставляет следов для следующего.
#
# Регистрацию выдаёт только администратор репозитория. Машинная учётная запись им не является,
# поэтому вызов идёт от входа владельца в `gh`, ключ которого лежит в связке ключей. Если служба
# не получит доступа к связке, ключ с правом «Administration: write» на этот репозиторий кладётся
# в файл `TOKEN_FILE`, и цикл берёт его оттуда.
#
# Запускается службой launchd (`launchd.plist`), образы и прокси готовит `setup.sh`.
set -uo pipefail

REPO=Eyhenij/rt-tools
LABEL=rt-copilot-review
NETWORK=rt-copilot-internal
PROXY=rt-copilot-proxy
IMAGE=rt-copilot-runner:latest
PROXY_URL="http://${PROXY}:8888"
TOKEN_FILE="${HOME}/.config/rt-copilot-runner-token"

# Служба приходит без профиля оболочки: пути и адрес демона задаются здесь
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
export DOCKER_HOST="unix://${HOME}/.docker/run/docker.sock"

# Свой каталог настроек Docker с пустой записью реестра. Общие настройки машины зовут помощник
# связки ключей, и без сеанса пользователя он отвечает отказом. Образы здесь только локальные
export DOCKER_CONFIG="${HOME}/.docker-rt-copilot"
mkdir -p "${DOCKER_CONFIG}"
[ -f "${DOCKER_CONFIG}/config.json" ] || echo '{"auths":{}}' > "${DOCKER_CONFIG}/config.json"

if [ -s "${TOKEN_FILE}" ]; then
    GH_TOKEN="$(cat "${TOKEN_FILE}")"
    export GH_TOKEN
fi

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') runner-loop: $*"; }

# После перезагрузки машины Docker поднимается позже службы
until docker info >/dev/null 2>&1; do
    sleep 10
done

while true; do
    docker start "${PROXY}" >/dev/null 2>&1 || true

    name="${LABEL}-$(date +%s)"
    jit="$(gh api -X POST "repos/${REPO}/actions/runners/generate-jitconfig" \
        -f name="${name}" -F runner_group_id=1 -f "labels[]=${LABEL}" -f work_folder=_work \
        --jq .encoded_jit_config 2>&1)"
    if [ -z "${jit}" ] || [[ "${jit}" == *" "* ]]; then
        log "регистрация не выдана: ${jit}"
        sleep 60
        continue
    fi

    log "раннер ${name} ждёт задание"
    docker run --rm --name "${name}" --platform linux/amd64 --network "${NETWORK}" \
        -e "ACTIONS_RUNNER_INPUT_JITCONFIG=${jit}" \
        -e "https_proxy=${PROXY_URL}" -e "HTTPS_PROXY=${PROXY_URL}" \
        -e "http_proxy=${PROXY_URL}" -e "HTTP_PROXY=${PROXY_URL}" \
        -e "no_proxy=localhost,127.0.0.1" -e "NO_PROXY=localhost,127.0.0.1" \
        --memory 4g --cpus 4 --pids-limit 1024 \
        --cap-drop ALL --security-opt no-new-privileges \
        "${IMAGE}"
    log "раннер ${name} закончил с кодом $?"

    # Короткая пауза: раннер, упавший на старте, иначе крутил бы регистрации без остановки
    sleep 5
done
