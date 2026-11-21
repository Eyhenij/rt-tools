#!/usr/bin/env bash
# Случаи прогноза отказов движка task flow по записям разговоров. Набор запускается сам, и его же
# подключает набор движка `task-flow-script.test.sh`: тот считает эти случаи в своём выводе и целиком
# не помещается в предел длины. Подключённый, набор берёт у него `TESTS`, `tf_run` и `report`.
if [ "${BASH_SOURCE[0]}" = "$0" ]; then
    . "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
    echo "сценарий task flow: прогноз отказов"
    TESTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    TF_ALONE=1
    tf_run() {
        local out label got want
        out="$(cd "$TESTS" && node --input-type=module 2>&1)"
        while IFS='|' read -r label got want; do
            [ -n "$label" ] || continue
            report "$label" "$got" "$want"
        done <<< "$out"
    }
fi

# --- Прогноз отказов по записям разговоров ---------------------------------------------------------
tf_run <<'JS'
import { dirname } from 'node:path';
import { buildModel } from '../assets/checks/flow-model.mjs';
import { openReaders } from '../assets/checks/task-flow-script.mjs';
import { forecastCopies, forecastLine, missedLine, perMille } from '../assets/checks/flow-forecast.mjs';
import * as sessionSource from '../assets/task-flow/source/session.mjs';
import { wordOf } from '../assets/task-flow/source/owner.mjs';

const out = (label, got, want) => console.log(`${label}|${got}|${want}`);
const flow = new URL('../assets/task-flow/flow.js', import.meta.url).pathname;
const model = buildModel(flow);
const settings = { tasksDir: 'docs/tasks', plansDir: 'docs/plans', overridePath: 'o.js', protectedPaths: ['^projects/agent-kit/assets/task-flow/'] };
const window = { from: Date.parse('2026-11-01T00:00:00Z'), to: Date.parse('2026-11-08T00:00:00Z') };
let n = 0;
// A second per entry, past the minute too: a time that does not parse drops the entry from the window.
const at = () => new Date(Date.parse('2026-11-02T10:00:00Z') + 1000 * n++).toISOString();
const meta = (branch) => ({ uuid: `u${n}`, gitBranch: branch, cwd: '/t', timestamp: at() });
const owner = (branch, text) => ({ ...meta(branch), type: 'user', message: { content: text } });
const use = (branch, name, input) => ({ ...meta(branch), type: 'assistant', message: { content: [{ type: 'tool_use', id: `t${n}`, name, input }] } });
const stop = (branch) => ({ ...meta(branch), type: 'system', subtype: 'stop_hook_summary' });
const say = (branch) => ({ ...meta(branch), type: 'assistant', message: { content: [{ type: 'text', text: 'done' }] } });
const run = async (entries) =>
    forecastCopies({ copies: [{ name: 'c', sessions: [{ id: 's', entries }] }], window, model, base: dirname(flow), openReaders, sessionSource, wordOf, tree: '/t', settings });

const B = 'RT-7-x';
const held = await run([owner(B, 'делай RT-7'), use(B, 'Edit', { file_path: '/t/a.md', old_string: 'a', new_string: 'b' }), say(B), stop(B), say(B), owner(B, 'стоп'), say(B), stop(B)]);
out('forecast: SC-AK-1549 — остановка после записи держится, «стоп» отпускает', `${held.stops} ${held.held}`, '2 1');
out('forecast: SC-AK-1549 — на тысячу вызовов', perMille(held, false), '1000');
const quiet = await run([owner('main-x', 'спасибо'), say('main-x'), stop('main-x')]);
out('forecast: SC-AK-1549 — сессия без записи отпущена', `${quiet.stops} ${quiet.held}`, '1 0');
const shell = await run([owner(B, 'делай RT-7'), use(B, 'Bash', { command: 'echo x > docs/tasks/RT-7-x/progress.md' }), use(B, 'Edit', { file_path: '/t/a.md', old_string: 'a', new_string: 'b' })]);
out('forecast: SC-AK-1549 — запись оболочкой в ход работы — отказ стража', `${shell.judged} ${shell.refused}`, '2 1');
out('forecast: SC-AK-1549 — отказы стража входят с --guard', perMille({ ...shell, held: 0 }, true), '500');

const feedback = (branch) => ({ ...meta(branch), type: 'user', message: { content: 'Stop hook feedback:\nBLOCKED by turn-exit-guard: the scenario is not over' } });
const loop = await run([owner(B, 'делай RT-7'), use(B, 'Edit', { file_path: '/t/a.md', old_string: 'a', new_string: 'b' }), say(B), stop(B), feedback(B), say(B), stop(B), feedback(B), say(B), stop(B), feedback(B)]);
out('forecast: SC-AK-1700 — меню простоя обрывает петлю остановок', `${loop.stops} ${loop.held}`, '2 2');
const resumed = await run([owner(B, 'делай RT-7'), use(B, 'Edit', { file_path: '/t/a.md', old_string: 'a', new_string: 'b' }), say(B), stop(B), feedback(B), say(B), stop(B), feedback(B), use(B, 'Read', { file_path: '/t/a.md' }), say(B), stop(B)]);
out('forecast: SC-AK-1700 — вызов после меню снова считает остановки', `${resumed.stops} ${resumed.held}`, '3 3');

// SC-AK-1765 — a waiting stop is let go, and the line names the longest run of held stops
const EDIT = () => use(B, 'Edit', { file_path: '/t/a.md', old_string: 'a', new_string: 'b' });
const bg = (id) => ({ ...meta(B), type: 'assistant', message: { content: [{ type: 'tool_use', id, name: 'Bash', input: { command: 'pnpm test', run_in_background: true } }] } });
const bgStarted = (id, when) => ({ ...meta(B), ...(when ? { timestamp: when } : {}), type: 'user', toolUseResult: { backgroundTaskId: `b-${id}` }, message: { content: [{ type: 'tool_result', tool_use_id: id, content: 'Command running in background' }] } });
const bgOver = (id) => ({ type: 'queue-operation', operation: 'enqueue', timestamp: at(), content: `<task-notification>\n<task-id>b-${id}</task-id>\n<tool-use-id>${id}</tool-use-id>\n<status>completed</status>\n</task-notification>` });
const waited = await run([owner(B, 'делай RT-7'), EDIT(), bg('w1'), bgStarted('w1'), say(B), stop(B)]);
out('forecast: SC-AK-1765 — остановка при идущей фоновой задаче отпущена', `${waited.stops} ${waited.held}`, '1 0');
const twice = await run([owner(B, 'делай RT-7'), EDIT(), bg('w1'), bgStarted('w1'), say(B), stop(B), say(B), stop(B)]);
out('forecast: SC-AK-1765 — вторая остановка на той же задаче без вызова держится', `${twice.stops} ${twice.held}`, '2 1');
const finished = await run([owner(B, 'делай RT-7'), EDIT(), bg('w1'), bgStarted('w1'), bgOver('w1'), say(B), stop(B)]);
out('forecast: SC-AK-1765 — задача кончилась — остановка держится', `${finished.stops} ${finished.held}`, '1 1');
out('forecast: SC-AK-1797 — названная непрочитанная задача — не меню, остановки считаются дальше', await run([owner(B, 'делай RT-7'), EDIT(), bg('w1'), bgStarted('w1'), bgOver('w1'), say(B), stop(B), feedback(B), say(B), stop(B), feedback(B), say(B), stop(B), feedback(B)]).then((r) => `${r.stops} ${r.held}`), '3 3');
const stale = await run([owner(B, 'делай RT-7'), EDIT(), bg('w1'), bgStarted('w1', '2026-11-02T09:00:00Z'), say(B), stop(B)]);
out('forecast: SC-AK-1765 — задача старше границы по времени остановки — держится', `${stale.stops} ${stale.held}`, '1 1');
const series = await run([owner(B, 'делай RT-7'), EDIT(), say(B), stop(B), EDIT(), say(B), stop(B), EDIT(), say(B), stop(B), owner(B, 'дальше'), EDIT(), say(B), stop(B), bg('w2'), bgStarted('w2'), say(B), stop(B), EDIT(), say(B), stop(B)]);
out('forecast: SC-AK-1765 — серию рвут слово владельца и отпущенная остановка', `${series.held} ${series.longest}`, '4 3');
out('forecast: SC-AK-1765 — без удержанных остановок серия нулевая', String(waited.longest), '0');
out('forecast: SC-AK-1765 — строка называет самую длинную серию', String(forecastLine(series, false).endsWith('the longest run of held stops — 3')), 'true');

out('missed: SC-AK-1552 — конец хода с открытой работой пропущен, конец по «стоп» нет', `${held.ended} ${held.missed}`, '2 1');
out('missed: SC-AK-1552 — остановка с отказом хука ход не кончает', `${loop.ended} ${loop.missed}`, '0 0');
out('missed: SC-AK-1552 — каждая остановка на ветке с движком входит в знаменатель', loop.laidStops, '3');
const blocked = await run([owner(B, 'делай RT-7'), use(B, 'Edit', { file_path: '/t/a.md', old_string: 'a', new_string: 'b' }), { ...stop(B), hookErrors: ['BLOCKED by turn-exit-guard: open'] }]);
out('missed: SC-AK-1552 — отказ в итоге хуков ход не кончает', `${blocked.ended} ${blocked.missed}`, '0 0');
const unlaid = await forecastCopies({ copies: [{ name: 'c', sessions: [{ id: 's', entries: [owner(B, 'делай RT-7'), use(B, 'Edit', { file_path: '/t/a.md', old_string: 'a', new_string: 'b' }), say(B), stop(B)] }] }], window, model, base: dirname(flow), openReaders, sessionSource, wordOf, tree: '/t', settings, laid: () => false });
out('missed: SC-AK-1552 — ветка без движка не считается', `${unlaid.ended} ${unlaid.missed}`, '0 0');
out('missed: SC-AK-1552 — строка счёта', missedLine(held, 200), 'missed stops with open work: 1 of 2 stops in the last 200 calls');
JS

if [ -n "${TF_ALONE:-}" ]; then
    suite_result "сценарий task flow: прогноз отказов"
fi
