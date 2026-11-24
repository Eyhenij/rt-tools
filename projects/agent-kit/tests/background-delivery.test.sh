#!/usr/bin/env bash
# Сценарии конца фоновой задачи: он считается от доставки уведомления. Уведомление стоит в записи
# дважды — когда встало в очередь и когда дошло до сессии; ход, который кончился между ними,
# разбудит само уведомление, и остановку соседней задачи он не съедает.
. "$(dirname "${BASH_SOURCE[0]}")/turn-exit-lib.sh"

echo "конец фоновой задачи и доставка уведомления"

BD_TESTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bd_out="$(cd "$BD_TESTS" && node --input-type=module 2>&1 <<'JS'
import * as session from '../assets/task-flow/measure/session.mjs';
import { eventsOf } from '../assets/task-flow/source/session.mjs';

const NOW = Date.parse('2026-11-24T12:00:00Z');
const waits = (list) => String(session.waiting({ session: { events: () => list, now: () => NOW } })({ words: {} }));
const out = (label, got, want) => console.log(`${label}|${got}|${want}`);
const started = (id) => ({ kind: 'background', id, task: `task-${id}`, at: NOW - 60_000 });
const over = (id) => ({ kind: 'backgroundEnd', id, task: `task-${id}` });
const ended = { kind: 'ended' };
const call = { kind: 'call', name: 'Read', input: {}, blocked: false };
const two = [started('a'), started('b')];

out('SC-AK-1762 — конец встал в очередь до остановки — остановка соседней цела', waits([...two, over('a'), ended]), 'true');
out('SC-AK-1762 — конец дошёл до остановки — остановка соседней потрачена', waits([...two, over('a'), over('a'), ended]), 'false');
out('SC-AK-1762 — вызов после конца — уведомление дошло, остановка потрачена', waits([...two, over('a'), call, ended]), 'false');
out('SC-AK-1762 — очередь, остановка, доставка, вторая остановка — соседняя потрачена один раз', waits([...two, over('a'), ended, over('a'), ended]), 'false');
out('SC-AK-1762 — снятая самой сессией задача в очереди не стоит', waits([...two, { kind: 'backgroundEnd', id: null, task: 'task-a', stopped: true }, ended]), 'false');
out('SC-AK-1762 — одна задача кончилась в очереди — ждать нечего', waits([started('a'), over('a'), ended]), 'false');

// The record as the harness writes it: the notice is queued while the turn closes, then delivered.
const at = '2026-11-24T11:59:00Z';
const notice = (id) => `<task-notification><task-id>task-${id}</task-id><tool-use-id>${id}</tool-use-id><status>completed</status></task-notification>`;
const start = (id) => ({ type: 'user', timestamp: at, message: { content: [{ type: 'tool_result', tool_use_id: id, content: '' }] }, toolUseResult: { backgroundTaskId: `task-${id}` } });
const use = (id) => ({ type: 'assistant', timestamp: at, message: { stop_reason: 'tool_use', content: [{ type: 'tool_use', id, name: 'Bash', input: { command: 'pnpm test' } }] } });
const close = { type: 'assistant', timestamp: at, message: { stop_reason: 'end_turn', content: [] } };
const record = [use('a'), start('a'), use('b'), start('b'), close, { type: 'queue-operation', operation: 'enqueue', timestamp: at, content: notice('a') }, { type: 'user', timestamp: at, message: { content: notice('a') } }];
out('SC-AK-1762 — запись: уведомление в очереди до конца хода — соседняя ждётся', waits(eventsOf(record)), 'true');
JS
)"
report "блок случаев отработал без ошибки" "$?" 0
while IFS='|' read -r label got want; do
    [ -n "$label" ] && report "$label" "$got" "$want"
done <<<"$bd_out"

suite_result "конец фоновой задачи и доставка уведомления"
