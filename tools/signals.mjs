// rt-kit v0.9.0 · checks/signals.mjs · 0b64f583bf01 · правится надстройкой, не здесь
/**
 * Наборы признаков единообразия: что дерево объявило своим и что при этом читается.
 *
 * Признак не лежит в коде проверки. Пакет режет признаки по своим пакетам — у кита свои, у
 * хранилища свои, — а дерево называет в настройке проверок те, что берёт. Набор, который дерево
 * не назвало, не читается вовсе: признак о готовом из пакета, которого в дереве нет, отвечает
 * ложно ровно так же, как имя чужого приложения.
 *
 * Тот же список читает гард на правке. Общий файл — единственное, чем гард на оболочке и
 * проверка на JS могут быть связаны: расходиться им нельзя, иначе правка проходит гард и падает
 * на гейте.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Наборы лежат рядом с этим файлом: он и сам ресурс пакета, и раскладывается вместе с ними. */
export const BUNDLES_DIR = join(dirname(fileURLToPath(import.meta.url)), 'signals');

export function bundleNames() {
    if (!existsSync(BUNDLES_DIR)) {
        return [];
    }

    return readdirSync(BUNDLES_DIR)
        .filter((name) => name.endsWith('.json'))
        .map((name) => name.slice(0, -'.json'.length))
        .sort();
}

/**
 * Разбор набора: шапка раскладки снимается до JSON.
 *
 * Раскладка ставит её первой строкой и комментирует незнакомое расширение решёткой — в JSON
 * комментария нет, и без снятия разбор падает на первом же символе.
 */
function parseSignals(text) {
    return JSON.parse(text.replace(/^#[^\n]*\n/, '')).signals ?? [];
}

function readBundle(name) {
    const path = join(BUNDLES_DIR, `${name}.json`);
    if (!existsSync(path)) {
        const known = bundleNames().join(', ') || 'ни одного';
        throw new Error(`набор признаков «${name}» при пакете не найден; есть: ${known}`);
    }

    return parseSignals(readFileSync(path, 'utf8'));
}

/**
 * Признаки объявленных наборов, а поверх них — свои признаки дерева.
 *
 * Совпавший ключ замещает пакетный: дерево вправе сказать о своём готовом точнее, чем пакет,
 * который его не видел. Файла своих признаков может не быть — это не отказ: пропуск дешевле
 * остановки работы, и объявляют его раньше, чем заводят.
 */
export function loadSignals(config, root) {
    const declared = config.bundles ?? [];
    const signals = declared.flatMap(readBundle);

    const ownPath = config.signals ? join(root, config.signals) : null;
    const own = ownPath && existsSync(ownPath) ? parseSignals(readFileSync(ownPath, 'utf8')) : [];

    const byKey = new Map(signals.map((signal) => [signal.key, signal]));
    for (const signal of own) {
        byKey.set(signal.key, signal);
    }

    return [...byKey.values()];
}
