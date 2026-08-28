#!/usr/bin/env bash
# Сценарии сверки надстроек профиля с таблицами компаньонов.
#
# Проверяется механика: что считается замещённым, где ищется имя и когда сверять нечего. Дерево
# для сверки собирается здесь же — своё дерево проверка судила бы вместо фикстуры.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: надстройки профиля"

TREE="$(mktemp -d)"
mkdir -p "$TREE/tools" "$TREE/.claude/rt-kit/defaults" "$TREE/.claude/skills/git-workflow"
cp "$CHECKS/check-profile-drift.mjs" "$TREE/tools/"

cleanup() { rm -rf "$TREE"; }
trap cleanup EXIT

defaults() {
    {
        printf '#!/usr/bin/env bash\n'
        printf 'RT_MAIN_BRANCH="${RT_MAIN_BRANCH:-main}"\n'
        printf 'RT_TASK_TITLE_RE="${RT_TASK_TITLE_RE:-пакетная форма}"\n'
        printf 'RT_STANDS="${RT_STANDS:-}"\n'
    } > "$TREE/.claude/rt-kit/defaults/project.sh"
}

profile() {
    {
        printf '#!/usr/bin/env bash\n'
        for line in "$@"; do
            printf '%s\n' "$line"
        done
    } > "$TREE/.claude/rt-kit/project.sh"
}

companion() {
    {
        printf '# git-workflow — как это устроено здесь\n\n'
        for line in "$@"; do
            printf -- '- %s\n' "$line"
        done
    } > "$TREE/.claude/skills/git-workflow/implementation.md"
}

# Что сказала проверка и с каким кодом.
said() {
    ( cd "$TREE" && node tools/check-profile-drift.mjs 2>&1 )
}
code() {
    ( cd "$TREE" && node tools/check-profile-drift.mjs >/dev/null 2>&1; echo $? )
}

defaults

# SC-AK-765. Замещённое, которого компаньон не называет, — расхождение.
profile "RT_TASK_TITLE_RE='своя форма'"
companion 'Главная ветка здесь — `main`.'
report "SC-AK-765 — замещённое без строки компаньона отбивает" "$(code)" 1
case "$(said)" in
    *RT_TASK_TITLE_RE*) report "SC-AK-765 — расхождение названо по имени" да да ;;
    *) report "SC-AK-765 — расхождение названо по имени" "$(said)" да ;;
esac

# SC-AK-766. То же замещение, названное компаньоном, расхождением не считается.
companion 'Форма заголовка заявки замещена: `.claude/rt-kit/project.sh:RT_TASK_TITLE_RE`.'
report "SC-AK-766 — названное компаньоном проходит" "$(code)" 0

# Имя ищется по всем компаньонам дерева, а не по одному: правило у надстройки бывает своё.
mkdir -p "$TREE/.claude/skills/task-flow"
companion 'Главная ветка здесь — `main`.'
printf '# task-flow\n\n- Форма заголовка: `RT_TASK_TITLE_RE`.\n' > "$TREE/.claude/skills/task-flow/implementation.md"
report "SC-AK-766 — имя ищется во всех компаньонах" "$(code)" 0
rm -rf "$TREE/.claude/skills/task-flow"

# SC-AK-767. Строка профиля, повторяющая умолчание пакета, замещением не бывает: о дереве она
# ничего нового не говорит, и требовать её в компаньоне значило бы пересказывать пакет.
profile "RT_MAIN_BRANCH='main'"
companion 'Главная ветка здесь — `main`.'
report "SC-AK-767 — повтор умолчания расхождением не считается" "$(code)" 0
case "$(said)" in
    *'замещено 0'*) report "SC-AK-767 — и в замещённые не попадает" да да ;;
    *) report "SC-AK-767 — и в замещённые не попадает" "$(said)" да ;;
esac

# Та же переменная с другим значением — уже замещение.
profile "RT_MAIN_BRANCH='master'"
report "SC-AK-767 — другое значение той же переменной замещает" "$(code)" 1

# SC-AK-768. Сверять нечего — проверка молчит и работу не держит.
profile "RT_MAIN_BRANCH='master'"
rm -f "$TREE/.claude/rt-kit/defaults/project.sh"
report "SC-AK-768 — без умолчаний пакета проверка молчит" "$(code)" 0
defaults

mv "$TREE/.claude/skills" "$TREE/.claude/skills-off"
report "SC-AK-768 — без компаньонов проверка молчит" "$(code)" 0
mv "$TREE/.claude/skills-off" "$TREE/.claude/skills"

rm -f "$TREE/.claude/rt-kit/project.sh"
report "SC-AK-768 — без профиля дерева проверка молчит" "$(code)" 0

suite_result "надстройки профиля"
