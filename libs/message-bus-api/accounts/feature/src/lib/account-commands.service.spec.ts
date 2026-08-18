import { beforeEach, describe, expect, it } from 'vitest';

import { passwordMatches } from '@rt/message-bus-api/accounts/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

import { AccountCommandsService, IAccountCommandReport, TPasswordPrompt } from './account-commands.service';

/** Учётная запись в хранилище: то же, что в схеме, — двойник ничего не досочиняет. */
interface IAccountRow {
    id: string;
    name: string;
    nameKey: string;
    passwordHash: string;
    disabledAt: Date | null;
    lastLoginAt: Date | null;
}

/** Вход в хранилище: чей он и оборван ли. */
interface ISessionRow {
    id: string;
    accountId: string;
    revokedAt: Date | null;
}

/** Запрос двойника: то же, что у клиента хранилища, — доводы объектом и обещание ответа. */
type TQuery = (args: Record<string, unknown>) => Promise<unknown>;

/** Момент, которым команда помечает отключение: он приезжает доводом, а не читается часами. */
const NOW: Date = new Date('2026-08-15T21:30:00Z');

/** Пароль, который спрашивалка отдаёт команде. */
const PASSWORD: string = 'тайный-пароль';

/**
 * Двойник хранилища: отбор и правку строк он делает сам, а строки лежат открыто — сценарии
 * обещают, что после команды лежит в хранилище, а не какой запрос собран.
 */
class PrismaDouble {
    #nextId: number = 1;

    public readonly accounts: IAccountRow[] = [];
    public readonly sessions: ISessionRow[] = [];

    public get account(): Record<string, TQuery> {
        return {
            findUnique: async (args: Record<string, unknown>): Promise<unknown> => this.#found(args) ?? null,
            findMany: async (): Promise<unknown> =>
                [...this.accounts].sort((left: IAccountRow, right: IAccountRow): number => left.name.localeCompare(right.name)),
            create: async (args: Record<string, unknown>): Promise<unknown> => this.#create(args),
            update: async (args: Record<string, unknown>): Promise<unknown> => this.#update(args),
        };
    }

    public get session(): Record<string, TQuery> {
        return {
            updateMany: async (args: Record<string, unknown>): Promise<unknown> => this.#revoke(args),
        };
    }

    public async $transaction(operations: readonly Promise<unknown>[]): Promise<unknown[]> {
        return Promise.all(operations);
    }

    #found(args: Record<string, unknown>): IAccountRow | undefined {
        const where: { nameKey?: string; id?: string } = args['where'] ?? {};

        return this.accounts.find((row: IAccountRow): boolean => row.nameKey === where.nameKey || row.id === where.id);
    }

    #create(args: Record<string, unknown>): IAccountRow {
        const data: Record<string, unknown> = args['data'] as Record<string, unknown>;
        const created: IAccountRow = {
            id: `account-${this.#nextId++}`,
            name: data['name'] as string,
            nameKey: data['nameKey'] as string,
            passwordHash: data['passwordHash'] as string,
            disabledAt: null,
            lastLoginAt: null,
        };
        this.accounts.push(created);

        return created;
    }

    #update(args: Record<string, unknown>): IAccountRow {
        const found: IAccountRow | undefined = this.#found(args);

        if (!found) {
            throw new Error('двойник: правится запись, которой нет');
        }

        Object.assign(found, args['data'] as Record<string, unknown>);

        return found;
    }

    #revoke(args: Record<string, unknown>): { count: number } {
        const where: { accountId: string } = args['where'] as { accountId: string };
        const data: { revokedAt: Date } = args['data'] as { revokedAt: Date };
        const live: ISessionRow[] = this.sessions.filter(
            (row: ISessionRow): boolean => row.accountId === where.accountId && row.revokedAt === null
        );

        live.forEach((row: ISessionRow): void => {
            row.revokedAt = data.revokedAt;
        });

        return { count: live.length };
    }
}

/** Спрашивалка пароля: команда зовёт её сама, а спека называет ответ заранее. */
function asks(password: string): TPasswordPrompt {
    return async (): Promise<string> => password;
}

describe('AccountCommandsService', () => {
    let db: PrismaDouble;
    let commands: AccountCommandsService;

    beforeEach((): void => {
        db = new PrismaDouble();
        commands = new AccountCommandsService(db as unknown as PrismaService);
    });

    describe('account:add', () => {
        it('SC-MB-42 — заведение кладёт в хранилище хеш, а не сам пароль', async () => {
            const report: IAccountCommandReport = await commands.run(['account:add', 'Владелец'], asks(PASSWORD), NOW);

            expect(report.failed).toBe(false);
            expect(db.accounts).toHaveLength(1);
            expect(db.accounts[0].passwordHash).not.toContain(PASSWORD);
            expect(passwordMatches(PASSWORD, db.accounts[0].passwordHash)).toBe(true);
        });

        it('SC-MB-42 — вывод называет имя записи и пароля не печатает', async () => {
            const report: IAccountCommandReport = await commands.run(['account:add', 'Владелец'], asks(PASSWORD), NOW);

            expect(report.lines.join('\n')).toContain('Владелец');
            expect(report.lines.join('\n')).not.toContain(PASSWORD);
        });

        it('SC-MB-43 — занятое имя отбивает команду, а прежний пароль цел', async () => {
            await commands.run(['account:add', 'Владелец'], asks(PASSWORD), NOW);
            const report: IAccountCommandReport = await commands.run(['account:add', 'Владелец'], asks('другой-пароль'), NOW);

            expect(report.failed).toBe(true);
            expect(db.accounts).toHaveLength(1);
            expect(passwordMatches(PASSWORD, db.accounts[0].passwordHash)).toBe(true);
        });

        it('SC-MB-60 — то же имя в другом регистре считается занятым', async () => {
            await commands.run(['account:add', 'admin'], asks(PASSWORD), NOW);
            const report: IAccountCommandReport = await commands.run(['account:add', 'Admin'], asks(PASSWORD), NOW);

            expect(report.failed).toBe(true);
            expect(db.accounts).toHaveLength(1);
        });

        it('SC-MB-42 — заведение без имени и с пустым паролем записи не заводит', async () => {
            const nameless: IAccountCommandReport = await commands.run(['account:add'], asks(PASSWORD), NOW);
            const wordless: IAccountCommandReport = await commands.run(['account:add', 'Владелец'], asks(''), NOW);

            expect(nameless.failed).toBe(true);
            expect(wordless.failed).toBe(true);
            expect(db.accounts).toEqual([]);
        });
    });

    describe('account:passwd', () => {
        it('SC-MB-59 — смена пароля кладёт новый хеш, и прежняя пара им не проверяется', async () => {
            await commands.run(['account:add', 'Владелец'], asks(PASSWORD), NOW);
            const report: IAccountCommandReport = await commands.run(['account:passwd', 'Владелец'], asks('новый-пароль'), NOW);

            expect(report.failed).toBe(false);
            expect(passwordMatches('новый-пароль', db.accounts[0].passwordHash)).toBe(true);
            expect(passwordMatches(PASSWORD, db.accounts[0].passwordHash)).toBe(false);
        });

        it('SC-MB-59 — пустой пароль оставляет прежний в силе', async () => {
            await commands.run(['account:add', 'Владелец'], asks(PASSWORD), NOW);
            const report: IAccountCommandReport = await commands.run(['account:passwd', 'Владелец'], asks(''), NOW);

            expect(report.failed).toBe(true);
            expect(passwordMatches(PASSWORD, db.accounts[0].passwordHash)).toBe(true);
        });

        it('SC-MB-59 — смена пароля записи, которой нет, отбивается', async () => {
            const report: IAccountCommandReport = await commands.run(['account:passwd', 'Никто'], asks(PASSWORD), NOW);

            expect(report.failed).toBe(true);
        });
    });

    describe('account:disable', () => {
        it('SC-MB-58 — отключение помечает запись и обрывает её живые входы', async () => {
            await commands.run(['account:add', 'Владелец'], asks(PASSWORD), NOW);
            db.sessions.push(
                { id: 'session-1', accountId: db.accounts[0].id, revokedAt: null },
                { id: 'session-2', accountId: db.accounts[0].id, revokedAt: null }
            );

            const report: IAccountCommandReport = await commands.run(['account:disable', 'Владелец'], asks(''), NOW);

            expect(report.failed).toBe(false);
            expect(db.accounts[0].disabledAt).toEqual(NOW);
            expect(db.sessions.every((row: ISessionRow): boolean => row.revokedAt !== null)).toBe(true);
            expect(report.lines.join('\n')).toContain('оборвано входов: 2');
        });

        it('SC-MB-58 — второе отключение говорит, что запись уже отключена', async () => {
            await commands.run(['account:add', 'Владелец'], asks(PASSWORD), NOW);
            await commands.run(['account:disable', 'Владелец'], asks(''), NOW);

            const report: IAccountCommandReport = await commands.run(['account:disable', 'Владелец'], asks(''), NOW);

            expect(report.failed).toBe(true);
        });

        it('SC-MB-58 — входы чужой записи отключение не трогает', async () => {
            await commands.run(['account:add', 'Владелец'], asks(PASSWORD), NOW);
            await commands.run(['account:add', 'Второй'], asks(PASSWORD), NOW);
            db.sessions.push({ id: 'session-чужой', accountId: db.accounts[1].id, revokedAt: null });

            await commands.run(['account:disable', 'Владелец'], asks(''), NOW);

            expect(db.sessions[0].revokedAt).toBeNull();
        });
    });

    describe('account:list', () => {
        it('SC-MB-61 — пустой список говорит, чем заводится первая запись', async () => {
            const report: IAccountCommandReport = await commands.run(['account:list'], asks(''), NOW);

            expect(report.failed).toBe(false);
            expect(report.lines.join('\n')).toContain('account:add');
        });

        it('SC-MB-42 — список называет имя записи и её состояние', async () => {
            await commands.run(['account:add', 'Владелец'], asks(PASSWORD), NOW);

            const report: IAccountCommandReport = await commands.run(['account:list'], asks(''), NOW);

            expect(report.lines.join('\n')).toContain('Владелец — действует, входов не было');
        });

        it('SC-MB-58 — отключённая запись названа в списке отключённой', async () => {
            await commands.run(['account:add', 'Владелец'], asks(PASSWORD), NOW);
            await commands.run(['account:disable', 'Владелец'], asks(''), NOW);

            const report: IAccountCommandReport = await commands.run(['account:list'], asks(''), NOW);

            expect(report.lines.join('\n')).toContain('отключена 2026-08-15');
        });
    });

    it('SC-MB-42 — незнакомая команда отбивается перечнем знакомых', async () => {
        const report: IAccountCommandReport = await commands.run(['account:кто-то'], asks(''), NOW);

        expect(report.failed).toBe(true);
        expect(report.lines.join('\n')).toContain('account:add');
    });
});
