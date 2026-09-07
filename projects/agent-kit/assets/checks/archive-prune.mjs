#!/usr/bin/env node
/**
 * The prune of the archive by the term.
 *
 * A record lives for the term the tree has set, then it is removed from the tree and stays in the
 * history of the version control system — it can be got back from there by the file name, which is
 * also the only pointer of the directory.
 *
 * A dry run is the default. The command removes the grill of the request — the only record of the
 * owner's words — and the removal is named explicitly: `--apply`. The list of what is removed is
 * printed the same way in both cases, so that the decision is made by the same list that will
 * then leave.
 *
 * The term and the selection are taken from `archive-age.mjs` — the same module the check goes red
 * by.
 */
import { execFileSync } from 'node:child_process';

import { RETENTION_DAYS, archiveRecords, staleRecords } from './archive-age.mjs';
import { ROOT } from './rt-kit-checks.config.mjs';

if (RETENTION_DAYS === null) {
    console.log('archive-prune: срок хранения описания прошлого деревом не назначен — снимать нечего');
    process.exit(0);
}

const apply = process.argv.includes('--apply');
const stale = staleRecords(ROOT);
const total = archiveRecords(ROOT).length;

if (stale.length === 0) {
    console.log(`archive-prune: записей ${total}, перестоявших срок в ${RETENTION_DAYS} суток нет`);
    process.exit(0);
}

console.log(`archive-prune: перестояло ${stale.length} из ${total} при сроке в ${RETENTION_DAYS} суток`);

for (const record of stale) {
    console.log(`  ${record.name} — ${Math.floor(record.ageDays)} суток, последний коммит ${record.committed.slice(0, 10)}`);
}

if (!apply) {
    console.log('\nЭто сухой прогон: не снято ничего. Снос идёт доводом --apply.');
    process.exit(0);
}

execFileSync('git', ['rm', '--quiet', '--', ...stale.map((record) => record.path)], { cwd: ROOT, stdio: 'inherit' });
console.log(`\nСнято записей: ${stale.length}. Они остаются в истории — найти их можно по имени файла.`);
