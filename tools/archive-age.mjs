/**
 * Возраст записей описания прошлого.
 *
 * Отбор живёт здесь один на двоих: команда чистки снимает по нему, проверка по нему же
 * краснеет. Разойдясь, они начали бы говорить о каталоге разное, а заметить это нечем —
 * чистка молча оставляла бы то, на что проверка молча не смотрит.
 *
 * Возраст меряется датой последнего коммита файла. Время файла на диске не годится: свежий
 * чекаут делает все записи одновременными, и чистка на чужой машине не сняла бы ни одной.
 * Шапка записи не годится тоже — день слияния стоит в ней не всегда и не всюду одинаково.
 *
 * Запись, которой в истории ещё нет, считается сегодняшней: она приехала этой же веткой и
 * перестоять не могла.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

/** Каталог описания прошлого. */
export const ARCHIVE_DIR = 'docs/archive';

/** Срок хранения записи в сутках. Больше него — запись снимается. */
export const RETENTION_DAYS = 7;

/** Сутки в миллисекундах — считать возраст удобнее в них. */
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Дата последнего коммита у каждой записи каталога.
 *
 * Один проход по истории вместо вызова на файл: на 280 записях это разница между секундой и
 * полуминутой. Лог идёт новыми вперёд, поэтому первая встреченная дата файла и есть последняя.
 */
function lastCommitDates(root) {
    const log = execFileSync('git', ['log', '--format=%cI', '--name-only', '--', ARCHIVE_DIR], {
        cwd: root,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
    });

    const dates = new Map();
    let current = null;

    for (const line of log.split('\n')) {
        if (line === '') {
            continue;
        }

        if (line.startsWith(`${ARCHIVE_DIR}/`)) {
            if (current !== null && !dates.has(line)) {
                dates.set(line, current);
            }

            continue;
        }

        current = line;
    }

    return dates;
}

/**
 * Записи каталога с их возрастом в сутках.
 *
 * @param root Корень дерева.
 * @param now Момент отсчёта — передаётся, чтобы проверка и чистка судили по одному времени.
 * @returns Записи: путь, дата последнего коммита и возраст в сутках.
 */
export function archiveRecords(root, now = new Date()) {
    const dates = lastCommitDates(root);

    return readdirSync(join(root, ARCHIVE_DIR))
        .filter((name) => name.endsWith('.md'))
        .map((name) => {
            const path = `${ARCHIVE_DIR}/${name}`;
            const committed = dates.get(path);
            const ageDays = committed === undefined ? 0 : (now.getTime() - new Date(committed).getTime()) / DAY_MS;

            return { path, name, committed, ageDays };
        })
        .sort((one, other) => other.ageDays - one.ageDays);
}

/** Записи, перестоявшие срок. */
export function staleRecords(root, now = new Date()) {
    return archiveRecords(root, now).filter((record) => record.ageDays > RETENTION_DAYS);
}
