import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

// The module build keeps import paths as written, and Node loads a file only by its full name: a
// path without `.js` builds fine and fails on the first `import` of the published package. A deep
// path into a package is resolved the same way unless the package declares an export map.
const SOURCES: string = join(__dirname, '..');
const IMPORT_PATH: RegExp = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;
const DEEP_PACKAGE_PATH: RegExp = /^((?:@[^/]+\/)?[^@./][^/]*)\/.+/;

function importPathsIn(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true, recursive: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
        .flatMap((entry) => [...readFileSync(join(entry.parentPath, entry.name), 'utf8').matchAll(IMPORT_PATH)])
        .map((match) => match[1]);
}

// The manifest is looked up the way Node looks up the package: in `node_modules` of the directory
// and of every directory above it. A package whose export map hides its manifest is found too.
function declaresExportMap(packageName: string, directory: string = SOURCES): boolean {
    const manifest: string = join(directory, 'node_modules', packageName, 'package.json');
    if (existsSync(manifest)) {
        return 'exports' in JSON.parse(readFileSync(manifest, 'utf8'));
    }
    const parent: string = dirname(directory);
    if (parent === directory) {
        throw new Error(`${packageName}: the package is not installed`);
    }
    return declaresExportMap(packageName, parent);
}

function needsFileName(path: string): boolean {
    if (path.startsWith('.')) {
        return true;
    }
    const deep: RegExpExecArray | null = DEEP_PACKAGE_PATH.exec(path);
    return deep !== null && !declaresExportMap(deep[1]);
}

describe('import paths of the module build', () => {
    it('every relative import and every deep path into a package without an export map ends with `.js`', () => {
        const paths: string[] = importPathsIn(SOURCES).filter(needsFileName);

        expect(paths.length).toBeGreaterThan(0);
        expect(paths.filter((path) => !path.endsWith('.js'))).toEqual([]);
    });
});
