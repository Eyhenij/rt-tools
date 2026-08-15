#!/usr/bin/env bash
# Сценарии умолчаний: профиль дерева и карта гейта.
#
# Умолчания — это то, что пакет считает верным для любого дерева мастерской, пока дерево не
# сказало иначе. Проверяется каждая функция по отдельности и главное свойство обеих: надстройка
# проекта вправе объявить функцию заново и позвать умолчание обратно суффиксом `_default`.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "умолчания"

TREE="$(fixture_tree)"
export CLAUDE_PROJECT_DIR="$TREE"
cleanup() { rm -rf "$TREE"; }
trap cleanup EXIT

# shellcheck disable=SC1091
. "$DEFAULTS/project.sh"
# shellcheck disable=SC1091
. "$DEFAULTS/gate-map.sh"

ok() {
    if "${@:2}"; then report "$1" да да; else report "$1" нет да; fi
}
no() {
    if "${@:2}"; then report "$1" да нет; else report "$1" нет нет; fi
}

# --- код приложения ли это ------------------------------------------------------------------
ok "код приложения: apps" rt_is_app_code "$TREE/apps/site/src/main.ts"
ok "код приложения: libs" rt_is_app_code "$TREE/libs/site/x/ui/a.ts"
ok "код приложения: projects" rt_is_app_code "$TREE/projects/ui-kit/src/a.ts"
no "не код: тексты" rt_is_app_code "$TREE/docs/adr/0001.md"
no "не код: обвязка" rt_is_app_code "$TREE/tools/check-x.mjs"
no "не код: правила агента" rt_is_app_code "$TREE/.claude/skills/x/SKILL.md"

# SC-AK-92. Путь вне корня дерева признака не получает, даже когда совпал с образцом: гарды
# отдают сюда абсолютный путь целиком, и каталог со словом `projects` в имени встречается и в
# домашнем каталоге агента. Правка файла вне корня замыслом этой ветки не распоряжается.
no "SC-AK-92 — чужой корень со словом из образца" rt_is_app_code /elsewhere/projects/x/a.ts
no "SC-AK-92 — домашний каталог агента" rt_is_app_code /home/agent/apps/notes.md
ok "путь от корня дерева, без ведущей косой" rt_is_app_code apps/site/src/main.ts

# --- форма имени ветки ------------------------------------------------------------------------
ok "ветка: ключ, номер и хвост" rt_task_branch_ok RT-12-guest-token
ok "ветка: голый номер" rt_task_branch_ok 12-guest-token
ok "ветка: приставка рода правки" rt_task_branch_ok fix/12-guest-token
no "ветка: без номера" rt_task_branch_ok probe-idea
no "ветка: заглавные в хвосте" rt_task_branch_ok RT-12-GuestToken
no "ветка: хвоста нет вовсе" rt_task_branch_ok RT-12
no "ветка: незнакомая приставка" rt_task_branch_ok hotfix/12-x

# --- пары документов ----------------------------------------------------------------------------
report "пара: контракт и спек" "$(rt_docs_pair_for a/x.proto)" 'docs/specs/.*/spec\.md'
report "пара: гард и его сценарии" "$(rt_docs_pair_for .claude/hooks/x.sh)" '.claude/hooks/tests/.*'
# Тест — не описание кода: он его проверяет, и пары у него нет.
report "пара: у спеки её нет" "$(rt_docs_pair_for a/x.spec.ts)" ''

# --- запускатель пакетов --------------------------------------------------------------------------
# По локфайлу, а не по договорённости: деревья с pnpm и с npm лежат в одной мастерской.
printf '' > "$TREE/pnpm-lock.yaml"
report "запускатель: pnpm по локфайлу" "$(rt_runner)" 'pnpm exec'
rm -f "$TREE/pnpm-lock.yaml"
printf '' > "$TREE/yarn.lock"
report "запускатель: yarn по локфайлу" "$(rt_runner)" 'yarn'
rm -f "$TREE/yarn.lock"
report "запускатель: npx, когда локфайла нет" "$(rt_runner)" 'npx'

# --- чем линтуется файл ------------------------------------------------------------------------------
# Путь подставляется в напечатанную команду: хук исполняет её вычислением строки, и позиционный
# параметр разрешился бы в параметр самого хука, то есть в пустоту.
report "линтер стилей знает свой файл" "$(rt_lint_for a/x.scss | grep -c 'a/x.scss')" 1
report "линтер кода знает свой файл" "$(rt_lint_for a/x.ts | grep -c 'a/x.ts')" 1
report "линтера на неизвестное расширение нет" "$(rt_lint_for a/x.bin)" ''

# --- надстройка зовёт умолчание обратно -----------------------------------------------------------------
# Главное свойство обоих умолчаний: дерево объявляет функцию заново, называет своё и передаёт
# остальное вниз. Без этого надстройка обязана была бы повторить всё умолчание целиком.
rt_is_app_code() {
    case "$1" in
        */generated/*) return 1 ;;
        *) rt_is_app_code_default "$@" ;;
    esac
}
no "надстройка сузила умолчание" rt_is_app_code "$TREE/libs/site/x/generated/a.ts"
ok "и остальное отдала вниз" rt_is_app_code "$TREE/libs/site/x/ui/a.ts"

# --- карта гейта -------------------------------------------------------------------------------------
report "карта: правило по роду файла" "$(skill_for edit /r/libs/x/a.component.ts '')" component-structure
# Карта судит путь и только его: правило, вступающее от текста правки, приходит слоем поверх
# доменного — `hooks/skill-gate-layers.sh`, — и в карте его нет вовсе.
report "карта: судит путь, а не текст правки" "$(skill_for edit /r/libs/x/a.service.ts 'localStorage.getItem("x")' | tr '\n' ' ')" 'angular-patterns '
# Текст правила устроен как спек, и правило под него есть; остальное хозяйство агента — нет.
report "карта: правило и паттерн судятся как спек" "$(skill_for edit /r/.claude/skills/x/SKILL.md '')" spec-driven
report "карта: правила на прочие файлы агента нет" "$(skill_for edit /r/.claude/agents/qa.md '')" ''
# Разложенный текст на месте не правится — правится надстройка над ним, и предмет у неё тот же.
# Пока карта её не знала, разделы законов и правил переписывались без единого требования.
report "карта: надстройка над законом" "$(skill_for edit /r/.claude/rt-kit/overrides/laws/delivery.md '')" spec-driven
report "карта: надстройка над правилом" "$(skill_for edit /r/.claude/rt-kit/overrides/rules/task-flow.md '')" spec-driven
report "карта: прочая надстройка судится по роду файла" "$(skill_for edit /r/.claude/rt-kit/overrides/docs/GLOSSARY.md '')" doc-style
report "карта: конфиг линтера кода" "$(skill_for edit /r/eslint.config.mjs '')" typescript-conventions
report "карта: конфиг линтера стилей" "$(skill_for edit /r/stylelint.config.js '')" styling-bem
report "карта: проверка повторов требует одно правило" "$(skill_for edit /r/tools/check-dupes.mjs '')" shared-code
report "карта: правило по команде" "$(skill_for bash 'git push origin x' '')" git-workflow
report "карта: команда без правила" "$(skill_for bash 'ls -la' '')" ''
# Упоминание команды командой не является: пока карта судила по подстроке, гейт отбивал строку о
# коммите в теле самого коммита и поиск по истории.
report "SC-AK-109 — упоминание команды вызовом не считается" "$(skill_for bash 'echo "потом git commit -m x"' '')" ''
report "карта: вызов после разделителя" "$(skill_for bash 'cd /tmp && git commit -m x' '')" git-workflow
report "карта: заведение ветки" "$(skill_for bash 'git checkout -b RT-9-x' '')" git-workflow
report "карта: заведение ветки вторым именем команды" "$(skill_for bash 'git switch -c RT-9-x' '')" git-workflow
report "карта: заведение задачи" "$(skill_for bash 'npm run task:new -- --title x' '')" git-workflow
report "карта: заведение отчёта" "$(skill_for bash 'gh pr create --fill' '')" git-workflow
# Правка тела отчёта ловится двумя признаками сразу: одного слова о заявке мало — оно попадает в
# строку любой команды, которая о ней пишет.
report "карта: правка тела отчёта" "$(skill_for bash 'gh api -X PATCH repos/o/r/pulls/12 -f body=x' '')" git-workflow
report "карта: чтение отчёта тем же клиентом" "$(skill_for bash 'gh api repos/o/r/pulls/12' '')" ''
# Слияние отчёта требует два правила: поставку и разбор папки задачи — она разбирается тем же
# отчётом, потому что после слияния отвечать за неё уже некому.
report "SC-AK-110 — слияние отчёта тянет и ведение работы" \
    "$(skill_for bash 'gh pr merge 12 --merge' '' | tr '\n' ' ')" 'git-workflow task-flow '
# Образы и реестр уносят чужое безвозвратно; команды чтения остаются вне гейта — ими нехватку
# места и разбирают.
report "карта: сборка образа" "$(skill_for bash 'docker build -t x .' '')" git-workflow
report "карта: общая чистка" "$(skill_for bash 'docker system prune -af' '')" git-workflow
report "карта: перечисление контейнеров" "$(skill_for bash 'docker ps -a' '')" ''
# Обращение к поднятому приложению: нужны оба признака — вызов клиента И адрес. Одного адреса
# мало, он попадает в строку любой команды, которая о нём пишет.
report "карта: запрос к поднятому приложению" "$(skill_for bash 'curl -s http://localhost:4200/ru/' '')" browser-verification
report "карта: адрес в тексте без вызова" "$(skill_for bash 'echo http://localhost:4200 >> notes.md' '')" ''
# Проверка через браузер — единственная область, где правило нужно под инструмент, а не под файл.
report "SC-AK-111 — правило под инструмент браузера" "$(skill_for browser mcp__claude-in-chrome__navigate '')" browser-verification
# Проверка исполняет утверждения своего правила, и признаки, по которым она судит, объявлены у
# него в привязке: правя признак, второе место открывают рядом.
report "карта: сверка спеков" "$(skill_for edit /r/tools/check-specs.mjs '')" spec-driven
report "карта: сверка длины файла" "$(skill_for edit /r/tools/check-file-size.mjs '')" doc-style
report "карта: сверка оформления" "$(skill_for edit /r/tools/check-styles.mjs '')" styling-bem
report "карта: своё правило линтера кода" "$(skill_for edit /r/tools/eslint-rules/no-x.mjs '')" typescript-conventions
# Поставка судит и то, что приезжает на прод, и то, чем оно туда едет.
report "карта: файл конвейера" "$(skill_for edit /r/.github/workflows/deploy.yml '')" git-workflow
report "карта: состав образа" "$(skill_for edit /r/deploy/api.Dockerfile '')" git-workflow
report "карта: миграция хранилища" "$(skill_for edit /r/prisma/migrations/20260101_x/migration.sql '')" git-workflow
# Сквозная спека по имени файла от обычного модуля не отличается.
report "карта: сквозная спека" "$(skill_for edit /r/apps/web-e2e/src/x.ts '')" testing

# --- что гоняется перед пушем -------------------------------------------------------------------
# Заведённая проверка встаёт в гейт пуша, а не только в общий прогон, который никто не зовёт сам.
# Печатается по тому, что лежит на диске: проверки, которой в дереве нет, гейт не зовёт.
report "гейт пуша: сборка идёт наравне с линтом и спеками" \
    "$(rt_push_checks origin/main | grep -c 'nx affected -t lint test build --base=origin/main')" 1
report "гейт пуша: без удалённого гоняется всё" \
    "$(rt_push_checks '' | grep -c 'run-many -t lint test build --all')" 1
report "SC-AK-113 — проверки, которой в дереве нет, гейт не зовёт" "$(rt_push_checks '' | grep -c 'check-specs')" 0
mkdir -p "$TREE/tools" "$TREE/.claude/hooks/tests"
printf '' > "$TREE/tools/check-specs.mjs"
printf '#!/bin/sh\nexit 0\n' > "$TREE/.claude/hooks/tests/run.sh"
chmod +x "$TREE/.claude/hooks/tests/run.sh"
report "SC-AK-112 — разложенная проверка зовётся гейтом пуша" "$(rt_push_checks '' | grep -c 'node tools/check-specs.mjs')" 1
report "SC-AK-112 — сценарии гардов зовутся гейтом пуша" "$(rt_push_checks '' | grep -c 'bash .claude/hooks/tests/run.sh')" 1
# SC-AK-93. Заведение рабочего дерева — работа с поставкой: свежее дерево получает только
# индекс, а ключи, разрешения и зависимости переносятся руками по списку из компаньона.
report "SC-AK-93 — заведение рабочего дерева" "$(skill_for bash 'git worktree add --detach ../wt origin/main' '')" git-workflow
report "SC-AK-93 — снятие рабочего дерева" "$(skill_for bash 'git worktree remove ../wt' '')" git-workflow
# Тексты и спеки читают ту же строку, что и код, и правило среды исполнения к ним не относится.
report "карта: текст правки в документе правила не поднимает" "$(skill_for edit /r/docs/x.md 'window.open()')" doc-style

suite_result "умолчания"
