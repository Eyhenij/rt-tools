/**
 * The signs that put a change on the full review path, as data and pure functions: what is read of the
 * tree comes in as arguments. The command is `review-path.mjs`, the rule — `task-delivery-loop`.
 *
 * A path sample errs towards the full path: a change the list took for a forbidden one only costs a
 * second reading, and one it missed goes past a reader.
 */
import { isVisibleKitFile } from './check-kit-approval.mjs';
import { shapeOf, viewOf } from './review-path-api.mjs';

/** Changed lines of code a light change may hold, both added and removed, the limit included. */
export const LINE_LIMIT = 150;

/** Files whose lines are not counted: tests, texts, frames and what a tool writes. */
const NOT_CODE =
    /^docs\/|\.mdx?$|\.(spec|test)\.[a-z]+$|\.stories\.ts$|^apps\/[^/]*-e2e\/|(^|\/)__snapshots__\/|\.snap$|(^|\/)(graphify-out|rules-graph)\/|^pnpm-lock\.yaml$|^tools\/tests\/|^projects\/agent-kit\/tests\//;

const SECURITY_PATH =
    /^projects\/auth-|^apps\/auth-example|^deploy\/|^docker-compose|^\.(github|verdaccio)\/|(^|\/)\.env|\.(guard|interceptor|middleware)\.ts$|^(apps|libs)\/(.*\/)?(access|auth|entry|permissions|security)\/|^(apps|libs|projects\/(?!ui-kit-v2\/))(.*\/)[^/]*(access|auth|origin|entry|permission|token|invite|secret|redact|sign-in|visitor|rights|cors|crypt|paste|embed-src|chat-hook)[^/]*$|^tools\/(auth-|cargo-sign-in|[^/]*secret)/;
const SECURITY_LINE =
    /DomSanitizer|bypassSecurityTrust|(inner|outer)HTML|insertAdjacentHTML|javascript:|\.protocol\b(?!['"/.])|\beval\(|new Function\(|\$(query|execute)RawUnsafe|node:crypto|createHash|createHmac|timingSafeEqual|randomBytes|\bjwt\b|DOMPurify|sanitiz|permitted\(|authorization|\bhmac/i;
/** A file that imports these is judged by its text: a changed line of it need not name them. */
const SECURITY_IMPORT = /from ['"](node:crypto|crypto|dompurify|jsonwebtoken|jose)['"]|\bDomSanitizer\b/;
const MIGRATION_PATH = /^prisma\/|(^|\/)migrations\//;
const LOOK_PATH = /\.(scss|css|html|svg|ico|png|jpe?g|gif|webp|woff2?|ttf)$|^apps\/.*\.(view|icons)\.ts$/;
/** The files of the root, its texts aside, hold the settings of the checks, the packages and the agent. */
const GUARD_PATH =
    /^(?!.*\.md$|LICENSE$|docker-compose|pnpm-lock\.yaml$|\.env)[^/]+$|^\.claude\/(?!rt-kit\/(assignments\.md$|postmortems\/|proposals\/|observations\/))|^\.(?!claude\/|github\/|verdaccio\/|idea\/|vscode\/)[^/]+\/|^docs\/constitution\/|^projects\/agent-kit\/(?!tests\/|graphify-out\/|rules-graph\/|CHANGELOG|README)|^tools\/(flow-|task-flow|review-path|work-steps-lib|check-(kit-approval|push-gate|hooks|boundary)\.mjs)|^tools\/[^/]*-allowlist\.json$|^tools\/tests\/(run|lib|review-path|gate-map|check-(kit-approval|push-gate|hooks|boundary))/;
const TEST_DIR = /^tools\/tests\/|^projects\/agent-kit\/tests\//;
/** A guard for the second round only: a check of the tree judges the work, and П2 says «защит» without «правил». */
const CHECK_PATH =
    /^tools\/(check-|verify-|kit-coverage|visual-gate|stylelint|eslint-rules\/|nx-plugins\/)|^eslint\/|(^|\/)(eslint|stylelint|jest|vitest|playwright)\.config\./;
const API_PATH =
    /^projects\/[^/]+\/(.*\/)?(src\/)?(index|public-api)\.ts$|^projects\/(.*\/)?(ng-package|tsconfig\.lib[^/]*)\.json$|^projects\/.*\.proto$|^projects\/[^/]+\/(.*\/)?src\/.*\.(mts|cts|tsx|js|mjs|cjs)$|^(apps\/message-bus|libs\/message-bus-api)\/.*\.(controller|dto)\.ts$|^apps\/chat-[^/]+\/.*\.element\.ts$/;
const PACKAGE_SOURCE = /^projects\/(?!agent-kit\/|auth-keycloak-theme\/)[^/]+\/(.*\/)?src\/.*\.ts$|^libs\/message-bus-common\/.*\.ts$/;
/** The receiver answers by the types of its libraries; their functions are its own. */
const RECEIVER_SOURCE = /^libs\/message-bus-api\/.*\.ts$/;
const PACKAGE_FILE = /^projects\/.*package\.json$/;
/** The keys of a package nobody installs by. */
const PACKAGE_WORDS = new Set([
    'version',
    'description',
    'keywords',
    'author',
    'homepage',
    'repository',
    'bugs',
    'license',
    'devDependencies',
]);
const KIT_CODE = /^projects\//;
const LAID_OUT = /rt-kit v\d/;

/** Whether the lines of the file count. */
export const isCode = (path) => !NOT_CODE.test(path);

/** Whether the version of the file carries the header of a laid-out resource. */
const isLaidOut = (text) => LAID_OUT.test((text ?? '').slice(0, 300));

function packageKeysDiffer(before, after) {
    try {
        const [a, b] = [JSON.parse(before ?? '{}'), JSON.parse(after ?? '{}')];
        const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((key) => !PACKAGE_WORDS.has(key));

        return keys.some((key) => JSON.stringify(a[key]) !== JSON.stringify(b[key]));
    } catch {
        return true;
    }
}

const differ = (by, { before, after }) => by(before ?? '') !== by(after ?? '');

function isGuard({ path, before, after, removed }) {
    const dropped = TEST_DIR.test(path) && after === null && before !== null && removed > 0;

    return GUARD_PATH.test(path) || dropped || isLaidOut(before) || isLaidOut(after);
}

function isSecurity({ path, before, after, lines = [] }) {
    const texts = [before, after].map((text) => text ?? '');

    return SECURITY_PATH.test(path) || lines.some((line) => SECURITY_LINE.test(line)) || texts.some((text) => SECURITY_IMPORT.test(text));
}

function isApi(file) {
    const { path } = file;

    if (!isCode(path)) return false;
    if (API_PATH.test(path)) return true;
    if (PACKAGE_FILE.test(path)) return packageKeysDiffer(file.before, file.after);
    if (PACKAGE_SOURCE.test(path)) return differ(shapeOf, file);

    return RECEIVER_SOURCE.test(path) && differ((text) => shapeOf(text, { types: true }), file);
}

function isLook(file, invisible) {
    const { path } = file;

    if (!isCode(path)) return false;
    if (LOOK_PATH.test(path)) return true;
    if (isVisibleKitFile(path) && !invisible) return true;

    return path.endsWith('.ts') && differ(viewOf, file);
}

/**
 * The signs of one changed file: `{ path, added, removed, before, after, lines }`, where `before` and
 * `after` are its texts (null for an absent one) and `lines` the changed lines. `invisible` says the
 * record of the branch holds the line «Без вида».
 */
export function signsOfFile(file, { invisible = false } = {}) {
    const { path } = file;
    const found = [];

    if (isGuard(file)) found.push('защиты правил');
    if (MIGRATION_PATH.test(path)) found.push('миграции');
    if (isCode(path) && isSecurity(file)) found.push('безопасность');
    if (isApi(file)) found.push('публичный API');
    if (isLook(file, invisible)) found.push('смена вида');

    return found;
}

/** The path of a diff: `{ light, lines, reasons }`; `files === null` — the diff could not be read. */
export function judgeDiff(files, options = {}) {
    if (files === null) return { light: false, lines: 0, reasons: ['разницу нельзя прочесть'] };

    const lines = files.filter(({ path }) => isCode(path)).reduce((total, { added, removed }) => total + added + removed, 0);
    const reasons = lines > LINE_LIMIT ? [`строк кода ${lines}, предел ${LINE_LIMIT}`] : [];

    for (const file of files) reasons.push(...signsOfFile(file, options).map((sign) => `${sign}: ${file.path}`));

    return { light: reasons.length === 0, lines, reasons };
}

/** The first file by which the change must be read the second time on the full path, or null. */
export function riskOf(files) {
    const risky = files.find((file) => {
        const signs = signsOfFile(file, { invisible: true });

        return (
            signs.includes('защиты правил') ||
            signs.includes('безопасность') ||
            (isCode(file.path) && (CHECK_PATH.test(file.path) || KIT_CODE.test(file.path)))
        );
    });

    return risky ? risky.path : null;
}

/** Files a round leaves behind that nobody reads again: the records of the task. */
export const isRecord = (path) => /^docs\/(tasks|archive)\//.test(path);

const HEADER = /^\*\*(?:Путь|Path):\*\*\s+(?:лёгкий|light)\s+·\s+(\d+)\s+(?:строк[аи]?|lines?)\s*(?:·\s*(.+?)\s*)?$/u;
const ANY_HEADER = /^\*\*(?:Путь|Path):\*\*/u;
const STATEMENT = /^(API и вид не меняются|the API and the look do not change)$/iu;

/** The text without code fences and comments: a quoted sample is no word of the plan. */
const spoken = (text) => (text ?? '').replace(/<!--[\s\S]*?-->/g, '').replace(/^ *(`{3,}|~{3,})[\s\S]*?^ *\1[^\n]*$/gm, '');

/** The header of the plan: `{ count, stated }`, or null where it is absent, doubled or in other words. */
function headerOf(text) {
    const head = spoken(text).split(/^## /m)[0].split(/\r?\n/);
    const lines = head.map((line) => line.trim()).filter((line) => ANY_HEADER.test(line));
    const match = lines.length === 1 ? HEADER.exec(lines[0]) : null;

    if (!match || (match[2] !== undefined && !STATEMENT.test(match[2]))) return null;

    return { count: Number(match[1]), stated: match[2] !== undefined };
}

/** Whether the plan calls itself light. */
export const isLightPlan = (text) => headerOf(text) !== null;

/** The rows of the footprint the work edits: the paths of each in backticks. */
const editedRows = (text) =>
    spoken(text)
        .split('\n')
        .filter((line) => /^\s*\|/.test(line) && /правится/iu.test(line))
        .map((line) => [...line.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim().replace(/^(\.\/)+/, '')));

/** Why a path of the footprint keeps the plan from the light path; `read` gives the text of a file or null. */
function pathReasons(path, stated, read) {
    if (/[*?{}[\]]/.test(path)) return [`в следе образец, а не файл: ${path}`];
    if (!/[^/]\.[a-z0-9]+$/i.test(path)) return [`в следе папка, а не файл: ${path}`];

    const text = read(path);
    const reasons = signsOfFile({ path, before: text, after: text, removed: 0 }, { invisible: true }).map((sign) => `${sign}: ${path}`);

    if (/^(projects|libs\/message-bus-(common|api))\//.test(path) && isCode(path) && !stated) {
        reasons.push(`в заголовке нет слов «API и вид не меняются»: ${path}`);
    }

    return reasons;
}

/** The path of a plan before the code: its header and the files it says it edits. */
export function judgePlan(text, read = () => null) {
    const header = headerOf(text);

    if (header === null) {
        return { light: false, reasons: ['в заголовке плана нет одной строки «**Путь:** лёгкий · N строк»'] };
    }

    const reasons = header.count > LINE_LIMIT ? [`строк в плане ${header.count}, предел ${LINE_LIMIT}`] : [];
    const rows = editedRows(text);

    if (rows.length === 0) reasons.push('в следе нет строк «(правится)»');
    for (const row of rows) {
        if (row.length === 0) reasons.push('в следе строка «(правится)» без файла');
        for (const path of row) reasons.push(...pathReasons(path, header.stated, read));
    }

    return { light: reasons.length === 0, reasons };
}
