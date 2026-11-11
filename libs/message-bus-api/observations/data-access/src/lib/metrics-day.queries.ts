/**
 * Строка дня: одна на дерево, копию и день. Новая заменяет старую, старая новую не заменяет.
 *
 * Условное обновление и вставка без дубля — по одному действию базы, каждое из них атомарно. Две
 * отправки разошлись бы только между ними: тот, чья вставка не легла, пробует обновление ещё раз.
 * Поэтому порядок решает штамп, а не тот, кто пришёл первым.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { Prisma } from '@rt/message-bus-api/persistence/util';

export interface IMetricsDayInput {
    readonly treeId: string;
    readonly origin: string;
    readonly day: string;
    readonly version: string;
    readonly stamp: Date;
    readonly metrics: Readonly<Record<string, number>>;
}

async function replaceIfNewer(prisma: PrismaService, line: IMetricsDayInput): Promise<boolean> {
    const done: Prisma.BatchPayload = await prisma.metricsDay.updateMany({
        where: { treeId: line.treeId, origin: line.origin, day: line.day, stamp: { lte: line.stamp } },
        data: { version: line.version, stamp: line.stamp, metrics: line.metrics },
    });

    return done.count > 0;
}

/** Кладёт строку дня. `false`: лежит более новая, и эта строка устарела. */
export async function writeMetricsDay(prisma: PrismaService, line: IMetricsDayInput): Promise<boolean> {
    if (await replaceIfNewer(prisma, line)) {
        return true;
    }
    const added: Prisma.BatchPayload = await prisma.metricsDay.createMany({
        data: [{ ...line, metrics: { ...line.metrics } }],
        skipDuplicates: true,
    });

    return added.count > 0 || replaceIfNewer(prisma, line);
}

/** Снимает строки дней старше первого хранимого дня. Возвращает их число. */
export async function sweepMetricsDaysBefore(prisma: PrismaService, day: string): Promise<number> {
    const gone: Prisma.BatchPayload = await prisma.metricsDay.deleteMany({ where: { day: { lt: day } } });

    return gone.count;
}
