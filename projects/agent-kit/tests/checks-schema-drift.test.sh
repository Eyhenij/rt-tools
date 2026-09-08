#!/usr/bin/env bash
# Сценарии сверки схемы с миграциями: где пропуск законен и где он становится отказом.
#
# В базу набор не ходит: судится развилка «проверять негде» — та самая, на которой гейт был
# зелёным, пока миграция уезжала в главную вслепую.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: схема и миграции"

SD_TREE="$(mktemp -d)"
mkdir -p "$SD_TREE/tools" "$SD_TREE/prisma/migrations" "$SD_TREE/docs"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/check-schema-drift.mjs" "$SD_TREE/tools/"
printf 'model A {\n  id Int @id\n}\n' > "$SD_TREE/prisma/schema.prisma"
printf 'docs\n' > "$SD_TREE/docs/README.md"

git -C "$SD_TREE" init -q -b main 2>/dev/null
git -C "$SD_TREE" -c user.name=t -c user.email=t@t add -A 2>/dev/null
git -C "$SD_TREE" -c user.name=t -c user.email=t@t commit -q -m base 2>/dev/null

# Адрес базы не задан — то же, что погашенный докер: сверять негде.
drift_code() {
    (cd "$SD_TREE" && env -u DATABASE_URL node tools/check-schema-drift.mjs >/dev/null 2>&1)
    printf '%s' $?
}

drift_says() {
    (cd "$SD_TREE" && env -u DATABASE_URL node tools/check-schema-drift.mjs 2>&1) | grep -cE "$1"
}

# --- SC-AK-822 — пропуск законен, пока ветка не трогала хранилища --------------------------
report "SC-AK-822 — без правки хранилища проверка пропускает" "$(drift_code)" 7
report "SC-AK-822 — и говорит, что сверять негде" "$(drift_says 'there is nowhere to check')" 1

# Правка схемы в рабочем дереве: она уйдёт тем же пушем следом, и вклада ветки для неё мало.
printf 'model A {\n  id Int @id\n  name String\n}\n' > "$SD_TREE/prisma/schema.prisma"
report "SC-AK-822 — незакоммиченная правка схемы делает пропуск отказом" "$(drift_code)" 1
report "SC-AK-822 — отказ называет, чем поднять базу" "$(drift_says 'git-workflow-migration')" 1
report "SC-AK-822 — и называет, почему порядок виден только на пустом" "$(drift_says 'the timestamp is set by the minute of creation')" 1
git -C "$SD_TREE" checkout -q -- prisma/schema.prisma 2>/dev/null

# Вклад ветки: правка миграций закоммичена, рабочее дерево чисто.
git -C "$SD_TREE" checkout -q -b RT-1-migration 2>/dev/null
mkdir -p "$SD_TREE/prisma/migrations/20260830_add"
printf 'ALTER TABLE "A" ADD COLUMN "name" TEXT;\n' > "$SD_TREE/prisma/migrations/20260830_add/migration.sql"
git -C "$SD_TREE" -c user.name=t -c user.email=t@t add -A 2>/dev/null
git -C "$SD_TREE" -c user.name=t -c user.email=t@t commit -q -m migration 2>/dev/null
report "SC-AK-822 — закоммиченная миграция делает пропуск отказом" "$(drift_code)" 1

# Ветка, тронувшая только тексты, ведёт себя как прежде: за погашенный докер пуш не отбивается.
git -C "$SD_TREE" checkout -q -b RT-2-docs main 2>/dev/null
printf 'ещё строка\n' >> "$SD_TREE/docs/README.md"
report "SC-AK-822 — правка текстов пропуска не отменяет" "$(drift_code)" 7

rm -rf "$SD_TREE"

# --- SC-AK-924, SC-AK-925 — теневая база и разбор отказа развёртывания ----------------------
#
# Живой базы у набора по-прежнему нет: клиент хранилища подменяется заглушкой в дереве фикстуры,
# а `npx` — оболочкой на PATH. Так видно и то, какие запросы проверка шлёт серверу, и то, каким
# словом она называет отказ развёртывания.
SD_STUB="$(mktemp -d)"
mkdir -p "$SD_STUB/tools" "$SD_STUB/prisma" "$SD_STUB/node_modules/pg" "$SD_STUB/bin"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/check-schema-drift.mjs" "$SD_STUB/tools/"
printf 'model A {\n  id Int @id\n}\n' > "$SD_STUB/prisma/schema.prisma"

# Заглушка клиента хранилища: соединение удаётся, а запросы уходят в файл — их и судит набор.
printf '{"name":"pg","version":"0.0.0","main":"index.cjs"}\n' > "$SD_STUB/node_modules/pg/package.json"
cat > "$SD_STUB/node_modules/pg/index.cjs" <<'STUB'
const { appendFileSync } = require('node:fs');

class Client {
    async connect() {}

    async query(text) {
        appendFileSync(process.env.SD_QUERIES, `${text}\n`);

        return { rows: [] };
    }

    async end() {}
}

module.exports = { Client };
STUB

# Оболочка вместо `npx`: чем она отвечает, задаёт набор перед вызовом.
cat > "$SD_STUB/bin/npx" <<'FAKE'
#!/usr/bin/env bash
printf '%s\n' "$SD_NPX_SAYS" >&2
exit "${SD_NPX_CODE:-0}"
FAKE
chmod +x "$SD_STUB/bin/npx"

stub_says() {
    : > "$SD_STUB/queries"
    (cd "$SD_STUB" && env PATH="$SD_STUB/bin:$PATH" SD_QUERIES="$SD_STUB/queries" \
        SD_NPX_SAYS="$1" SD_NPX_CODE="$2" \
        DATABASE_URL='postgresql://u:p@localhost:5432/probe' \
        node tools/check-schema-drift.mjs 2>&1)
}

stub_queries() {
    grep -cE "$1" "$SD_STUB/queries"
}

sd_out="$(stub_says 'Error: P1001: Can not reach database server' 1)"
report "SC-AK-924 — теневая база заводится своей командой" "$(stub_queries '^CREATE DATABASE ')" 1
report "SC-AK-924 — и снимается до того, как её завести" "$(stub_queries '^DROP DATABASE IF EXISTS ')" 2
report "SC-AK-925 — P1001 назван поломкой проверки" "$(printf '%s' "$sd_out" | grep -c 'defect of the check')" 1
report "SC-AK-925 — и не выдан за расхождение миграций" "$(printf '%s' "$sd_out" | grep -c 'do not apply to a clean database')" 0

sd_out="$(stub_says 'Error: relation "A" already exists' 1)"
report "SC-AK-925 — прочий отказ развёртывания остаётся отказом миграций" \
    "$(printf '%s' "$sd_out" | grep -c 'do not apply to a clean database')" 1
report "SC-AK-925 — и не назван поломкой проверки" "$(printf '%s' "$sd_out" | grep -c 'defect of the check')" 0

rm -rf "$SD_STUB"

suite_result "проверки: схема и миграции"
