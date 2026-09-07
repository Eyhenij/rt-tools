// rt-kit v0.25.0 · checks/signals.mjs · e4e94c5cb5d4 · правится надстройкой, не здесь
/**
 * The sign bundles of uniformity: what the tree declared as its own and what is read alongside it.
 *
 * A sign does not lie in the check code. The package cuts the signs by its own packages — the kit
 * has its own, the storage has its own — and the tree names in the checks settings the ones it
 * takes. A bundle the tree did not name is not read at all: a sign about ready-made code from a
 * package the tree does not have answers falsely exactly as the name of a foreign application does.
 *
 * The same list is read by the guard on an edit. The shared file is the only thing that can tie the
 * shell guard and the JS check together: they may not drift apart, otherwise an edit passes the
 * guard and falls at the gate.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The bundles lie next to this file: it is a package resource itself and is laid out with them. */
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
 * Parsing a bundle: the layout header is stripped before the JSON.
 *
 * The layout puts it as the first line and comments an unknown extension out with a hash — JSON has
 * no comment, and without stripping it the parse falls on the very first character.
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

/** A sign that looks for a native tag: `<input\\b`, `<textarea\\b`, `<select\\b`. */
const NATIVE_TAG = /^<([a-z]+)\\b$/;

/**
 * Expression special characters in a directive name: the name comes from the tree settings,
 * not from the code.
 */
function escaped(name) {
    return name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * The directives of the tree's own design system are struck out of the native-tag signs.
 *
 * A tree can have more than one source of look: the owner panel is assembled from the kit set, the
 * public site from its own system, and the law on application uniformity separates them by
 * application. A directive of such a system stands on a native tag exactly as a kit button
 * directive does — and the button sign already cuts it out with its `strip`, while the signs of the
 * field, the text area and the list cut out nothing: a form assembled from one's own ready-made
 * counts as a discrepancy entirely, five fields out of five.
 *
 * The list of directives is named by the tree — by the key `reuse.kitDirectives`. If it named none,
 * nothing is cut out, and a tree with a single source of look behaves as before.
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
 * The signs of the declared bundles, and on top of them the tree's own signs.
 *
 * A matching key replaces the package one: the tree has the right to speak of its own ready-made
 * more precisely than a package that has not seen it. The file of own signs may be absent — that is
 * not a refusal: a skip is cheaper than stopping the work, and it is declared before it is created.
 *
 * An empty result, though, is a refusal. The check stands in the push gate and answers
 * "discrepancies 0 out of 0 signs" with a zero exit code: it declares success without having read a
 * single file, and by the output that cannot be told from an honest zero — the number of signs
 * stands in the same line as the number of discrepancies and reads as a detail. When moving from an
 * edition where the signs lay in the check itself, no one has the setting yet: the very first run
 * after the upgrade lies silently for every consumer at once. The result is judged, not the list of
 * bundles: a tree that keeps only its own signs lawfully takes no package bundles.
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
