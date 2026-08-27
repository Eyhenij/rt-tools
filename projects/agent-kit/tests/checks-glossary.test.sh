#!/usr/bin/env bash
# Сценарии сверки словаря: запретное слово в дереве, слово с уточнением и выведенные каталоги.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: словарь"

# Фикстура — настоящий репозиторий: список файлов проверка берёт у системы контроля версий.
GL_TREE="$(mktemp -d)"
mkdir -p "$GL_TREE/tools" "$GL_TREE/docs/archive" "$GL_TREE/docs/tasks/RT-1-x" "$GL_TREE/docs/specs"
cp "$CHECKS/rt-kit-checks.config.mjs" "$CHECKS/check-glossary.mjs" "$GL_TREE/tools/"

printf '# Словарь\n\n## Так не пишем\n\n- **таска, тикет** — задача\n- **спека (о тесте)** — тест\n' \
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

# SC-AK-691 — слово со скобочным уточнением поиском не судится, и проверка говорит об этом.
printf '# Домен\n\nСпека рядом с исходником.\n' > "$GL_TREE/docs/specs/domain.md"
git -C "$GL_TREE" add -A 2>/dev/null
report "SC-AK-691 — слово с уточнением расхождением не считается" "$(glossary_code)" 0
report "SC-AK-691 — и названо вслух" "$(glossary_says 'поиском не судятся')" 1

# SC-AK-692 — словарь, описание прошлого и папка задачи из поиска выведены.
printf '# Запись\n\nТаска закрыта.\n' > "$GL_TREE/docs/archive/RT-1-x.md"
printf '# Ход\n\nТаска взята.\n' > "$GL_TREE/docs/tasks/RT-1-x/progress.md"
git -C "$GL_TREE" add -A 2>/dev/null
report "SC-AK-692 — описание прошлого и папка задачи не читаются" "$(glossary_code)" 0

# Раздела запретных слов нет вовсе — проверка объявляет пропуск, а не сходство.
printf '# Словарь\n\n## Термины\n\n- **Задача** — единица работы\n' > "$GL_TREE/docs/GLOSSARY.md"
git -C "$GL_TREE" add -A 2>/dev/null
report "SC-AK-692 — без раздела запретных слов проверка объявляет пропуск" "$(glossary_code)" 7

rm -rf "$GL_TREE"

suite_result "проверки: словарь"
