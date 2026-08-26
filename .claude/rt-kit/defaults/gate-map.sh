#!/usr/bin/env bash
# rt-kit v0.15.0 · defaults/gate-map.sh · 32aac0f6af22 · правится надстройкой, не здесь
# Карта «что правится — какое правило». Умолчание пакета: настоящие пути, а не образцы.
#
# Деревья этой мастерской устроены одинаково — Nx, `apps/` и `libs/`, те же расширения и те же
# имена каталогов, — поэтому карту везёт пакет, а не пишет каждый проект заново. Пятнадцать её
# редакций расходились бы молча, и заметить расхождение можно было бы только по тому, что гейт
# перестал требовать правило там, где оно есть.
#
# Своё дерево дописывает надстройкой — `.claude/rt-kit/gate-map.sh`. Она грузится второй,
# объявляет `skill_for` заново и зовёт отсюда `skill_for_default` для всего, чего не назвала.
#
# Функция печатает ИМЯ ПРАВИЛА или молчит. Молчание — «правила на это нет», и гейт пропускает.
# Имён может быть несколько, по одному в строке: первое — доменное правило файла, следующие —
# те, что действуют вторым слоем. Гейт потребует первое незагруженное.
#
# Порядок веток решает: первое совпадение выигрывает, поэтому частное идёт раньше общего.

# Правила, вступающие не от рода файла, а от того, что в него пишут, здесь не выбираются:
# они приходят слоем поверх доменного — `hooks/skill-gate-layers.sh`. Карта судит путь, слой
# судит текст, и оба зовутся из гейта в одной оболочке.

# Команда считается ВЫЗОВОМ, только когда стоит в начале строки или сразу за разделителем.
# Совпадение по подстроке ловит любое УПОМИНАНИЕ: строка о коммите в теле самого коммита и поиск
# по истории отбивались как настоящий коммит.
#
# `([A-Za-z_]…=…[[:space:]]+)*` — переменные окружения перед вызовом: адрес хранилища ставят
# приставкой самой команды, и без этого куска вызов не опознавался вовсе. `(npx…)?` — запуск
# через раннер пакетов, `([^[:space:]]*/)?` — путь до исполняемого файла. Многострочную команду
# поиск разбирает построчно, поэтому начало строки — начало каждой.
rt_gate_invokes() {
    printf '%s\n' "$1" \
        | grep -qE "(^|[;&|(])[[:space:]]*([A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*[[:space:]]+)*((npx|pnpm|yarn|bun|npm)([[:space:]]+(exec|run|dlx))?[[:space:]]+)?([^[:space:]]*/)?$2([[:space:]]|$)"
}

skill_for_default() {
    kind="$1"
    target="$2"
    written="$3"

    case "$kind" in
        edit)
            case "$target" in
                # Надстройка над разложенным текстом — правка того же текста: путь другой, а
                # предмет тот же. Ветка стоит первой, потому что путь надстройки кончается тем
                # же именем файла, что и разложенная копия, и ветки ниже разобрали бы её по
                # расширению — то есть правилом формулировок вместо правила устройства.
                */.claude/rt-kit/overrides/laws/* | */.claude/rt-kit/overrides/rules/* | */.claude/rt-kit/overrides/patterns/*)
                    printf '%s\n' 'spec-driven' ;;

                # Правило и паттерн — такая же договорённость, как спек: обязательные разделы,
                # утверждение с привязкой, граница между статьёй закона и утверждением правила.
                # Ветка стоит раньше общего исключения и раньше `*.md`: под исключением текст
                # правила переписывался без единого требования, а `*.md` увёл бы его в правило
                # формулировок — оно про слова, не про устройство.
                */.claude/skills/*.md) printf '%s\n' 'spec-driven' ;;

                # Остальные файлы самого агента правятся без правила: правило на них — это оно
                # само.
                */.claude/skills/* | */.claude/agents/* | */.claude/commands/* | */.claude/workflows/*) return 0 ;;

                # Тексты проекта. Спек держит устройство домена, закон — договорённость,
                # и оба правятся не так, как правится код.
                */docs/specs/*) printf '%s\n' 'spec-driven' ;;
                */docs/tasks/*) printf '%s\n' 'task-flow' ;;
                */docs/constitution/*) printf '%s\n' 'spec-driven' ;;
                *.md) printf '%s\n' 'doc-style' ;;

                # Конфиги линтеров — то же самое, только запреты в них исполняемые: они и есть
                # исполнение правил про типы и про оформление, а комментарии в них пересказывают
                # эти правила поимённо. Правились без единого правила под рукой.
                */eslint.config.mjs | */eslint.config.js) printf '%s\n' 'typescript-conventions' ;;
                */stylelint.config.js | */stylelint.config.mjs) printf '%s\n' 'styling-bem' ;;

                # Проверка повторов исполняет утверждения правила об общем коде и требуется
                # только им: правило о раскладке либ говорит про неё одной строкой с отсылкой,
                # а привязки её признаков стоят при общем коде. Два отказа подряд на правку двух
                # строк комментария стоят захода, а второе прочитанное правило не пригождается.
                */tools/check-dupes.mjs | */tools/dupes-allowlist.json) printf '%s\n' 'shared-code' ;;

                # Остальные проверки — то же самое: проверка исполняет утверждения своего
                # правила, и признаки, по которым она судит, объявлены у него в привязке. Правя
                # признак в проверке, второе место открывают рядом — иначе они расходятся молча,
                # и проверка числит отказом то, что правило разрешает.
                */check-specs.mjs) printf '%s\n' 'spec-driven' ;;
                */check-doc-paths.mjs | */doc-paths-allowlist.json | */check-file-size.mjs)
                    printf '%s\n' 'doc-style' ;;
                */check-styles.mjs | */styles-allowlist.json | */stylelint-rules/*)
                    printf '%s\n' 'styling-bem' ;;
                */check-lib-layers.mjs | */lib-layers-allowlist.json) printf '%s\n' 'lib-layers' ;;
                */check-reuse.mjs | */reuse-allowlist.json) printf '%s\n' 'reuse-first' ;;
                */check-board.mjs | */board.mjs | */task-new.mjs | */check-schema-drift.mjs)
                    printf '%s\n' 'git-workflow' ;;
                # Своё правило линтера кода пишется по тем же соглашениям, что и код под ним.
                */eslint-rules/*) printf '%s\n' 'typescript-conventions' ;;

                # Схема хранилища и её миграции: порядок каталогов лексикографический, а метку
                # времени ставит инструмент в момент заведения — цепочка ломается молча и падает
                # только накатом с нуля, то есть уже после слияния. Правило живёт при поставке.
                */schema.prisma | */prisma/migrations/*) printf '%s\n' 'git-workflow' ;;
                # Конвейер и образ: проверки решают, что вообще гоняется до слияния, а образ —
                # что приезжает на прод. И то и другое правилось без единого правила поставки.
                */.github/workflows/*.yml | */.gitlab-ci.yml | */azure-pipelines*.yml)
                    printf '%s\n' 'git-workflow' ;;
                */Dockerfile | */*.Dockerfile | */docker-compose*.yml | */docker-compose*.yaml)
                    printf '%s\n' 'git-workflow' ;;

                # Сквозная спека проверяет поднятое приложение, а не класс: по имени файла она от
                # обычного модуля не отличается, и без этой ветки уходила бы в соглашения языка.
                *-e2e/*) printf '%s\n' 'testing' ;;

                # Поставка: состав зависимостей — это то, что приезжает на прод. Правка
                # скриптов зависимостью не является, и правило про версии на неё не вступает.
                # Оговорка: удаление зависимости приходит правкой без номера версии и сюда не
                # попадает — его ловит снимок дерева, который правится тем же коммитом.
                */package.json)
                    printf '%s' "$written" | grep -qE '"(dependencies|devDependencies|peerDependencies|optionalDependencies|overrides|resolutions|packageManager)"|"[^"]+"[[:space:]]*:[[:space:]]*"[~^]?[0-9]+\.[0-9]+' \
                        && printf '%s\n' 'dependencies' ;;
                */pnpm-lock.yaml | */pnpm-workspace.yaml | */package-lock.json) printf '%s\n' 'dependencies' ;;

                # Границы между либами: манифест, алиасы, барель.
                */project.json | */tsconfig.base.json | */eslint/boundaries/* | */src/index.ts | */public-api.ts | */ng-package.json)
                    printf '%s\n' 'lib-layers' ;;

                *.spec.ts) printf '%s\n' 'testing' ;;
                *.component.ts | *.component.html) printf '%s\n' 'component-structure' ;;
                *.scss) printf '%s\n' 'styling-bem' ;;

                # Классы каркаса: состояние, потоки и место подписки. Бэкенд сюда не идёт —
                # ни компонентов, ни подписок в шаблоне у него нет.
                */libs/api/* | */apps/api/*) printf '%s\n' 'typescript-conventions' ;;
                *.store.ts | *.service.ts | *.directive.ts | *.pipe.ts | *.guard.ts | *.interceptor.ts) printf '%s\n' 'angular-patterns' ;;

                *.ts) printf '%s\n' 'typescript-conventions' ;;
            esac
            ;;
        bash)
            # Ветки идут проверкой на вызов, а не совпадением по подстроке: упоминание команды
            # командой не является, и гейт отбивал собственный текст о коммите.
            if rt_gate_invokes "$target" "git[[:space:]]+(commit|push|merge|rebase|cherry-pick)" \
                || rt_gate_invokes "$target" "git[[:space:]]+worktree[[:space:]]+(add|remove)" \
                || rt_gate_invokes "$target" "git[[:space:]]+checkout[[:space:]]+-b" \
                || rt_gate_invokes "$target" "git[[:space:]]+switch[[:space:]]+-c" \
                || rt_gate_invokes "$target" "(gh|glab)[[:space:]]+(pr|mr|issue)[[:space:]]+(create|merge|edit)" \
                || rt_gate_invokes "$target" "az[[:space:]]+(repos|boards)" \
                || rt_gate_invokes "$target" "[^[:space:]]*task:new" \
                || rt_gate_invokes "$target" "prisma[[:space:]]+(migrate|db)"; then
                printf '%s\n' 'git-workflow'
            # Правка тела PR через клиент хостинга ловится двумя признаками сразу — вызовом
            # клиента И адресом запроса: одного слова о заявке мало, оно попадает в строку любой
            # команды, которая о ней пишет. Тело PR не читает ни одна проверка, и утверждение
            # о дереве стареет в нём молча.
            elif rt_gate_invokes "$target" "(gh|glab)[[:space:]]+api" \
                && printf '%s' "$target" | grep -qE '(-X|--method)[[:space:]]+(PATCH|PUT).*(pulls|merge_requests)/[0-9]+'; then
                printf '%s\n' 'git-workflow'
            # Образы и реестр на машине владельца: там же лежат его собственные стенды и работы
            # других его веток. Снятие и чистка важнее сборки — они уносят чужое безвозвратно.
            # Команды чтения остаются вне гейта: ими нехватку места и разбирают, и требовать на
            # них правило значило бы отбивать сам приём. Поэтому общая чистка ловится с `prune`.
            elif rt_gate_invokes "$target" "docker[[:space:]]+(build|buildx|pull|push|run|compose|login|rm|rmi|stop|start|restart|image|volume|builder|network)" \
                || rt_gate_invokes "$target" "docker[[:space:]]+system[[:space:]]+prune"; then
                printf '%s\n' 'git-workflow'
            fi

            # Слияние PR — последний момент, когда папку закрытой задачи ещё можно разобрать
            # тем же PR: после слияния сверка очереди её видит, а отвечать за неё уже
            # некому. Требуется ВТОРЫМ слоем, дополнительно к правилу поставки.
            rt_gate_invokes "$target" "(gh[[:space:]]+pr|glab[[:space:]]+mr)[[:space:]]+merge" \
                && printf '%s\n' 'task-flow'

            # Обращение к поднятому приложению: врёт здесь не код, а то, что отвечает на порту.
            # Ответ сборки прошлого захода неотличим от ответа живой ветки. Нужны оба признака —
            # вызов клиента И адрес: одного адреса мало, он попадает в строку любой команды,
            # которая о нём пишет, и гейт отбивал проверку самого гейта. Порт не перечисляется:
            # свой разовый стенд поднимается на любом свободном.
            if printf '%s' "$target" | grep -qE '(localhost|127\.0\.0\.1):[0-9]{4,5}' \
                && { rt_gate_invokes "$target" curl || rt_gate_invokes "$target" wget; }; then
                printf '%s\n' 'browser-verification'
            fi
            ;;
        # Проверка через браузер — единственная область, где правило нужно не под правку файла, а
        # под инструмент: врут там не файлы, а стенд и координаты.
        browser) printf '%s\n' 'browser-verification' ;;
    esac

    return 0
}

# Без надстройки проекта карта — это умолчание. С надстройкой она объявит `skill_for` заново.
skill_for() {
    skill_for_default "$@"
}
