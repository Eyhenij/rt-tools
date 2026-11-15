// A check of the plan of RT-3329: the recorded turns in the public repository carry no private text.
// The owner's message in a fixture (`owner`) is either a phrase of at most four words that starts with a stop word of the
// plan, or a class label: <nudge>, <question>, <abuse>, <order:RT-N>,
// <menu-answer:N> (the number of the option), <refusal>. Any other owner text counts as private. The whole fixture is
// also searched for an email, a home path and an IPv4 address.
// Prints `fixtures <n>, private <m>`.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'projects/agent-kit/tests/fixtures/turn-replay';
if (!existsSync(dir)) {
    console.log(`no fixtures: ${dir} is absent`);
    process.exit(1);
}
const STOP = /^(стоп|стой|хватит|остановись|прекрати|не сейчас|подожди|погоди|жди|пауза|отбой|на сегодня всё|stop|wait|not now|pause)(?=[\s\p{P}]|$)/iu;
const LABEL = /^<(nudge|question|abuse|order:RT-\d+|menu-answer:\d+|refusal)>$/;
const LEAK = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}|\/Users\/|\/home\/|\b\d{1,3}(\.\d{1,3}){3}\b/;

let fixtures = 0;
let leaks = 0;
for (const name of readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('judge-verdicts.'))) {
    fixtures += 1;
    const raw = readFileSync(join(dir, name), 'utf8');
    const owners = [];
    JSON.parse(raw, (key, value) => {
        if (key === 'owner' && typeof value === 'string') owners.push(value);
        return value;
    });
    const bad = owners.filter((o) => !LABEL.test(o) && !(STOP.test(o) && o.trim().split(/\s+/).length <= 4));
    if (bad.length || LEAK.test(raw)) {
        leaks += 1;
        console.log(`  private text in ${name}`);
    }
}
console.log(`fixtures ${fixtures}, private ${leaks}`);
