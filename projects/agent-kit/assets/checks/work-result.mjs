#!/usr/bin/env node
/**
 * The lines of the work result for the report, counted from the observations of the tree by the same
 * functions the hook at the end of a turn and the reading of merges use: the events of the records,
 * the merges, the editions, the verdicts.
 *
 *   node work-result.mjs --observations <dir> --until YYYY-MM-DD [--days N] [--no-package]
 *
 * Prints one JSON object: `{ result, lines }`. `result` holds the numbers, never a null among the
 * lines of the result; `lines` holds the text the report prints.
 */
import { pairsOf, idleOf, reasksOf, deadEndsOf } from './record-count.mjs';
import { dayMerges } from './merge-read.mjs';
import { readObservations } from './epic-window.mjs';

const DAY = 24 * 60 * 60 * 1000;
/** The role whose refusal is the verdict «цель не достигнута». */
const GOAL_ROLE = 'goal-critic';

const option = (argv, name) => {
    const at = argv.indexOf(name);
    return at >= 0 ? argv[at + 1] : undefined;
};

/** The days of a period, oldest first. */
export const daysOf = (until, days) =>
    Array.from({ length: days }, (_, i) => new Date(Date.parse(`${until}T00:00:00Z`) - (days - 1 - i) * DAY).toISOString().slice(0, 10));

/** The events of the records back from their observation lines, in the shape the counter reads. */
export function eventsOf(observations) {
    return observations
        .filter((o) => typeof o.ev === 'string' && o.ev.startsWith('record-') && o.ev !== 'record-skip' && o.ev !== 'record-broken' && o.t)
        .map((o) => ({
            at: o.t,
            ev: o.ev.slice('record-'.length),
            session: o.sid ?? null,
            branch: o.task ?? null,
            kind: o.kind,
            check: o.check,
            reask: o.reask === '1',
            answered: o.answered,
            corr: o.corr === '1',
        }))
        .sort((a, b) => a.at.localeCompare(b.at));
}

const onDay = (day) => (item) => String(item.at ?? item.t ?? item.from).startsWith(day);
const share = (part, whole) => (whole > 0 ? Math.round((part / whole) * 10000) / 100 : 0);
const count = (list, key) => {
    const out = {};
    for (const item of list) out[key(item)] = (out[key(item)] ?? 0) + 1;
    return out;
};
const byCountThenName = (entries) => entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

/** The task a verdict counts against, as the report names it. */
const verdictTask = (o) => (o.task === 'none' || (!o.task && !o.epic) ? 'без задачи' : (o.task ?? `эпик ${o.epic}`));

/** The numbers of one day. */
export function dayResult(observations, events, day) {
    const of = events.filter(onDay(day));
    const calls = of.filter((e) => e.ev === 'call').length;
    const refusals = of.filter((e) => e.ev === 'refusal');
    const byCheck = count(refusals, (e) => e.check || 'unnamed');
    // Only the goal role judges the goal: «частично» is written as a refusal by the hook and counts here.
    const verdicts = observations.filter(
        (o) => o.ev === 'role-verdict' && o.res === GOAL_ROLE && o.verdict === 'refused' && String(o.t).startsWith(day)
    );
    return {
        day,
        calls,
        refusals: refusals.length,
        refusalsPer100: share(refusals.length, calls),
        byCheck: Object.fromEntries(byCountThenName(Object.entries(byCheck)).map(([name, n]) => [name, { refusals: n, per100: share(n, calls) }])),
        pairs: Object.fromEntries(byCountThenName(Object.entries(count(pairsOf(events).filter(onDay(day)), (p) => `${p.first} → ${p.second}`)))),
        idleMinutes: idleOf(events).filter((s) => s.day === day).reduce((sum, s) => sum + s.minutes, 0),
        reasks: reasksOf(events).filter(onDay(day)).length,
        interrupts: of.filter((e) => e.ev === 'interrupt').length,
        ownerWords: of.filter((e) => e.ev === 'word').length,
        corrections: of.filter((e) => e.ev === 'word' && e.corr).length,
        deadEnds: deadEndsOf(events).filter((d) => String(d.to).startsWith(day)).length,
        goalNotMet: verdicts.length,
        goalNotMetByTask: count(verdicts, verdictTask),
        ...dayMerges(observations, day),
    };
}

/** The result of a period: a result per day and the sums the lines print. */
export function resultOf(observations, days) {
    const events = eventsOf(observations);
    return { days: days.map((day) => dayResult(observations, events, day)) };
}

const hours = (minutes) => (minutes / 60).toFixed(1);

/**
 * The lines of the result, as the report prints them. «Принято с первого раза» is not among them: it
 * is counted from the outcomes of requests, and the report puts it in.
 */
export function linesOf(result) {
    const sum = (key) => result.days.reduce((total, d) => total + d[key], 0);
    const lines = ['', 'результат работы:'];
    lines.push(`  Задачи слиты: ${sum('tasksMerged')}, с видимым взятием ${sum('tasksTimed')}, от взятия ${hours(sum('takenMinutes'))} ч`);
    lines.push(`  Простой: ${hours(sum('idleMinutes'))} ч`);
    lines.push('  Отказов на сто вызовов:');
    for (const d of result.days) {
        lines.push(`    ${d.day}: ${d.refusalsPer100.toFixed(2)} (${d.refusals} из ${d.calls})`);
        for (const [name, c] of Object.entries(d.byCheck)) lines.push(`      ${name}: ${c.per100.toFixed(2)}`);
    }
    const pairs = {};
    for (const d of result.days) for (const [pair, n] of Object.entries(d.pairs)) pairs[pair] = (pairs[pair] ?? 0) + n;
    const pairList = byCountThenName(Object.entries(pairs));
    lines.push(`  Подряд: ${pairList.reduce((total, [, n]) => total + n, 0)}`);
    for (const [pair, n] of pairList.slice(0, 8)) lines.push(`    ${pair}: ${n}`);
    lines.push(`  Переспросили: ${sum('reasks')}`);
    lines.push(`  Прерывания хода: ${sum('interrupts')} при ${sum('ownerWords')} словах владельца`);
    lines.push(`  Правки владельца: ${sum('corrections')}`);
    const verdicts = {};
    for (const d of result.days) for (const [task, n] of Object.entries(d.goalNotMetByTask)) verdicts[task] = (verdicts[task] ?? 0) + n;
    lines.push(`  Цель не достигнута: ${sum('goalNotMet')}`);
    for (const [task, n] of byCountThenName(Object.entries(verdicts))) lines.push(`    ${task}: ${n}`);
    lines.push('  Повторы ошибок: считается в приёмнике');
    return lines;
}

function main(argv) {
    const dir = option(argv, '--observations');
    const until = option(argv, '--until');
    if (!dir || !until) return 1;
    const result = resultOf(readObservations(dir), daysOf(until, Number(option(argv, '--days') ?? '1')));
    console.log(JSON.stringify({ result, lines: linesOf(result) }));
    return 0;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) process.exit(main(process.argv.slice(2)));
