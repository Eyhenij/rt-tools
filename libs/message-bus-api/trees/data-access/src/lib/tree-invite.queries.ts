/**
 * Приглашения деревьев — всё, что домен читает из базы и пишет в неё.
 *
 * Приглашение ищется по хешу кода, а не перебором строк: хеш уникален в хранилище, и поиск
 * равенством идёт индексом. Сам код в базу не попадает вовсе.
 *
 * Записи здесь делают команды строки запуска владельца и приём обращения. Операцией запроса
 * читается одно — список приглашений для админки, и открыт он входом человека.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { ITreeInviteRecord } from '@rt/message-bus-api/trees/util';

/** Приглашение, которое команда выдаёт: имя будущего дерева, хеш кода и срок годности. */
export interface INewInvite {
    readonly name: string;
    readonly hash: string;
    readonly expiresAt: Date;
}

/** Приглашение с его признаком: признак нужен там, где приглашение потом правится. */
export interface IStoredInvite extends ITreeInviteRecord {
    readonly id: string;
}

/** Что приезжает на погашение: какое приглашение, каким именем и признаком заводится дерево. */
export interface IRedemption {
    readonly inviteId: string;
    readonly name: string;
    readonly slug: string;
    /** Хеш первого токена дерева: сам токен уходит ответом и в хранилище не попадает. */
    readonly hash: string;
}

/**
 * Что нужно от клиента внутри сделки.
 *
 * Объявлено здесь, а не взято типом клиента: внутри сделки клиент другой — у него нет ни
 * подключения, ни вложенных сделок, — и подпись службы врала бы о том, что там доступно.
 */
interface ITransactionClient {
    readonly treeInvite: {
        updateMany(args: Record<string, unknown>): Promise<{ count: number }>;
        update(args: Record<string, unknown>): Promise<unknown>;
    };
    readonly tree: {
        create(args: Record<string, unknown>): Promise<{ id: string }>;
    };
}

/** Строка хранилища так, как её читают отсюда: кода в ней нет — в базе его нет тоже. */
interface IInviteRow {
    readonly id: string;
    readonly name: string;
    readonly issuedAt: Date;
    readonly expiresAt: Date;
    readonly redeemedAt: Date | null;
    readonly revokedAt: Date | null;
    readonly tree: { readonly slug: string } | null;
}

/** Строка хранилища в то, чем приглашение читают команда, приём и экран. */
function record(row: IInviteRow): IStoredInvite {
    return {
        id: row.id,
        name: row.name,
        issuedAt: row.issuedAt,
        expiresAt: row.expiresAt,
        redeemedAt: row.redeemedAt,
        revokedAt: row.revokedAt,
        treeSlug: row.tree?.slug ?? null,
    };
}

/**
 * Выдача приглашения.
 *
 * Просроченное приглашение на то же имя снимается тем же движением: годным его уже не считает
 * никто, а имя оно держит — уникальность годного приглашения стоит на хранилище, и без снятия
 * владелец не смог бы выдать новое, не отозвав руками старое.
 */
export async function createInvite(prisma: PrismaService, invite: INewInvite, at: Date): Promise<void> {
    await prisma.$transaction([
        prisma.treeInvite.updateMany({
            where: { activeName: invite.name, redeemedAt: null, revokedAt: null, expiresAt: { lte: at } },
            data: { activeName: null },
        }),
        prisma.treeInvite.create({
            data: { name: invite.name, hash: invite.hash, activeName: invite.name, expiresAt: invite.expiresAt },
        }),
    ]);
}

/** Приглашение по хешу кода. Пусто — такого кода нет; годность решает вызывающий. */
export async function findInviteByHash(prisma: PrismaService, hash: string): Promise<IStoredInvite | null> {
    const row: IInviteRow | null = await prisma.treeInvite.findUnique({
        where: { hash },
        select: {
            id: true,
            name: true,
            issuedAt: true,
            expiresAt: true,
            redeemedAt: true,
            revokedAt: true,
            tree: { select: { slug: true } },
        },
    });

    return row ? record(row) : null;
}

/** Приглашение, которое сейчас держит имя. Пусто — имя свободно либо занято негодным. */
export async function findLiveInviteByName(prisma: PrismaService, name: string): Promise<IStoredInvite | null> {
    const row: IInviteRow | null = await prisma.treeInvite.findUnique({
        where: { activeName: name },
        select: {
            id: true,
            name: true,
            issuedAt: true,
            expiresAt: true,
            redeemedAt: true,
            revokedAt: true,
            tree: { select: { slug: true } },
        },
    });

    return row ? record(row) : null;
}

/**
 * Отзыв приглашения владельцем.
 *
 * Имя освобождается тем же движением: отозванное приглашение годным не считается, и держать имя
 * ему больше незачем. Запись при этом не удаляется — по ней читается, что приглашение было.
 */
export async function revokeInvite(prisma: PrismaService, id: string, at: Date): Promise<void> {
    await prisma.treeInvite.update({ where: { id }, data: { revokedAt: at, activeName: null } });
}

/**
 * Погашение приглашения и заведение дерева с его первым токеном — одной сделкой.
 *
 * Погашение идёт условной правкой: строка правится только пока она не погашена и не отозвана, и
 * ответ хранилища говорит, сколько строк сошлось. Двум обращениям, пришедшим разом, условие
 * достаётся одному: между проверкой чтением и выдачей стоит сеть, и второе успело бы пройти
 * проверку до того, как первое погасило код.
 *
 * Пусто в ответе означает «приглашение уже не годно» — и второму обращению отвечают тем же
 * отказом, что и на ненайденный код.
 */
export async function redeemInvite(prisma: PrismaService, redemption: IRedemption, at: Date): Promise<boolean> {
    try {
        return await prisma.$transaction(async (tx: ITransactionClient): Promise<boolean> => {
            const taken: { count: number } = await tx.treeInvite.updateMany({
                where: { id: redemption.inviteId, redeemedAt: null, revokedAt: null },
                data: { redeemedAt: at, activeName: null },
            });

            if (taken.count !== 1) {
                return false;
            }

            const tree: { id: string } = await tx.tree.create({
                data: {
                    name: redemption.name,
                    slug: redemption.slug,
                    tokens: { create: { hash: redemption.hash } },
                },
                select: { id: true },
            });

            await tx.treeInvite.update({ where: { id: redemption.inviteId }, data: { treeId: tree.id } });

            return true;
        });
    } catch {
        // Признак или имя заняты — уникальность держит хранилище, и сделка откатилась целиком:
        // приглашение осталось годным, а дерево не завелось. Вызывающий отвечает отказом.
        return false;
    }
}

/** Все приглашения, свежие сверху: список читает человек, и последнее выданное ему нужнее. */
export async function listInvites(prisma: PrismaService): Promise<IStoredInvite[]> {
    const rows: IInviteRow[] = await prisma.treeInvite.findMany({
        select: {
            id: true,
            name: true,
            issuedAt: true,
            expiresAt: true,
            redeemedAt: true,
            revokedAt: true,
            tree: { select: { slug: true } },
        },
        orderBy: { issuedAt: 'desc' },
    });

    return rows.map(record);
}
