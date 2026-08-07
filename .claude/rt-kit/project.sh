#!/usr/bin/env bash
# Профиль этого дерева: что здесь чем зовётся и какими командами проверяется.
#
# Живёт в проекте, а не в пакете: механизм у сторожевых хуков общий, а команды, порты и пары
# «правка — её документ» у каждого дерева свои. Пакет везёт хуки, проект — этот файл.
#
# Каждая функция вправе промолчать. Молчание значит «правила на это нет», и хук пропускает:
# пустой профиль оставляет хуки безвредными, а не отбивающими наугад.

# Где поднимаются витрины. Приложения этот репозиторий не держит вовсе: он публикует пакеты,
# а живьём смотрят на витрины.
RT_STANDS='витрина ui-kit http://localhost:6006, витрина ui-kit-v2 http://localhost:6007'

# Команды, которые обязаны пройти перед пушем. По одной на строку; первая упавшая отбивает пуш.
# Линтер стилей отдельной строкой: линтер кода файлы стилей не читает вовсе.
#
# Два файла первого кита выведены из прогона: в них 35 нарушений запрета сырых значений,
# накопленных до заведения правила, и за ними стоит задача #282. Без исключения гард отбивал бы
# каждый пуш на долге, которого правка не касалась; строки снимаются вместе с закрытием задачи.
rt_push_checks() {
    cat <<'EOF'
pnpm exec nx affected -t lint typecheck test --parallel
pnpm exec stylelint "projects/**/*.scss" --ignore-pattern "projects/ui-kit/src/lib/ui-kit/icon/rtui-icon.component.scss" --ignore-pattern "projects/ui-kit/src/lib/ui-kit/buttons/unified-button/rtui-button.component.scss"
EOF
}

# Какой документ обязан ехать тем же коммитом, что и этот файл. Печатает образец пути или молчит.
rt_docs_pair_for() {
    case "$1" in
        # Спека — не описание компонента: она его проверяет.
        *.spec.ts) return 0 ;;
        # Описание компонента второго кита лежит рядом с ним и правится тем же движением.
        projects/ui-kit-v2/src/lib/*/*/*.component.ts)
            printf '%s' "${1%/*}/CONTEXT\.md" ;;
        # Набор токенов оформления описан в одном документе, и новый токен без строки в нём
        # найти нечем: имена токенов нигде больше не перечислены.
        projects/ui-kit/src/styles/base/_tokens.scss | projects/ui-kit/src/styles/base/_color-scheme.scss)
            printf '%s' 'projects/ui-kit/src/styles/TOKENS\.md' ;;
    esac
}

# Чем линтуется этот файл сразу после правки. Печатает команду или молчит.
#
# Путь подставляется здесь, а не оставляется позиционным параметром: хук исполняет напечатанное
# вычислением строки, и `$1` в нём разрешился бы в параметр самого хука, то есть в пустоту.
rt_lint_for() {
    case "$1" in
        *.scss) printf 'pnpm exec stylelint "%s"' "$1" ;;
        *.ts | *.html) printf 'pnpm exec eslint "%s"' "$1" ;;
    esac
}

# Имя ветки, с которой разрешено открывать PR: род правки, номер задачи, краткое имя.
rt_task_branch_ok() {
    printf '%s' "$1" | grep -qE '^(feat|fix|refactor|docs|chore|style|perf|test|build|ci)/[0-9]+-'
}

# Что в этом дереве считается переизобретением. По строке «образец<таб>чем заменить».
# Образцы узкие намеренно: гард сверяет только НОВЫЙ текст, и широкий образец отбивал бы
# правку, которая ничего нового не заводит.
rt_reinvented_in() {
    case "$1" in
        *.ts)
            printf '%s\t%s\n' '@(Input|Output|ViewChild|ViewChildren|ContentChild)\(' 'input(), output(), viewChild(), contentChild() — реактивный вход и выход'
            printf '%s\t%s\n' "from '(vitest|@vitest)" 'jest: describe/it/expect из @types/jest'
            printf '%s\t%s\n' "from '\.\./\.\./\.\./(core|store|utils)" 'алиас пакета: @rt-tools/core, @rt-tools/store, @rt-tools/utils'
            ;;
        *.scss)
            printf '%s\t%s\n' '#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?\b' 'токен оформления: var(--rt-…), список — в projects/ui-kit/src/styles/TOKENS.md'
            ;;
        *.html)
            printf '%s\t%s\n' '\[ngClass\]|\[class\.' 'директивы класса: rtBlock, rtElem, [rtMod]'
            ;;
    esac

    case "$1" in
        */projects/ui-kit-v2/*.scss)
            printf '%s\t%s\n' ':host' 'класс блока: .rt-<блок>, а под совпадением имён — селектор по имени элемента'
            ;;
    esac
}
