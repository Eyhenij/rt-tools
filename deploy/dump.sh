#!/usr/bin/env bash
#
# Выгрузка и загрузка хранилища приёмника на узле.
#
#   bash /opt/message-bus/dump.sh save            — снять дамп в /opt/message-bus/dumps
#   bash /opt/message-bus/dump.sh load <файл>     — загрузить дамп поверх пустого хранилища
#   bash /opt/message-bus/dump.sh probe [<файл>]  — проверить, что дамп загружается обратно
#
# Одна команда на каждое действие, а не четыре вызова по памяти: выгрузка, которую собирают из
# кусков, снимается в тот день, когда её пишут, и больше никогда.
#
# Проба идёт на одноразовой базе рядом — тот же образ и то же окружение, что у боевой, — и
# боевое хранилище не трогает: второго узла нет, а откатываться после неудачной загрузки
# пришлось бы тем же путём, который проверяют. Без файла проба снимает свежий дамп сама: между
# выгрузкой и сверкой тогда проходят секунды, и приехавший в это окно груз не красит пробу.
# Годность судится отпечатками, а не взглядом: по каждой таблице считаются строки и сумма всех
# строк в обеих базах, и расхождение называет таблицу.
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

# Сколько последних дампов живёт на узле. Выгрузка идёт раз в сутки, и неделя — глубина, за
# которую промах в данных успевают заметить; семь файлов диск узла не съедают.
KEEP_DUMPS="${KEEP_DUMPS:-7}"

save() {
    mkdir -p "${DUMPS}"
    # Метка времени в имени: дамп, перезаписывающий предыдущий, оставляет ровно одну точку
    # возврата — ту, что снята последней, в том числе снятой поверх уже испорченного.
    target="${DUMPS}/message-bus-$(date -u +%Y%m%dT%H%M%SZ).dump"
    # Своим форматом, а не текстом: он сжат, и загрузка идёт с параллелью и без разбора SQL.
    compose exec -T db pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --format=custom > "${target}"
    echo "dump: снят ${target} ($(du -h "${target}" | cut -f1))" >&2
    # Старше предела — снимаются после выгрузки, а не до: неудачная выгрузка иначе оставила бы
    # на один файл меньше, не прибавив нового. Порядок по имени и есть порядок по времени.
    ls -1 "${DUMPS}"/message-bus-*.dump | sort -r | tail -n "+$((KEEP_DUMPS + 1))" | while read -r old; do
        rm -f "${old}"
        echo "dump: снят старый ${old}" >&2
    done
    printf '%s\n' "${target}"
}

# Отпечаток базы: по каждой таблице схемы — число строк и сумма всех строк в их текстовом виде.
# Первый довод — команда, которая доводит psql до нужной базы; таблицы читаются из неё же, а не
# перечисляются здесь: новая миграция иначе прибавила бы таблицу, которой проба не видит.
fingerprint() {
    local tables query
    tables=$("$@" -Atc "select tablename from pg_tables where schemaname = 'public' order by 1")
    query=$(printf '%s\n' "${tables}" | awk '
        NR > 1 { printf " union all " }
        { printf "select %c%s%c, count(*), coalesce(md5(string_agg(x::text, chr(10) order by x::text)), %c-%c) from \"%s\" x", 39, $0, 39, 39, 39, $0 }
    ')
    "$@" -Atc "${query}"
}

# Имя одноразовой базы пробы. Стоит вне функции: его читает ловушка выхода, а она срабатывает,
# когда локальных переменных функции уже нет.
PROBE_NAME='mb-dump-probe'

probe() {
    local file name image live probe_side
    file="${1:-}"
    if [ -z "${file}" ]; then
        file=$(save)
    elif [ ! -f "${file}" ]; then
        echo "probe: файла дампа нет — ${file}" >&2
        exit 1
    fi

    name="${PROBE_NAME}"
    # Образ берётся из состава прода, а не пишется здесь второй раз: разойдясь, две записи
    # проверяли бы загрузку не в ту базу, в которую она пойдёт.
    image=$(compose config --images db)
    # Контейнер сносится вместе с томом и при отказе тоже: оставшийся от прошлой пробы он
    # занимает имя, а его том — место на узле, которому 24 ГБ.
    docker rm -f -v "${name}" >/dev/null 2>&1 || true
    trap 'docker rm -f -v "${PROBE_NAME}" >/dev/null 2>&1 || true' EXIT
    docker run -d --name "${name}" \
        -e POSTGRES_USER="${POSTGRES_USER}" -e POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
        -e POSTGRES_DB="${POSTGRES_DB}" "${image}" >/dev/null
    for _ in $(seq 1 30); do
        docker exec "${name}" pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" >/dev/null 2>&1 && break
        sleep 1
    done
    # Те же ключи, что у боевой загрузки: проба проверяет тот путь, которым пойдёт `load`.
    docker exec -i "${name}" pg_restore -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
        --clean --if-exists --no-owner --no-privileges < "${file}"

    live=$(fingerprint compose exec -T db psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}")
    probe_side=$(fingerprint docker exec "${name}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}")

    echo "probe: дамп ${file}"
    # Шапка набрана пробелами, а не форматом ширины: ширину printf считает в байтах, и слово
    # кириллицей в нём короче своих букв.
    echo 'таблица                     строк  отпечаток'
    printf '%s\n' "${probe_side}" | while IFS='|' read -r table rows sum; do
        printf '%-24s %8s  %s\n' "${table}" "${rows}" "${sum}"
    done

    if [ "${live}" = "${probe_side}" ]; then
        echo "probe: сошлось — таблиц $(printf '%s\n' "${live}" | grep -c .), боевая база и дамп совпадают"
    else
        echo 'probe: разошлось — боевая база и дамп отличаются:' >&2
        diff <(printf '%s\n' "${live}") <(printf '%s\n' "${probe_side}") | grep '^[<>]' | sed 's/^</  боевая: /; s/^>/  дамп:   /' >&2
        exit 1
    fi
}

case "${1:-}" in
    save)
        save >/dev/null
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

    probe)
        probe "${2:-}"
        ;;

    *)
        echo 'dump: save | load <файл> | probe [<файл>]' >&2
        exit 1
        ;;
esac
