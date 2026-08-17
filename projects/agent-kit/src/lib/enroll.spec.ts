import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { enroll, IEnrollAnswer, IEnrollBody, IEnrollOptions, IEnrollOutcome, intakeAllowed, TEnrollCall } from './enroll.js';

/** Код приглашения образца: он уезжает телом обращения и на диск не ложится. */
const CODE: string = 'b'.repeat(64);

/** Токен, который отдаёт приём годному обращению. */
const TOKEN: string = 'c'.repeat(64);

/** Что уехало в приём: спека смотрит тело обращения, а в сеть не ходит. */
let sent: IEnrollBody[] = [];

/** Приём, отдающий токен. Второго пути забрать его нет — у приёма его тоже нет. */
const granting: TEnrollCall = async (unusedIntake: string, body: IEnrollBody): Promise<IEnrollAnswer> => {
    sent.push(body);

    return { ok: true, status: 201, said: '', granted: { tree: body.tree, name: 'Своё дерево', token: TOKEN } };
};

/** Приём, отказавший по негодному приглашению: он не называет, что именно не сошлось. */
const refusing: TEnrollCall = async (unusedIntake: string, body: IEnrollBody): Promise<IEnrollAnswer> => {
    sent.push(body);

    return { ok: false, status: 401, said: 'приглашение не принято', granted: null };
};

/** Приём, до которого не дозвонились: у неотвеченного обращения кода ответа нет вовсе. */
const silent: TEnrollCall = async (unusedIntake: string, body: IEnrollBody): Promise<IEnrollAnswer> => {
    sent.push(body);

    return { ok: false, status: 0, said: 'The operation was aborted due to timeout', granted: null };
};

describe('intakeAllowed', () => {
    it('SC-MB-126 — адрес по TLS годен', () => {
        expect(intakeAllowed('https://message-bus.dev')).toBe(true);
    });

    it('SC-MB-126 — открытый адрес чужой машины не годен', () => {
        expect(intakeAllowed('http://message-bus.dev')).toBe(false);
        expect(intakeAllowed('http://10.0.0.7:3000')).toBe(false);
    });

    it('SC-MB-126 — открытый адрес локальной машины годен: сети между сторонами нет', () => {
        expect(intakeAllowed('http://localhost:3000')).toBe(true);
        expect(intakeAllowed('http://127.0.0.1:3000/')).toBe(true);
        expect(intakeAllowed('http://[::1]:3000')).toBe(true);
    });

    it('SC-MB-126 — адрес, начинающийся именем локальной машины, чужим не считается', () => {
        expect(intakeAllowed('http://localhost.чужой.дом')).toBe(false);
    });
});

describe('enroll', () => {
    let root: string;

    function options(patch: Partial<IEnrollOptions> = {}): IEnrollOptions {
        return {
            root,
            intake: 'https://message-bus.dev',
            code: CODE,
            tree: 'a1b2c3d4',
            token: 'секреты/токен',
            force: false,
            call: granting,
            ...patch,
        };
    }

    beforeEach((): void => {
        root = mkdtempSync(join(tmpdir(), 'enroll-'));
        sent = [];
    });

    afterEach((): void => {
        rmSync(root, { recursive: true, force: true });
    });

    it('годное приглашение кладёт токен на диск и говорит, чьё дерево завелось', async () => {
        const outcome: IEnrollOutcome = await enroll(options());

        expect(outcome.code).toBe(0);
        expect(outcome.lines.join('\n')).toContain('Своё дерево');
        expect(readFileSync(join(root, 'секреты/токен'), 'utf8').trim()).toBe(TOKEN);
        expect(sent).toEqual([{ schema: '1', tree: 'a1b2c3d4', code: CODE }]);
    });

    it('файл токена читает и пишет только владелец файла', async () => {
        await enroll(options());

        const mode: string = (statSync(join(root, 'секреты/токен')).mode % 0o1000).toString(8);

        expect(mode).toBe('600');
    });

    it('сам код приглашения на диск не ложится', async () => {
        await enroll(options());

        expect(readFileSync(join(root, 'секреты/токен'), 'utf8')).not.toContain(CODE);
    });

    it('SC-MB-126 — адрес приёма без TLS отбивается до обращения в сеть', async () => {
        const outcome: IEnrollOutcome = await enroll(options({ intake: 'http://message-bus.dev' }));

        expect(outcome.code).toBe(1);
        expect(outcome.lines.join('\n')).toContain('без TLS');
        expect(sent).toHaveLength(0);
    });

    it('SC-MB-127 — лежащий токен не перезаписывается, и отказ называет, чем перезаписать намеренно', async () => {
        writeFileSync(join(root, 'прежний'), 'прежний токен\n');

        const outcome: IEnrollOutcome = await enroll(options({ token: 'прежний' }));

        expect(outcome.code).toBe(1);
        expect(outcome.lines.join('\n')).toContain('--force');
        expect(readFileSync(join(root, 'прежний'), 'utf8').trim()).toBe('прежний токен');
        expect(sent).toHaveLength(0);
    });

    it('SC-MB-127 — с прямым доводом лежащий токен перезаписывается', async () => {
        writeFileSync(join(root, 'прежний'), 'прежний токен\n');

        const outcome: IEnrollOutcome = await enroll(options({ token: 'прежний', force: true }));

        expect(outcome.code).toBe(0);
        expect(readFileSync(join(root, 'прежний'), 'utf8').trim()).toBe(TOKEN);
    });

    it('обращение без кода до сети не доходит', async () => {
        const outcome: IEnrollOutcome = await enroll(options({ code: '' }));

        expect(outcome.code).toBe(1);
        expect(outcome.lines.join('\n')).toContain('код приглашения');
        expect(sent).toHaveLength(0);
    });

    it('незаполненная настройка отбивается своими словами, а не отказом приёма', async () => {
        expect((await enroll(options({ intake: '' }))).lines.join('\n')).toContain('intake');
        expect((await enroll(options({ token: '' }))).lines.join('\n')).toContain('token');
        expect(sent).toHaveLength(0);
    });

    it('отказ приёма пересказывается его словами, и токена на диске не появляется', async () => {
        const outcome: IEnrollOutcome = await enroll(options({ call: refusing }));

        expect(outcome.code).toBe(1);
        expect(outcome.lines.join('\n')).toContain('приглашение не принято');
        expect((): string => readFileSync(join(root, 'секреты/токен'), 'utf8')).toThrow();
    });

    it('молчащий приём назван неотвеченным обращением, а не отказом с кодом', async () => {
        const outcome: IEnrollOutcome = await enroll(options({ call: silent }));

        expect(outcome.code).toBe(1);
        expect(outcome.lines.join('\n')).toContain('приём не ответил');
    });
});
