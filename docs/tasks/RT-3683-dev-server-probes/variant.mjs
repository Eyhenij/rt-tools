#!/usr/bin/env node
// Сверяет таблицу решений, испортив окружение четырёх проб стража dev-server-guard со стендами сессии.
//   life  — после запуска сервера пробы проходит 11 секунд;
//   start — сервер пробы стартует через 6 секунд (обёртка node в PATH);
//   dead  — сервер не пишет файл порта, проба должна сказать об этом словами;
//   gone  — сервер гасится сразу после порта, проба должна сказать, что он умер.
// Печатает вывод `decision-table.mjs --conform`: последняя строка — «rows N, mismatch M».
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const mode = process.argv[2];
const dir = mkdtempSync(join(tmpdir(), 'rt3683-'));
const table = JSON.parse(readFileSync('projects/agent-kit/assets/checks/decision-table.json', 'utf8'));
const shim = join(dir, 'bin');
spawnSync('mkdir', ['-p', shim]);
writeFileSync(join(shim, 'node'), `#!/bin/sh\nsleep 6\nexec ${process.execPath} "$@"\n`);
chmodSync(join(shim, 'node'), 0o755);
let spoiled = 0;
for (const row of table.rows) {
    if (row.hook !== 'dev-server-guard.sh' || row.when.stands_raised_by !== 'session') continue;
    spoiled++;
    const before = row.probe.setup;
    if (mode === 'life') row.probe.setup += '; sleep 11';
    else if (mode === 'start') row.probe.setup = `export PATH="${shim}:$PATH"; ${row.probe.setup}`;
    else if (mode === 'dead') row.probe.setup = row.probe.setup.replace('"$T/port" ', '"$T/never" ');
    else if (mode === 'gone') row.probe.setup += '; kill $SRV; wait $SRV 2>/dev/null';
    else throw new Error('mode: life, start, dead or gone');
    // Порча, не тронувшая подготовку, проверила бы прежнюю пробу и сошлась бы молча.
    if (row.probe.setup === before) throw new Error(`${row.action}: the mode ${mode} did not change the setup`);
}
// Опыт о четырёх пробах; другое число значит, что строки переименованы и опыт сверил бы нетронутую таблицу.
if (spoiled !== 4) throw new Error(`spoiled ${spoiled} rows, expected 4`);
writeFileSync(join(dir, 'table.json'), JSON.stringify(table));
const run = spawnSync('node', ['projects/agent-kit/assets/checks/decision-table.mjs', '--conform'], {
    env: { ...process.env, RT_DECISION_TABLE: join(dir, 'table.json') },
    encoding: 'utf8',
});
process.stdout.write(`${run.stdout}${run.stderr}`);
