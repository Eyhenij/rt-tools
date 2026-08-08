#!/usr/bin/env bash
# rt-kit v0.3.0 · defaults/gate-map.sh · 79ac768f8c1d · правится надстройкой, не здесь
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

# Правила, которые вступают не от рода файла, а от того, что в него пишут.
#
# Обращение к среде исполнения приходит в обычный сервис, а число-настройка и перечисление —
# в обычный класс: по имени файла ни то ни другое не видно, и правило, требуемое только по
# расширению, здесь молчало бы.
skill_for_written() {
    target="$1"
    written="$2"

    [ -z "$written" ] && return 0

    case "$target" in
        *.spec.ts | */docs/* | *.md) return 0 ;;
    esac

    printf '%s' "$written" | grep -qE '(globalThis|window\.|document\.defaultView|PLATFORM_ID|isPlatformBrowser|localStorage|sessionStorage)' \
        && printf '%s\n' 'platform-access'

    case "$target" in
        *.ts)
            printf '%s' "$written" | grep -qE '^[[:space:]]*(export[[:space:]]+)?(const[[:space:]]+[A-Z][A-Z0-9_]*[[:space:]]*(:[^=]*)?=[[:space:]]*-?[0-9]|enum[[:space:]])' \
                && printf '%s\n' 'shared-code'
            ;;
    esac

    return 0
}

skill_for_default() {
    kind="$1"
    target="$2"
    written="$3"

    case "$kind" in
        edit)
            case "$target" in
                # Файлы самого агента правятся без правила: правило на них — это оно само.
                */.claude/skills/* | */.claude/agents/* | */.claude/commands/* | */.claude/workflows/*) return 0 ;;

                # Тексты проекта. Спек держит устройство домена, закон — договорённость,
                # и оба правятся не так, как правится код.
                */docs/specs/*) printf '%s\n' 'spec-driven' ;;
                */docs/tasks/*) printf '%s\n' 'task-flow' ;;
                */docs/constitution/*) printf '%s\n' 'spec-driven' ;;
                *.md) printf '%s\n' 'doc-style' ;;

                # Поставка: состав зависимостей — это то, что приезжает на прод.
                */package.json | */pnpm-lock.yaml | */pnpm-workspace.yaml | */package-lock.json) printf '%s\n' 'dependencies' ;;

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
            skill_for_written "$target" "$written"
            ;;
        bash)
            case "$target" in
                *git\ commit* | *git\ push* | *git\ merge* | *git\ rebase* | *git\ cherry-pick* | *gh\ pr\ * | *glab\ mr\ * | *az\ repos\ *)
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
