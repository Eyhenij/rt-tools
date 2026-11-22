#!/usr/bin/env bash
# Сценарии ожидания своей фоновой задачи: задача старше границы — зависшая, и удержание называет её;
# слежение за CI — ожидание, сервер — нет; прочитанное уведомление без шага держит остановку и
# называет шаг. Файл подключается из `turn-exit-guard.test.sh` и берёт его обвязку; бегун пакета
# зовёт его и сам по себе — тогда обвязку он поднимает сам.
if [ -z "${TESTS:-}" ]; then
    . "$(dirname "${BASH_SOURCE[0]}")/turn-exit-lib.sh"
    TESTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    TE_WAIT_ALONE=1
    echo "ожидание своей фоновой задачи"
fi
if ! declare -F te_run >/dev/null; then
    te_run() {
        local out label got want code
        out="$(cd "$TESTS" && node --input-type=module 2>&1)"
        code=$?
        report "блок случаев отработал без ошибки" "$code" 0
        [ "$code" -eq 0 ] || printf '%s\n' "$out" | grep -v '|' | head -5 >&2
        while IFS='|' read -r label got want; do
            [ -n "$label" ] || continue
            report "$label" "$got" "$want"
        done <<< "$out"
    }
fi

te_run <<'JS'
import { buildModel } from '../assets/checks/flow-model.mjs';
import { isWriteCommand } from '../assets/checks/flow-data.mjs';
import { decide, holdReason, menuCause } from '../assets/checks/flow-verdict.mjs';
import * as session from '../assets/task-flow/measure/session.mjs';

const model = buildModel(new URL('../assets/task-flow/flow.js', import.meta.url).pathname);
const data = { words: model.words, expect: model.expect, rules: { isWriteCommand } };
const out = (label, got, want) => console.log(`${label}|${got}|${want}`);

const NOW = Date.parse('2026-11-22T12:00:00Z');
const minutesAgo = (m) => NOW - m * 60_000;
const timed = (list) => ({ session: { events: () => list, now: () => NOW } });
const measure = (name, list) => session[name](timed(list))(data);
const called = (name, input = {}) => ({ kind: 'call', name, input, blocked: false });
const started = (id, m, command = 'pnpm test') => ({ kind: 'background', id, task: `task-${id}`, at: minutesAgo(m), command, output: `/tmp/tasks/task-${id}.output` });
const over = (id) => ({ kind: 'backgroundEnd', id, task: `task-${id}`, output: `/tmp/tasks/task-${id}.output` });
const BG = called('Bash', { command: 'pnpm test', run_in_background: true });
const stage = { state: 'этап-идёт', index: 7, reason: null };
const step = { number: '1.2', name: 'x', left: 3 };
const read = (list) => (name) => {
    const key = name.replace(/^measure\.session\./, '');
    if (!name.startsWith('measure.session.') || typeof session[key] !== 'function') return false;
    // A measurer that needs a port this double has not — the role's tools — answers no.
    try {
        return measure(key, list);
    } catch {
        return false;
    }
};
const hold = (list) => holdReason(model, stage, step, { cause: menuCause(read(list)), task: '7' });

// --- SC-AK-1838: задача старше границы — зависшая ---------------------------------------------------
const hungList = [called('Edit'), BG, started('a', 95)];
out('wait: SC-AK-1838 — задача 95 минут — зависшая, с номером и возрастом', JSON.stringify(measure('hung', hungList)), '{"task":"task-a","minutes":95,"output":"/tmp/tasks/task-a.output"}');
out('wait: SC-AK-1838 — задача 58 минут — не зависшая', String(measure('hung', [BG, started('a', 58)])), 'false');
out('wait: SC-AK-1838 — кончившаяся задача — не зависшая', String(measure('hung', [BG, started('a', 95), over('a')])), 'false');
const agentTask = { ...started('r', 105), agent: true };
out('wait: SC-AK-1838 — агент старше границы — не зависший и не ожидание', `${measure('hung', [called('Agent'), agentTask])} ${measure('waiting', [called('Agent'), agentTask])}`, 'false false');
const hungHold = hold(hungList);
out('wait: SC-AK-1838 — удержание называет зависшую задачу и её вывод', String(hungHold.includes('`task-a` runs 95 minutes') && hungHold.includes('/tmp/tasks/task-a.output')), 'true');
out('wait: SC-AK-1838 — удержание при зависшей задаче меню не зовёт', String(!hungHold.includes("The one move is the owner's menu")), 'true');
out('wait: SC-AK-1838 — после отказа зависшая задача важнее простоя', JSON.stringify(Object.keys(menuCause(read([...hungList, { kind: 'refusal', text: 'x', by: 'turn-exit-guard' }])) ?? {})), '["hung"]');
const blockedBy = (by) => ({ kind: 'blocked', by, reason: 'r' });
out('wait: SC-AK-1838 — запрет другой проверки дважды важнее зависшей задачи — меню', JSON.stringify(Object.keys(menuCause(read([...hungList, blockedBy('git-guard-delivery'), blockedBy('git-guard-delivery')])) ?? {})), '["by"]');

// --- SC-AK-1840: слежение за CI — ожидание, сервер — нет ---------------------------------------------
const WATCH = 'gh run watch 123 --exit-status';
out('wait: SC-AK-1840 — слежение за CI отпускает остановку', String(measure('waiting', [called('Bash'), started('w', 5, WATCH)])), 'true');
for (const command of ['pnpm run serve:stand', 'pnpm run storybook:ui-kit-v2', 'npx nx serve admin', 'nx run message-bus:serve', 'nx run-many -t serve', 'node apps/auth-example-e2e/stand/up.mjs']) {
    out(`wait: SC-AK-1840 — сервер «${command}» — не ожидание`, String(measure('waiting', [called('Bash'), started('s', 5, command)])), 'false');
}
for (const command of ['pnpm exec storybook build', 'npx storybook@8 build', 'eslint projects/ui-kit-v2/.storybook', 'grep -rn storybook docs']) {
    out(`wait: SC-AK-1840 — «${command}» — не сервер, ожидание`, String(measure('waiting', [called('Bash'), started('b', 5, command)])), 'true');
}
out('wait: SC-AK-1840 — сервер старше границы — не зависший', String(measure('hung', [called('Bash'), started('s', 200, 'pnpm run serve:stand')])), 'false');
out('wait: SC-AK-1840 — сборка витрины — ожидание', String(measure('waiting', [called('Bash'), started('b', 5, 'pnpm exec build-storybook')])), 'true');

// --- SC-AK-1841: прочитанное уведомление без шага держит остановку и называет шаг ---------------------
const readList = [called('Edit'), BG, started('a', 10), over('a'), called('Read', { file_path: '/tmp/tasks/task-a.output' })];
out('wait: SC-AK-1841 — после прочтения ожидания нет', String(measure('waiting', readList)), 'false');
out('wait: SC-AK-1841 — после прочтения непрочитанного нет', String(measure('unread', readList)), 'false');
const readMeasures = (list) => (name) => (name === 'measure.session.wrote' ? true : read(list)(name));
out('wait: SC-AK-1841 — остановка держится', String(decide(model, readMeasures(readList), stage)), 'null');
out('wait: SC-AK-1841 — до прочтения та же остановка отпущена ожиданием', JSON.stringify(decide(model, readMeasures([called('Edit'), BG, started('a', 10)]), stage)), '{"release":"a background task of the session runs"}');
out('wait: SC-AK-1841 — удержание называет следующий шаг', String(hold(readList).includes('The next move is step 1.2')), 'true');
JS

[ -n "${TE_WAIT_ALONE:-}" ] && suite_result "ожидание своей фоновой задачи"
