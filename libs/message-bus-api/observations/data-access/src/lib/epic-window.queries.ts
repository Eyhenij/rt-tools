/**
 * Окно эпика: одно на дерево, копию, эпик и момент открытия. Новое заменяет старое, старое новое
 * не заменяет — тем же приёмом, что строка дня.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { Prisma } from '@rt/message-bus-api/persistence/util';

export interface IEpicWindowInput {
    readonly treeId: string;
    readonly origin: string;
    readonly epic: number;
    readonly openedAt: Date;
    readonly closedAt: Date | null;
    readonly calls: number;
    readonly refusals: number;
    readonly reasks: number;
    readonly merged: boolean;
    readonly released: boolean;
    readonly mergedAt: Date | null;
    readonly releasedAt: Date | null;
    readonly minutes: number | null;
    readonly stamp: Date;
}

async function replaceIfNewer(prisma: PrismaService, window: IEpicWindowInput): Promise<boolean> {
    const { treeId, origin, epic, openedAt, ...data } = window;
    const done: Prisma.BatchPayload = await prisma.epicWindow.updateMany({
        where: { treeId, origin, epic, openedAt, stamp: { lte: window.stamp } },
        data,
    });

    return done.count > 0;
}

/** Кладёт окно. `false`: лежит более новое, и это окно устарело. */
export async function writeEpicWindow(prisma: PrismaService, window: IEpicWindowInput): Promise<boolean> {
    if (await replaceIfNewer(prisma, window)) {
        return true;
    }
    const added: Prisma.BatchPayload = await prisma.epicWindow.createMany({ data: [{ ...window }], skipDuplicates: true });

    return added.count > 0 || replaceIfNewer(prisma, window);
}
