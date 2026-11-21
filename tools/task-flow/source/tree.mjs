// rt-kit v0.38.0 · task-flow/source/tree.mjs · 0e5ad415587a · правится надстройкой, не здесь
/**
 * The source «source.tree» of the task flow description: the working copy as it lies on disk, from
 * its root.
 *
 *   read(path)    the text of the file, null where it is absent
 *   exists(path)  a file or a directory stands there
 *   list(dir)     the names inside the directory, [] where it is absent
 *   copyEpic()    the epic the assignment table gives this working copy, or null
 *
 * The assignment is read by the laid-out `tree-assignment.mjs` — next to the laid-out engine one
 * level up, or in `tools/` of the tree root: the table has one reader, and a second one would drift
 * from it.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ASSIGNMENT = [join(HERE, '..', '..', 'tree-assignment.mjs'), join(process.cwd(), 'tools', 'tree-assignment.mjs')].find((p) => existsSync(p));
let assignment = null;
try {
    assignment = ASSIGNMENT ? await import(pathToFileURL(ASSIGNMENT).href) : null;
} catch {
    // A reader that does not load gives no assignment: the copy then has no epic of its own.
    assignment = null;
}

export function open() {
    const root = process.cwd();
    return {
        copyEpic: () => assignment?.assignmentOf(root)?.epic ?? null,
        read(path) {
            const file = join(root, path);
            return existsSync(file) && statSync(file).isFile() ? readFileSync(file, 'utf8') : null;
        },
        exists: (path) => existsSync(join(root, path)),
        list(dir) {
            const at = join(root, dir);
            return existsSync(at) && statSync(at).isDirectory() ? readdirSync(at).sort() : [];
        },
    };
}
