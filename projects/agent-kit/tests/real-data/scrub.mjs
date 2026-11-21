/**
 * What is cut from saved real data before it lands in the tree: the home directory in both its forms
 * (the path and the dashed name of a session directory), mail addresses, the names of people, the
 * names of the other projects on this machine and their task keys.
 *
 * The other projects are read from the directory that holds this tree at the minute of the cut:
 * their names never stand in a file of the tree, here included. People are named by the recorder —
 * the `name` next to a `login` in a hosting answer.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HOME = homedir();
const DASHED_HOME = HOME.replace(/[/.]/g, '-');
const MAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
/** A task key of another queue: not this tree's and not a scenario number. */
const FOREIGN_KEY = /(?<![A-Z]-)\b(?!RT-|SC-)[A-Z]{2,5}-\d{2,}\b/g;

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The names of the neighbouring projects: the directories next to this tree, without copy suffixes. */
export function neighbourWords() {
    const tree = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
    const parent = dirname(tree);
    if (!existsSync(parent)) return [];
    const own = basename(tree);
    const words = readdirSync(parent, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.startsWith('+'))
        .map((entry) => entry.name.replace(/-(\d+|prs)$/, ''))
        .filter((name) => name !== own && name.length >= 4);
    return [...new Set(words)];
}

/** The full name of the account on this machine, where the system gives one. */
function machineName() {
    try {
        return execFileSync('id', ['-F'], { encoding: 'utf8' }).trim();
    } catch {
        return '';
    }
}

/** A scrubber over the given people, the account owner and the neighbouring projects. */
export function scrubber(people = []) {
    people = [...people, machineName()].filter((name) => name && name.length >= 4);
    const projects = neighbourWords();
    const projectRe = projects.length > 0 ? new RegExp(projects.map(escape).join('|'), 'gi') : null;
    const peopleRe = people.length > 0 ? new RegExp(people.filter(Boolean).map(escape).join('|'), 'g') : null;
    return (text) => {
        let out = text.split(HOME).join('~').split(DASHED_HOME).join('~').replace(MAIL, '<mail>');
        if (peopleRe) out = out.replace(peopleRe, '<person>');
        if (projectRe) out = out.replace(projectRe, '<project>');
        return out.replace(FOREIGN_KEY, '<key>');
    };
}
