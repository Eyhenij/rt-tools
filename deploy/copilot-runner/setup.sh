#!/usr/bin/env bash
#
# Подготовка раннера ревью Copilot на машине владельца: два образа, закрытая сеть, прокси и служба.
#
# Зовётся руками один раз и после правки любого файла этой папки. Регистрацию и запуск раннера
# делает `runner-loop.sh`, его поднимает служба launchd. Сценарий кладёт копию цикла в домашнюю
# папку: служба не должна зависеть от ветки, на которой стоит рабочее дерево.
#
# На машине стоят раннеры и других репозиториев, поэтому сценарий трогает только своё: сборщик,
# сеть, контейнер, образы и службу с приставкой `rt-copilot-`. Раннер проверок `~/actions-runner`
# ему не виден.
set -euo pipefail

cd "$(dirname "$0")"

BUILDER=rt-copilot-builder
NETWORK=rt-copilot-internal
PROXY=rt-copilot-proxy
RUNNER_IMAGE=rt-copilot-runner:latest
PROXY_IMAGE=rt-copilot-proxy:latest
SERVICE=com.rt-tools.copilot-runner
INSTALL_DIR="${HOME}/.local/share/rt-copilot-runner"
AGENT="${HOME}/Library/LaunchAgents/${SERVICE}.plist"

# Сборка идёт своим сборщиком с пределом кэша: стандартный сборщик машины кэширует без предела
if ! docker buildx inspect "${BUILDER}" >/dev/null 2>&1; then
    config="$(mktemp)"
    printf '[worker.oci]\n  gc = true\n  gckeepstorage = "3GB"\n' > "${config}"
    docker buildx create --name "${BUILDER}" --driver docker-container --buildkitd-config "${config}" >/dev/null
    rm -f "${config}"
fi

docker buildx build --builder "${BUILDER}" --platform linux/amd64 --load \
    -f runner.Dockerfile -t "${RUNNER_IMAGE}" .
docker buildx build --builder "${BUILDER}" --load \
    -f proxy.Dockerfile -t "${PROXY_IMAGE}" .

# Внутренняя сеть не выпускает наружу ничего: раннер в ней видит только прокси
if ! docker network inspect "${NETWORK}" >/dev/null 2>&1; then
    docker network create --internal "${NETWORK}" >/dev/null
fi

# Прокси пересоздаётся: новый образ иначе не подхватится
docker rm -f "${PROXY}" >/dev/null 2>&1 || true
docker run -d --name "${PROXY}" --restart unless-stopped --network "${NETWORK}" \
    --read-only --tmpfs /tmp --tmpfs /var/run/tinyproxy --cap-drop ALL \
    --security-opt no-new-privileges "${PROXY_IMAGE}" >/dev/null
docker network connect bridge "${PROXY}"

# Служба ставится заново: новая копия цикла иначе не подхватится
mkdir -p "${INSTALL_DIR}" "$(dirname "${AGENT}")"
cp runner-loop.sh "${INSTALL_DIR}/runner-loop.sh"
sed "s|__HOME__|${HOME}|g" launchd.plist > "${AGENT}"
launchctl bootout "gui/$(id -u)/${SERVICE}" >/dev/null 2>&1 || true
launchctl bootstrap "gui/$(id -u)" "${AGENT}"

echo "setup: образы ${RUNNER_IMAGE} и ${PROXY_IMAGE}, сеть ${NETWORK}, прокси ${PROXY} поднят, служба ${SERVICE} запущена"
