#!/usr/bin/env bash
# rt-hook: PreCompact .*
# Требует: hooks/profile-check.sh
# Передача захода пишется перед сжатием контекста, а не рукой исполнителя.
#
# Заход кончается двумя способами: исполнитель доводит работу до точки и пишет передачу сам —
# либо контекст переполняется, и сжатие приходит от инструмента. Второй случай раньше терял
# передачу целиком: писать её в этот момент уже некому, а после сжатия пересказывать нечего.
# Ночью, когда напомнить некому, так кончается каждый заход.
#
# Хук собирает передачу из того, что лежит на диске: ход работы даёт состояние и следующий шаг,
# дерево — ветку, незакоммиченное и коммиты сверх главной. Ничего от себя он не добавляет:
# передача пересказывает записанное, а не заменяет его.
#
# Написанное руками не затирается молча: файл один, и последняя запись побеждает. Исполнитель,
# закрывающий заход по правилу, пишет поверх — его передача полнее, потому что он знает то,
# чего на диске нет.
#
# FAIL-OPEN: нет разборщика, пустой ввод, не репозиторий, нет каталога передачи — хук выходит
# нулём и молчит. Сжатие он не отбивает никогда: остановленное сжатие оставит заход без места.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

input="$(cat 2>/dev/null)"
[ -z "$input" ] && exit 0

command -v jq >/dev/null 2>&1 || exit 0

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" \
    "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

workdir="$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

branch="$(git branch --show-current 2>/dev/null)"
[ -z "$branch" ] && exit 0

root="$(git rev-parse --show-toplevel 2>/dev/null)"
[ -z "$root" ] && exit 0

handoff_dir="${RT_HANDOFF_DIR:-.claude/handoff}"
tasks_dir="${RT_TASKS_DIR:-docs/tasks}"

mkdir -p "$root/$handoff_dir" 2>/dev/null || exit 0
[ -d "$root/$handoff_dir" ] || exit 0

# Ручное сжатие от автоматического отличается одним: при ручном исполнитель у клавиатуры и
# может дописать передачу сам. Пишется она в обоих случаях — заход, сжатый руками, теряет
# контекст ровно так же.
trigger="$(printf '%s' "$input" | jq -r '.trigger // "auto"' 2>/dev/null)"
[ -z "$trigger" ] && trigger='auto'

progress="$root/$tasks_dir/$branch/progress.md"

# Строка раздела «Где стоим» по её названию. Пусто — работа идёт вне папки задачи, и выдумывать
# за неё состояние нельзя: в передаче тогда стоит то, что известно дереву.
line_of() {
    [ -f "$progress" ] || return 0
    sed -n "s/^[[:space:]]*[-*][[:space:]]*\*\*$1:\*\*[[:space:]]*\(.*\)/\1/p" "$progress" 2>/dev/null | head -1
}

state="$(line_of 'Состояние')"
stage="$(line_of 'Этап')"
next_step="$(line_of 'Следующий шаг')"
pull="$(line_of 'PR')"

uncommitted="$(git status --short 2>/dev/null | head -20)"
[ -z "$uncommitted" ] && uncommitted='нет'

ahead="$(git log --oneline origin/main..HEAD 2>/dev/null | head -20)"
[ -z "$ahead" ] && ahead='нет коммитов сверх главной'

target="$root/$handoff_dir/$branch.md"

{
    printf '# Передача захода — сжатие контекста (%s)\n\n' "$trigger"
    printf '**Рабочее дерево:** %s\n' "$root"
    printf '**Ветка:** %s\n\n' "$branch"

    if [ -n "$state" ]; then
        printf '## Где стоим\n\n'
        printf -- '- **Состояние:** %s\n' "$state"
        [ -n "$stage" ] && printf -- '- **Этап:** %s\n' "$stage"
        [ -n "$next_step" ] && printf -- '- **Следующий шаг:** %s\n' "$next_step"
        [ -n "$pull" ] && printf -- '- **PR:** %s\n' "$pull"
        printf '\nХод работы целиком — `%s/%s/progress.md`; замысел рядом с ним.\n\n' "$tasks_dir" "$branch"
    else
        printf '## Где стоим\n\nПапки задачи у этой ветки нет: состояние работы взять неоткуда.\n\n'
    fi

    printf '## Незакоммиченное\n\n```\n%s\n```\n\n' "$uncommitted"
    printf '## Коммиты сверх главной\n\n```\n%s\n```\n\n' "$ahead"
    printf 'Написана хуком перед сжатием контекста. Всё, что здесь стоит, проверяется деревом:\n'
    printf 'передача пересказывает записанное и описывает минуту, когда её собрали.\n'
} > "$target" 2>/dev/null

exit 0
