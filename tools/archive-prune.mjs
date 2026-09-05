#!/usr/bin/env node
// rt-kit v0.24.0 · checks/archive-prune.mjs · 118e9c58581b · правится надстройкой, не здесь
/**
 * Чистка описания прошлого по сроку.
 *
 * Запись живёт назначенный деревом срок, дальше снимается из дерева и остаётся в истории
 * системы контроля версий — достать её оттуда можно по имени файла, оно же единственный
 * указатель каталога.
 *
 * Сухой прогон — умолчание. Команда сносит разбор просьбы — единственную запись слов
 * владельца, — и снос называется явно: `--apply`. Перечень снимаемого печатается в обоих
 * случаях одинаково, чтобы решение принималось по тому же списку, который потом уедет.
 *
 * Срок и отбор берутся у `archive-age.mjs` — того же модуля, по которому краснеет проверка.
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
