#!/usr/bin/env bash
# Сценарии счётчика метрики `owner-nudges.mjs`: подталкивания, набранные сообщения, отказы и тупики
# по записям разговоров.
#
# Решения зовутся как функции на записях, собранных в случае; командная строка гоняется на файлах
# jsonl во временном каталоге, который стоит вместо `~/.claude/projects`. Момент — всегда параметр
# `--until`: часы набор не читает.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "счётчик метрики"

TESTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ON_DIR="$(mktemp -d)"
export ON_DIR

# Случаи группы: JS печатает строки `метка|получено|ожидалось`, каждая идёт в report.
on_run() {
    local out label got want
    out="$(cd "$TESTS" && node --input-type=module 2>&1)"
    while IFS='|' read -r label got want; do
        [ -n "$label" ] || continue
        report "$label" "$got" "$want"
    done <<< "$out"
}

on_run <<'JS'
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as on from '../assets/checks/owner-nudges.mjs';
import { buildModel } from '../assets/checks/flow-model.mjs';

const out = (label, got, want) => console.log(`${label}|${got}|${want}`);
const nudge = buildModel(new URL('../assets/task-flow/flow.js', import.meta.url).pathname).words.nudge;

let n = 0;
const at = (time) => `2026-11-${time}Z`;
const owner = (text, time = '14T10:00:00', extra = {}) => ({ type: 'user', uuid: `u${++n}`, timestamp: at(time), message: { role: 'user', content: text }, ...extra });
const call = (time = '14T10:01:00', name = 'Bash') => ({ type: 'assistant', uuid: `u${++n}`, timestamp: at(time), message: { content: [{ type: 'tool_use', id: `t${n}`, name, input: {} }] } });
const stopRefusal = (guard, line, time = '14T10:02:00') => owner(`Stop hook feedback:\nBLOCKED by ${guard}: ${line}\n\nMore text.`, time, { isMeta: true });
const agentStopRefusal = (guard, line, time = '14T10:02:00') => owner(`Stop hook feedback:\nAgent hook condition was not met: BLOCKED by ${guard}: ${line}`, time, { isMeta: true });
const toolResult = (text, isError, time = '14T10:01:30') => owner([{ type: 'tool_result', tool_use_id: 'x', content: text, is_error: isError }], time);
const passed = (time = '14T10:03:00') => ({ type: 'system', subtype: 'stop_hook_summary', uuid: `u${++n}`, timestamp: at(time), hookErrors: [] });
const copy = (name, ...sessions) => ({ name, sessions: sessions.map((entries, index) => ({ id: `s${index}`, entries })) });
const day = on.windowOf({ days: 1, until: '2026-11-14' });

// SC-AK-1541 — подталкивания на сто вызовов
{
    const copies = [copy('main', [owner('ну что там?'), call(), call(), owner('почему ты стоишь?'), call(), owner('не продолжай'), owner('переработай план'), call()])];
    const got = on.measureNudges(copies, day, nudge);
    out('SC-AK-1541 — подталкивания и вызовы по образцу words.nudge', `${got.nudges} ${got.calls}`, '2 4');
    out('SC-AK-1541 — строка счёта', on.nudgesLine(got), 'owner nudges per 100 calls: 50.00 (2 nudges, 4 calls)');
    out('SC-AK-1541 — без вызовов счёт 0.00', on.nudgesLine({ nudges: 0, calls: 0 }), 'owner nudges per 100 calls: 0.00 (0 nudges, 0 calls)');
}

// SC-AK-1542 — что считается набранным сообщением владельца
{
    const cases = [
        ['строка владельца', owner('продолжай'), 'продолжай'],
        ['текст частями', owner([{ type: 'text', text: 'делай дальше' }]), 'делай дальше'],
        ['мета-запись', owner('продолжай', undefined, { isMeta: true }), 'null'],
        ['сводка сжатия', owner('продолжай', undefined, { isCompactSummary: true }), 'null'],
        ['ответ меню', owner([{ type: 'tool_result', content: 'The user answered: "Q"="продолжай"' }], undefined, { toolUseResult: { answers: { Q: 'продолжай' } } }), 'null'],
        ['результат вызова', toolResult('продолжай', false), 'null'],
        ['отзыв хука на Stop', owner('Stop hook feedback:\nпродолжай'), 'null'],
        ['напоминание обвязки', owner('<system-reminder>продолжай</system-reminder>'), 'null'],
        ['прерванный ход', owner([{ type: 'text', text: '[Request interrupted by user]' }]), 'null'],
        ['уведомление задачи', owner('<task-notification>продолжай</task-notification>', undefined, { origin: { kind: 'task-notification' } }), 'null'],
        ['запись субагента', owner('продолжай', undefined, { isSidechain: true }), 'null'],
    ];
    for (const [what, entry, want] of cases) out(`SC-AK-1542 — ${what}`, String(on.typedText(entry)), want);
}

// SC-AK-1544 — отказы на сто вызовов по группам
{
    const entries = [
        call(), call(), call(), call(), call(), call(), call(), call(), call(), call(),
        stopRefusal('turn-exit-guard', 'the work stands in the state X'),
        toolResult('PreToolUse:Edit hook error: [hook]: BLOCKED by flow-step-guard: step 1.1 has no green mark', true),
        toolResult('PreToolUse:AskUserQuestion hook error: BLOCKED by grill-gate: a guard refused', true),
        agentStopRefusal('turn-judge', 'the owner ordered work'),
        toolResult('PreToolUse:Write hook error: BLOCKED by prose-style-guard: a long sentence', true),
        toolResult('grep output\nBLOCKED by turn-exit-guard: a line of a hook source', false),
        toolResult('Exit code 1\nBLOCKED by turn-exit-guard: a line of a hook source', true),
        owner('the refusal starts with `BLOCKED by <guard>:`'),
    ];
    const got = on.measureRefusals([copy('main', entries)], day);
    out('SC-AK-1544 — отказы по группам', `${got.calls} ${got.all} ${got.exit} ${got.base} ${got.fresh}`, '10 5 1 2 2');
    out('SC-AK-1544 — строка счёта', on.refusalsLine(got), 'refusals per 100 calls: all 50.00, exit 10.00, base 20.00, new 20.00');
    out('SC-AK-1544 — проверки базы и новые названы списком', `${on.BASE_GUARDS.includes('stand-login-guard')} ${on.NEW_GUARDS.join(',')}`, 'true turn-exit-guard,flow-step-guard');
}

// SC-AK-1545 — тупик: 10 и больше отказов на Stop подряд с одной причиной
{
    const series = (count, line = 'the folder is removed') => Array.from({ length: count }, () => [call(), stopRefusal('turn-exit-guard', line)]).flat();
    const found = (entries) => on.findDeadlocks([copy('main', entries)], day).map((s) => s.refusals).join(',') || 'none';
    out('SC-AK-1545 — десять отказов подряд — тупик', found(series(10)), '10');
    out('SC-AK-1545 — девять отказов — не тупик', found(series(9)), 'none');
    out('SC-AK-1545 — сообщение владельца серию не прерывает', found([...series(5), owner('ты стоишь'), ...series(6)]), '11');
    out('SC-AK-1545 — пропущенный Stop прерывает серию', found([...series(5), passed(), call(), ...series(5)]), 'none');
    out('SC-AK-1545 — другая причина прерывает серию', found([...series(6), ...series(6, 'another state')]), 'none');
    out('SC-AK-1545 — отказ agent-хука после сводки Stop серию не прерывает', found([...series(5), passed(), agentStopRefusal('turn-exit-guard', 'the folder is removed'), ...series(4)]), '10');
    out('SC-AK-1545 — строка счёта', on.deadlocksLine([{ refusals: 12 }, { refusals: 10 }]), 'deadlocks: 2 series of 10+ stop refusals at one state and step, 22 refusals');
}

// SC-AK-1546 — окно: дата --until входит целиком, момент — параметр
{
    const w = on.windowOf({ days: 7, until: '2026-11-15' });
    out('SC-AK-1546 — 7 дней до конца 15.11', `${new Date(w.from).toISOString()} ${new Date(w.to).toISOString()}`, '2026-11-09T00:00:00.000Z 2026-11-16T00:00:00.000Z');
    const s = on.windowOf({ since: '2026-10-13', until: '2026-11-15' });
    out('SC-AK-1546 — --since начинает с начала дня', new Date(s.from).toISOString(), '2026-10-13T00:00:00.000Z');
    const m = on.windowOf({ days: 1, until: '2026-11-14T12:00:00Z' });
    out('SC-AK-1546 — момент со временем берётся как есть', new Date(m.to).toISOString(), '2026-11-14T12:00:00.000Z');
    const edge = [copy('main', [owner('a', '14T23:59:59'), owner('b', '15T00:00:00'), owner('c', '13T00:00:00'), owner('d', '12T23:59:59')])];
    out('SC-AK-1546 — запись по времени сообщения', String(on.measureTyped(edge, day).messages), '1');
    const thrown = (args) => { try { on.windowOf(args); return 'no'; } catch { return 'thrown'; } };
    out('SC-AK-1546 — окно без --days и --since отказано', thrown({ until: '2026-11-14' }), 'thrown');
    out('SC-AK-1546 — не дата отказана', thrown({ days: 1, until: 'вчера' }), 'thrown');
    out('SC-AK-1546 — две меры сразу отказаны', (() => { try { on.parseArgs(['--typed', '--refusals']); return 'no'; } catch { return 'thrown'; } })(), 'thrown');
}

// Записи для командной строки: две копии дерева, чужой каталог, запись субагента, повтор записи.
{
    const tree = '/work/tree';
    const root = process.env.ON_DIR;
    const write = (dir, file, entries) => {
        mkdirSync(join(root, dir), { recursive: true });
        writeFileSync(join(root, dir, file), entries.map((e) => JSON.stringify(e)).join('\n') + '\nnot json\n');
    };
    const main = on.recordDirOf(tree);
    const shared = owner('ну что там?', '14T09:00:00');
    write(main, 'a.jsonl', [shared, call(), call(), owner('сделай план'), stopRefusal('turn-exit-guard', 'x'), call()]);
    write(`${main}--claude-worktrees-side`, 'b.jsonl', [shared, owner('продолжай', '14T11:00:00'), call()]);
    write(`${main}-old`, 'c.jsonl', [owner('продолжай'), call()]);
    write(`${main}/a/subagents`, 'agent-1.jsonl', [owner('продолжай'), call()]);
    out('SC-AK-1543 — копии дерева: каталог корня и его рабочих копий', `${on.isCopyDir(main, tree)} ${on.isCopyDir(`${main}--claude-worktrees-side`, tree)} ${on.isCopyDir(`${main}-old`, tree)}`, 'true true false');
}
JS

ON="$TESTS/../assets/checks/owner-nudges.mjs"
on_cli() { node "$ON" --root "$ON_DIR" --tree /work/tree "$@" 2>&1; }

report "SC-AK-1541 — командная строка: подталкивания по копиям дерева" \
    "$(on_cli --days 7 --until 2026-11-15)" 'owner nudges per 100 calls: 50.00 (2 nudges, 4 calls)'
report "SC-AK-1543 — набранные сообщения всех копий, повтор записи один раз" \
    "$(on_cli --typed --since 2026-11-01 --until 2026-11-15)" 'owner typed messages: 3 in 2 copies'
report "SC-AK-1543 — запись вне окна не считается" \
    "$(on_cli --typed --days 1 --until 2026-11-13)" 'owner typed messages: 0 in 0 copies'
report "SC-AK-1544 — командная строка: отказы" \
    "$(on_cli --refusals --days 1 --until 2026-11-14)" 'refusals per 100 calls: all 25.00, exit 25.00, base 0.00, new 25.00'
report "SC-AK-1545 — командная строка: тупики" \
    "$(on_cli --deadlocks --days 7 --until 2026-11-15)" 'deadlocks: 0 series of 10+ stop refusals at one state and step, 0 refusals'
node "$ON" --root "$ON_DIR" --tree /work/tree --until 2026-11-15 >/dev/null 2>&1
report "SC-AK-1546 — окно без --days и --since — код 2" "$?" '2'
report "SC-AK-1546 — каталог записей отсутствует — счёт нулевой" \
    "$(node "$ON" --root "$ON_DIR/none" --tree /work/tree --typed --days 1 --until 2026-11-14 2>&1)" 'owner typed messages: 0 in 0 copies'

rm -rf "$ON_DIR"
suite_result "счётчик метрики"
