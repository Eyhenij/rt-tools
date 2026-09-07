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

suite_result "проверки: схема и миграции"
