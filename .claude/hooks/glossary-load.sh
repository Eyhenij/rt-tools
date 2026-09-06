#!/usr/bin/env bash
# rt-kit v0.25.0 · hooks/glossary-load.sh · aa10dc04d1cf · правится надстройкой, не здесь
# rt-hook: SessionStart startup|resume|compact|clear
# SessionStart: словарь проекта уезжает в контекст целиком, на каждом запуске сессии.
#
# Памятью это не держится: словарь читают перед тем, как написать текст, а разговор с
# владельцем идёт без чтения — и слово из левой колонки «Так не пишем» всплывает в ответе,
# хотя в файлах его уже нет. Здесь словарь приходит до первой реплики и действует и на
# тексты, и на ответы.
#
# FAIL-OPEN: нет файла или нет `jq` — выходим молча. Сессия важнее словаря.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

GLOSSARY="${CLAUDE_PROJECT_DIR:-.}/docs/GLOSSARY.md"
[ -f "$GLOSSARY" ] || exit 0
command -v jq >/dev/null 2>&1 || exit 0

# Где слово заводят. Словарь бывает разложен пакетом — тогда правка на его месте теряется на
# следующей раскладке, а до тех пор раскладка отказывает по нему целиком. Вводная, которую читает
# каждая сессия, обязана вести в надстройку: она — единственный текст о словаре, доезжающий до
# читателя гарантированно, и, ведя в собранный файл, она отменяет собой всё сказанное на других
# слоях. Опровержение стоит строкой ниже, в шапке раскладки, но читается служебной строкой сборки:
# начинается оно с версии и суммы, а не со слова.
#
# Адрес выводится из идентификатора ресурса в самой шапке, а не зашивается: каталог надстроек у
# каждого дерева свой, и зашитый путь врал бы в первом же, которое держит их иначе. Шапки нет —
# словарь принадлежит дереву целиком, и «заводится здесь же» верно как есть.
header="$(head -1 "$GLOSSARY" 2>/dev/null)"
resource="$(printf '%s' "$header" | sed -n 's/.*rt-kit v[^ ]* · \([^ ]*\) · .*/\1/p')"

if [ -n "$resource" ]; then
    where="$(printf 'The glossary is laid out by the package and is not edited in place: a new word goes to the override\n.claude/rt-kit/overrides/%s — it merges by `## ` section and survives the layout.\n' "$resource")"
else
    where='The glossary belongs to the tree as a whole: a new word is added right here, by the same edit.
'
fi

{
    printf 'PROJECT GLOSSARY — `docs/GLOSSARY.md`, in full below.\n\n'
    printf 'A word from here is used in the meaning given here: in files and in replies to the owner alike.\n'
    printf 'The "Not written here" section works the same way: its left column is neither written nor said anywhere.\n'
    printf 'A word that is not here does not exist for the reader either: it is introduced by the same change\n'
    printf 'that first uses it, or replaced with a word that already exists.\n'
    printf '%s\n' "$where"
    cat "$GLOSSARY"
} | jq -Rs '{hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:.}}'
