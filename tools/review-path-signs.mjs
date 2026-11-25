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
    /^docs\/|\.mdx?$|\.(spec|test)\.[a-z]+$|\.stories\.ts$|^apps\/[^/]*-e2e\/|(^|\/)__snapshots__\/|\.(png|snap)$|(^|\/)(graphify-out|rules-graph)\/|^pnpm-lock\.yaml$|^tools\/tests\/|^projects\/agent-kit\/tests\//;

const SECURITY_PATH =
    /^projects\/auth-|^apps\/auth-example|^deploy\/|^docker-compose|^\.github\/|(^|\/)\.env|\.(guard|interceptor)\.ts$|^(apps|libs)\/(.*\/)?(access|auth|entry|permissions|security)\//;
const SECURITY_LINE = /DomSanitizer|bypassSecurityTrust|innerHTML|javascript:|\.protocol\b/;
const MIGRATION_PATH = /^prisma\/|(^|\/)migrations\//;
const LOOK_PATH = /\.(scss|css|html|svg)$/;
const GUARD_PATH =
    /^\.claude\/(?!rt-kit\/(assignments\.md$|postmortems\/|proposals\/|observations\/))|^docs\/constitution\/|^projects\/agent-kit\/(assets|src)\/|^\.husky\/|^tools\/(flow-|task-flow|review-path|work-steps-lib|check-(kit-approval|push-gate|hooks|boundary)\.mjs)|^tools\/[^/]*-allowlist\.json$/;
/** A guard for the second round only: a check of the tree judges the work, and П2 says «защит» without «правил». */
const CHECK_PATH = /^tools\/(check-|eslint-rules\/|stylelint-rules\/)|^eslint\/|^(eslint|stylelint)\.config\./;
const API_PATH = /^projects\/[^/]+\/(src\/)?(index|public-api)\.ts$|^(apps\/message-bus|libs\/message-bus-api)\/.*\.(controller|dto)\.ts$/;
const PACKAGE_SOURCE = /^projects\/(?!agent-kit\/|auth-keycloak-theme\/)[^/]+\/.*\.ts$/;
const PACKAGE_FILE = /^projects\/[^/]+\/package\.json$/;
const PACKAGE_KEYS = ['exports', 'main', 'module', 'types', 'typings', 'bin', 'dependencies', 'peerDependencies', 'peerDependenciesMeta'];
const LAID_OUT = /^.{0,200}rt-kit v\d/s;

/** Whether the lines of the file count. */
export const isCode = (path) => !NOT_CODE.test(path);

/** Whether the version of the file carries the header of a laid-out resource. */
const isLaidOut = (text) => LAID_OUT.test((text ?? '').slice(0, 300));

function packageKeysDiffer(before, after) {
    try {
        const [a, b] = [JSON.parse(before ?? '{}'), JSON.parse(after ?? '{}')];

        return PACKAGE_KEYS.some((key) => JSON.stringify(a[key]) !== JSON.stringify(b[key]));
    } catch {
        return true;
    }
}

const differ = (by, before, after) => by(before ?? '') !== by(after ?? '');

/**
 * The signs of one changed file: `{ path, added, removed, before, after, lines }`, where `before` and
 * `after` are its texts (null for an absent one) and `lines` the changed lines. `invisible` says the
 * record of the branch holds the line «Без вида».
 */
export function signsOfFile(file, { invisible = false } = {}) {
    const { path, before, after, lines = [] } = file;
    const found = [];
    const test = !isCode(path);
    const source = path.endsWith('.ts') && !test;

    if (GUARD_PATH.test(path) || isLaidOut(before) || isLaidOut(after)) found.push('защиты правил');
    if (MIGRATION_PATH.test(path)) found.push('миграции');
    if (SECURITY_PATH.test(path) || (!test && lines.some((line) => SECURITY_LINE.test(line)))) found.push('безопасность');
    if (!test && (API_PATH.test(path) || (PACKAGE_FILE.test(path) && packageKeysDiffer(before, after)))) found.push('публичный API');
    if (!found.includes('публичный API') && source && PACKAGE_SOURCE.test(path) && differ(shapeOf, before, after))
        found.push('публичный API');
    if (!test && LOOK_PATH.test(path)) found.push('смена вида');
    else if (isVisibleKitFile(path) && !invisible) found.push('смена вида');
    else if (source && path.startsWith('projects/') === false && differ(viewOf, before, after)) found.push('смена вида');

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

/** Whether the change must be read the second time on the full path by what it touches. */
export function riskOf(files) {
    const risky = files.find((file) => {
        if (!isCode(file.path) && !GUARD_PATH.test(file.path)) return false;
        const signs = signsOfFile(file, { invisible: true });

        return (
            signs.includes('защиты правил') || signs.includes('безопасность') || CHECK_PATH.test(file.path) || /^projects\//.test(file.path)
        );
    });

    return risky ? risky.path : null;
}

const HEADER = /^\*\*(?:Путь|Path):\*\*\s+(?:лёгкий|light)\s+·\s+(\d+)\s+(?:строк|lines?)(.*)$/mu;
const STATEMENT = /API и вид не меняются/u;
const EDITED_ROW = /^\|[^|]*\(правится\)[^|]*\|(.*)\|\s*$/gmu;

/** Whether the plan calls itself light. */
export const isLightPlan = (text) => HEADER.test(text ?? '');

/** The paths of the rows «(правится)» of the footprint. */
export const editedPaths = (text) => [...text.matchAll(EDITED_ROW)].flatMap((row) => [...row[1].matchAll(/`([^`]+)`/g)].map((m) => m[1]));

/** The path of a plan before the code: its header and the paths it says it edits. */
export function judgePlan(text) {
    const header = HEADER.exec(text ?? '');

    if (!header) return { light: false, reasons: ['в заголовке плана нет строки «**Путь:** лёгкий · N строк»'] };

    const reasons = [];
    const paths = editedPaths(text);
    const stated = STATEMENT.test(header[2]);

    if (Number(header[1]) > LINE_LIMIT) reasons.push(`строк в плане ${header[1]}, предел ${LINE_LIMIT}`);
    if (paths.length === 0) reasons.push('в следе нет строк «(правится)»');
    for (const path of paths) {
        if (/^[^/]*\/?$/.test(path) && !/\.[a-z]+$/.test(path)) reasons.push(`след шире папки: ${path}`);

        const probe = { path, before: null, after: null };
        const signs = signsOfFile(probe, { invisible: true });

        reasons.push(...signs.map((sign) => `${sign}: ${path}`));
        if (/^projects\/(?!agent-kit\/)/.test(path) && isCode(path) && !stated)
            reasons.push(`в заголовке нет слов «API и вид не меняются»: ${path}`);
    }

    return { light: reasons.length === 0, reasons };
}
