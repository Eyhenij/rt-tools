#!/usr/bin/env bash
# Разбор каждого исполняемого ресурса пакета его же исполнителем.
#
# Это самый дешёвый набор и единственный, который знает про ВСЕ ресурсы разом: гарды и
# умолчания читает `bash -n`, проверки — `node --check`. Поведения он не судит, но сломанную
# строку ловит в любом файле, включая те, на которые поведенческого набора ещё нет. Пока его не
# было, синтаксическая поломка в гарде проходила прогон пакета зелёной: линтер в `assets/` не
# ходит, а спеки механизма раскладки исполняют TypeScript, а не то, что он перекладывает.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "разбор ресурсов"

# Каждый ресурс называется своим именем, а не считается числом: набор, печатающий «проверено
# 36», не говорит, что именно он проверил, и молча зеленеет, когда каталог опустел.
shell_count=0
for file in "$HOOKS"/*.sh "$DEFAULTS"/*.sh; do
    [ -f "$file" ] || continue
    shell_count=$((shell_count + 1))
    if bash -n "$file" 2>/dev/null; then
        report "разбирается: ${file##*/}" PASS PASS
    else
        report "разбирается: ${file##*/}" FAIL PASS
    fi
done

node_count=0
for file in "$CHECKS"/*.mjs; do
    [ -f "$file" ] || continue
    node_count=$((node_count + 1))
    if node --check "$file" 2>/dev/null; then
        report "разбирается: ${file##*/}" PASS PASS
    else
        report "разбирается: ${file##*/}" FAIL PASS
    fi
done

# Пустой каталог — тоже провал: он означает, что набор смотрит не туда, а не что ломать нечего.
[ "$shell_count" -gt 0 ] && report "гарды и умолчания найдены" PASS PASS || report "гарды и умолчания найдены" FAIL PASS
[ "$node_count" -gt 0 ] && report "проверки найдены" PASS PASS || report "проверки найдены" FAIL PASS

# Каждый гард обязан быть исполняемым: раскладка сохраняет бит, и файл без него отбивает не
# правку, а сам вызов — с ошибкой оболочки, которую читают как поломку агента.
for file in "$HOOKS"/*.sh; do
    [ -f "$file" ] || continue
    if [ -x "$file" ]; then
        report "исполняемый: ${file##*/}" PASS PASS
    else
        report "исполняемый: ${file##*/}" FAIL PASS
    fi
done

# SC-AK-409. Гард, отбивающий вызов или ход, называет два законных хода — починить или принести
# владельцу цену обхода. Хвост зовётся общей функцией, а не пишется в каждом тексте: написанный
# по одному, он пропускается там, где отказ заводили позже, и пропуск читается как «у этого
# отказа ходов нет». Отбор здесь по самому отказу: файл, который ничего не отбивает, требования
# не получает.
for file in "$HOOKS"/*.sh; do
    [ -f "$file" ] || continue
    case "${file##*/}" in
        deny-tail.sh) continue ;;
    esac
    grep -qE 'permissionDecision:"deny"|decision:"block"|exit 2' "$file" || continue

    # Гарды семьи запросов к хранилищу зовут общий отказ соседа и своего не объявляют.
    if grep -q 'rt_deny_tail' "$file" || grep -q 'sql-guard-parse.sh' "$file" \
        || grep -qE '^\. "\$\(dirname "\$\{BASH_SOURCE\[0\]\}"\)/sql-guard' "$file"; then
        report "SC-AK-409 — отказ зовёт общий хвост: ${file##*/}" PASS PASS
    else
        report "SC-AK-409 — отказ зовёт общий хвост: ${file##*/}" FAIL PASS
    fi
done

suite_result "разбор ресурсов"
