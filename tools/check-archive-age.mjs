#!/usr/bin/env node
// rt-kit v0.29.0 · checks/check-archive-age.mjs · 63cf83236d24 · правится надстройкой, не здесь
/**
 * The audit of the retention term of the archive.
 *
 * One prune lasts exactly for the term: the directory gains a record for every closed piece of
 * work, and the first survivor overstays again. Without the audit the term would be held by the
 * memory of whoever remembers the prune command — that is, it would not be held at all.
 *
 * The audit does not prune: removal is a decision, not a consequence of a check. It names the
 * records that have overstayed and the command that removes them.
 *
 * The audit demands later than the prune removes: it has a margin of a day over the term. The prune
 * runs at the minute of the push, the audit in the pipeline minutes or hours later, and without the
 * margin the next record crossed the threshold between them.
 *
 * FAIL-OPEN: the tree has set no term — nothing to check, zero code. The term has no default
 * deliberately: a package that set it for the tree would start removing someone else's archive on
 * the day of the install. No directory — the same. An empty directory does not count as a refusal:
 * it means everything has been removed by the term.
 *
 * A non-zero exit code and the list of records that have overstayed.
 */
import { ARCHIVE_DIR, CHECK_GRACE_DAYS, RETENTION_DAYS, archiveRecords, staleRecords } from './archive-age.mjs';
import { ROOT } from './rt-kit-checks.config.mjs';

if (RETENTION_DAYS === null) {
    console.log('check-archive-age: the tree set no retention term for the record of the past — there is nothing to check');
    process.exit(0);
}

const total = archiveRecords(ROOT).length;
const stale = staleRecords(ROOT, new Date(), CHECK_GRACE_DAYS);

if (stale.length > 0) {
    console.error(`check-archive-age: divergences ${stale.length}`);

    for (const record of stale) {
        console.error(`  ${record.path}: ${Math.floor(record.ageDays)} days at a term of ${RETENTION_DAYS} and a grace of ${CHECK_GRACE_DAYS}`);
    }

    console.error(`\nA record lives ${RETENTION_DAYS} days and is then removed: \`node tools/archive-prune.mjs --apply\`.`);
    console.error('A removed one stays in the history — it can be found by the file name.');
    process.exit(1);
}

console.log(`check-archive-age: records ${total} in ${ARCHIVE_DIR}, none outstood the term of ${RETENTION_DAYS} days`);
