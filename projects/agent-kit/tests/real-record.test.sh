#!/usr/bin/env bash
# Сценарии читателей записи разговора на настоящей записи: срез суток 13.11.2026.
#
# В тот день проверка конца эпика была зелёной на своём наборе и отказала на согласии владельца в
# настоящей записи, а её починка пропускала посторонние ответы. Здесь каждый читатель записи — факты
# `facts.sh`, слова владельца движка, одобрение плана, счёт напоминаний — спрошен на срезе той
# записи. Ответы сняты с полной записи тем же `real-data/read-record.mjs` и записаны здесь числом и
# словом: срез, по которому читатель отвечает иначе, чем по полной записи, краснеет.
#
# Срез — `fixtures/real-record/2026-11-13.jsonl`, его режет `real-data/cut-record.mjs`.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "читатели записи на настоящей записи"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CUT="$HERE/fixtures/real-record/2026-11-13.jsonl"
FACTS="$HERE/../assets/hooks/facts.sh"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

READINGS="$(node "$HERE/real-data/read-record.mjs" "$CUT" 2>&1)"
reading() { printf '%s\n' "$READINGS" | sed -n "s/^$1: //p"; }

# The record up to a moment: a fact is asked by a hook at a moment, on what was written by then.
until_moment() {
    node -e '
const fs = require("fs");
const out = [];
for (const line of fs.readFileSync(process.argv[1], "utf8").split("\n")) {
    if (!line) continue;
    if ((JSON.parse(line).timestamp ?? "") > process.argv[2]) break;
    out.push(line);
}
fs.writeFileSync(process.argv[3], out.join("\n") + "\n");' "$CUT" "$1" "$WORK/until.jsonl"
    printf '%s' "$WORK/until.jsonl"
}
fact() { bash -c ". '$FACTS'; $1 \"\$@\"" _ "${@:2}"; }

# --- the owner's words: the moment of the consent -------------------------------------------------
report "SC-AK-1606 — consent: на срезе шесть ответов меню, menuAnswers как в записи" "$(reading 'menu answers')" "6"
report "SC-AK-1606 — consent: 01:46 — «Новая задача в эпике» читается словом владельца" \
    "$(reading 'menu answer 1')" "Новая задача в эпике (Recommended)"
report "SC-AK-1606 — consent: 01:51 — «Да, завести задачу» читается словом владельца" \
    "$(reading 'menu answer 2')" "Да, завести задачу (Recommended)"
report "SC-AK-1606 — consent: последнее слово владельца за сутки" "$(reading 'owner last word')" "Отложить RT-3272"

# --- foreign answers: what is no word of the owner ------------------------------------------------
report "SC-AK-1607 — foreign answer: ни одно сообщение хука не читается словом владельца" \
    "$(reading 'owner messages with a hook refusal')" "0"
# A finding of RT-3277: the owner source counts 213 typed messages, the reminder measure 123 on the
# same cut. The 90 between them are interrupt marks and command wrappers of the harness, which the
# owner source reads as the owner's words. The case names what the source counts today.
report "SC-AK-1607 — foreign answer: owner.mjs считает 213 сообщений набранными, owner-nudges — 123 — находка RT-3277" \
    "$(reading 'owner typed messages') $(reading 'owner-nudges typed')" "213 123"
report "SC-AK-1607 — foreign answer: ответ меню «ты нашёл причину?» не одобряет план — planApproval RT-3268" \
    "$(reading 'planApproval RT-3268')" "null"
report "SC-AK-1607 — foreign answer: «Одобряю, делай» без имени плана не одобряет его — planApproval RT-3269" \
    "$(reading 'planApproval RT-3269')" "null"

# --- the calls of the roles -----------------------------------------------------------------------
report "SC-AK-1608 — roleCalls product-strategist за сутки" "$(reading 'roleCalls product-strategist')" "12"
report "SC-AK-1608 — roleCalls goal-critic за сутки" "$(reading 'roleCalls goal-critic')" "12"

# --- the session source of the engine: refusals, blocked calls, menus -------------------------------
report "SC-AK-1604 — session.mjs: отказы хуков в сообщениях выхода" "$(reading 'session refusals')" "199"
report "SC-AK-1604 — session.mjs: вызовы, отбитые хуком" "$(reading 'session blocked calls')" "63"
report "SC-AK-1604 — session.mjs: меню и ответы на них" "$(reading 'session menus')" "28, answered 6"
report "SC-AK-1604 — session.mjs: вызовы инструментов" "$(reading 'session tool uses')" "1998"

# --- the measures of the reminders ----------------------------------------------------------------
report "SC-AK-1609 — owner-nudges: подталкивания владельца на сто вызовов" "$(reading 'owner-nudges nudges')" "4 of 1998 calls"
report "SC-AK-1609 — owner-nudges: набранные сообщения" "$(reading 'owner-nudges typed')" "123"
report "SC-AK-1609 — owner-nudges: отказы хуков" "$(reading 'owner-nudges refusals')" "203 all, 129 at the exit, of 1998 calls"
report "SC-AK-1609 — owner-nudges: серии отказов на выходе" "$(reading 'owner-nudges deadlocks')" "2"

# --- the facts of the hooks at the moments of the consent ------------------------------------------
AT_1746="$(until_moment 2026-11-13T01:46:30Z)"
report "SC-AK-1598 — rt_fact_window_fill в 01:46" "$(fact rt_fact_window_fill "$AT_1746")" "239554"
report "SC-AK-1598 — rt_fact_exam в 01:46: экзамена не было" "$(fact rt_fact_exam "$AT_1746")" "none"
report "SC-AK-1598 — rt_fact_from_handoff в 01:46: заход не из передачи" "$(fact rt_fact_from_handoff "$AT_1746")" "no"
AT_1751="$(until_moment 2026-11-13T01:51:11Z)"
report "SC-AK-1598 — rt_fact_window_fill в 01:51" "$(fact rt_fact_window_fill "$AT_1751")" "290752"
report "SC-AK-1598 — rt_fact_exam в 01:51: экзамена не было" "$(fact rt_fact_exam "$AT_1751")" "none"
report "SC-AK-1598 — rt_fact_transcript называет срез из входа хука" \
    "$(fact rt_fact_transcript "{\"transcript_path\":\"$AT_1751\"}")" "$AT_1751"
report "SC-AK-1598 — rt_fact_agent_transcript пуст, когда хук зовёт не роль" \
    "$(fact rt_fact_agent_transcript "{\"transcript_path\":\"$AT_1751\"}")" ""

suite_result "читатели записи на настоящей записи"
