/**
 * Деревья и их токены — всё, что домен читает из базы и пишет в неё.
 *
 * Токен ищется по хешу, а не перебором строк: хеш уникален в хранилище, и поиск равенством
 * идёт индексом. Перебор со сверкой в коде стоил бы прохода по всем деревьям на каждом приёме.
 */
import { IRequestTree } from '@rt/message-bus-api/trees/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

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
