/**
 * Отправка строк дня: сценарии договорённости `docs/specs/agent-kit/proposed/metrics/`.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { IMetricsDayCargo } from './cargo.js';
import { IEnvironment, IOutcomeOfCommand } from './commands.js';
import { IConfig, readConfig } from './config.js';
import { ESendFault, readSendMark, SEND_EVERY_MS, sendEnrolledLines, sendFaultLines, sendMetrics, windowDays } from './metric-send.js';
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

/** Приём, у которого на каждый день свой ответ. Дня в таблице нет: всё хорошо. */
function answeringByDay(statuses: Readonly<Record<string, number>>): ICalls {
    const bodies: IMetricsDayCargo[] = [];
    const operations: string[] = [];

    return {
        bodies,
        operations,
        ship: async (_intake: string, _token: string, shipment: IShipment): Promise<IShipped> => {
            const body: IMetricsDayCargo = shipment.body as IMetricsDayCargo;
            const status: number = statuses[body.day] ?? 200;

            bodies.push(body);
            operations.push(shipment.operation);

            return { ok: status >= 200 && status < 300, status, said: '', accepted: null };
        },
    };
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

    function send(
        calls: ICalls,
        over: Partial<{ quiet: boolean; force: boolean; now: Date; remote: string }> = {}
    ): Promise<IOutcomeOfCommand> {
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

    it('SC-AK-1311 — числа дерева остаются в строке вчерашнего дня', async () => {
        config();
        observed('2026-11-07', '{"t":"2026-11-07T10:00:00Z","ev":"skill-load","res":"testing","sid":"1","v":"0.35.0"}');
        await send(answering());

        const calls: ICalls = answering();

        await send(calls, { now: new Date('2026-11-08T09:00:00Z') });

        const yesterday: IMetricsDayCargo | undefined = calls.bodies.find((one: IMetricsDayCargo): boolean => one.day === '2026-11-07');

        expect(yesterday?.metrics).toHaveProperty('sectionsTotal');
        expect(yesterday?.metrics).toMatchObject({ sessions: 1 });
    });

    it('SC-AK-1311 — день, отказанный на повторе, не теряет числа', async () => {
        config();
        observed('2026-11-06', '{"t":"2026-11-06T10:00:00Z","ev":"skill-load","res":"testing","sid":"1","v":"0.35.0"}');
        await send(answering(), { now: new Date('2026-11-06T12:00:00Z') });
        await send(answeringByDay({ '2026-11-06': 400 }));
        await send(answeringByDay({ '2026-11-06': 400 }), { now: new Date('2026-11-08T09:00:00Z') });

        const calls: ICalls = answering();

        await send(calls, { now: new Date('2026-11-09T09:00:00Z') });

        const line: IMetricsDayCargo | undefined = calls.bodies.find((one: IMetricsDayCargo): boolean => one.day === '2026-11-06');

        expect(line?.metrics).toHaveProperty('sectionsTotal');
    });

    it('SC-AK-1286 — срок сбоя идёт от первой неудачи, а не от попытки', async () => {
        config();
        await send(answering(503, 'нет'));
        await send(answering(503, 'нет'), { force: true, now: new Date(NOW.getTime() + 60 * 60 * 1000) });

        expect(readSendMark(root).faultSince).toBe(NOW.getTime());

        await send(answering(), { force: true, now: new Date(NOW.getTime() + 2 * 60 * 60 * 1000) });

        expect(readSendMark(root).faultSince).toBe(0);
    });

    it('SC-AK-1282 — команда человека без токена отвечает отказом', async () => {
        config({ token: 'no-such-file' });

        const done: IOutcomeOfCommand = await send(answering(), { quiet: false });

        expect(done.code).toBe(1);
    });

    it('SC-AK-1312 — код сбоя держится во всех строках своего дня', async () => {
        config();
        await send(answering(503, 'нет'));

        const first: ICalls = answering();
        const second: ICalls = answering();

        await send(first, { force: true, now: new Date(NOW.getTime() + 1000) });
        await send(second, { force: true, now: new Date(NOW.getTime() + 2000) });

        expect(first.bodies.at(-1)?.metrics).toMatchObject({ sendFault: ESendFault.Intake });
        expect(second.bodies.at(-1)?.metrics).toMatchObject({ sendFault: ESendFault.Intake });
    });

    it('SC-AK-1313 — отказанная старая строка не закрывает сегодняшнюю', async () => {
        config();
        observed('2026-11-05', '{"t":"2026-11-05T10:00:00Z","ev":"skill-load","res":"testing","sid":"1","v":"0.35.0"}');
        const calls: ICalls = answeringByDay({ '2026-11-05': 400 });

        await send(calls);

        expect(calls.bodies.map((one: IMetricsDayCargo): string => one.day)).toEqual(['2026-11-05', '2026-11-07']);
        expect(readSendMark(root).fault).toBe(ESendFault.LineRefused);
        expect(Object.keys(readSendMark(root).factsByDay)).toEqual(['2026-11-07']);
    });

    it('сбой сети останавливает окно: дальше стучаться незачем', async () => {
        config();
        observed('2026-11-05', '{"t":"2026-11-05T10:00:00Z","ev":"skill-load","res":"testing","sid":"1","v":"0.35.0"}');
        const calls: ICalls = answeringByDay({ '2026-11-05': 503 });

        await send(calls);

        expect(calls.bodies.map((one: IMetricsDayCargo): string => one.day)).toEqual(['2026-11-05']);
    });

    it('SC-AK-1314 — строка с адресом дерева не уходит', async () => {
        config();
        const calls: ICalls = answering();

        await send(calls, { force: true, remote: 'sectionsTotal' });

        expect(calls.bodies).toHaveLength(0);
        expect(readSendMark(root).fault).toBe(ESendFault.Leak);
    });

    it('SC-AK-1314 — имя копии, совпавшее со словом ключа, строку не закрывает', async () => {
        const named: string = join(root, 'testing');

        mkdirSync(named);
        const calls: ICalls = answering();

        root = named;
        mkdirSync(join(root, '.claude'), { recursive: true });
        writeFileSync(join(root, 'token-file'), 'tree-token\n');
        config();
        observed('2026-11-07', '{"t":"2026-11-07T10:00:00Z","ev":"skill-load","res":"testing","sid":"1","v":"0.35.0"}');

        await send(calls);

        expect(calls.bodies[0]?.metrics).toMatchObject({ 'ruleLoads:testing': 1 });
    });

    it('SC-AK-1319 — вчерашний день уходит под своей версией', async () => {
        config();
        observed('2026-11-06', '{"t":"2026-11-06T10:00:00Z","ev":"skill-load","res":"testing","sid":"1","v":"0.34.0"}');
        observed('2026-11-07', '{"t":"2026-11-07T10:00:00Z","ev":"skill-load","res":"testing","sid":"1","v":"dev"}');
        const calls: ICalls = answering();

        await send(calls);

        expect(calls.bodies.map((one: IMetricsDayCargo): string => one.version)).toEqual(['0.34.0', '0.35.0']);
    });

    it('SC-AK-1320 — адрес есть, токена нет: это названо', () => {
        config({ token: 'no-such-file' });

        expect(sendFaultLines(root).join('\n')).toContain('файла токена на этой машине нет');
    });

    it('SC-AK-1320 — токен на месте: строки нет', () => {
        config();

        expect(sendFaultLines(root)).toEqual([]);
    });

    it('SC-AK-1321 — метки отправки не идут в историю', async () => {
        config();

        await send(answering());

        expect(readFileSync(join(root, OBSERVATIONS_DIR, '.gitignore'), 'utf8')).toBe('*\n');
    });

    it('SC-AK-1315 — раскладка называет включённую отправку', () => {
        config();
        const tree: IConfig = readConfig(root) as IConfig;
        const hook: string = '.claude/hooks/metric-send-start.sh';

        expect(sendEnrolledLines(tree, [hook])).toHaveLength(1);
        expect(sendEnrolledLines(tree, ['.claude/hooks/other.sh'])).toHaveLength(0);
        expect(sendEnrolledLines({ ...tree, intake: '' }, [hook])).toHaveLength(0);
        expect(sendEnrolledLines({ ...tree, send: false }, [hook])).toHaveLength(0);
    });

    it('SC-AK-1317 — дерево, которое некого спросить, называет себя ключом', async () => {
        config();
        const calls: ICalls = answering();

        await send(calls);

        expect(calls.bodies[0]?.metrics).toMatchObject({ outcomesUnread: 1 });
        expect(calls.bodies[0]?.metrics).not.toHaveProperty('outcomesBroken');
    });

    it('SC-AK-1318 — тихая отправка не снимает файлы по сроку', async () => {
        config();
        observed('2026-01-01', '{"t":"2026-01-01T10:00:00Z","ev":"skill-load","res":"testing","sid":"1","v":"0.35.0"}');

        await send(answering());

        expect(existsSync(join(root, OBSERVATIONS_DIR, '2026-01-01.jsonl'))).toBe(true);
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
