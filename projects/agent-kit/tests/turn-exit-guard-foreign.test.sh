#!/usr/bin/env bash
# Сценарии отказа чужой проверки остановки: событие отказа называет проверку, мера простоя судит
# все отказы остановки после последнего вызова, удержание называет чужой отказ одной строкой без
# меню владельцу. Файл подключается из `turn-exit-guard.test.sh` и берёт его обвязку: `te_run`,
# `transcript`, `say`, `edited`, `input_stop`, `expect_stop` и `expect_reason`.
if [ -z "${TESTS:-}" ]; then
    echo "набор подключается из turn-exit-guard.test.sh" >&2
    return 1 2>/dev/null || exit 1
fi

# --- событие отказа и мера простоя, над двойниками ------------------------------------------------
te_run <<'JS'
import { buildModel } from '../assets/checks/flow-model.mjs';
import { isWriteCommand, saysStop } from '../assets/checks/flow-data.mjs';
import { holdReason, menuCause } from '../assets/checks/flow-verdict.mjs';
import { eventsOf, refusalBy } from '../assets/task-flow/source/session.mjs';
import * as session from '../assets/task-flow/measure/session.mjs';

const model = buildModel(new URL('../assets/task-flow/flow.js', import.meta.url).pathname);
const data = { words: model.words, expect: model.expect, rules: { saysStop, isWriteCommand } };
const out = (label, got, want) => console.log(`${label}|${got}|${want}`);

const feedback = (body) => `Stop hook feedback:\n${body}`;
const DRAFT = feedback('BLOCKED by git-guard-draft-ready: 1 request is abandoned as a draft');
const ENGINE = feedback('BLOCKED by turn-exit-guard: The scenario is not over');
const JUDGE = feedback('Agent hook condition was not met: BLOCKED by turn-judge: the owner said «делай»');
const JUDGE_BARE = feedback("Agent hook condition was not met: I couldn't read .claude/hooks/turn-judge.md");
const BROKEN = feedback('[command hook 1]: dispatch.sh: line 2: syntax error');

out('menu: SC-AK-1830 — имя проверки в начале строки', refusalBy(DRAFT), 'git-guard-draft-ready');
out('menu: SC-AK-1830 — имя после префикса модельной проверки', refusalBy(JUDGE), 'turn-judge');
out('menu: SC-AK-1830 — префикс модельной проверки без имени — модельная проверка', refusalBy(JUDGE_BARE), 'turn-judge');
out('menu: SC-AK-1830 — отказ без всякого имени — null', String(refusalBy(BROKEN)), 'null');
out('menu: SC-AK-1830 — имя ниже первой строки не берётся', String(refusalBy(feedback('нет имени\nBLOCKED by x-guard: y'))), 'null');
const recorded = eventsOf([{ type: 'user', message: { content: DRAFT } }]).find((event) => event.kind === 'refusal');
out('menu: SC-AK-1830 — событие записи несёт имя проверки', recorded?.by, 'git-guard-draft-ready');

const NOW = Date.parse('2026-11-22T12:00:00Z');
const refusal = (text) => ({ kind: 'refusal', text, by: refusalBy(text) });
const called = (name) => ({ kind: 'call', name, input: {}, blocked: false });
const timed = (list) => ({ session: { events: () => list, now: () => NOW } });
const idle = (list) => session.idle(timed(list))(data);
const shown = (value) => (value && typeof value === 'object' ? JSON.stringify(value) : String(value));
const stage = { state: 'этап-идёт', index: 7, reason: null };
const step = { number: '1.2', name: 'x', left: 3 };
const hold = (list) => holdReason(model, stage, step, { cause: menuCause((name) => (name === 'measure.session.idle' ? idle(list) : false)), task: '7' });

const draftHold = hold([called('Edit'), refusal(DRAFT)]);
out('menu: SC-AK-1831 — после отказа проверки черновика — не простой', shown(idle([called('Edit'), refusal(DRAFT)])), '{"foreign":"git-guard-draft-ready"}');
out('menu: SC-AK-1831 — удержание называет чужой отказ и шаг, без меню', String(draftHold.includes('`git-guard-draft-ready`') && draftHold.includes('The next move is step 1.2') && !draftHold.includes('«стоп»')), 'true');
out('menu: SC-AK-1831 — при идущей фоновой задаче — ожидание, не чужой отказ', shown(idle([{ kind: 'background', id: 'a', task: 't', at: NOW - 60_000 }, refusal(DRAFT)])), 'false');

out('menu: SC-AK-1832 — после отказа самого движка — простой', shown(idle([called('Edit'), refusal(ENGINE)])), 'true');
out('menu: SC-AK-1832 — запись без имени — простой, как прежде', shown(idle([called('Edit'), { kind: 'refusal', text: 'x' }])), 'true');

const bothHold = hold([called('Edit'), refusal(ENGINE), refusal(JUDGE)]);
out('menu: SC-AK-1836 — отказ движка и модельной проверки в одну остановку — простой', shown(idle([called('Edit'), refusal(ENGINE), refusal(JUDGE)])), 'true');
out('menu: SC-AK-1836 — такой простой называет меню', String(bothHold.includes("owner's menu") && bothHold.includes('«стоп»')), 'true');
out('menu: SC-AK-1836 — отказ движка до последнего вызова не считается', shown(idle([refusal(ENGINE), called('Read'), refusal(DRAFT)])), '{"foreign":"git-guard-draft-ready"}');

out('menu: SC-AK-1837 — отказ модельной проверки без имени — не простой', shown(idle([called('Edit'), refusal(JUDGE_BARE)])), '{"foreign":"turn-judge"}');
out('menu: SC-AK-1837 — отказ без всякого имени — простой', shown(idle([called('Edit'), refusal(BROKEN)])), 'true');
JS

# --- через хук: запись 20.11 — отказ проверки черновика, потом остановка без вызова ---------------
draft_refused() { jq -c -n '{type:"user",message:{content:"Stop hook feedback:\nBLOCKED by git-guard-draft-ready: снять черновик #3453"}}'; }
FOREIGN="$(input_stop "$(transcript "$(say 'делай')" "$(edited)" "$(draft_refused)")")"
expect_stop "menu: SC-AK-1831 — запись 20.11 держит остановку через хук" "$FOREIGN" BLOCK
expect_reason "menu: SC-AK-1831 — запись 20.11 называет чужой отказ" "$FOREIGN" 'The previous refusal came from `git-guard-draft-ready`'
foreign_menu="$(printf '%s' "$FOREIGN" | "$HOOKS/turn-exit-guard.sh" 2>/dev/null | jq -r '.reason // ""' 2>/dev/null)"
case "$foreign_menu" in
    *'«стоп»'*) report "menu: SC-AK-1831 — запись 20.11 меню владельцу не называет" "меню" "без меню" ;;
    *) report "menu: SC-AK-1831 — запись 20.11 меню владельцу не называет" "без меню" "без меню" ;;
esac
