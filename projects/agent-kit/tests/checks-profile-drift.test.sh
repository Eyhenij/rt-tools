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

# Набор гейта пуша. Умолчание пакета зовёт проверки, надстройка дерева вправе объявить функцию
# заново — и выкушенная так проверка ничем не отличима от отсутствующей. Набор собирается
# вызовом, а не чтением текста: он смотрит на дерево, и прочитанный текстом назвал бы командами
# то, чего в этом дереве нет.
defaults_with_gate() {
    {
        printf '#!/usr/bin/env bash\n'
        printf 'RT_MAIN_BRANCH="${RT_MAIN_BRANCH:-main}"\n'
        printf 'RT_TASK_TITLE_RE="${RT_TASK_TITLE_RE:-пакетная форма}"\n'
        printf 'RT_STANDS="${RT_STANDS:-}"\n'
        printf 'rt_push_checks_default() {\n'
        printf '    printf "%%s\\n" "node tools/check-specs.mjs"\n'
        printf '    printf "%%s\\n" "node tools/check-dupes.mjs"\n'
        printf '    printf "%%s\\n" "node tools/check-glossary.mjs"\n'
        printf '}\n'
        printf 'rt_push_checks() { rt_push_checks_default "$@"; }\n'
    } > "$TREE/.claude/rt-kit/defaults/project.sh"
}

defaults_with_gate
companion 'Главная ветка здесь — `main`.'

# SC-AK-782. Проверка, выкушенная надстройкой из набора, называется по имени и отбивает.
profile "rt_push_checks() { rt_push_checks_default \"\$1\" | grep -v check-glossary; }"
report "SC-AK-782 — выкушенная проверка отбивает" "$(code)" 1
case "$(said)" in
    *check-glossary.mjs*) report "SC-AK-782 — выкушенная названа по имени" да да ;;
    *) report "SC-AK-782 — выкушенная названа по имени" "$(said)" да ;;
esac

# SC-AK-783. Набор, который дерево не трогало, расхождением не бывает.
profile "RT_MAIN_BRANCH='main'"
report "SC-AK-783 — нетронутый набор проходит" "$(code)" 0

# SC-AK-784. Та же проверка, позванная другим запускателем и с другим доводом, — не пропажа:
# сверяется имя файла, а не строка команды целиком.
profile "rt_push_checks() { printf '%s\n' 'node tools/check-specs.mjs'; printf '%s\n' 'pnpm exec node tools/check-dupes.mjs --strict'; printf '%s\n' 'node tools/check-glossary.mjs'; }"
report "SC-AK-784 — другой запускатель пропажей не считается" "$(code)" 0

# SC-AK-785. Отказ в пользу работы: умолчание набора не объявляет — сверять нечего, и остальная
# сверка идёт своим делом.
defaults
profile "rt_push_checks() { printf '%s\n' 'node tools/check-specs.mjs'; }"
companion 'Главная ветка здесь — `main`.'
report "SC-AK-785 — без функции набора в умолчании проверка молчит" "$(code)" 0

suite_result "надстройки профиля"
