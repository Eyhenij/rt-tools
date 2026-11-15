/**
 * The source «source.tree» of the task flow description: the working copy as it lies on disk, from
 * its root.
 *
 *   read(path)    the text of the file, null where it is absent
 *   exists(path)  a file or a directory stands there
 *   list(dir)     the names inside the directory, [] where it is absent
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export function open() {
    const root = process.cwd();
    return {
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
