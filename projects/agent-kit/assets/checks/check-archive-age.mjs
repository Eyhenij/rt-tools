#!/usr/bin/env node
/**
 * Сверка срока хранения описания прошлого.
 *
 * Одной чистки хватает ровно на срок: каталог набирает по записи на каждую закрытую работу, и
 * первая уцелевшая перестаивает снова. Без сверки срок держался бы памятью того, кто помнит
 * про команду чистки, — то есть не держался бы вовсе.
 *
 * Сверка не чистит: снос — решение, а не следствие проверки. Она называет перестоявшие записи
 * и команду, которой их снимают.
 *
 * FAIL-OPEN: срок деревом не назначен — сверять нечего, нулевой код. Умолчания у срока нет
 * намеренно: пакет, назначивший его за дерево, начал бы сносить чужой архив в день установки.
 * Каталога нет — то же самое. Пустой каталог отказом не считается: он означает, что всё снято
 * по сроку.
 *
 * Ненулевой код возврата и перечень перестоявших записей.
 */
import { ARCHIVE_DIR, RETENTION_DAYS, archiveRecords, staleRecords } from './archive-age.mjs';
import { ROOT } from './rt-kit-checks.config.mjs';

if (RETENTION_DAYS === null) {
    console.log('check-archive-age: срок хранения описания прошлого деревом не назначен — сверять нечего');
    process.exit(0);
}

const total = archiveRecords(ROOT).length;
const stale = staleRecords(ROOT);

if (stale.length > 0) {
    console.error(`check-archive-age: расхождений ${stale.length}`);

    for (const record of stale) {
        console.error(`  ${record.path}: ${Math.floor(record.ageDays)} суток при сроке в ${RETENTION_DAYS}`);
    }

    console.error(`\nЗапись живёт ${RETENTION_DAYS} суток и снимается: \`node tools/archive-prune.mjs --apply\`.`);
    console.error('Снятая остаётся в истории — найти её можно по имени файла.');
    process.exit(1);
}

console.log(`check-archive-age: записей ${total} в ${ARCHIVE_DIR}, ни одна не перестояла срок в ${RETENTION_DAYS} суток`);
