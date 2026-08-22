#!/usr/bin/env bash
# Запись для гарда хранилища: что считается записью, что из неё заведомо разрушительно, куда
# идут миграции и по чему запрос адресует строки.
#
# Строки `# rt-hook:` здесь нет намеренно: событие и образец вызова объявляет сам гард, а
# помощник рядом хуком не регистрируется и в одиночку ничего не решает.

# Глаголы ищутся в сегментах ВЫЗОВА, а не по всей строке: иначе слово из шаблона поиска в
# соседнем звене цепочки объявляло записью читающую команду.
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

sql_detect_write() {
    is_write=""
    write_scope="$segments"
    # `copy … from` и `select … into` — запись, не называющая ни одного привычного глагола.
    printf '%s' "$write_scope" | grep -qE '(^|[^[:alnum:]_])(delete|update|insert|truncate|drop|alter|create|grant|revoke|copy)([^[:alnum:]_]|$)|\\copy|into[[:space:]]+[a-z_"]' \
        && is_write="yes"
    # Конвейер из источника в клиент — та же доставка файла, только без флага: содержимое
    # `cat fix.sql | psql …` гарду не видно, значит это запись по определению.
    while IFS= read -r seg; do
        [ -z "$seg" ] && continue
        printf '%s' "$seg" | grep -qE '(^|[^[:alnum:]_.-])(cat|head|tail|gzcat|zcat|gunzip|echo|printf|curl|wget)([[:space:]]|$)' \
            && is_write="yes" && break
    done <<PIPE_EOF
$(client_segments)
PIPE_EOF

    # Команды prisma меняют базу, не называя ни одного SQL-глагола: `migrate reset` пересоздаёт
    # её целиком, `db push` подгоняет схему под модель, `db execute` льёт произвольный файл.
    printf '%s' "$write_scope" | grep -qE 'prisma[[:space:]]+(migrate[[:space:]]+(reset|deploy|dev)|db[[:space:]]+(push|execute))' \
        && is_write="yes"

    # Глагол в командной строке — не единственный способ довезти SQL до сервера. Файл (`-f`,
    # `--file`, `< dump.sql`) и `pg_restore` не называют ни одного, поэтому раньше проходили
    # мимо всех трёх уровней: доставка файла в клиент на боевой базе завершалась нулём
    # без единого вопроса, а `pg_restore` не мог сработать в принципе, хотя `--clean` сносит
    # содержимое. Содержимое файла гарду недоступно — значит это запись по определению.
    printf '%s' "$flat" | grep -qE '(^|[^[:alnum:]_.-])pg_restore([^[:alnum:]_.-]|$)' \
        && is_write="yes"
    # У `pg_dump` тот же `-f` означает файл ВЫВОДА: это чтение, и записью его считать нельзя —
    # иначе штатное снятие дампа с боевой базы отклонялось, хотя текст отказа сам его советует.
    #
    # Исключение действует ПОСЕГМЕНТНО. Пока оно проверялось по всей команде, одного упоминания
    # `pg_dump` где угодно в цепочке хватало, чтобы `-f` перестал считаться записью во всех
    # остальных вызовах: `pg_dump … > /dev/null && psql -d app -f /tmp/x.sql` проходил молча.
    while IFS= read -r seg; do
        [ -z "$seg" ] && continue
        # Граница слова обязательна: `-f /tmp/pg_dump-restore.sql` — это заливка дампа, а не
        # его снятие, и подстрочное совпадение снимало с неё обе защиты разом.
        if printf '%s' "$seg" | grep -qE '(^|[^[:alnum:]_.-])pg_dump(all)?([^[:alnum:]_.-]|$)'; then
            continue
        fi
        # Хвост сегмента после имени клиента: `-f` у `docker compose` (боевой compose-файл
        # называется нестандартно, без флага не поднимается) стоит ДО `psql` и к запросу
        # отношения не имеет.
        seg_tail="$(printf '%s' "$seg" | perl -0pe 's{^.*?(?<![[:alnum:]_./-])(psql|pg_restore|prisma)(?=\s|$)}{$1}s' 2>/dev/null)"
        [ -z "$seg_tail" ] && seg_tail="$seg"
        if printf '%s' "$seg_tail" | grep -qE '(^|[[:space:]])(-f|--file)([[:space:]]|=)|<[[:space:]]*[^[:space:]|<]+\.(sql|dump)'; then
            is_write="yes"
            break
        fi
    done <<EOF
$segments
EOF
}

# --- заведомо разрушительное ------------------------------------------------------------
verdict() {
    if [ -n "$soft" ]; then
        ask "Запрос помечен маркером destructive-ok, но остаётся разрушительным: $1 Подтверди выполнение, если это осознанно."
    fi
    deny "BLOCKED: $1 Адресуй строки по первичному ключу — \`WHERE id IN ('…','…')\`: так затрагивается ровно столько строк, сколько перечислено, и промах виден до выполнения. Удаление по маске (email LIKE '%test%') однажды унесло вместе с тестовыми записями демонстрационные брони владельца. Если адресация по id действительно не подходит — сначала выполни SELECT с тем же условием и покажи пользователю, что попадает под удаление." \
        "маркер destructive-ok при запросе, с объяснением"
}

sql_check_destructive() {
    soft=""
    case "$flat" in
        *destructive-ok*) soft="yes" ;;
    esac

    if printf '%s' "$flat" | grep -qE '(^|[^[:alnum:]_])(truncate|drop[[:space:]]+(table|database|schema|column|index)|alter[[:space:]]+table)([^[:alnum:]_]|$)'; then
        verdict "запрос меняет саму схему или очищает таблицу целиком (${context})."
    fi

    if printf '%s' "$flat" | grep -qE 'prisma[[:space:]]+(migrate[[:space:]]+reset|db[[:space:]]+push)'; then
        verdict "\`prisma migrate reset\` / \`db push\` пересоздаёт базу и теряет её содержимое (${context})."
    fi

    # `pg_restore --clean` перед загрузкой удаляет существующие объекты — то же очищение
    # таблиц, только чужими руками. Без `--clean` это обычная догрузка, она идёт общим путём.
    if printf '%s' "$flat" | grep -q 'pg_restore' && printf '%s' "$flat" | grep -qE '(^|[[:space:]])(--clean|-c|--create)([[:space:]]|=|$)'; then
        verdict "\`pg_restore --clean\` удаляет объекты базы перед загрузкой дампа (${context})."
    fi
}

# Штатное применение миграций разрушительным не считается. Раньше здесь стоял безусловный
# `ask` со словами «убедись, что DATABASE_URL указывает на локальную базу» — гард
# перекладывал на человека ровно ту работу, которую умеет сделать сам. На локальной базе
# миграции гоняются постоянно, и вопрос на каждую не добавляет безопасности: гард, который
# спрашивает по десятому разу, перестают читать вместе с тем единственным вопросом, который
# был важен.
#
# Поэтому адрес РАЗРЕШАЕТСЯ, а не угадывается: сначала inline-префикс самой команды, затем
# переменная окружения, затем `.env` рабочего каталога.
unquote() {
    sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
}

resolve_database_url() {
    # Искать по `$flat` нельзя: он приведён к нижнему регистру, и `DATABASE_URL=` в нём
    # не встречается никогда — правило молча брало бы адрес из `.env`, игнорируя явно
    # указанный в команде. Разбирается исходная строка, а `$flat` остаётся запасным
    # вариантом с регистронезависимым поиском.
    inline="$(printf '%s' "${cmd:-}" | grep -oE '[Dd][Aa][Tt][Aa][Bb][Aa][Ss][Ee]_[Uu][Rr][Ll]=[^[:space:]]+' | tail -n1)"
    [ -z "$inline" ] && inline="$(printf '%s' "$flat" | grep -oiE 'database_url=[^[:space:]]+' | tail -n1)"
    if [ -n "$inline" ]; then
        printf '%s' "${inline#*=}" | unquote
        return
    fi
    if [ -n "${DATABASE_URL:-}" ]; then
        printf '%s' "$DATABASE_URL" | unquote
        return
    fi
    # Подъём по дереву, а не только рабочий каталог: агент работает в git worktree под
    # `.claude/worktrees/<ветка>/`, где своего `.env` нет, а у основного чекаута — есть,
    # и он лежит ровно выше по пути. Без подъёма гард не разрешил бы адрес ни разу
    # именно там, где миграции и гоняются.
    dir="$hook_cwd"
    depth=0
    while [ -n "$dir" ] && [ "$dir" != '/' ] && [ "$depth" -lt 8 ]; do
        for env_file in "$dir/.env" "$dir/.env.local"; do
            [ -f "$env_file" ] || continue
            value="$(grep -m1 -E '^[[:space:]]*DATABASE_URL=' "$env_file" 2>/dev/null | sed -e 's/^[[:space:]]*DATABASE_URL=//' | unquote)"
            if [ -n "$value" ]; then
                printf '%s' "$value"
                return
            fi
        done
        dir="$(dirname "$dir")"
        depth=$((depth + 1))
    done
}

sql_check_migrations() {
    if printf '%s' "$flat" | grep -qE 'prisma[[:space:]]+migrate[[:space:]]+(deploy|dev)'; then
        migrate_target="$(resolve_database_url)"
        # Боевой адрес проверяется ДО разбора по видам: туннель к бою тоже висит на петлевом
        # адресе, только на своём порту, и общее правило «петлевой значит локальный» пропустило бы
        # миграцию на бой.
        if [ -n "$PROD_DSN" ] && printf '%s' "$migrate_target" | grep -qE "$PROD_DSN"; then
            deny "BLOCKED: применение миграций к БОЕВОЙ базе (${context}). Адрес базы ведёт на бой. Схема на бою меняется выкаткой: она сама зовёт применение миграций одноразовым контейнером до старта приложения. Руками этого делать нельзя — гард обойти нельзя."
        fi
        case "$migrate_target" in
            *@localhost:*|*@127.0.0.1:*|*@postgres:*|*@host.docker.internal:*)
                # Локальная база — штатная работа. Разбор завершается здесь, иначе ниже
                # сработает общее правило про запись в базу и вопрос всё равно будет задан:
                # `migrate deploy` помечен записью выше по тексту.
                #
                # Но выйти можно, только если запись в команде ОДНА — сама миграция. В цепочке
                # `prisma migrate deploy && psql -c "delete …"` ранний выход снял бы проверку со
                # второго звена, а это ровно тот обход, ради которого гард и написан.
                other_write=""
                printf '%s' "$write_scope" \
                    | grep -qE '(^|[^[:alnum:]_])(delete|update|insert|truncate|drop|alter|create|grant|revoke|copy)([^[:alnum:]_]|$)|\\copy|into[[:space:]]+[a-z_"]' \
                    && other_write="yes"
                while IFS= read -r seg; do
                    [ -z "$seg" ] && continue
                    printf '%s' "$seg" | grep -qE '(^|[^[:alnum:]_.-])(cat|head|tail|gzcat|zcat|gunzip|echo|printf|curl|wget)([[:space:]]|$)' \
                        && other_write="yes" && break
                done <<MIGRATE_PIPE_EOF
$(client_segments)
MIGRATE_PIPE_EOF
                [ -z "$other_write" ] && exit 0
                ;;
            '')
                ask "Применение миграций к базе (${context}), но адрес разрешить не удалось: DATABASE_URL нет ни в команде, ни в окружении, ни в \`.env\` рабочего каталога. Проверь, куда пойдёт миграция, и подтверди."
                ;;
            *)
                ask "Применение миграций по адресу, НЕИЗВЕСТНОМУ ГАРДУ (${context}). Гард знает локальные адреса и боевые; этот — ни то, ни другое. Убедись, что это не прод, и подтверди."
                ;;
        esac
    fi
}

# --- delete/update: смотрим на адресацию ------------------------------------------------
sql_check_addressing() {
    if printf '%s' "$flat" | grep -qE '(^|[^[:alnum:]_])(delete[[:space:]]+from|update)([^[:alnum:]_]|$)'; then
        if ! printf '%s' "$flat" | grep -q 'where'; then
            verdict "DELETE/UPDATE без WHERE затрагивает всю таблицу (${context})."
        fi

        # Адресация ищется ТОЛЬКО в хвосте после последнего `where`. Пока смотрели на весь
        # запрос, присваивание в SET засчитывалось за адресацию: `UPDATE bookings SET
        # "propertyId" = 'p1' WHERE source = 'site'` выглядел адресным, хотя задевал все прямые
        # заявки объекта — ровно то, от чего гард и защищает.
        # Регистр здесь сохраняется, в отличие от `flat`: колонки Prisma пишутся в camelCase, и
        # приведённый к нижнему регистру `bookingid` уже не отличить от слова `paid`.
        where_tail="$(printf '%s' "$sql" | tr '\n\t' '  ' | sed -E 's/.*[Ww][Hh][Ee][Rr][Ee]/where/')"

        # Имя колонки требуется целиком: `id`, `booking_id`, `"bookingId"`. Прежний шаблон
        # `[a-z_]*id` принимал за идентификатор `paid` и `valid`.
        if ! printf '%s' "$where_tail" | grep -qE '(^|[^[:alnum:]_"])"?(id|[A-Za-z_]+_id|[a-zA-Z]+Id)"?[[:space:]]*(=|[Ii][Nn][[:space:]]*\()'; then
            verdict "DELETE/UPDATE адресует строки не по идентификатору (${context}) — условие может совпасть шире, чем задумано."
        fi

        # Гард видит имя колонки, но не схему: `propertyId` и `session_id` — внешние ключи, и
        # запрос по ним адресный только на вид. `DELETE … WHERE "propertyId" = 'p1'` сносит все
        # брони объекта. Отличить это от первичного ключа без схемы нельзя, поэтому решение
        # остаётся за пользователем — но предупреждение должно быть прямым, а не общим.
        if ! printf '%s' "$where_tail" | grep -qE '(^|[^[:alnum:]_"])"?id"?[[:space:]]*(=|[Ii][Nn][[:space:]]*\()'; then
            ask "Условие адресует строки по ВНЕШНЕМУ ключу, а не по первичному (${context}): $(printf '%s' "$where_tail" | head -c 200). Под него попадут ВСЕ строки, связанные с этой сущностью, — например \`WHERE \"propertyId\" = …\` заденет все брони объекта, включая демонстрационные. Если нужны конкретные строки, сперва выбери их SELECT-ом и перечисли в \`WHERE id IN (…)\`."
        fi
    fi
}
