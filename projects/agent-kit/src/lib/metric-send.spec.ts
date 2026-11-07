/**
 * Отправка строк дня: сценарии договорённости `docs/specs/agent-kit/proposed/metrics/`.
 */
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { IMetricsDayCargo } from './cargo.js';
import { IEnvironment, IOutcomeOfCommand } from './commands.js';
import { ESendFault, readSendMark, SEND_EVERY_MS, sendFaultLines, sendMetrics, windowDays } from './metric-send.js';
import { OBSERVATIONS_DIR } from './observations.js';
import { IShipment, IShipped, TShip } from './ship.js';
import { treeSlugOf } from './tree-mark.js';

const NOW: Date = new Date('2026-11-07T12:00:00Z');
const REMOTE: string = 'git@example.org:one/two.git';

interface ICalls {
    readonly bodies: IMetricsDayCargo[];
    readonly operations: string[];
    readonly ship: TShip;
}

function answering(status: number = 200, said: string = ''): ICalls {
    const bodies: IMetricsDayCargo[] = [];
    const operations: string[] = [];

    return {
        bodies,
        operations,
        ship: async (_intake: string, _token: string, shipment: IShipment): Promise<IShipped> => {
            bodies.push(shipment.body as IMetricsDayCargo);
            operations.push(shipment.operation);

            return { ok: status >= 200 && status < 300, status, said, accepted: null };
        },
    };
}

describe('sendMetrics', () => {
    let root: string;

    function env(): IEnvironment {
        return { root, version: '0.35.0', assetsDir: join(__dirname, '..', '..', 'assets') };
    }

    function config(over: Record<string, unknown> = {}): void {
        mkdirSync(join(root, '.claude', 'rt-kit', 'observations'), { recursive: true });
        writeFileSync(
            join(root, '.claude', 'rt-kit.json'),
            JSON.stringify({ intake: 'https://intake.example.org', token: 'token-file', tree: 'one-two', ...over })
        );
    }

    function observed(day: string, line: string): void {
        writeFileSync(join(root, OBSERVATIONS_DIR, `${day}.jsonl`), `${line}\n`);
    }

    function send(calls: ICalls, over: Partial<{ quiet: boolean; force: boolean; now: Date }> = {}): Promise<IOutcomeOfCommand> {
        return sendMetrics(env(), { quiet: true, force: false, now: NOW, remote: REMOTE, ship: calls.ship, ...over });
    }

    beforeEach((): void => {
        root = mkdtempSync(join(tmpdir(), 'rt-send-'));
        mkdirSync(join(root, '.claude'), { recursive: true });
        writeFileSync(join(root, 'token-file'), 'tree-token\n');
    });

    afterEach((): void => {
        rmSync(root, { recursive: true, force: true });
    });

    it('SC-AK-1285 — уходит только строка дня', async () => {
        config();
        observed('2026-11-07', '{"t":"2026-11-07T10:00:00Z","ev":"skill-load","res":"testing","sid":"1","v":"0.35.0"}');

        const calls: ICalls = answering();

        await send(calls);

        expect(new Set(calls.operations)).toEqual(new Set(['metrics']));
        expect(calls.bodies[0]).toMatchObject({ day: '2026-11-07', tree: treeSlugOf(REMOTE, 'one-two'), version: '0.35.0' });
        expect(calls.bodies[0]?.metrics).toMatchObject({ sessions: 1, 'ruleLoads:testing': 1 });
    });

    it('SC-AK-1282 — без адреса или токена запрос не уходит', async () => {
        config({ intake: '' });
        const calls: ICalls = answering();

        await send(calls);
        config({ token: 'no-such-file' });
        await send(calls);

        expect(calls.bodies).toHaveLength(0);
    });

    it('SC-AK-1288 — `send: false` останавливает отправку', async () => {
        config({ send: false });
        const calls: ICalls = answering();

        await send(calls);

        expect(calls.bodies).toHaveLength(0);
    });

    it('SC-AK-1283 — копия пробует раз в 15 минут, конец сессии шлёт всё равно', async () => {
        config();
        const calls: ICalls = answering();

        await send(calls);
        await send(calls, { now: new Date(NOW.getTime() + 5 * 60 * 1000) });
        expect(calls.bodies).toHaveLength(1);

        await send(calls, { now: new Date(NOW.getTime() + 5 * 60 * 1000), force: true });
        expect(calls.bodies).toHaveLength(2);

        await send(calls, { now: new Date(NOW.getTime() + 5 * 60 * 1000 + SEND_EVERY_MS + 1) });
        expect(calls.bodies).toHaveLength(3);
    });

    it('SC-AK-1284 — вторая отправка выходит по замку', async () => {
        config();
        mkdirSync(join(root, OBSERVATIONS_DIR, '.marks'), { recursive: true });
        writeFileSync(join(root, OBSERVATIONS_DIR, '.marks', 'send.lock'), '');
        const calls: ICalls = answering();

        await send(calls, { force: true, now: new Date() });

        expect(calls.bodies).toHaveLength(0);
    });

    it('мёртвый замок не закрывает копию', async () => {
        config();
        mkdirSync(join(root, OBSERVATIONS_DIR, '.marks'), { recursive: true });
        writeFileSync(join(root, OBSERVATIONS_DIR, '.marks', 'send.lock'), '');
        const calls: ICalls = answering();

        await send(calls, { force: true, now: new Date(Date.now() + 60 * 60 * 1000) });

        expect(calls.bodies.length).toBeGreaterThan(0);
        expect(existsSync(join(root, OBSERVATIONS_DIR, '.marks', 'send.lock'))).toBe(false);
    });

    it('SC-AK-1286 — отказанный токен останавливает попытки до смены файла', async () => {
        config();
        const refused: ICalls = answering(401, 'токен не принят');

        await send(refused);
        expect(readSendMark(root).fault).toBe(ESendFault.TokenRefused);
        expect(sendFaultLines(root).join(' ')).toContain('токен не принят');

        await send(refused, { force: true, now: new Date(NOW.getTime() + 2 * SEND_EVERY_MS) });
        expect(refused.bodies).toHaveLength(1);

        writeFileSync(join(root, 'token-file'), 'new-token\n');

        const fresh: ICalls = answering();

        await send(fresh, { now: new Date(NOW.getTime() + 2 * SEND_EVERY_MS) });
        expect(fresh.bodies).toHaveLength(1);
        expect(fresh.bodies[0]?.metrics).toMatchObject({ sendFault: ESendFault.TokenRefused });
        expect(sendFaultLines(root)).toEqual([]);
    });

    it('SC-AK-1287 — сбой не двигает окно: следующая попытка шлёт те же дни', async () => {
        config();
        observed('2026-11-06', '{"t":"2026-11-06T10:00:00Z","ev":"skill-load","res":"testing","sid":"1","v":"0.35.0"}');
        await send(answering(503, 'нет'));

        const calls: ICalls = answering();

        await send(calls, { force: true });

        expect(calls.bodies.map((body: IMetricsDayCargo): string => body.day)).toEqual(['2026-11-06', '2026-11-07']);
    });

    it('старый штамп не сбой: новая строка уже лежит', async () => {
        config();

        await send(answering(409));

        expect(readSendMark(root).fault).toBe(ESendFault.None);
    });

    it('команда человека говорит, чем кончилось, и код сбоя не прячет', async () => {
        config();

        const outcome: IOutcomeOfCommand = await send(answering(0, 'сеть недоступна'), { quiet: false });

        expect(outcome.code).toBe(1);
        expect(outcome.lines.join(' ')).toContain('сеть недоступна');
    });
});

describe('windowDays', () => {
    it('идёт от последней удачи и всегда несёт сегодняшний день', () => {
        expect(windowDays(['2026-11-05.jsonl', '2026-11-06.jsonl', 'copy'], '2026-11-06', '2026-11-07')).toEqual([
            '2026-11-06',
            '2026-11-07',
        ]);
    });

    it('не уходит дальше срока хранения', () => {
        expect(windowDays(['2026-01-01.jsonl'], '', '2026-11-07')).toEqual(['2026-11-07']);
    });
});
