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
# The reminder measure counts by the shared rule of the owner's words: a message pasted by the owner
# and one queued during a turn count, a wrapper of the harness does not. The owner source of the
# engine still reads the wrappers as words, and its move to the shared rule is a task of its own.
report "SC-AK-1607 — foreign answer: owner.mjs считает 213 сообщений набранными, owner-nudges по общему правилу — 198" \
    "$(reading 'owner typed messages') $(reading 'owner-nudges typed')" "213 198"
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
report "SC-AK-1609 — owner-nudges: подталкивания владельца на сто вызовов" "$(reading 'owner-nudges nudges')" "5 of 1998 calls"
report "SC-AK-1609 — owner-nudges: набранные сообщения" "$(reading 'owner-nudges typed')" "198"
report "SC-AK-1609 — owner-nudges: отказы хуков" "$(reading 'owner-nudges refusals')" "203 all, 129 at the exit, of 1998 calls"
report "SC-AK-1609 — owner-nudges: серии отказов на выходе" "$(reading 'owner-nudges deadlocks')" "2"

# --- the counter of the record: the epic window and the day ----------------------------------------
# The numbers are taken from the full record of 13.11 by the same counter; the cut gives them too.
COUNTED="$(node -e '
const fs = require("fs");
import(process.argv[2]).then((m) => {
    const entries = fs.readFileSync(process.argv[1], "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
    const inWindow = (at) => at >= "2026-11-13T00:34:01" && at < "2026-11-13T03:04:27";
    const kinds = {};
    for (const r of m.refusals(entries).filter((r) => inWindow(r.at ?? ""))) kinds[r.kind] = (kinds[r.kind] ?? 0) + 1;
    console.log(`window calls: ${m.calls(entries).filter((c) => inWindow(c.at ?? "")).length}`);
    console.log(`window refusals: ${Object.entries(kinds).sort().map(([k, v]) => `${k}:${v}`).join(" ")}`);
    console.log(`owner words: ${m.ownerWords(entries).filter((w) => (w.at ?? "").startsWith("2026-11-13")).length}`);
    console.log(`reasks: ${m.reasks(entries).map((r) => r.at.slice(11, 19)).join(" ")}`);
    const ends = m.deadEnds(entries);
    console.log(`dead ends: ${ends.filter((d) => (d.to ?? "").startsWith("2026-11-13")).length}`);
    console.log(`dead end epic-over: ${ends.filter((d) => d.check === "epic-over").map((d) => `${d.from.slice(11, 19)}:${d.count}`).join(" ")}`);
});' "$CUT" "$HERE/../assets/checks/record-count.mjs")"
counted() { printf '%s\n' "$COUNTED" | sed -n "s/^$1: //p"; }
report "SC-AK-1611 — окно эпика 00:34:01–03:04:27: вызовы" "$(counted 'window calls')" "187"
report "SC-AK-1611 — окно эпика: отказы по классам — 30 хуков, 1 разрешение, 4 конца хода" \
    "$(counted 'window refusals')" "hook:30 permission:1 stop:4"
report "SC-AK-1611 — слова владельца за 13.11" "$(counted 'owner words')" "196"
report "SC-AK-1611 — переспросы: три вопроса после отвеченного меню RT-3227" "$(counted 'reasks')" "01:48:48 01:48:56 01:49:11"
report "SC-AK-1654 — тупики дня: столько же, сколько на полной записи" "$(counted 'dead ends')" "20"
report "SC-AK-1654 — тупик проверки конца эпика: четыре отказа с 01:43:47" "$(counted 'dead end epic-over')" "01:43:47:4"

# --- the recount of 13.11 from the saved record --------------------------------------------------------
# The record is found by its branches: the tree knows the epic branch, the directory of the record does
# not name the tree.
RECOUNT_TREE="$WORK/recount-tree"
git -C "$WORK" init -q recount-tree 2>/dev/null
git -C "$RECOUNT_TREE" -c user.name=probe -c user.email=probe@example.com -c commit.gpgsign=false commit -q --allow-empty -m start 2>/dev/null
git -C "$RECOUNT_TREE" branch RT-3227-agent-kit-revision-day1 2>/dev/null
mkdir -p "$WORK/projects/elsewhere"
cp "$CUT" "$WORK/projects/elsewhere/session.jsonl"
node "$HERE/../assets/checks/record-recount.mjs" --tree "$RECOUNT_TREE" --observations "$WORK/recounted" --projects "$WORK/projects" --day 2026-11-13 > /dev/null
report "SC-AK-1632 — пересчёт 13.11 по сохранённой записи: окно эпика даёт 187 вызовов и 35 отказов" \
    "$(jq -r 'select(.t >= "2026-11-13T00:34:01" and .t < "2026-11-13T03:04:27") | .ev' "$WORK/recounted/2026-11-13.jsonl" | grep -cE '^record-call$'):$(jq -r 'select(.t >= "2026-11-13T00:34:01" and .t < "2026-11-13T03:04:27") | .ev' "$WORK/recounted/2026-11-13.jsonl" | grep -cE '^record-refusal$')" \
    "187:35"

# --- the report of 13.11 over the recounted day ----------------------------------------------------------
RESULT_LINES="$(node "$HERE/../assets/checks/work-result.mjs" --observations "$WORK/recounted" --until 2026-11-13 | jq -r '.lines[]')"
report "SC-AK-1618 — отчёт за 13.11: переспросили 3" \
    "$(printf '%s\n' "$RESULT_LINES" | grep -E '^  Переспросили: ')" "  Переспросили: 3"

# --- the epic windows of 13.11 ------------------------------------------------------------------------
# The observations the hook writes from the cut, with the merges the hosting gave that day.
OUTCOMES="$HERE/fixtures/real-outcomes"
WINDOWS="$(node -e '
const fs = require("fs");
const [cut, turn, merge, win, ...pulls] = process.argv.slice(1);
Promise.all([import(turn), import(merge), import(win)]).then(([t, m, w]) => {
    const entries = fs.readFileSync(cut, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
    const lines = [];
    for (const [, day] of t.observationsOf(entries, { sid: "s" })) for (const l of day) lines.push(JSON.parse(l));
    for (const x of m.mergesOf(pulls.map((f) => JSON.parse(fs.readFileSync(f, "utf8"))))) lines.push(x.line);
    for (const x of w.epicWindows(lines, "2026-11-13"))
        console.log(`${x.epic} ${x.from.slice(11, 16)}-${x.to ? x.to.slice(11, 16) : "open"} отказов ${x.refusals} из ${x.calls}`);
});' "$CUT" "$HERE/../assets/checks/record-turn.mjs" "$HERE/../assets/checks/merge-read.mjs" "$HERE/../assets/checks/epic-window.mjs" \
    "$OUTCOMES/pull-3266.json" "$OUTCOMES/pull-3225.json" "$OUTCOMES/pull-3278.json" "$OUTCOMES/pull-3279.json")"
report "SC-AK-1615 — окно RT-3227 от слияния PR 3266 до сообщения владельца, с которого начался разбор" \
    "$(printf '%s\n' "$WINDOWS" | sed -n 1p)" "RT-3227 00:34-03:04 отказов 35 из 187"
report "SC-AK-1615 — второе окно от слияния 04:49 до слияния эпика в главную ветку" \
    "$(printf '%s\n' "$WINDOWS" | grep ' 04:49-' | sed 's/ отказов.*//')" "RT-3227 04:49-05:48"

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
