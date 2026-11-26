#!/usr/bin/env bash
# Сценарии остановки владельца: остановка — состояние над словами записи, а не последнее слово.
#
# Каждая строка таблицы «Переходы» плана эпика RT-3602 — свои случаи SC-AK-2010 с номером строки в
# метке. Удержание CI при стоящей остановке — SC-AK-2011. Строка случая начинается с группы плана,
# `end:`, по ней случаи считает проверка шага.
. "$(dirname "${BASH_SOURCE[0]}")/turn-exit-lib.sh"

echo "остановка владельца"

TESTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

out="$(cd "$TESTS" && node --input-type=module 2>&1 <<'JS'
import { buildModel } from '../assets/checks/flow-model.mjs';
import { isWriteCommand, saysStop } from '../assets/checks/flow-data.mjs';
import { decide } from '../assets/checks/flow-verdict.mjs';
import * as ci from '../assets/task-flow/measure/ci.mjs';
import * as owner from '../assets/task-flow/measure/owner.mjs';
import { wordsOf } from '../assets/task-flow/source/owner.mjs';

const model = buildModel(new URL('../assets/task-flow/flow.js', import.meta.url).pathname);
const data = { words: model.words, expect: model.expect, rules: { saysStop, isWriteCommand } };
const out = (label, got, want) => console.log(`${label}|${got}|${want}`);

// Записи сессии: набранное, из очереди, Esc, ответ меню, отказ от вызова.
let clock = Date.parse('2026-11-24T04:00:00Z');
const tick = (ms = 10_000) => new Date((clock += ms)).toISOString();
const typed = (text, ms) => ({ type: 'user', timestamp: tick(ms), message: { content: [{ type: 'text', text }] } });
const queued = (text, kind = 'human') => ({ type: 'attachment', timestamp: tick(), attachment: { type: 'queued_command', prompt: text, origin: { kind } } });
const esc = (ms) => ({ type: 'user', timestamp: tick(ms), message: { content: [{ type: 'text', text: '[Request interrupted by user]' }] } });
const escTool = () => ({ type: 'user', timestamp: tick(), message: { content: [{ type: 'text', text: '[Request interrupted by user for tool use]' }] } });
const menu = (answer) => ({ type: 'user', timestamp: tick(), toolUseResult: { answers: { 'Что дальше?': answer } }, message: { content: [{ type: 'tool_result', content: `Your questions have been answered: "Что дальше?"="${answer}"` }] } });
const refused = (text) => ({ type: 'user', timestamp: tick(), message: { content: [{ type: 'tool_result', content: `The user doesn't want to proceed with this tool use.${text ? ` To tell you how to proceed, the user said:\n${text}` : ''}` }] } });
const notice = () => queued('<task-notification><task-id>b1</task-id><status>completed</status></task-notification>', 'task');
const neighbour = () => ({ type: 'user', timestamp: tick(), origin: { kind: 'peer' }, message: { content: [{ type: 'text', text: 'продолжай' }] } });

const sourceOf = (entries) => ({ owner: { words: () => wordsOf(entries), last: () => wordsOf(entries).at(-1)?.text ?? null } });
const stateOf = (...entries) => {
    const stop = owner.stopStands(sourceOf(entries), data.words);
    return stop.stands ? `остановлена ${stop.by}` : 'работа';
};
const WORK = typed('делай задачу');
const STOPPED = [WORK, typed('стоп')];
const ESCAPED = [WORK, esc(30_000)];

// Строка 1: работа + Esc, слово остановки в начале, «не двигайся» и «остановить работу» внутри фразы.
out('end: SC-AK-2010 строка 1 — Esc ставит остановку', stateOf(WORK, esc()), 'остановлена esc');
for (const word of ['стоп', 'блин, стоп', 'я же сказал стоп', 'не двигайся дальше урод пока не скажу', 'Остановить работу', 'стоп, пиши инцидент', 'Стоп. Сначала напиши инцидент', 'Стоп, на сегодня хватит']) {
    out(`end: SC-AK-2010 строка 1 — «${word}» ставит остановку`, stateOf(WORK, typed(word)), 'остановлена word');
}
out('end: SC-AK-2010 строка 1 — /stop из очереди ставит остановку', stateOf(WORK, queued('/stop')), 'остановлена word');
out('end: SC-AK-2010 строка 1 — «вливай и подожди CI» не ставит', stateOf(WORK, typed('вливай и подожди CI')), 'работа');
out('end: SC-AK-2010 строка 1 — «вливай, не жди CI» не ставит', stateOf(WORK, typed('вливай, не жди CI')), 'работа');
for (const word of ['сука прекрати', 'ебаная тварь, хватит', 'блять прекрати работать', 'стоп, сделай паузу', 'стоп и верни меню', 'стоп, тебе надо стоять и ждать', 'стоп! сначала спрашивай меня', 'стоп, сделай перерыв']) {
    out(`end: SC-AK-2010 строка 1 — «${word}» ставит остановку`, stateOf(WORK, typed(word)), 'остановлена word');
}
for (const word of ['чини стоп-хук', 'сделай, чтобы Stop hook не держал ход', 'почини проверку stop в хуке', 'Ожидание и убрать «стоп»', "keep going, don't stop", 'Стоп, хватит останавливаться', 'как работает стоп?', 'что значит стоп?']) {
    out(`end: SC-AK-2010 строка 1 — «${word}»: «стоп» — имя, не остановка`, stateOf(WORK, typed(word)), 'работа');
}

// Строка 2: Esc и сообщение после метки быстрее 2 секунд — судится само сообщение.
out('end: SC-AK-2010 строка 2 — Esc и вопрос через секунду — работа', stateOf(WORK, esc(), typed('что ты делаешь?', 1_000)), 'работа');
out('end: SC-AK-2010 строка 2 — Esc и «стоп» через секунду — остановка словом', stateOf(WORK, esc(), typed('стоп', 1_000)), 'остановлена word');
out('end: SC-AK-2010 строка 2 — Esc и вопрос через 5 секунд — остановка', stateOf(WORK, esc(), typed('что ты делаешь?', 5_000)), 'остановлена esc');
// 24.11 в 00:38:44: приказ, набранный за 3 секунды до Esc, хост доставил через 60 мс после метки — судится он сам.
const enqueue = (text) => ({ type: 'queue-operation', operation: 'enqueue', timestamp: tick(), content: text });
out('end: SC-AK-2010 строка 2 — приказ из очереди сразу после Esc — работа', stateOf(WORK, enqueue('Исправляй это прямо сейчас'), esc(3_000), typed('Исправляй это прямо сейчас', 60)), 'работа');

// Строка 3: отказ владельца от вызова с меткой Esc, с текстом и без.
out('end: SC-AK-2010 строка 3 — отказ от вызова с меткой Esc ставит остановку', stateOf(WORK, refused(''), escTool()), 'остановлена esc');
out('end: SC-AK-2010 строка 3 — отказ с текстом «стоп» ставит остановку', stateOf(WORK, refused('стоп')), 'остановлена word');
out('end: SC-AK-2010 строка 3 — текст отказа — слово владельца', wordsOf([refused('нет, не заводи')]).map((w) => `${w.kind}:${w.text}`).join(','), 'refusal:нет, не заводи');

// Строка 4: слово остановки и приказ после него.
for (const word of ['хватит тупить, чини', 'подожди CI и вливай', 'хватит останавливаться, продолжай']) {
    out(`end: SC-AK-2010 строка 4 — «${word}» — работа`, stateOf(WORK, typed(word)), 'работа');
}

// Строка 5: остановка + вопрос, брань, «пиши инцидент» — остановка стоит.
for (const word of ['Стоп. Почему ты всё ещё работаешь?!', 'какого хрена ты не остановился', 'ну что там с CI?', 'пиши инцидент', 'кто тебе сказал вливай?', 'сука! кто тебе сказал вливай?', 'кто разрешил влить 0.40 в main?', 'жди, пока я не скажу продолжай', 'я не говорил продолжай', 'пиши инцидент на это поведение и отправляй в приёмник', 'не вливай пока', 'почему ты продолжаешь работать после "стоп"?']) {
    out(`end: SC-AK-2010 строка 5 — «${word}» после «стоп» — остановка стоит`, stateOf(...STOPPED, typed(word)).startsWith('остановлена'), 'true');
}
out('end: SC-AK-2010 строка 5 — вопрос после Esc — остановка стоит', stateOf(...ESCAPED, typed('что ты сейчас делал?')), 'остановлена esc');
// Слово владельца 26.11 «Жалоба — тоже приказ»: жалоба на остановку снимает её, и в вопросе тоже.
for (const word of ['почему ты бросил эпик?', 'ебаное ты чмо тупое, ты снова остановился', 'ты заблокировал работу, сука', 'почему ты стоишь?', 'хватит стоять', 'не останавливайся', 'почему встал?', 'работа полностью стоит', 'continue', 'давай RT-3673', 'ну что там? делай дальше']) {
    out(`end: SC-AK-2010 строка 6 — жалоба «${word}» после Esc — работа`, stateOf(...ESCAPED, typed(word)), 'работа');
}

// Строка 6: остановка + рабочий приказ, выбор работы в меню, одобрение плана — работа.
for (const word of ['продолжай', 'вливай', 'выпусти кит', 'Одобряю план RT-3672', 'отправь отчёт об инциденте в приёмник, затем продолжай работу по эпику']) {
    out(`end: SC-AK-2010 строка 6 — «${word}» после «стоп» — работа`, stateOf(...STOPPED, typed(word)), 'работа');
}
out('end: SC-AK-2010 строка 6 — выбор работы в меню после Esc — работа', stateOf(...ESCAPED, menu('Отложить RT-3656')), 'работа');

// Строка 7: уведомление, сообщение соседней сессии, «без предпочтения», меню без ответа — без перемен.
out('end: SC-AK-2010 строка 7 — уведомление после Esc — остановка стоит', stateOf(...ESCAPED, notice()), 'остановлена esc');
out('end: SC-AK-2010 строка 7 — сообщение соседней сессии после «стоп» — остановка стоит', stateOf(...STOPPED, neighbour()), 'остановлена word');
out('end: SC-AK-2010 строка 7 — «без предпочтения» в меню после «стоп» — остановка стоит', stateOf(...STOPPED, menu('без предпочтения')), 'остановлена word');
out('end: SC-AK-2010 строка 7 — меню без ответа после Esc — остановка стоит', stateOf(...ESCAPED), 'остановлена esc');
out('end: SC-AK-2010 строка 7 — ответ меню без задачи после «стоп» — остановка стоит', stateOf(...STOPPED, menu('синий')), 'остановлена word');
out('end: SC-AK-2010 строка 6 — «подскажу путь» в меню после «стоп» — работа', stateOf(...STOPPED, menu('подскажу путь')), 'работа');
out('end: SC-AK-2010 строка 6 — «у тебя есть 10 минут чтобы выпустить пакет» после Esc — работа', stateOf(...ESCAPED, typed('у тебя есть 10 минут чтобы выпустить пакет')), 'работа');
out('end: SC-AK-2010 строка 6 — «заверши текущий шаг» после Esc — работа', stateOf(...ESCAPED, typed('заверши текущий шаг и напиши передачу')), 'работа');

// Случаи отпуска движка читают то же состояние.
const WROTE = { 'measure.session.wrote': true };
const reader = (entries) => (name) =>
    name === 'measure.owner.saidStop' ? owner.saidStop(sourceOf(entries))(data) : name === 'measure.owner.interrupted' ? owner.interrupted(sourceOf(entries))(data) : (WROTE[name] ?? false);
const stage = { state: 'этап-идёт', index: 7, reason: null };
out('end: SC-AK-2010 строка 5 — «стоп» и вопрос — ход отпущен словом', decide(model, reader([...STOPPED, typed('почему ты продолжаешь?')]), stage)?.release ?? 'held', 'a stop word of the owner');
out('end: SC-AK-2010 строка 5 — Esc и «пиши инцидент» — ход отпущен Esc', decide(model, reader([...ESCAPED, typed('пиши инцидент')]), stage)?.release ?? 'held', 'the owner interrupted the turn');
out('end: SC-AK-2010 строка 6 — «стоп» и «продолжай» — ход держится', decide(model, reader([...STOPPED, typed('продолжай')]), stage)?.release ?? 'held', 'held');

// SC-AK-2011: пока остановка стоит, удержание CI ход не держит.
const PR = { number: 1, head: 'RT-1-x', headRefOid: 'abc', base: 'main', createdAt: clock - 3_600_000 };
const runOf = (over) => ({ id: 7, attempt: 1, status: 'completed', conclusion: 'failure', endedAt: clock, ...over });
const ciHost = (runs) => ({ issue: () => null, pulls: () => [], openPulls: () => [PR], runs: () => runs, pipeline: () => ({ file: 'ci.yml', bases: ['main'] }) });
const holdOf = (runs, entries) =>
    ci.hold({ git: { branch: () => PR.head }, host: ciHost(runs), tree: { copyEpic: () => null, list: () => [], read: () => null }, session: { events: () => [], now: () => clock }, owner: sourceOf(entries).owner })(data);
const kindOf = (h) => (h ? h.kind : 'none');
out('end: SC-AK-2011 — «стоп» и вопрос: красный запуск не держит', kindOf(holdOf([runOf({})], [...STOPPED, typed('почему?')])), 'none');
out('end: SC-AK-2011 — Esc: идущий запуск без слежения не держит', kindOf(holdOf([runOf({ status: 'in_progress', conclusion: null })], ESCAPED)), 'none');
out('end: SC-AK-2011 — «стоп»: свежая вершина не держит', kindOf(holdOf([], STOPPED)), 'none');
out('end: SC-AK-2011 — после «продолжай» красный запуск снова держит', kindOf(holdOf([runOf({})], [...STOPPED, typed('продолжай')])), 'red');
JS
)"
code=$?
report "блок случаев отработал без ошибки" "$code" 0
[ "$code" -eq 0 ] || printf '%s\n' "$out" | grep -v '|' | head -5 >&2
while IFS='|' read -r label got want; do
    [ -n "$label" ] || continue
    report "$label" "$got" "$want"
done <<< "$out"

suite_result "остановка владельца"
