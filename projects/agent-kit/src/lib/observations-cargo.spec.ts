/**
 * Груз наблюдений: строки дней уезжают как лежат, с родом скила у загрузок.
 *
 * Дерево одноразовое — обвязка отправки рядом; раскладка берётся из дерева пакета, чтобы род
 * скила читался с настоящих ресурсов, а не с выдуманных.
 *
 * Сценарии договорённости `docs/specs/agent-kit/proposed/rule-usage-stats/`.
 */
import { basename } from 'node:path';
import { collectAssets, IAsset } from './assets.js';
import { IObservationDay, IObservationLine, IObservationsCargo } from './cargo.js';
import { IConfig, readConfig } from './config.js';
import { OBSERVATIONS_DIR } from './observations.js';
import { linesOfDay, linesTotal, originOf, OWN_RESOURCE, readObservationDays } from './observations-cargo.js';
import { IOutcomeOfCommand } from './commands.js';
import { dropTree, freshTree, put, PROPOSALS_FILE, said, sent, shipping, start, TODAY, treeEnv, treeRoot } from './shipment.fixture.js';
import { IShipment, IShipped, TShip } from './ship.js';

function load(res: string, sid: string = '1'): string {
    return JSON.stringify({ t: `${TODAY}T10:00:00Z`, ev: 'skill-load', res, sid, v: '0.27.0' });
}

function deny(res: string, day: string = TODAY): string {
    return JSON.stringify({ t: `${day}T10:01:00Z`, ev: 'gate-deny', res, kind: 'ext', sid: '1', v: '0.27.0' });
}

function assets(): readonly IAsset[] {
    const config: IConfig | null = readConfig(treeRoot());

    if (!config) {
        throw new Error('конфига одноразового дерева нет');
    }

    return collectAssets(config, treeEnv().assetsDir);
}

/** Запросы наблюдений как уехали: на каждый день свой. */
function observationRequests(): readonly IObservationsCargo[] {
    return sent
        .filter((one: IShipment): boolean => one.operation === 'observations')
        .map((one: IShipment): IObservationsCargo => one.body as IObservationsCargo);
}

/** Все дни, что уехали, одним грузом: так читаются спеки о строках, а не о делении на запросы. */
function observationsSent(): IObservationsCargo {
    const requests: readonly IObservationsCargo[] = observationRequests();

    if (!requests.length) {
        throw new Error('наблюдения не уехали');
    }

    return { ...requests[0], days: requests.flatMap((one: IObservationsCargo): readonly IObservationDay[] => one.days) };
}

describe('груз наблюдений', () => {
    beforeEach((): void => freshTree());
    afterEach((): void => dropTree());

    it('SC-AK-1099 — уезжают все строки отрезка, по дням', () => {
        start();
        put(`${OBSERVATIONS_DIR}/2026-08-12.jsonl`, `${load('task-flow')}\n${deny('testing', '2026-08-12')}\n`);
        put(
            `${OBSERVATIONS_DIR}/2026-08-13.jsonl`,
            `${JSON.stringify({ t: '2026-08-13T01:00:00Z', ev: 'guard-deny', res: 'grill-gate', sid: '2', v: '0.27.0' })}\n`
        );
        put(
            `${OBSERVATIONS_DIR}/${TODAY}.jsonl`,
            `${JSON.stringify({ t: `${TODAY}T01:00:00Z`, ev: 'push-gate', res: 'green', sid: '3', v: '0.27.0' })}\n`
        );
        put(`${OBSERVATIONS_DIR}/2026-08-01.jsonl`, `${load('task-flow')}\n`);

        const days: readonly IObservationDay[] = readObservationDays(treeRoot(), TODAY, 3, assets());

        expect(days.map((day: IObservationDay): string => day.day)).toEqual(['2026-08-12', '2026-08-13', TODAY]);
        expect(days.map((day: IObservationDay): number => day.lines.length)).toEqual([2, 1, 1]);
        expect(days[0].lines[1]).toEqual({
            t: '2026-08-12T10:01:00Z',
            ev: 'gate-deny',
            res: 'testing',
            kind: 'ext',
            sid: '1',
            v: '0.27.0',
        });
    });

    it('SC-AK-1100 — загрузка называет род скила, отказ — нет', () => {
        start();
        const text: string = [load('testing'), load('git-workflow-commit'), load('agent-kit'), load('grill-me'), deny('testing')].join(
            '\n'
        );

        const kinds: readonly (string | undefined)[] = linesOfDay(text, assets()).map(
            (line: IObservationLine): string | undefined => line.skill
        );

        expect(kinds).toEqual(['rule', 'pattern', 'skill', 'own', undefined]);
    });

    it('SC-AK-1101 — битая строка пропускается, остальные уезжают', () => {
        start();
        const text: string = `${load('testing')}\n{"ev":"skill-load","res":"tes\n${load('task-flow')}\n${JSON.stringify({ ev: 'unknown', res: 'x', sid: '1' })}\n`;

        const lines: readonly unknown[] = linesOfDay(text, assets());

        expect(lines).toHaveLength(2);
    });

    it('SC-AK-1102 — сухой прогон называет груз числом строк и дней', async () => {
        start();
        put(`${OBSERVATIONS_DIR}/2026-08-13.jsonl`, `${load('testing')}\n${load('task-flow', '2')}\n`);
        put(`${OBSERVATIONS_DIR}/${TODAY}.jsonl`, `${load('testing')}\n`);

        const dry: string = said(await shipping(undefined, true));

        expect(dry).toContain('observations — строк 2 за 1 дн.');
        expect(dry).toContain('observations — строк 1 за 1 дн.');
        expect(sent).toHaveLength(0);

        await shipping();

        const cargo: IObservationsCargo = observationsSent();

        expect(linesTotal(cargo)).toBe(3);
        expect(cargo.origin).toBe(originOf(treeRoot()));
        expect(cargo.days[1].lines[0].skill).toBe('rule');
    });

    it('SC-AK-1151 — имя своего правила дерева не уезжает ни загрузкой, ни отказом', () => {
        start();
        const own: string = `rules/${basename(treeRoot())}`;
        const text: string = [load('testing'), load(own), deny(own)].join('\n');

        const lines: readonly IObservationLine[] = linesOfDay(text, assets());

        expect(lines.map((line: IObservationLine): string => line.res)).toEqual(['testing', OWN_RESOURCE, OWN_RESOURCE]);
        expect(lines.map((line: IObservationLine): string | undefined => line.skill)).toEqual(['rule', 'own', undefined]);
    });

    it('SC-AK-1152 — груз со своим правилом дерева уезжает: течь нечему', async () => {
        start();
        put(`${OBSERVATIONS_DIR}/${TODAY}.jsonl`, `${load(`rules/${basename(treeRoot())}`)}\n`);

        const outcome: string = said(await shipping());

        expect(outcome).not.toContain('назван адрес этого дерева');
        expect(observationsSent().days[0].lines[0].res).toBe(OWN_RESOURCE);
    });

    it('SC-AK-1211 — наблюдения уходят по одному дню на запрос', async () => {
        start();
        put(`${OBSERVATIONS_DIR}/2026-08-12.jsonl`, `${load('task-flow')}\n`);
        put(`${OBSERVATIONS_DIR}/2026-08-13.jsonl`, `${load('testing')}\n`);
        put(`${OBSERVATIONS_DIR}/${TODAY}.jsonl`, `${load('agent-kit')}\n`);

        await shipping();

        const requests: readonly IObservationsCargo[] = observationRequests();
        expect(
            requests.map((one: IObservationsCargo): readonly string[] => one.days.map((day: IObservationDay): string => day.day))
        ).toEqual([['2026-08-12'], ['2026-08-13'], [TODAY]]);
        expect(
            requests.every((one: IObservationsCargo): boolean => one.tree === requests[0].tree && one.origin === requests[0].origin)
        ).toBe(true);
    });

    it('SC-AK-1211 — без наблюдений запросов о них нет', async () => {
        start();

        await shipping();

        expect(observationRequests()).toHaveLength(0);
    });

    it('SC-AK-1212 — отказ одного дня не останавливает остальное, и отказ называет день', async () => {
        start();
        put(`${OBSERVATIONS_DIR}/2026-08-12.jsonl`, `${load('task-flow')}\n`);
        put(`${OBSERVATIONS_DIR}/2026-08-13.jsonl`, `${load('testing')}\n`);
        put(
            PROPOSALS_FILE,
            [
                '# Предложения',
                '',
                '## пакет · rules/styling-bem.md',
                '',
                '- **повод:** правило молчит',
                '- **ближайшее:** нет',
                '',
                '> Текст.',
                '',
            ].join('\n')
        );
        const tooHeavy: TShip = async (_intake: string, _token: string, shipment: IShipment): Promise<IShipped> => {
            sent.push(shipment);
            const day: string = shipment.operation === 'observations' ? (shipment.body as IObservationsCargo).days[0].day : '';

            return day === '2026-08-12'
                ? { ok: false, status: 413, said: 'груз тяжелее предела', accepted: null }
                : { ok: true, status: 201, said: '', accepted: { tree: 'дерево', month: '2026-08', created: true } };
        };

        const outcome: IOutcomeOfCommand = await shipping(tooHeavy);

        expect(outcome.code).toBe(1);
        expect(said(outcome)).toContain('2026-08-12');
        expect(said(outcome)).toContain('413');
        expect(sent.map((shipment: IShipment): string => shipment.operation)).toEqual([
            'summary',
            'observations',
            'observations',
            'proposals',
        ]);
    });

    it('SC-AK-1103 — адрес дерева в свободном поле строки отбивает отправку целиком', async () => {
        start();
        const line: string = JSON.stringify({
            t: `${TODAY}T10:00:00Z`,
            ev: 'skill-load',
            res: 'testing',
            sid: `сессия в ${basename(treeRoot())}`,
            v: '0.27.0',
        });
        put(`${OBSERVATIONS_DIR}/${TODAY}.jsonl`, `${line}\n`);

        const outcome: string = said(await shipping());

        expect(outcome).toContain('назван адрес этого дерева');
        expect(outcome).toContain('наблюдения:');
        expect(sent).toHaveLength(0);
    });
});
