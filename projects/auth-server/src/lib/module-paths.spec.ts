import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// The module build keeps relative paths as written, and Node loads a module only by its full name:
// a path without `.js` builds fine and fails on the first `import` of the published package.
const SOURCES: string = join(__dirname, '..');
const RELATIVE_PATH: RegExp = /(?:from|import)\s*\(?\s*['"](\.{1,2}\/[^'"]+)['"]/g;

function relativePathsIn(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true, recursive: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
        .flatMap((entry) => [...readFileSync(join(entry.parentPath, entry.name), 'utf8').matchAll(RELATIVE_PATH)])
        .map((match) => match[1]);
}

describe('relative paths of the module build', () => {
    it('every relative import names its file with `.js`', () => {
        const paths: string[] = relativePathsIn(SOURCES);

        expect(paths.length).toBeGreaterThan(0);
        expect(paths.filter((path) => !path.endsWith('.js'))).toEqual([]);
    });
});
