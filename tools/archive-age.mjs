// rt-kit v0.25.0 · checks/archive-age.mjs · addfebfb5a6f · правится надстройкой, не здесь
/**
 * Возраст записей описания прошлого.
 *
 * Каталог набирает по записи на каждую закрытую работу и не отдаёт обратно ничего: папку
 * задачи разбирает паттерн закрытия работы, и запись оттуда переживает всё дерево. Срок
 * назначает дерево ключом настройки; пакет умолчания не даёт — установка новой версии не
 * вправе начать сносить чужой архив, а снимается там разбор просьбы, которого нет больше нигде.
 *
 * Отбор живёт здесь один на двоих: команда чистки снимает по нему, проверка по нему же
 * краснеет. Разойдясь, они говорили бы о каталоге разное, а заметить это нечем — чистка молча
 * оставляла бы то, на что проверка молча не смотрит.
 *
 * Возраст меряется датой последнего коммита файла. Время файла на диске не годится: свежий
 * чекаут делает все записи одновременными, и чистка на чужой машине не сняла бы ни одной.
 * Шапка записи не годится тоже — день слияния стоит в ней не всегда и не всюду одинаково.
 *
 * Запись, которой в истории ещё нет, считается сегодняшней: она приехала этой же веткой и
 * перестоять не могла.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { CONFIG } from './rt-kit-checks.config.mjs';

/** Каталог описания прошлого — без завершающей косой черты: её несёт настройка. */
export const ARCHIVE_DIR = CONFIG.archiveDir.replace(/\/$/, '');

/**
 * Срок хранения записи в сутках. `null` — срок не назначен, и тогда молчат обе стороны:
 * проверка не краснеет, чистка не снимает. Дерево называет своё число ключом настройки.
 */
export const RETENTION_DAYS = CONFIG.archiveRetentionDays ?? null;

/**
 * Запас проверки в сутках сверх срока.
 *
 * Чистка снимает в минуту пуша, а проверка в конвейере считает возраст в минуту прогона —
 * минутами позже, при очереди на раннере часами. Возраст меряется до минуты, и за это время
 * следующая запись пересекает порог: три прогона одного захода покраснели так, ни один не по
 * правке ветки. Проверка поэтому требует позже, чем чистка снимает; всё, что она называет,
 * чистка по-прежнему снимает — отбор один, разница в запасе.
 */
export const CHECK_GRACE_DAYS = 1;

/** Сутки в миллисекундах — считать возраст удобнее в них. */
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Дата последнего коммита у каждой записи каталога.
 *
 * Один проход по истории вместо вызова на файл: на трёх сотнях записей это разница между
 * секундой и полуминутой. Лог идёт новыми вперёд, поэтому первая встреченная дата файла и есть
 * последняя.
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
    if (!existsSync(join(root, ARCHIVE_DIR))) {
        return [];
    }

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

/**
 * Записи, перестоявшие срок. Срок не назначен — перестоявших нет ни одной.
 *
 * @param graceDays Запас сверх срока в сутках: чистка зовёт без него, проверка — с ним.
 */
export function staleRecords(root, now = new Date(), graceDays = 0) {
    if (RETENTION_DAYS === null) {
        return [];
    }

    return archiveRecords(root, now).filter((record) => record.ageDays > RETENTION_DAYS + graceDays);
}
