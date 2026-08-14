/**
 * Деревья и их токены — всё, что домен читает из базы и пишет в неё.
 *
 * Токен ищется по хешу, а не перебором строк: хеш уникален в хранилище, и поиск равенством
 * идёт индексом. Перебор со сверкой в коде стоил бы прохода по всем деревьям на каждом приёме.
 *
 * Записи здесь делают команды строки запуска: заведение и отзыв токена операцией запроса не
 * делаются — токен дерева зовёт только приём груза.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IRequestTree, ITreeSummaryRow } from '@rt/message-bus-api/trees/util';

/** Дерево, которое команда заводит: имя, признак и хеш первого токена. */
export interface INewTree {
    readonly name: string;
    readonly slug: string;
    readonly hash: string;
}

/** Чем уже заведённое дерево столкнулось с заводимым: имя и признак у дерева уникальны оба. */
export interface ITreeClash {
    readonly name: string;
    readonly slug: string;
}

/** Прогон дерева: по какому дереву и когда. */
interface ITreeRun {
    readonly treeId: string;
    readonly ranAt: Date;
}

/**
 * Дерево годного токена. Пусто означает и «такого токена нет», и «он отозван»: различать эти
 * два случая вызывающему не по чему, и отказ на них один.
 *
 * Отозванный токен при этом остаётся в хранилище — груз, приехавший по нему, читается по-прежнему.
 */
export async function findTreeByTokenHash(prisma: PrismaService, hash: string): Promise<IRequestTree | null> {
    const token: { tree: { id: string; slug: string; name: string } } | null = await prisma.treeToken.findFirst({
        where: { hash, revokedAt: null },
        select: { tree: { select: { id: true, slug: true, name: true } } },
    });

    return token?.tree ?? null;
}

/** Дерево по читаемому имени: им его зовут команды, потому что владелец назвал его сам. */
export async function findTreeByName(prisma: PrismaService, name: string): Promise<IRequestTree | null> {
    return prisma.tree.findUnique({ where: { name }, select: { id: true, slug: true, name: true } });
}

/**
 * Дерево, которое займёт имя или признак заводимого. Пусто — заводить можно.
 *
 * Спрашивается до заведения, чтобы команда назвала причину отказа словами, а не пересказом
 * ошибки хранилища. Уникальность при этом держит хранилище: проверка чтением её не заменяет.
 */
export async function findTreeClash(prisma: PrismaService, name: string, slug: string): Promise<ITreeClash | null> {
    return prisma.tree.findFirst({ where: { OR: [{ name }, { slug }] }, select: { name: true, slug: true } });
}

/**
 * Заведение дерева вместе с первым токеном.
 *
 * Токен заводится тем же запросом, что и дерево: дерево без токена приёмнику не нужно ни для
 * чего, а два запроса оставили бы его таким при обрыве между ними.
 */
export async function createTreeWithToken(prisma: PrismaService, tree: INewTree): Promise<void> {
    await prisma.tree.create({
        data: { name: tree.name, slug: tree.slug, tokens: { create: { hash: tree.hash } } },
    });
}

/**
 * Новый токен взамен прежнего: годен у дерева один.
 *
 * Отзыв прежнего и выпуск нового едут одной сделкой — между ними дерево осталось бы либо с
 * двумя годными токенами, либо без единого.
 */
export async function replaceTreeToken(prisma: PrismaService, treeId: string, hash: string, revokedAt: Date): Promise<void> {
    await prisma.$transaction([
        prisma.treeToken.updateMany({ where: { treeId, revokedAt: null }, data: { revokedAt } }),
        prisma.treeToken.create({ data: { treeId, hash } }),
    ]);
}

/**
 * Отзыв годных токенов дерева. Отвечает, сколько отозвано: ноль означает, что отзывать было
 * нечего, и команда говорит об этом, а не молчит.
 *
 * Отозванный токен не удаляется: удалив его, приёмник потерял бы и то, кем присланы прежние
 * записи.
 */
export async function revokeTreeTokens(prisma: PrismaService, treeId: string, revokedAt: Date): Promise<number> {
    const revoked: { count: number } = await prisma.treeToken.updateMany({
        where: { treeId, revokedAt: null },
        data: { revokedAt },
    });

    return revoked.count;
}

/**
 * Все деревья приёмника с состоянием токена и днём последнего прогона.
 *
 * Три плоских запроса вместо одного со вложенной выборкой: их читает и двойник хранилища в
 * спеке, а вложенную выборку он повторял бы формой вызова, а не поведением. Прогоны при этом
 * приезжают целиком — их у дерева двенадцать в год, и приёмник свой и малый.
 */
export async function listTrees(prisma: PrismaService): Promise<ITreeSummaryRow[]> {
    const trees: { id: string; slug: string; name: string }[] = await prisma.tree.findMany({
        select: { id: true, slug: true, name: true },
        orderBy: { name: 'asc' },
    });
    const live: { treeId: string }[] = await prisma.treeToken.findMany({
        where: { revokedAt: null },
        select: { treeId: true },
    });
    const runs: ITreeRun[] = await prisma.monthRecord.findMany({
        select: { treeId: true, ranAt: true },
        orderBy: { ranAt: 'desc' },
    });

    const withLiveToken: Set<string> = new Set(live.map((token: { treeId: string }): string => token.treeId));

    return trees.map((tree: { id: string; slug: string; name: string }): ITreeSummaryRow => {
        const last: ITreeRun | undefined = runs.find((run: ITreeRun): boolean => run.treeId === tree.id);

        return { slug: tree.slug, name: tree.name, tokenLive: withLiveToken.has(tree.id), ranAt: last?.ranAt ?? null };
    });
}
