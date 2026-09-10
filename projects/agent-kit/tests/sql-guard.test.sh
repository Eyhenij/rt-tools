#!/usr/bin/env bash
# Сценарии стража записи в хранилище.
#
# Правка данных — единственное действие, которое не отменяется правкой кода. Удаление по маске
# однажды уносит вместе с пробными записями настоящие: маска совпадает шире, чем ждал автор
# запроса, и узнают об этом из восстановления из копии.
#
# Набор судит три уровня и границы между ними: разрушительное отбито, остальная запись спрошена,
# чтение пропущено. Отдельно проверяется, что команда, ничего не доставляющая на сервер, не
# разбирается вовсе: обойти отбой на ней можно только испортив образец поиска, а не работу.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "страж записи в хранилище"

tree="$(mktemp -d)"
cleanup() { rm -rf "$tree"; }
trap cleanup EXIT
export CLAUDE_PROJECT_DIR="$tree"

# Адрес хранилища снимается с окружения по той же причине, что и поля профиля в обвязке: страж
# разрешает адрес миграции в том числе из переменной окружения, и под живым заходом или под
# гейтом пуша он взял бы адрес того дерева. Проба «адрес не разрешился» зеленела бы у себя и
# краснела бы в конвейере — ровно так она и разошлась в первый раз.
unset DATABASE_URL

# Дерево называет боевой адрес, одноразовый диапазон портов и обе известные связи редактора.
export RT_PROD_DSN='prod\.example\.net|:15432'
export RT_PROD_CONNECTIONS='связь-боевая'
export RT_LOCAL_CONNECTIONS='связь-местная'
export RT_SCRATCH_PORT_RE='(:|-p[[:space:]]+)194[0-9][0-9]'

# Команда оболочки: страж читает её тем же полем, что и любой гард правки.
shell() {
    local label="$1" want="$2" cmd="$3"
    expect_decision "$label" sql-guard.sh "$(input_cmd "$cmd" Bash "$tree")" "$want"
}

# Запрос через связь редактора: текст запроса и признак связи.
query() {
    jq -n --arg q "$1" --arg c "${2:-}" \
        '{session_id:"tests",tool_name:"mcp__webstorm__execute_sql_query",
          tool_input:{queryText:$q,connectionId:$c}}'
}

asked() {
    local label="$1" want="$2" text="$3" conn="${4:-связь-местная}"
    expect_decision "$label" sql-guard.sh "$(query "$text" "$conn")" "$want"
}

# --- SC-AK-1056. Без адресации по опознавателю — отказ -------------------------------------

asked "SC-AK-1056 — удаление без условия отбито" deny "DELETE FROM bookings"
asked "SC-AK-1056 — правка без условия отбита" deny "UPDATE bookings SET status = 'new'"
asked "SC-AK-1056 — условие по маске отбито" deny \
    "DELETE FROM users WHERE email LIKE '%test%'"
asked "SC-AK-1056 — присваивание в set за адресацию не считается" deny \
    "UPDATE bookings SET \"propertyId\" = 'p1' WHERE source = 'site'"
asked "SC-AK-1056 — очистка таблицы отбита" deny "TRUNCATE TABLE bookings"
asked "SC-AK-1056 — правка схемы отбита" deny "ALTER TABLE bookings ADD COLUMN note text"

# --- SC-AK-1057. Адресованная правка спрошена, чтение пропущено ----------------------------

asked "SC-AK-1057 — правка по опознавателю спрошена" ask \
    "UPDATE bookings SET status = 'paid' WHERE id = 'b1'"
asked "SC-AK-1057 — удаление по списку опознавателей спрошено" ask \
    "DELETE FROM bookings WHERE id IN ('b1','b2')"
asked "SC-AK-1057 — вставка спрошена" ask \
    "INSERT INTO bookings (id, status) VALUES ('b1', 'new')"
asked "SC-AK-1057 — условие по чужому ключу спрошено" ask \
    "DELETE FROM bookings WHERE \"propertyId\" = 'p1' AND id = 'b1'"
asked "SC-AK-1057 — выборка проходит" PASS "SELECT id FROM bookings LIMIT 10"

# Неизвестная связь: цель запроса не опознана, и молчать нельзя.
asked "SC-AK-1057 — запись через неизвестную связь спрошена" ask \
    "INSERT INTO bookings (id) VALUES ('b1')" связь-чужая

# --- SC-AK-1058. Боевое хранилище: запись отбита, чтение доказывается ----------------------

asked "SC-AK-1058 — запись через боевую связь отбита" deny \
    "UPDATE bookings SET status = 'paid' WHERE id = 'b1'" связь-боевая
shell "SC-AK-1058 — запись по боевому адресу отбита" deny \
    'psql postgres://app@prod.example.net/app -c "delete from bookings where id = 1"'
shell "SC-AK-1058 — снятие копии с боевого проходит" PASS \
    'pg_dump postgres://app@prod.example.net/app -f /tmp/snapshot.dump'
shell "SC-AK-1058 — одна выборка с боевого проходит" PASS \
    'psql postgres://app@prod.example.net/app -c "select count(*) from bookings"'
shell "SC-AK-1058 — неопознанный вызов на боевом отбит" deny \
    'psql postgres://app@prod.example.net/app -c "\\copy bookings to stdout"'

# --- SC-AK-1059. Доставка с невидимым содержимым — это запись ------------------------------

shell "SC-AK-1059 — файл в клиента спрошен" ask 'psql -d app -f /tmp/fix.sql'
shell "SC-AK-1059 — поток в клиента спрошен" ask 'cat /tmp/fix.sql | psql -d app'
shell "SC-AK-1059 — восстановление из копии спрошено" ask 'pg_restore -d app /tmp/snapshot.dump'
shell "SC-AK-1059 — восстановление с очисткой отбито" deny \
    'pg_restore --clean -d app /tmp/snapshot.dump'
shell "SC-AK-1059 — снятие копии остаётся чтением" PASS 'pg_dump -d app -f /tmp/snapshot.dump'
shell "SC-AK-1059 — снятие копии рядом с доставкой файла не снимает проверку" ask \
    'pg_dump -d app > /dev/null && psql -d app -f /tmp/fix.sql'

# --- SC-AK-1060. Ничего не доставляющее не разбирается -------------------------------------

shell "SC-AK-1060 — поиск по дереву проходит" PASS 'grep -rn "prisma db push" docs/'
shell "SC-AK-1060 — коммит со словами запроса проходит" PASS \
    'git commit -am "chore(api): update prisma schema, drop unused column"'
shell "SC-AK-1060 — чужая команда проходит" PASS 'ls -la /tmp'
expect_decision "SC-AK-1060 — пустой ввод проходит" sql-guard.sh '' PASS

# --- SC-AK-1061. Миграции судятся по разрешённому адресу -----------------------------------

shell "SC-AK-1061 — миграция на местный адрес проходит" PASS \
    'DATABASE_URL=postgres://app@localhost:55432/app pnpm exec prisma migrate deploy'
shell "SC-AK-1061 — миграция на боевой адрес отбита" deny \
    'DATABASE_URL=postgres://app@prod.example.net/app pnpm exec prisma migrate deploy'
shell "SC-AK-1061 — миграция на незнакомый адрес спрошена" ask \
    'DATABASE_URL=postgres://app@stage.example.org/app pnpm exec prisma migrate deploy'
shell "SC-AK-1061 — неразрешимый адрес миграции спрошен" ask 'pnpm exec prisma migrate deploy'
shell "SC-AK-1061 — миграция рядом со второй записью не проходит" ask \
    'DATABASE_URL=postgres://app@localhost:55432/app pnpm exec prisma migrate deploy && psql -d app -c "insert into bookings (id) values (1)"'
shell "SC-AK-1061 — пересоздание базы отбито" deny 'pnpm exec prisma migrate reset'

# --- SC-AK-1062. Одноразовая база ничего не спрашивает --------------------------------------

shell "SC-AK-1062 — доставка файла в одноразовую базу проходит" PASS \
    'psql -h 127.0.0.1 -p 19434 -d probe -f /tmp/fix.sql'
shell "SC-AK-1062 — второй адресованный вызов снимает исключение" ask \
    'psql -h 127.0.0.1 -p 19434 -d probe -f /tmp/fix.sql && psql -h localhost -p 55432 -d app -f /tmp/fix.sql'

# --- SC-AK-1063. Метка понижает отказ до вопроса --------------------------------------------

asked "SC-AK-1063 — с меткой разрушительное спрошено" ask \
    "TRUNCATE TABLE bookings -- destructive-ok: пересев пробного дерева"
asked "SC-AK-1063 — без метки то же отбито" deny "TRUNCATE TABLE bookings"
asked "SC-AK-1063 — на боевом метка ничего не меняет" deny \
    "TRUNCATE TABLE bookings -- destructive-ok: пересев" связь-боевая

suite_result "страж записи в хранилище"
