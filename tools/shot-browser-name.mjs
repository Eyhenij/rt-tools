/**
 * Имя и порт браузера кадров по умолчанию — свои у каждой рабочей копии.
 *
 * На машине несколько раннеров и несколько рабочих копий, а образ и порт у них были одни:
 * второй запуск рядом перезапускал образ первого, и тот падал посреди набора с `ECONNRESET`.
 * Путь копии на машине один, поэтому пара выводится из него: та же копия получает ту же пару,
 * соседняя — другую. Переменные окружения по-прежнему сильнее умолчания.
 *
 * Запуск файла напрямую проверяет вывод на двух путях и печатает итог.
 */
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

/** Начало диапазона портов. Явный порт конвейера, 43220, в диапазон не попадает. */
const PORT_BASE = 44000;

/** Ширина диапазона портов. */
const PORT_SPAN = 1000;

/** Имя образа и порт машины для рабочей копии по её пути. */
export function shotDefaults(root) {
    const digest = createHash('sha256').update(root).digest('hex');

    return {
        container: `rt-tools-shot-${digest.slice(0, 8)}`,
        port: PORT_BASE + (parseInt(digest.slice(0, 8), 16) % PORT_SPAN),
    };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const first = shotDefaults('/home/one/rt-tools');
    const again = shotDefaults('/home/one/rt-tools');
    const other = shotDefaults('/home/one/rt-tools-2');
    const failures = [];

    if (first.container !== again.container || first.port !== again.port) {
        failures.push('one path gave two pairs');
    }
    if (first.container === other.container) {
        failures.push('two paths gave one name');
    }
    if (first.port < PORT_BASE || first.port >= PORT_BASE + PORT_SPAN) {
        failures.push(`port ${first.port} is outside the range`);
    }

    if (failures.length > 0) {
        console.error(`per-copy defaults broken: ${failures.join('; ')}`);
        process.exit(1);
    }
    console.log('per-copy defaults ok');
}
