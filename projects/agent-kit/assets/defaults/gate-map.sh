#!/usr/bin/env bash
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


skill_for_default() {
    kind="$1"
    target="$2"
    written="$3"

    case "$kind" in
        edit)
            case "$target" in
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
            case "$target" in
                *git\ commit* | *git\ push* | *git\ merge* | *git\ rebase* | *git\ cherry-pick* | *gh\ pr\ * | *glab\ mr\ * | *az\ repos\ *)
                    printf '%s\n' 'git-workflow' ;;
                *git\ worktree\ add* | *git\ worktree\ remove*)
                    printf '%s\n' 'git-workflow' ;;
                *prisma\ migrate* | *prisma\ db\ *) printf '%s\n' 'git-workflow' ;;
                *curl\ *localhost* | *wget\ *localhost*) printf '%s\n' 'browser-verification' ;;
            esac
            ;;
    esac

    return 0
}

# Без надстройки проекта карта — это умолчание. С надстройкой она объявит `skill_for` заново.
skill_for() {
    skill_for_default "$@"
}
