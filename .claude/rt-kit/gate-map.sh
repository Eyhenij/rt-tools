#!/usr/bin/env bash
# Карта «что правится — какое правило» этого дерева. Её читает хук гейта правил.
#
# Живёт в проекте, а не в пакете: имена каталогов, расширения и команды поставки у каждого
# дерева свои. Пакет везёт механизм, проект — карту.
#
# Функция печатает ИМЯ ПРАВИЛА или молчит. Молчание — «правила на это нет», и гейт пропускает.
#
# Порядок веток решает: первое совпадение выигрывает, поэтому частное идёт раньше общего.
# Файл витрины и файл спеки — не файлы компонента, и обе ветки обязаны стоять до общей ветки
# расширения.

skill_for() {
    kind="$1"
    target="$2"

    case "$kind" in
        edit)
            case "$target" in
                # Файлы самого агента правятся без правила: правило на них — это оно само.
                */.claude/*) return 0 ;;

                # Витрина: у неё своё правило этого дерева, пакет такого не везёт.
                *.stories.ts | */stories/*.ts | */strories/*.ts | *.mdx) printf '%s' 'rt-tools-storybook' ;;

                *.spec.ts) printf '%s' 'testing' ;;
                *.component.ts | *.component.html) printf '%s' 'component-structure' ;;
                *.scss) printf '%s' 'styling-bem' ;;

                # Барели и манифесты — это опубликованная поверхность и границы между либами.
                */public-api.ts | */index.ts | */project.json | */ng-package.json) printf '%s' 'lib-layers' ;;

                # Классы каркаса: состояние, потоки и место подписки.
                *.service.ts | *.directive.ts | *.pipe.ts | *.store.ts | *.guard.ts | *.interceptor.ts) printf '%s' 'angular-patterns' ;;

                *.ts) printf '%s' 'typescript-conventions' ;;
                *.md) printf '%s' 'doc-style' ;;
            esac
            ;;
        bash)
            case "$target" in
                *git\ commit* | *git\ push* | *gh\ pr\ create* | *gh\ pr\ merge*) printf '%s' 'git-workflow' ;;
            esac
            ;;
    esac

    return 0
}
