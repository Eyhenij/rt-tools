/**
 * Разборы происшествий дерева: опознаются именем файла, приехавший повторно обновляет прежний.
 *
 * К записи месяца не крепятся: разбор правится на дереве после того, как уехал, и второй
 * экземпляр читался бы как второе происшествие. Исчезнувший на дереве у приёмника остаётся —
 * приёмник принимает, а не следит, и удаление по молчанию отправителя стёрло бы записи первого
 * же дерева, переставшего слать.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

/** Один разбор, каким он ложится в хранилище. */
export interface IPostmortemRow {
    readonly file: string;
    readonly text: string;
}

/**
 * Положить разборы дерева: каждый по своему имени файла заводится или обновляется.
 *
 * Все записи операции ложатся вместе или не ложатся вовсе, поэтому они идут одной сделкой:
 * упавший третий разбор оставил бы дерево в состоянии, которого не было ни до, ни после.
 * Одной командой это не выразить — обновление берёт текст каждой записи свой.
 *
 * Возвращает, сколько разборов положено.
 */
export async function writePostmortems(prisma: PrismaService, treeId: string, items: readonly IPostmortemRow[]): Promise<number> {
    if (items.length === 0) {
        return 0;
    }

    await prisma.$transaction(
        items.map((item: IPostmortemRow) =>
            prisma.postmortem.upsert({
                where: { treeId_file: { treeId, file: item.file } },
                create: { treeId, file: item.file, text: item.text },
                update: { text: item.text },
                select: { id: true },
            })
        )
    );

    return items.length;
}
