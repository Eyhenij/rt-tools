#!/usr/bin/env node
/**
 * Сверка срока хранения описания прошлого.
 *
 * Одной чистки хватает ровно на неделю: каталог набирает по записи на каждую закрытую работу,
 * и через семь суток первая из них перестаивает снова. Без сверки срок держался бы памятью
 * того, кто помнит про команду чистки, — то есть не держался бы вовсе.
 *
 * Сверка не чистит: снос — решение, а не следствие проверки. Она называет перестоявшие записи
 * и команду, которой их снимают.
 *
 * FAIL-OPEN: каталога описания прошлого в дереве нет — сверять нечего, нулевой код. Пустой
 * каталог отказом не считается: он означает, что всё снято по сроку.
 *
 * Ненулевой код возврата и перечень перестоявших записей.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { ARCHIVE_DIR, RETENTION_DAYS, archiveRecords, staleRecords } from './archive-age.mjs';

const root = process.cwd();

if (!existsSync(join(root, ARCHIVE_DIR))) {
    console.log(`check-archive-age: каталога ${ARCHIVE_DIR} в дереве нет — сверять нечего`);
    process.exit(0);
}

const total = archiveRecords(root).length;
const stale = staleRecords(root);

if (stale.length > 0) {
    console.error(`check-archive-age: расхождений ${stale.length}`);

    for (const record of stale) {
        console.error(`  ${record.path}: ${Math.floor(record.ageDays)} суток при сроке в ${RETENTION_DAYS}`);
    }

    console.error('\nЗапись живёт неделю и снимается: `node tools/archive-prune.mjs --apply`.');
    console.error('Снятая остаётся в истории — найти её можно по имени файла.');
    process.exit(1);
}

console.log(`check-archive-age: записей ${total}, ни одна не перестояла срок в ${RETENTION_DAYS} суток`);
