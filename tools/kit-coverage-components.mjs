/**
 * The components of the second kit against the stories that show them.
 *
 * A separate file because the subject is different from its neighbour's: that one asks whether a
 * family reaches the showcase, this one whether a component is the subject of a story. The two
 * questions gave different answers on the same tree — 73 families of 74 reached the showcase while
 * thirty components were the subject of no story at all, and the family count saw none of them.
 *
 * What counts as shown. The subject of a story is what its title names: the last segment of the
 * title, letters and digits only. A component that stands in a neighbour's wrapper but names no
 * title is shown as part of that neighbour — which is exactly the gap, unless the list says which
 * story shows it on purpose.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** A declaration of a component or a directive: the selector is what the title is matched against. */
const DECLARATION = /@(?:Component|Directive)\(\{[\s\S]*?selector:\s*'([^']+)'/g;
const TITLE = /title:\s*'([^']+)'/g;

/** Everything but letters and digits is dropped: `DownloadLink`, `download-link` and `Download Link` are one name. */
const plain = (value) => value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

/**
 * The name of a component by its selector: the kit's prefix, the element name and the attribute
 * brackets go away. A multiple selector is judged by its first part — the rest are the same
 * component under another spelling.
 */
function nameOf(selector) {
    return plain(
        selector
            .split(',')[0]
            .trim()
            .replace(/^ng-template/, '')
            .replace(/^[a-zA-Z]+(?=\[)/, '')
            .replace(/[[\]]/g, '')
            .replace(/^rt-?/i, '')
    );
}

function walk(root, dir) {
    const found = [];
    for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
        const path = `${dir}/${entry.name}`;
        if (entry.isDirectory()) {
            found.push(...walk(root, path));
        } else {
            found.push(path);
        }
    }
    return found;
}

/** Declared components and directives of the kit; the showcase wrappers are not the kit. */
export function declarationsOf(root, familiesDir) {
    const declared = [];

    for (const path of walk(root, familiesDir)) {
        if (!path.endsWith('.ts') || path.endsWith('.spec.ts') || path.includes('/stories/')) {
            continue;
        }
        const text = readFileSync(join(root, path), 'utf8');
        for (const match of text.matchAll(DECLARATION)) {
            declared.push({ selector: match[1], name: nameOf(match[1]), path });
        }
    }

    return declared;
}

/** The names the story titles of the kit speak about. */
export function storySubjectsOf(root, dirs) {
    const subjects = new Set();

    for (const dir of dirs) {
        for (const path of walk(root, dir)) {
            if (!path.endsWith('.stories.ts')) {
                continue;
            }
            const text = readFileSync(join(root, path), 'utf8');
            for (const match of text.matchAll(TITLE)) {
                subjects.add(plain(match[1].split('/').pop()));
            }
        }
    }

    return subjects;
}
