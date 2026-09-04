import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

import { enroll, IEnrollAnswer, IEnrollBody, IEnrollOptions, IEnrollOutcome, intakeAllowed, TEnrollCall, tokenPath } from './enroll.js';

/** Код приглашения образца: он уезжает телом обращения и на диск не ложится. */
const CODE: string = 'b'.repeat(64);

/** Токен, который отдаёт приём годному обращению. */
const TOKEN: string = 'c'.repeat(64);

/** Токен, выданный человеку прямо в админке приёма: он приходит доводом, а не ответом. */
const ISSUED: string = 'd'.repeat(64);

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

describe('tokenPath', () => {
    it('SC-AK-871 — абсолютный путь берётся как есть, а не клеится с корнем дерева', () => {
        // Склеенный, он кладёт секрет внутрь репозитория: `<дерево>/Users/…/tree.token`. Оттуда
        // токен уезжает в историю первой же командой добавления, и владелец об этом не знает.
        expect(tokenPath('/work/tree', '/Users/owner/.config/rt-kit/tree.token')).toBe('/Users/owner/.config/rt-kit/tree.token');
    });

    it('SC-AK-871 — путь от домашнего каталога и путь от корня дерева читаются по-прежнему', () => {
        expect(tokenPath('/work/tree', '~/.config/rt-kit/tree.token')).toBe(join(homedir(), '.config/rt-kit/tree.token'));
        expect(tokenPath('/work/tree', '.secrets/tree.token')).toBe('/work/tree/.secrets/tree.token');
    });
});

describe('enroll', () => {
    let root: string;

    function options(patch: Partial<IEnrollOptions> = {}): IEnrollOptions {
        return {
            root,
            intake: 'https://message-bus.dev',
            code: CODE,
            issued: '',
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

    it('SC-AK-283 — выданный токен ложится на диск, и в сеть команда не идёт', async () => {
        const outcome: IEnrollOutcome = await enroll(options({ code: '', issued: ISSUED }));

        expect(outcome.code).toBe(0);
        expect(readFileSync(join(root, 'секреты/токен'), 'utf8').trim()).toBe(ISSUED);
        expect(sent).toHaveLength(0);
    });

    it('SC-AK-283 — файл выданного токена читает и пишет только владелец файла', async () => {
        await enroll(options({ code: '', issued: ISSUED }));

        const mode: string = (statSync(join(root, 'секреты/токен')).mode % 0o1000).toString(8);

        expect(mode).toBe('600');
    });

    it('SC-AK-284 — код приглашения и выданный токен вместе не идут', async () => {
        const outcome: IEnrollOutcome = await enroll(options({ issued: ISSUED }));

        expect(outcome.code).toBe(1);
        expect(outcome.lines.join('\n')).toContain('--token');
        expect(outcome.lines.join('\n')).toContain('--code');
        expect(sent).toHaveLength(0);
    });

    it('SC-AK-285 — заведение без единого довода называет оба пути', async () => {
        const outcome: IEnrollOutcome = await enroll(options({ code: '' }));

        expect(outcome.code).toBe(1);
        expect(outcome.lines.join('\n')).toContain('--code');
        expect(outcome.lines.join('\n')).toContain('--token');
        expect(sent).toHaveLength(0);
    });

    it('SC-AK-286 — лежащий токен защищён и у пути с рук', async () => {
        writeFileSync(join(root, 'прежний'), 'прежний токен\n');

        const outcome: IEnrollOutcome = await enroll(options({ code: '', issued: ISSUED, token: 'прежний' }));

        expect(outcome.code).toBe(1);
        expect(outcome.lines.join('\n')).toContain('--force');
        expect(readFileSync(join(root, 'прежний'), 'utf8').trim()).toBe('прежний токен');
    });

    it('SC-AK-286 — с прямым доводом выданный токен перезаписывает лежащий', async () => {
        writeFileSync(join(root, 'прежний'), 'прежний токен\n');

        const outcome: IEnrollOutcome = await enroll(options({ code: '', issued: ISSUED, token: 'прежний', force: true }));

        expect(outcome.code).toBe(0);
        expect(readFileSync(join(root, 'прежний'), 'utf8').trim()).toBe(ISSUED);
    });

    it('SC-AK-287 — путь без сети не требует ни адреса приёма, ни TLS', async () => {
        const outcome: IEnrollOutcome = await enroll(options({ code: '', issued: ISSUED, intake: '' }));

        expect(outcome.code).toBe(0);
        expect(readFileSync(join(root, 'секреты/токен'), 'utf8').trim()).toBe(ISSUED);
        expect(sent).toHaveLength(0);
    });

    it('незаполненная настройка отбивается своими словами, а не отказом приёма', async () => {
        expect((await enroll(options({ intake: '' }))).lines.join('\n')).toContain('intake');
        expect((await enroll(options({ token: '' }))).lines.join('\n')).toContain('token');
        expect(sent).toHaveLength(0);
    });

    // Ключ настройки отвечает на «куда вписать» и не говорит, откуда взять: адреса пакет не
    // знает — приём поднимает владелец, и у каждой мастерской он свой.
    it('SC-AK-855 — отказ по пустому адресу называет, у кого его спросить', async () => {
        const said: string = (await enroll(options({ intake: '' }))).lines.join('\n');

        expect(said).toContain('код приглашения');
        expect(said).toContain('парой');
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
