/**
 * Barrels and re-exports: what a lib gives outward and how that differs from an own declaration.
 *
 * The name does not begin with `check-`: by walking such names the package default assembles the
 * push gate set, and a helper with one would be run by the gate as a check of its own.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { BARREL_FILES, IGNORED_DIRS, isDir, report } from './lib-common.mjs';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

/** A barrel collects the lib's own files outward, and only they are lawful in it */
const isBarrel = (path) => BARREL_FILES.some((name) => path.endsWith(`/${name}`));

/** A file of the same lib is addressed by a relative path, a foreign lib by an alias */
const isOwnFile = (module) => module.startsWith('.');

/** `export { X } from '…'` and `import { X } …` together with `export { X };` */
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

/** The files of the libs, except tests: a re-export in a test is meaningless, and skipping is cheaper */
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
 * A symbol declared in another lib does not pass outward.
 *
 * A re-export is created when the consumer lacks the rights to the source lib,
 * and it drags the lib through a neighbour past the tag boundary: by the dependency
 * graph it comes out that the layer does not see it. Neither lint nor the build tells
 * a re-export from an own declaration.
 *
 * In a barrel only foreign libs are checked: its own files are what it collects.
 * While the barrel was skipped whole, a foreign symbol passed through it silently —
 * that is how `common/util` gave date handling to the whole backend through the `util`
 * layer of the Postgres domain.
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
