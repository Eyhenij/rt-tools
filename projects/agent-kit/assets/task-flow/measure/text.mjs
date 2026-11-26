/**
 * The reading of the task folder texts shared by the measurers: the sections of the grill, the line
 * of the agreement and the rows of the task footprint. Pure functions of text: the data reaches the
 * measurers through their ports, and this file only reads what they pass.
 */

/** The task folder of a branch, from the root of the tree. */
export function taskFolder(branch) {
    return `docs/tasks/${branch}`;
}

/** The lines of the first `## ` section whose heading is one of the names, or null. */
export function section(text, names) {
    const lines = text.split('\n');
    const start = lines.findIndex((line) => names.some((name) => line.trim() === `## ${name}`));
    if (start < 0) return null;
    const end = lines.findIndex((line, i) => i > start && /^##\s/.test(line));
    return lines.slice(start + 1, end < 0 ? lines.length : end);
}

const meaningful = (line) => {
    const bare = line.replace(/^>\s*/, '').replace(/\*\*/g, '').trim();
    return bare !== '' && !bare.startsWith('<');
};

/** The grill holds the owner's request as a quote and at least one answer. */
export function grillAnswered(text) {
    const request = section(text, ['Просьба владельца', 'The owner request']);
    const answers = section(text, ['Вопросы и ответы', 'Questions and answers']);
    if (!request || !answers) return false;
    return request.some((line) => line.startsWith('>') && meaningful(line)) && answers.some(meaningful);
}

const PATH_LINE = /^\*\*(?:Описание фичи|Draft|Spec):\*\*\s+`([^`]+)`/gm;
const REASON_LINE = /^\*\*(?:Описание фичи:\*\*\s+не нужно|Behaviour:\*\*\s+unchanged)\s+—\s+(.+)$/gm;

/** The agreement lines of a text: the paths it names and the reasons there is none. */
export function agreementLines(text) {
    const paths = [...text.matchAll(PATH_LINE)].map((m) => m[1]).filter((p) => !p.includes('<'));
    const reasons = [...text.matchAll(REASON_LINE)].map((m) => m[1].trim()).filter((r) => r.length >= 3 && !r.startsWith('<'));
    return { paths, reasons };
}

/** The rows of the task footprint: whether the row is marked edited, and the paths it names. */
export function footprintRows(text) {
    const lines = section(text, ['След задачи', 'Task footprint']) ?? [];
    return lines
        .filter((line) => /^\|/.test(line) && !/^\|\s*-/.test(line))
        .map((line) => line.split('|').map((cell) => cell.trim()))
        .filter((cells) => cells.length >= 4)
        .map((cells) => ({
            edited: /\((?:правится|edited)\)/.test(cells[1]),
            paths: [...cells[2].matchAll(/`([^`\s]+)`/g)].map((m) => m[1]).filter((p) => /[/.]/.test(p) && !p.includes('<')),
        }))
        .filter((row) => row.paths.length > 0);
}

/** A changed file lies under the path: the file itself or a file inside the directory. */
export function under(file, path) {
    const bare = path.replace(/\/$/, '');
    return file === bare || file.startsWith(`${bare}/`);
}

/**
 * A changed file touches a footprint path: it lies under the path, or the path names its file or
 * its directories anywhere in it (`flow.js`, `source/`, `fixtures/turn-replay/`), as a row writes it
 * after the directory it belongs to. A mask is unfolded: «*» holds no slash, «**» holds any.
 */
export function touches(file, path) {
    const bare = path.replace(/\/$/, '');
    if (bare.includes('*')) return maskOf(bare).test(file);
    return under(file, path) || `/${file}/`.includes(`/${bare}/`);
}

const maskOf = (path) => {
    const parts = path.split(/(\*\*\/|\*\*|\*)/).map((part) => ({ '**/': '(?:.*/)?', '**': '.*', '*': '[^/]*' })[part] ?? part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(`(?:^|/)${parts.join('')}(?:/|$)`);
};

/** Two lists of steps name the same steps in the same order. */
export function sameSteps(planned, got) {
    return planned.length === got.length && planned.every((p, i) => p.number === got[i].number && p.name === got[i].name);
}
