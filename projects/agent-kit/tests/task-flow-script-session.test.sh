#!/usr/bin/env bash
# Случаи фоновых задач сессии движка task flow: начало и конец задачи в записи, ожидание и чтение
# записи кусками. Набор запускается сам, и его же подключает набор движка
# `task-flow-script.test.sh`: тот считает эти случаи в своём выводе и целиком не помещается в предел
# длины. Подключённый, набор берёт у него `TESTS`, `tf_run` и `report`.
if [ "${BASH_SOURCE[0]}" = "$0" ]; then
    . "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
    echo "сценарий task flow: фоновые задачи сессии"
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

# --- Фоновые задачи сессии и чтение записи кусками -------------------------------------------------
tf_run <<'JS'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { eventsOf, linesOf } from '../assets/task-flow/source/session.mjs';
import { openAt } from '../assets/task-flow/source/records.mjs';

const out = (label, got, want) => console.log(`${label}|${got}|${want}`);
const T = '2026-11-19T10:00:00Z';
const call = (id, name, input) => ({ type: 'assistant', timestamp: T, message: { content: [{ type: 'tool_use', id, name, input }] } });
const result = (id, toolUseResult, extra = {}) => ({ type: 'user', timestamp: T, toolUseResult, message: { content: [{ type: 'tool_result', tool_use_id: id, content: 'ok', ...extra }] } });
const notice = (id, task, status) => ({ type: 'queue-operation', operation: 'enqueue', content: `<task-notification>\n<task-id>${task}</task-id>\n<tool-use-id>${id}</tool-use-id>\n<status>${status}</status>\n</task-notification>` });
const kinds = (entries) => eventsOf(entries).filter((e) => e.kind !== 'call').map((e) => `${e.kind}:${e.id ?? ''}:${e.task ?? ''}`).join(' ');

// SC-AK-1759 — the start and the end of a background task
const shell = [call('t1', 'Bash', { command: 'sleep 9', run_in_background: true }), result('t1', { backgroundTaskId: 'b1' })];
out('session: SC-AK-1759 — команда в фоне — начало задачи', kinds(shell), 'background:t1:b1');
out('session: SC-AK-1759 — начало несёт время записи', String(eventsOf(shell).at(-1).at === Date.parse(T)), 'true');
out('session: SC-AK-1759 — асинхронный агент — начало задачи', kinds([call('t2', 'Agent', { description: 'd' }), result('t2', { isAsync: true, agentId: 'a2' })]), 'background:t2:a2');
out('session: SC-AK-1759 — уведомление со статусом — конец задачи', kinds([...shell, notice('t1', 'b1', 'completed')]), 'background:t1:b1 backgroundEnd:t1:b1');
out('session: SC-AK-1759 — уведомление без конечного статуса концом не считается', kinds([...shell, notice('t1', 'b1', 'running')]), 'background:t1:b1');
out('session: SC-AK-1759 — вызов остановки — конец задачи', kinds([...shell, call('t3', 'TaskStop', { task_id: 'b1' })]), 'background:t1:b1 backgroundEnd::b1');
const logged = [call('t6', 'Bash', { command: 'bash push-ahead.sh', run_in_background: true }), { ...result('t6', { backgroundTaskId: 'b6' }), message: { content: [{ type: 'tool_result', tool_use_id: 't6', content: 'Command running in background with ID: b6. Output is being written to: /tmp/My Dir/b6.output. You will be notified.' }] } }];
out('session: SC-AK-1797 — начало команды несёт файл вывода', eventsOf(logged).at(-1).output, '/tmp/My Dir/b6.output');
out('session: SC-AK-1797 — уведомление несёт статус и файл вывода', JSON.stringify(eventsOf([...logged, { type: 'queue-operation', content: '<task-notification>\n<task-id>b6</task-id>\n<tool-use-id>t6</tool-use-id>\n<output-file>/o/b6.output</output-file>\n<status>killed</status>\n</task-notification>' }]).at(-1)), '{"kind":"backgroundEnd","id":"t6","task":"b6","output":"/o/b6.output","status":"killed"}');
out('session: SC-AK-1759 — обычный вызов задачей не считается', kinds([call('t4', 'Bash', { command: 'ls' }), result('t4', { stdout: '' })]), '');
out('session: SC-AK-1759 — отказанный запуск задачей не считается', kinds([call('t5', 'Bash', { command: 'x', run_in_background: true }), result('t5', { backgroundTaskId: 'b5' }, { is_error: true })]), '');
out('session: SC-AK-1759 — монитор задачей не считается', kinds([call('t6', 'Monitor', { command: 'x' }), result('t6', { backgroundTaskId: 'm6' })]), '');
out('session: SC-AK-1759 — конец хода без отказа — событие', kinds([{ type: 'system', subtype: 'stop_hook_summary' }, { type: 'system', subtype: 'stop_hook_summary', hookErrors: ['BLOCKED by turn-exit-guard: open'] }]), 'ended::');
const closed = { type: 'assistant', message: { stop_reason: 'end_turn', content: [{ type: 'text', text: 'готово' }] } };
const feedback = { type: 'user', message: { content: 'Stop hook feedback:\nBLOCKED by turn-exit-guard: open' } };
out('session: SC-AK-1759 — закрытый ход последней записью — ещё не конец', kinds([closed]), '');
out('session: SC-AK-1759 — служебная запись за закрытым ходом — ещё не конец', kinds([closed, { type: 'last-prompt' }, { type: 'custom-title' }]), '');
out('session: SC-AK-1759 — за закрытым ходом слово владельца — конец хода', kinds([closed, { type: 'user', message: { content: 'дальше' } }]), 'ended::');
out('session: SC-AK-1759 — за закрытым ходом новый вызов — конец хода', kinds([closed, call('t7', 'Read', {})]), 'ended::');
out('session: SC-AK-1759 — отказ остановки после служебных записей — не конец', kinds([closed, { type: 'last-prompt' }, { type: 'queue-operation', operation: 'enqueue', content: 'x' }, feedback, { type: 'last-prompt' }]), 'refusal::');
out('session: SC-AK-1759 — части одного ответа — один конец хода', kinds([closed, closed, { type: 'user', message: { content: 'дальше' } }]), 'ended::');
const resumed = [call('t2', 'Agent', { description: 'd' }), result('t2', { isAsync: true, agentId: 'a2' }), notice('t2', 'a2', 'completed'), call('t9', 'SendMessage', { to: 'a2' }), result('t9', { success: true, resumedAgentId: 'a2' })];
out('session: SC-AK-1759 — возобновлённый агент — снова начало задачи', kinds(resumed), 'background:t2:a2 backgroundEnd:t2:a2 background:t9:a2');
out('session: SC-AK-1759 — уведомление возобновлённого агента несёт номер вызова сообщения', kinds([...resumed, notice('t9', 'a2', 'completed')]).split(' ').at(-1), 'backgroundEnd:t9:a2');
const several = { type: 'queue-operation', operation: 'enqueue', content: '<task-notification>\n<task-id>b1</task-id>\n<task-id>b2</task-id>\n<status>stopped</status>\n</task-notification>' };
out('session: SC-AK-1759 — уведомление о нескольких задачах — конец каждой', kinds([several]), 'backgroundEnd::b1 backgroundEnd::b2');
out('session: SC-AK-1759 — служебная запись хука за закрытым ходом — не конец', kinds([closed, { type: 'user', isMeta: true, message: { content: 'Goal check-in' } }, feedback]), 'refusal::');
const goesOn = { type: 'queue-operation', operation: 'enqueue', content: '<task-notification>\n<task-id>a2</task-id>\n<status>completed</status>\n<summary>Agent "d" is waiting on its own background work</summary>\n</task-notification>' };
out('session: SC-AK-1759 — агент ждёт свою фоновую работу — не конец задачи', kinds([call('t2', 'Agent', { description: 'd' }), result('t2', { isAsync: true, agentId: 'a2' }), goesOn]), 'background:t2:a2');
out('session: SC-AK-1759 — запись субагента событий не даёт', kinds([{ ...call('t1', 'Bash', { command: 'x', run_in_background: true }), isSidechain: true }, { ...result('t1', { backgroundTaskId: 'b1' }), isSidechain: true }]), '');

// SC-AK-1760 — the record is read by pieces
const dir = mkdtempSync(join(tmpdir(), 'tf-lines-'));
const file = join(dir, 'r.jsonl');
const lines = ['{"uuid":"a","n":"первая строка"}', '', '{"uuid":"b","n":"вторая, длиннее куска"}', '{"uuid":"c"}'];
writeFileSync(file, lines.join('\n'));
out('session: SC-AK-1760 — строка через край куска собирается целой', [...linesOf(file, 7)].join(' ~ '), lines.join(' ~ '));
out('session: SC-AK-1760 — кусок больше файла даёт те же строки', [...linesOf(file)].join(' ~ '), lines.join(' ~ '));
writeFileSync(file, `${lines.join('\n')}\n`);
out('session: SC-AK-1760 — перевод строки в конце пустой строки не добавляет', String([...linesOf(file, 5)].length), '4');
rmSync(dir, { recursive: true, force: true });
out('session: SC-AK-1760 — источник записей без файла записи отвечает пусто', String(openAt(process.cwd()).entry('/nowhere/x.jsonl', 'a')), 'null');
JS

if [ -n "${TF_ALONE:-}" ]; then
    suite_result "сценарий task flow: фоновые задачи сессии"
fi
