// rt-kit v0.9.0 · checks/lib-reexports.mjs · 6cf992eff51b · правится надстройкой, не здесь
/**
 * Барели и реэкспорты: что либа отдаёт наружу и чем это отличается от собственного объявления.
 *
 * Имя не начинается с `check-`: перебором таких имён умолчание пакета собирает набор гейта
 * пуша, и помощник с ним гейт стал бы гонять как отдельную проверку.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { BARREL_FILES, IGNORED_DIRS, isDir, report } from './lib-common.mjs';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

/** Барель собирает наружу собственные файлы либы, и только они в нём законны */
const isBarrel = (path) => BARREL_FILES.some((name) => path.endsWith(`/${name}`));

/** Файл той же либы адресуется относительным путём, чужая либа — алиасом */
const isOwnFile = (module) => module.startsWith('.');

/** `export { X } from '…'` и `import { X } …` вместе с `export { X };` */
const REEXPORT_FROM = /^export\s+(?:type\s+)?\{([^}]*)\}\s*from\s*'([^']+)';/gm;
const BARE_EXPORT = /^export\s+(?:type\s+)?\{([^}]*)\};/gm;
const IMPORTED_NAMES = /^import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*'([^']+)';/gm;

const namesIn = (list) =>
    list
        .split(',')
        .map(
            (part) =>
                part
                    .trim()
                    .replace(/^type\s+/, '')
                    .split(/\s+as\s+/)[0]
        )
        .filter(Boolean);

/** Файлы либ, кроме спек: реэкспорт в спеке бессмыслен, а обходить их дешевле */
function collectSourceFiles() {
    const files = [];
    const walk = (dir) => {
        for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
            if (IGNORED_DIRS.includes(entry.name) && entry.name !== 'src') {
                continue;
            }
            const path = `${dir}/${entry.name}`;
            if (entry.isDirectory()) {
                walk(path);
            } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
                files.push(path);
            }
        }
    };

    CONFIG.sourceRoots.filter(isDir).forEach(walk);

    return files;
}

/**
 * Символ, объявленный в другой либе, наружу не проходит.
 *
 * Реэкспорт заводится тогда, когда потребителю не хватает прав на либу-источник,
 * и протаскивает её через соседа мимо границы тегов: по графу зависимостей
 * выходит, что слой её не видит. Ни линт, ни сборка реэкспорт от собственного
 * объявления не отличают.
 *
 * В бареле проверяются только чужие либы: собственные файлы он и собирает.
 * Пока барель пропускался целиком, чужой символ проходил через него молча —
 * так `common/util` отдавала работу с датами всему бэкенду через слой `util`
 * домена Postgres.
 */
function checkReexports() {
    for (const file of collectSourceFiles()) {
        if (file.includes('/gen/') || file.includes('/generated/')) {
            continue;
        }

        const ownFilesAllowed = isBarrel(file);
        const text = readFileSync(join(ROOT, file), 'utf8');
        for (const [, list, module] of text.matchAll(REEXPORT_FROM)) {
            if (ownFilesAllowed && isOwnFile(module)) {
                continue;
            }
            report(file, `реэкспорт из \`${module}\`: ${namesIn(list).join(', ')} — потребитель импортирует их у источника`);
        }

        const imported = new Map();
        for (const [, list, module] of text.matchAll(IMPORTED_NAMES)) {
            namesIn(list).forEach((name) => imported.set(name, module));
        }
        for (const [, list] of text.matchAll(BARE_EXPORT)) {
            for (const name of namesIn(list).filter((name) => imported.has(name))) {
                if (ownFilesAllowed && isOwnFile(imported.get(name))) {
                    continue;
                }
                report(file, `реэкспорт \`${name}\` из \`${imported.get(name)}\` — потребитель импортирует его у источника`);
            }
        }
    }
}

export { checkReexports };
