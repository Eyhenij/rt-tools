#!/usr/bin/env bash
# Сценарии сверки словаря: запретное слово в дереве, слово с уточнением и выведенные каталоги.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: словарь"

# Фикстура — настоящий репозиторий: список файлов проверка берёт у системы контроля версий.
GL_TREE="$(mktemp -d)"
mkdir -p "$GL_TREE/tools" "$GL_TREE/docs/archive" "$GL_TREE/docs/tasks/RT-1-x" "$GL_TREE/docs/specs"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/check-glossary.mjs" "$GL_TREE/tools/"

printf '# Glossary\n\n## Not written here\n\n- **таска, тикет** — задача\n- **спека (о тесте)** — тест\n' \
    > "$GL_TREE/docs/GLOSSARY.md"

git -C "$GL_TREE" init -q 2>/dev/null
git -C "$GL_TREE" add -A 2>/dev/null

glossary_says() {
    (cd "$GL_TREE" && node tools/check-glossary.mjs 2>&1) | grep -cE "$1"
}

glossary_code() {
    (cd "$GL_TREE" && node tools/check-glossary.mjs >/dev/null 2>&1)
    echo $?
}

# SC-AK-690 — запретное слово, встреченное в дереве, называется местом и словом.
printf '# Домен\n\nЗаведена таска на разбор.\n' > "$GL_TREE/docs/specs/domain.md"
git -C "$GL_TREE" add -A 2>/dev/null
report "SC-AK-690 — запретное слово в дереве краснеет" "$(glossary_says 'docs/specs/domain.md.*таска')" 1
report "SC-AK-690 — код возврата ненулевой" "$(glossary_code)" 1

# Принятое слово из правой колонки запретным не бывает: иначе краснела бы всякая замена.
printf '# Домен\n\nЗаведена задача на разбор.\n' > "$GL_TREE/docs/specs/domain.md"
git -C "$GL_TREE" add -A 2>/dev/null
report "SC-AK-690 — принятое слово молчит" "$(glossary_code)" 0

# SC-AK-690 — английское слово раздела ловится теми же границами: граница слова — любая буква,
# а не кириллическая, и словарь на английском читается той же проверкой.
printf '# Словарь\n\n## Так не пишем\n\n- **таска, тикет** — задача\n- **ticket** — task\n- **спека (о тесте)** — тест\n' \
    > "$GL_TREE/docs/GLOSSARY.md"
printf '# Domain\n\nA ticket is filed for the review.\n' > "$GL_TREE/docs/specs/domain.md"
git -C "$GL_TREE" add -A 2>/dev/null
report "SC-AK-690 — английское слово раздела краснеет" "$(glossary_says 'docs/specs/domain.md.*ticket')" 1
printf '# Domain\n\nThe ticketing desk is closed.\n' > "$GL_TREE/docs/specs/domain.md"
git -C "$GL_TREE" add -A 2>/dev/null
report "SC-AK-690 — английское слово внутри другого слова молчит" "$(glossary_code)" 0
printf '# Словарь\n\n## Так не пишем\n\n- **таска, тикет** — задача\n- **спека (о тесте)** — тест\n' \
    > "$GL_TREE/docs/GLOSSARY.md"

# SC-AK-691 — слово со скобочным уточнением поиском не судится, и проверка говорит об этом.
printf '# Домен\n\nСпека рядом с исходником.\n' > "$GL_TREE/docs/specs/domain.md"
git -C "$GL_TREE" add -A 2>/dev/null
report "SC-AK-691 — слово с уточнением расхождением не считается" "$(glossary_code)" 0
report "SC-AK-691 — и названо вслух" "$(glossary_says 'not judged by search')" 1

# SC-AK-692 — словарь, описание прошлого и папка задачи из поиска выведены.
printf '# Запись\n\nТаска закрыта.\n' > "$GL_TREE/docs/archive/RT-1-x.md"
printf '# Ход\n\nТаска взята.\n' > "$GL_TREE/docs/tasks/RT-1-x/progress.md"
git -C "$GL_TREE" add -A 2>/dev/null
report "SC-AK-692 — описание прошлого и папка задачи не читаются" "$(glossary_code)" 0

# Раздела запретных слов нет вовсе — проверка объявляет пропуск, а не сходство.
printf '# Словарь\n\n## Термины\n\n- **Задача** — единица работы\n' > "$GL_TREE/docs/GLOSSARY.md"
git -C "$GL_TREE" add -A 2>/dev/null
report "SC-AK-692 — без раздела запретных слов проверка объявляет пропуск" "$(glossary_code)" 7

# SC-AK-904 — раздел находится и под русским именем: словарь дерева, ещё не переведённый,
# новой редакцией пакета без сверки не остаётся.
printf '# Словарь\n\n## Так не пишем\n\n- **таска** — задача\n' > "$GL_TREE/docs/GLOSSARY.md"
printf '# Домен\n\nЗаведена таска на разбор.\n' > "$GL_TREE/docs/specs/domain.md"
git -C "$GL_TREE" add -A 2>/dev/null
report "SC-AK-904 — раздел под русским именем читается" "$(glossary_says 'docs/specs/domain.md.*таска')" 1
report "SC-AK-904 — и код возврата ненулевой" "$(glossary_code)" 1
printf '# Домен\n\nЗаведена задача на разбор.\n' > "$GL_TREE/docs/specs/domain.md"
git -C "$GL_TREE" add -A 2>/dev/null

# --- SC-AK-819 — вводная словаря ведёт в источник правки ----------------------------------
# Словарь уезжает в контекст каждой сессии целиком и оттого читается обычным документом дерева, а
# правится он надстройкой, как всякий разложенный ресурс. Вводная — единственный текст о словаре,
# доезжающий до читателя гарантированно: ведя в собранный файл, она отменяет собой всё, что о
# словаре сказано на других слоях.
GL_HOOK="$(mktemp -d)"
mkdir -p "$GL_HOOK/docs"

hook_says() {
    CLAUDE_PROJECT_DIR="$GL_HOOK" bash "$HOOKS/glossary-load.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.additionalContext // ""' | grep -cE "$1"
}

printf '<!-- rt-kit v0.22.0 · docs/GLOSSARY.md · 2fcd88176a0d · правится надстройкой, не здесь -->\n# Словарь\n' \
    > "$GL_HOOK/docs/GLOSSARY.md"
report "SC-AK-819 — при шапке раскладки вводная называет надстройку" \
    "$(hook_says 'overrides/docs/GLOSSARY.md')" 1
report "SC-AK-819 — и не зовёт править словарь на месте" \
    "$(hook_says 'added right here')" 0

# Шапки нет — словарь принадлежит дереву целиком, и адрес надстройки был бы там ложью.
printf '# Словарь\n' > "$GL_HOOK/docs/GLOSSARY.md"
report "SC-AK-819 — без шапки вводная зовёт править словарь на месте" \
    "$(hook_says 'belongs to the tree as a whole')" 1
report "SC-AK-819 — и надстройки не называет" "$(hook_says 'overrides/')" 0

rm -rf "$GL_HOOK"

rm -rf "$GL_TREE"

suite_result "проверки: словарь"
