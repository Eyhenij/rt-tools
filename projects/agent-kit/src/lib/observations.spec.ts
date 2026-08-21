/**
 * Наблюдения и сводка по ним.
 *
 * Сценарии договорённости `docs/specs/agent-kit/proposed/rules-feedback/`: SC-AK-74 … SC-AK-76.
 * Запись наблюдения проверяется не здесь, а набором сценариев гардов: пишет её оболочка.
 *
 * Сегодняшний день везде задаётся явно. Спека, берущая его из часов, зеленеет ровно до
 * полуночи, а отрезок в три дня без него не проверяется вовсе.
 */
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
    dayBefore,
    ICount,
    IObservation,
    IReadResult,
    ISummary,
    KEEP_DAYS,
    OBSERVATIONS_DIR,
    parseObservation,
    readObservations,
    summarize,
} from './observations.js';

const TODAY: string = '2026-08-12';

let root: string;

const note: (event: string, fields: Readonly<Record<string, string>> = {}) => string = (
    event: string,
    fields: Readonly<Record<string, string>> = {}
): string => JSON.stringify({ t: `${TODAY}T10:00:00Z`, ev: event, ...fields, v: '0.5.1' });

/** День наблюдений: имя файла и его строки. */
const put: (day: string, lines: readonly string[]) => void = (day: string, lines: readonly string[]): void => {
    mkdirSync(join(root, OBSERVATIONS_DIR), { recursive: true });
    writeFileSync(join(root, OBSERVATIONS_DIR, `${day}.jsonl`), `${lines.join('\n')}\n`, 'utf8');
};

beforeEach((): void => {
    root = mkdtempSync(join(tmpdir(), 'rt-kit-observations-'));
});

afterEach((): void => {
    rmSync(root, { recursive: true, force: true });
});

describe('строка наблюдения', (): void => {
    it('разбирается в наблюдение', (): void => {
        expect(parseObservation(note('gate-deny', { res: 'styling-bem', kind: 'scss', sid: '42' }))).toEqual({
            event: 'gate-deny',
            resource: 'styling-bem',
            kind: 'scss',
            session: '42',
            version: '0.5.1',
        });
    });

    it('битая строка пропускается, а не роняет разбор', (): void => {
        expect(parseObservation('{"ev":"gate-deny"')).toBeNull();
        expect(parseObservation('')).toBeNull();
        expect(parseObservation('{"res":"styling-bem"}')).toBeNull();
    });
});

describe('чтение наблюдений', (): void => {
    it('SC-AK-76 — берёт дни отрезка и не берёт те, что старше', (): void => {
        put(TODAY, [note('skill-load', { res: 'task-flow', sid: '1' })]);
        put(dayBefore(TODAY, 1), [note('skill-load', { res: 'doc-style', sid: '2' })]);
        put(dayBefore(TODAY, 5), [note('skill-load', { res: 'testing', sid: '3' })]);

        const result: IReadResult = readObservations(root, TODAY, 3);

        expect(result.observations.map((entry: IObservation): string => entry.resource)).toEqual(['doc-style', 'task-flow']);
        expect(result.silent).toBe(false);
    });

    it('SC-AK-76 — снимает наблюдения старше срока хранения и называет их', (): void => {
        const old: string = dayBefore(TODAY, KEEP_DAYS + 1);
        put(TODAY, [note('skill-load', { res: 'task-flow', sid: '1' })]);
        put(old, [note('skill-load', { res: 'testing', sid: '2' })]);

        const result: IReadResult = readObservations(root, TODAY, 3);

        expect(result.swept).toEqual([`${old}.jsonl`]);
        expect(existsSync(join(root, OBSERVATIONS_DIR, `${old}.jsonl`))).toBe(false);
        expect(existsSync(join(root, OBSERVATIONS_DIR, `${TODAY}.jsonl`))).toBe(true);
    });

    it('SC-AK-75 — каталога нет: записи не велось ни разу', (): void => {
        const result: IReadResult = readObservations(root, TODAY, 3);

        expect(result.silent).toBe(true);
        expect(result.observations).toEqual([]);
    });

    it('чужой файл в каталоге наблюдением не считается', (): void => {
        put(TODAY, [note('skill-load', { res: 'task-flow', sid: '1' })]);
        writeFileSync(join(root, OBSERVATIONS_DIR, 'README.md'), 'не наблюдение', 'utf8');

        expect(readObservations(root, TODAY, 3).observations).toHaveLength(1);
    });
});

describe('сводка', (): void => {
    const observations: readonly IObservation[] = [
        { event: 'skill-load', resource: 'task-flow', kind: '', session: '1', version: '0.5.1' },
        { event: 'skill-load', resource: 'styling-bem', kind: '', session: '1', version: '0.5.1' },
        { event: 'skill-load', resource: 'styling-bem', kind: '', session: '2', version: '0.5.1' },
        { event: 'gate-deny', resource: 'styling-bem', kind: 'scss', session: '1', version: '0.5.1' },
        { event: 'gate-deny', resource: 'testing', kind: 'ts', session: '2', version: '0.5.1' },
        { event: 'guard-deny', resource: 'docs-guard', kind: '', session: '2', version: '0.5.1' },
    ];

    it('считает загрузки, отбития и отказы порознь', (): void => {
        const summary: ISummary = summarize(observations, [], 3);

        expect(summary.loads).toEqual([
            { name: 'styling-bem', count: 2 },
            { name: 'task-flow', count: 1 },
        ]);
        expect(summary.denials).toHaveLength(2);
        expect(summary.guards).toEqual([{ name: 'docs-guard', count: 1 }]);
        expect(summary.total).toBe(6);
    });

    it('считает заходы, а не события', (): void => {
        expect(summarize(observations, [], 3).sessions).toBe(2);
    });

    it('SC-AK-74 — называет разложенное правило, не загруженное ни разу', (): void => {
        const summary: ISummary = summarize(observations, ['task-flow', 'styling-bem', 'ui-component-tests', 'testing'], 3);

        expect(summary.unused).toEqual(['testing', 'ui-component-tests']);
    });

    it('SC-AK-74 — отбитое правило загруженным не считается', (): void => {
        // `testing` в наблюдениях есть — но только тем, что гейт его потребовал. Засчитать это
        // загрузкой значило бы объявить работающим правило, которое как раз и не открыли.
        expect(summarize(observations, ['testing'], 3).unused).toEqual(['testing']);
    });

    it('род правки при отбитии сводится отдельно', (): void => {
        expect(summarize(observations, [], 3).kinds).toEqual([
            { name: 'scss', count: 1 },
            { name: 'ts', count: 1 },
        ]);
    });

    it('версии пакета в записях перечисляются', (): void => {
        expect(summarize(observations, [], 3).versions).toEqual(['0.5.1']);
    });

    it('доля отбитий не на правке файла считается сводкой, а не читателем', (): void => {
        // Отбития набора: одно на `scss`, одно на `ts` — оба на файле. Правкой не являются
        // команда оболочки и браузер, и их здесь нет.
        expect(summarize(observations, [], 3).denialsOffFile).toBe(0);
    });

    it('команда оболочки и браузер считаются отбитиями не на правке файла', (): void => {
        const mixed: readonly IObservation[] = [
            ...observations,
            { event: 'gate-deny', resource: 'git-workflow', kind: 'command', session: '1', version: '0.5.1' },
            { event: 'gate-deny', resource: 'doc-style', kind: 'command', session: '2', version: '0.5.1' },
            { event: 'gate-deny', resource: 'browser-verification', kind: 'browser', session: '2', version: '0.5.1' },
        ];

        const summary: ISummary = summarize(mixed, [], 3);

        // Положительная сторона рядом с долей: без неё «три из пяти» сходится и тогда, когда
        // отбитий не нашлось вовсе.
        expect(summary.denials.reduce((found: number, entry: ICount): number => found + entry.count, 0)).toBe(5);
        expect(summary.denialsOffFile).toBe(3);
    });
});

describe('вес загруженного', (): void => {
    const loads: readonly IObservation[] = [
        { event: 'skill-load', resource: 'task-flow', kind: '', session: '1', version: '0.5.1' },
        { event: 'skill-load', resource: 'task-flow', kind: '', session: '2', version: '0.5.1' },
        { event: 'skill-load', resource: 'styling-bem', kind: '', session: '2', version: '0.5.1' },
    ];

    it('каждая загрузка считается своим весом, а не одним на правило', (): void => {
        // `task-flow` открыт дважды, в двух заходах: место он занял дважды.
        expect(summarize(loads, [], 3, { 'task-flow': 1000, 'styling-bem': 500 }).bytes).toBe(2500);
    });

    it('правило, веса которого не назвали, считается нулём', (): void => {
        expect(summarize(loads, [], 3, { 'task-flow': 1000 }).bytes).toBe(2000);
    });

    it('веса не назвали вовсе — сводка отвечает нулём, а не падает', (): void => {
        expect(summarize(loads, [], 3).bytes).toBe(0);
    });

    it('цена захода — вес, делённый на число заходов', (): void => {
        const summary: ISummary = summarize(loads, [], 3, { 'task-flow': 1000, 'styling-bem': 500 });

        expect(summary.sessions).toBe(2);
        expect(summary.bytesPerSession).toBe(1250);
    });

    it('пустой отрезок цену захода не считает и на ноль не делит', (): void => {
        const summary: ISummary = summarize([], [], 3, { 'task-flow': 1000 });

        expect(summary.sessions).toBe(0);
        expect(summary.bytesPerSession).toBe(0);
    });
});
