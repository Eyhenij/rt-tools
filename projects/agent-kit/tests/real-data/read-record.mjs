#!/usr/bin/env node
/**
 * What every reader of the conversation record answers on one record file.
 *
 *   node read-record.mjs <record.jsonl> [--from <ISO time>] [--to <ISO time>]
 *
 * One line per reading, `<reader>: <answer>`. The suite on saved data runs it on the cut and compares
 * the lines with the answers a person read off the full record; run on the full record with the same
 * window, it gives the lines the suite holds. The readers of the shell facts are asked by the suite
 * itself.
 */
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { buildModel } from '../../assets/checks/flow-model.mjs';
import { approvingAnswer, readRecord, ROLES } from '../../assets/checks/flow-plan.mjs';
import { findDeadlocks, measureNudges, measureRefusals, measureTyped } from '../../assets/checks/owner-nudges.mjs';
import { open, wordOf } from '../../assets/task-flow/source/owner.mjs';
import { open as openSession } from '../../assets/task-flow/source/session.mjs';

const option = (argv, name) => {
    const at = argv.indexOf(name);
    return at >= 0 ? (argv[at + 1] ?? '') : '';
};

/** The entries of a window, read by the engine's own `readRecord` — the reader of `flow-plan.mjs`. */
function entriesIn(file, from, to) {
    return readRecord(file).filter((entry) => {
        const at = entry.timestamp ?? '';
        return !((from && at && at < from) || (to && at && at > to));
    });
}

/** The answers of the readers on the entries of a window, as lines. */
export function readings(entries, from, to) {
    const lines = [];
    const menus = entries.filter((entry) => entry.toolUseResult?.answers).map((entry) => wordOf(entry));
    lines.push(`menu answers: ${menus.length}`);
    menus.forEach((word, index) => lines.push(`menu answer ${index + 1}: ${word}`));

    // The owner source of the engine reads its record from a file named by the environment.
    const dir = mkdtempSync(join(tmpdir(), 'read-record-'));
    try {
        const file = join(dir, 'record.jsonl');
        writeFileSync(file, entries.map((entry) => JSON.stringify(entry)).join('\n') + '\n');
        process.env.RT_FLOW_TRANSCRIPT = file;
        const owner = open();
        lines.push(`owner typed messages: ${owner.messages().length}`);
        lines.push(`owner messages with a hook refusal: ${owner.messages().filter((text) => /BLOCKED by|Refused by/.test(text)).length}`);
        lines.push(`owner last word: ${owner.last()}`);
        // The session source of the engine: the refusals, the blocked calls and the menus it reads.
        const events = openSession().events();
        const count = (kind) => events.filter((event) => event.kind === kind).length;
        lines.push(`session refusals: ${count('refusal')}`);
        lines.push(`session blocked calls: ${count('blocked')}`);
        lines.push(`session menus: ${count('menu')}, answered ${events.filter((event) => event.kind === 'menu' && event.answered).length}`);
        lines.push(`session tool uses: ${openSession().toolUses().length}`);
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }

    for (const role of ROLES) {
        const calls = entries.flatMap((entry) =>
            entry.type === 'assistant' && Array.isArray(entry.message?.content)
                ? entry.message.content.filter(
                      (part) => part?.type === 'tool_use' && part.name === 'Agent' && part.input?.subagent_type === role
                  )
                : []
        );
        lines.push(`roleCalls ${role}: ${calls.length}`);
    }
    for (const task of ['RT-3268', 'RT-3269']) lines.push(`planApproval ${task}: ${approvingAnswer(entries, task)}`);

    const copies = [{ name: 'record', sessions: [{ id: 'record', entries }] }];
    const window = { from: from ? Date.parse(from) : 0, to: to ? Date.parse(to) : Date.parse('2100-01-01') };
    const nudge = buildModel(new URL('../../assets/task-flow/flow.js', import.meta.url).pathname).words.nudge;
    const nudges = measureNudges(copies, window, nudge);
    lines.push(`owner-nudges nudges: ${nudges.nudges} of ${nudges.calls} calls`);
    lines.push(`owner-nudges typed: ${measureTyped(copies, window).messages}`);
    const refusals = measureRefusals(copies, window);
    lines.push(`owner-nudges refusals: ${refusals.all} all, ${refusals.exit} at the exit, of ${refusals.calls} calls`);
    lines.push(`owner-nudges deadlocks: ${findDeadlocks(copies, window).length}`);
    return lines;
}

function main(argv) {
    const [file] = argv;
    if (!file) {
        console.error('usage: node read-record.mjs <record.jsonl> [--from <ISO>] [--to <ISO>]');
        return 2;
    }
    const from = option(argv, '--from');
    const to = option(argv, '--to');
    for (const line of readings(entriesIn(file, from, to), from, to)) console.log(line);
    return 0;
}

process.exit(main(process.argv.slice(2)));
