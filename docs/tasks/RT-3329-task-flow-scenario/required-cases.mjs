// A check of the plan of RT-3329: every required case of one group is run by its suite and passes.
// The list of required cases is the table «Обязательные случаи» of the committed plan — rows
// `| SC-AK-NNNN | <group> | <name> |`. The suite is run with VERBOSE=1, and a case counts only by
// the line `  ok   <group>: … SC-AK-NNNN …`. Prints `<group>: missing <n> of <m>` and each missing id.
// Usage: node required-cases.mjs <group> <suite.sh> [--plan <path>] [env assignments for the suite…]
// `--plan` stands in the command text, which `step` takes from the plan commit, so no environment
// can swap the table under a step.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const at = args.indexOf('--plan');
const plan = at >= 0 ? args.splice(at, 2)[1] : 'docs/tasks/RT-3329-task-flow-scenario/plan.md';
const [group, suite, ...env] = args;
const text = readFileSync(plan, 'utf8');
const section = text.split(/^## /m).find((s) => s.startsWith('Обязательные случаи')) || '';
const ids = [...section.matchAll(/^\|\s*(SC-AK-\d{4})\s*\|\s*([a-z]+)\s*\|/gm)]
    .filter((m) => m[2] === group)
    .map((m) => m[1]);
if (ids.length === 0) {
    console.log(`${group}: no required cases in ${plan}`);
    process.exit(1);
}

const extra = Object.fromEntries(env.map((kv) => kv.split('=')));
const run = spawnSync('bash', [suite], { encoding: 'utf8', env: { ...process.env, VERBOSE: '1', ...extra }, timeout: 540000 });
const ok = (run.stdout || '').split('\n').filter((l) => l.startsWith(`  ok   ${group}:`));
const missing = ids.filter((id) => !ok.some((l) => l.includes(id)));
for (const id of missing) console.log(`  missing ${id}`);
console.log(`${group}: missing ${missing.length} of ${ids.length}`);
