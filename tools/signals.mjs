// rt-kit v0.24.0 · checks/signals.mjs · 5e3ae19b2266 · правится надстройкой, не здесь
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

/** Признак, ищущий нативный тег: `<input\\b`, `<textarea\\b`, `<select\\b`. */
const NATIVE_TAG = /^<([a-z]+)\\b$/;

/** Спецзнаки выражения в имени директивы: имя приходит из настройки дерева, а не из кода. */
function escaped(name) {
    return name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Директивы своей дизайн-системы вычёркиваются из признаков нативных тегов.
 *
 * Источник вида в дереве бывает не один: панель владельца собирается набором кита, публичный
 * сайт — своей системой, и закон о единообразии разводит их по приложениям. Директива такой
 * системы стоит на нативном теге ровно так же, как директива кнопки кита, — и признак кнопки её
 * уже вырезает своим `strip`, а признаки поля, области текста и списка не вырезают ничего: форма,
 * собранная из готового своего, числится расхождением целиком, пять полей из пяти.
 *
 * Список директив называет дерево — ключом `reuse.kitDirectives`. Не назвало — не вырезается
 * ничего, и дерево с одним источником вида ведёт себя как прежде.
 */
export function withKitDirectives(signals, directives) {
    const names = (directives ?? []).filter(Boolean).map(escaped);
    if (names.length === 0) {
        return signals;
    }

    const alternatives = names.join('|');

    return signals.map((signal) => {
        const tag = NATIVE_TAG.exec(signal.find ?? '')?.[1];
        if (!tag || signal.ext !== '.html') {
            return signal;
        }

        const own = `<${tag}\\b[^>]*(?:${alternatives})[^>]*>`;

        return { ...signal, strip: signal.strip ? `${signal.strip}|${own}` : own };
    });
}

/**
 * Признаки объявленных наборов, а поверх них — свои признаки дерева.
 *
 * Совпавший ключ замещает пакетный: дерево вправе сказать о своём готовом точнее, чем пакет,
 * который его не видел. Файла своих признаков может не быть — это не отказ: пропуск дешевле
 * остановки работы, и объявляют его раньше, чем заводят.
 *
 * А вот пустой итог — отказ. Проверка стоит в гейте пуша и отвечает «расхождений 0 в 0
 * признаках» с нулевым кодом: она объявляет успех, не прочитав ни одного файла, и отличить это
 * от честного нуля по выводу нельзя — число признаков стоит в той же строке, что и число
 * расхождений, и читается как подробность. При переезде с редакции, где признаки лежали в самой
 * проверке, настройка не заведена ещё ни у кого: первый же прогон после обновления врёт молча у
 * всех потребителей сразу. Судится итог, а не список наборов: дерево, ведущее только свои
 * признаки, наборов пакета не берёт законно.
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

    if (byKey.size === 0) {
        const known = bundleNames().join(', ') || 'ни одного';
        throw new Error(
            `признаков не объявлено ни одного: ни набора в «reuse.bundles», ни своего файла признаков. ` +
                `Проверка прошла бы, не прочитав ни одного файла, и зелёный ответ означал бы только это. ` +
                `Наборы при пакете: ${known}; свои признаки называются полем «reuse.signals».`
        );
    }

    return withKitDirectives([...byKey.values()], config.kitDirectives);
}
