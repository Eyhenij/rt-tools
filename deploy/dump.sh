#!/usr/bin/env bash
#
# Выгрузка и загрузка хранилища приёмника на узле.
#
#   bash /opt/message-bus/dump.sh save            — снять дамп в /opt/message-bus/dumps
#   bash /opt/message-bus/dump.sh load <файл>     — загрузить дамп поверх пустого хранилища
#
# Одна команда на каждое действие, а не четыре вызова по памяти: выгрузка, которую собирают из
# кусков, снимается в тот день, когда её пишут, и больше никогда.
#
# Дамп несёт хранилище целиком — деревья с признаками, токены с их состоянием, учётные записи,
# записи месяца, предложения и разборы. Отбора у выгрузки нет: половина дампа не отвечает ни на
# один вопрос, ради которого его снимают, а токены, потерянные при отборе, оставляют деревья без
# права слать.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE="${ROOT}/docker-compose.prod.yml"
ENV_FILE="${ROOT}/.env.prod"
DUMPS="${ROOT}/dumps"

# Пароль и имена базы живут в окружении узла и в вывод не попадают: команда зовётся внутри
# контейнера, которому они и так известны.
if [ ! -f "${ENV_FILE}" ]; then
    echo "dump: окружения прода нет — ${ENV_FILE}" >&2
    exit 1
fi

# shellcheck disable=SC1090
set -a
. "${ENV_FILE}"
set +a

compose() {
    docker compose -f "${COMPOSE}" --env-file "${ENV_FILE}" "$@"
}

case "${1:-}" in
    save)
        mkdir -p "${DUMPS}"
        # Метка времени в имени: дамп, перезаписывающий предыдущий, оставляет ровно одну точку
        # возврата — ту, что снята последней, в том числе снятой поверх уже испорченного.
        target="${DUMPS}/message-bus-$(date -u +%Y%m%dT%H%M%SZ).dump"
        # Своим форматом, а не текстом: он сжат, и загрузка идёт с параллелью и без разбора SQL.
        compose exec -T db pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --format=custom > "${target}"
        echo "dump: снят ${target} ($(du -h "${target}" | cut -f1))"
        ;;

    load)
        file="${2:-}"
        if [ -z "${file}" ] || [ ! -f "${file}" ]; then
            echo 'dump: назови файл дампа вторым доводом' >&2
            exit 1
        fi
        # `--clean --if-exists` вместо ручной пересборки базы: загрузка идёт поверх работающего
        # хранилища, и пересоздавать базу пришлось бы, отцепив от неё приёмник.
        compose exec -T db pg_restore -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
            --clean --if-exists --no-owner --no-privileges < "${file}"
        echo "dump: загружен ${file}"
        # Приёмник перезапускается: клиент хранилища держит соединения, снятые загрузкой, и
        # первое же обращение после неё иначе отвечает отказом связи.
        compose restart api
        echo 'dump: приёмник перезапущен'
        ;;

    *)
        echo 'dump: save | load <файл>' >&2
        exit 1
        ;;
esac
